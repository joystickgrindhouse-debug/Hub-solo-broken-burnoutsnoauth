import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to auto-center map
function MapAutoCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
import { RunLogic } from "../logic/runLogic.js";
import { UserService } from "../services/userService.js";
import { LeaderboardService } from "../services/leaderboardService.js";

export default function Run({ user, userProfile }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0); // miles
  const [duration, setDuration] = useState(0); // seconds
  const [diceEarned, setDiceEarned] = useState(0);
  const [lastPos, setLastPos] = useState(null);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  const [shareRoute, setShareRoute] = useState(true); // Default to true for better UX
  const [route, setRoute] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);

  const timerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    loadCompetitiveRuns();
    return () => {
      stopTracking();
      clearInterval(timerRef.current);
    };
  }, []);

  const loadCompetitiveRuns = async () => {
    try {
      const result = await LeaderboardService.getTopScores("run", 10);
      if (result.success) {
        const globalGhosts = result.scores.map(score => ({
          id: score.userId,
          name: `Rival: ${score.userName}`,
          distance: score.score / 100, // Assuming score is stored as miles * 100
          duration: score.duration || 600, // Fallback if duration not stored
          date: new Date(score.timestamp).toLocaleDateString()
        }));
        setRecentRuns(prev => [...prev, ...globalGhosts]);
      }
    } catch (err) {
      console.error("Error loading competitive runs:", err);
    }
  };

  const [ghostMode, setGhostMode] = useState(false);
  const [ghostData, setGhostData] = useState(null);
  const [ghostProgress, setGhostProgress] = useState(0);

  const startRun = (ghost = null) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    if (ghost) {
      setGhostMode(true);
      setGhostData(ghost);
      setGhostProgress(0);
    }

    setIsActive(true);
    setIsPaused(false);
    setError(null);

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    // Start tracking
    const options = { 
      enableHighAccuracy: true, 
      timeout: 15000,
      maximumAge: 0,
      distanceFilter: 0 
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("GPS Position received:", pos.coords.latitude, pos.coords.longitude);
        if (isPaused) return;

        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy > 100) return; // Increased accuracy threshold for city running

        const newPos = { lat: latitude, lng: longitude };
        setCurrentPos([latitude, longitude]);

        if (lastPos) {
          const d = RunLogic.calculateDistance(
            lastPos.lat, lastPos.lng,
            latitude, longitude
          );

          console.log("Distance increment:", d);

          // Cheat detection - increased threshold slightly for GPS jitter
          if (RunLogic.isRealisticSpeed(d, 1)) { 
             setDistance(prev => {
               const newDist = prev + d;
               console.log("New total distance:", newDist);
               const newDice = RunLogic.calculateDice(newDist);
               if (newDice > diceEarned) setDiceEarned(newDice);
               return newDist;
             });
             if (shareRoute) {
               setRoute(prev => [...prev, { lat: latitude, lng: longitude }]);
             }
          } else {
            console.warn("Suspicious speed detected:", d);
            setIsVerified(false);
          }
        }
        setLastPos({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("GPS Error:", err);
        setError(err.message);
      },
      options
    );
  };

  const pauseRun = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
  };

  const resumeRun = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const endRun = async () => {
    stopTracking();
    clearInterval(timerRef.current);
    setIsActive(false);

    // Competitive multiplier for ghost racing
    let finalDice = diceEarned;
    if (ghostMode && ghostData) {
      if (distance >= ghostData.distance && duration < ghostData.duration) {
        finalDice = Math.floor(diceEarned * 1.5); // 50% bonus for beating ghost
        alert("GHOST DEFEATED! 1.5x Dice Multiplier Active!");
      }
    }

    // Save stats
    const avgPace = distance > 0 ? (duration / 60) / distance : 0;
    const runData = {
      totalDistance: distance,
      totalDuration: duration,
      avgPace,
      diceEarned: finalDice,
      isVerified,
      timestamp: new Date().toISOString(),
      source: "internal"
    };

    if (shareRoute) {
      runData.route = route;
    }

    // Update user profile and leaderboard
    if (user) {
      try {
        await UserService.updateUserProfile(user.uid, {
          totalMiles: (userProfile?.totalMiles || 0) + distance,
          diceBalance: (userProfile?.diceBalance || 0) + finalDice,
          lastRunDate: new Date().toISOString()
        });

        await LeaderboardService.submitScore({ 
          userId: user.uid, 
          userName: userProfile?.nickname || "Runner", 
          gameMode: "run", 
          score: Math.floor(distance * 100),
          duration: duration
        });
      } catch (err) {
        console.error("Error saving run stats:", err);
      }
    }

    // Reset local state
    alert(`Run Ended! \nDistance: ${distance.toFixed(2)} miles\nDice Earned: ${finalDice}`);
    setDistance(0);
    setDuration(0);
    setDiceEarned(0);
    setRoute([]);
    setGhostMode(false);
    setGhostData(null);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [recentRuns, setRecentRuns] = useState([
    { id: 1, name: "Your Previous Best", distance: 1.0, duration: 480, date: "2025-12-25" },
    { id: 2, name: "Global Ghost: Sonic", distance: 0.5, duration: 180, date: "2025-12-24" }
  ]);

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h1 style={styles.title}>{ghostMode ? "GHOST RACE" : "RUN MODE"}</h1>
        
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>DISTANCE</div>
            <div style={styles.statValue}>{distance.toFixed(2)} <span style={{fontSize: '1rem'}}>mi</span></div>
            {ghostMode && ghostData && (
              <div style={{fontSize: '0.8rem', color: '#667eea'}}>Target: {ghostData.distance} mi</div>
            )}
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>TIME</div>
            <div style={styles.statValue}>{formatTime(duration)}</div>
            {ghostMode && ghostData && (
              <div style={{fontSize: '0.8rem', color: '#667eea'}}>Ghost: {formatTime(ghostData.duration)}</div>
            )}
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>DICE</div>
            <div style={styles.statValue}>🎲 {diceEarned}</div>
          </div>
        </div>

        {!isActive ? (
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ marginBottom: '1rem', color: '#fff' }}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={shareRoute} 
                    onChange={(e) => setShareRoute(e.target.checked)}
                  /> Share Route
                </label>
              </div>
              <button style={styles.button} onClick={() => startRun()}>START SOLO RUN</button>
            </div>

            <h3 style={{color: '#ff3050', marginBottom: '10px', textAlign: 'center'}}>GHOST RACING</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {recentRuns.map(run => (
                <div key={run.id} style={styles.ghostCard}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{run.name}</div>
                    <div style={{fontSize: '0.8rem', opacity: 0.7}}>{run.distance} mi • {formatTime(run.duration)}</div>
                  </div>
                  <button 
                    style={styles.ghostButton}
                    onClick={() => startRun(run)}
                  >
                    RACE
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={styles.controls}>
              {isPaused ? (
                <button style={styles.button} onClick={resumeRun}>RESUME</button>
              ) : (
                <button style={styles.button} onClick={pauseRun}>PAUSE</button>
              )}
              <button style={{...styles.button, background: '#ff3050'}} onClick={endRun}>STOP</button>
            </div>

            <div style={styles.mapContainer}>
              <div style={{ height: "300px", width: "100%", background: "#1a1a1a", position: "relative", zIndex: 1, overflow: "hidden" }}>
                <MapContainer 
                  center={currentPos || [51.505, -0.09]} 
                  zoom={15} 
                  style={{ height: "300px", width: "100%" }}
                  scrollWheelZoom={false}
                  key={currentPos ? `map-${currentPos[0]}-${currentPos[1]}` : 'map-placeholder'}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {currentPos && <Marker position={currentPos} />}
                  {route.length > 1 && (
                    <Polyline positions={route.map(p => [p.lat, p.lng])} color="#ff3050" weight={5} />
                  )}
                </MapContainer>
                <link 
                  rel="stylesheet" 
                  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                />
                <style>
                  {`
                    .leaflet-container {
                      height: 300px !important;
                      width: 100% !important;
                      background: #1a1a1a !important;
                      position: relative;
                    }
                    .leaflet-map-pane { z-index: 2 !important; }
                    .leaflet-tile-pane { z-index: 1 !important; }
                    .leaflet-control-container .leaflet-top,
                    .leaflet-control-container .leaflet-bottom { z-index: 1000 !important; }
                    .leaflet-marker-pane img { z-index: 1001 !important; }
                  `}
                </style>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "100px"
  },
  ghostCard: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 48, 80, 0.3)",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff"
  },
  ghostButton: {
    background: "#ff3050",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  title: {
    color: "#ff3050",
    textShadow: "0 0 10px rgba(255, 48, 80, 0.8)",
    fontSize: "2.5rem",
    textAlign: "center"
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    width: "100%",
    maxWidth: "500px"
  },
  statBox: {
    background: "rgba(255, 48, 80, 0.1)",
    border: "2px solid #ff3050",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 0 15px rgba(255, 48, 80, 0.3)"
  },
  statLabel: { color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem", marginBottom: "5px" },
  statValue: { color: "#fff", fontSize: "1.5rem", fontWeight: "bold" },
  button: {
    padding: "15px 40px",
    fontSize: "1.2rem",
    background: "#000",
    color: "#ff3050",
    border: "2px solid #ff3050",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 15px rgba(255, 48, 80, 0.5)",
    margin: "10px"
  },
  error: { color: "#ff3050", background: "rgba(255, 48, 80, 0.2)", padding: "10px", borderRadius: "8px" },
  controls: { display: "flex", gap: "10px" },
  mapContainer: {
    width: "100%",
    maxWidth: "500px",
    height: "300px",
    border: "2px solid #ff3050",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.4)",
    marginTop: "20px"
  },
  background: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/assets/images/run-bg.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
};
