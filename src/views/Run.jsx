import React, { useState, useEffect, useRef } from "react";
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
  const [shareRoute, setShareRoute] = useState(false);
  const [route, setRoute] = useState([]);

  const timerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTracking();
      clearInterval(timerRef.current);
    };
  }, []);

  const startRun = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    setError(null);

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    // Start tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (isPaused) return;

        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy > 50) return; // Skip poor accuracy

        if (lastPos) {
          const d = RunLogic.calculateDistance(
            lastPos.lat, lastPos.lng,
            latitude, longitude
          );

          // Cheat detection
          if (RunLogic.isRealisticSpeed(d, 1)) { // 1s interval roughly
             setDistance(prev => {
               const newDist = prev + d;
               const newDice = RunLogic.calculateDice(newDist);
               if (newDice > diceEarned) setDiceEarned(newDice);
               return newDist;
             });
             if (shareRoute) {
               setRoute(prev => [...prev, { lat: latitude, lng: longitude }]);
             }
          } else {
            setIsVerified(false);
          }
        }
        setLastPos({ lat: latitude, lng: longitude });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, distanceFilter: 5 }
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

    // Save stats
    const avgPace = distance > 0 ? (duration / 60) / distance : 0;
    const runData = {
      totalDistance: distance,
      totalDuration: duration,
      avgPace,
      diceEarned,
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
          diceBalance: (userProfile?.diceBalance || 0) + diceEarned,
          lastRunDate: new Date().toISOString()
        });

        await LeaderboardService.saveScore(user.uid, userProfile?.nickname || "Runner", "run", Math.floor(distance * 100));
      } catch (err) {
        console.error("Error saving run stats:", err);
      }
    }

    // Reset local state or show summary
    alert(`Run Ended! \nDistance: ${distance.toFixed(2)} miles\nDice Earned: ${diceEarned}`);
    setDistance(0);
    setDuration(0);
    setDiceEarned(0);
    setRoute([]);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hero-background" style={styles.container}>
      <h1 style={styles.title}>RUN MODE</h1>
      
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>DISTANCE</div>
          <div style={styles.statValue}>{distance.toFixed(2)} <span style={{fontSize: '1rem'}}>mi</span></div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>TIME</div>
          <div style={styles.statValue}>{formatTime(duration)}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>DICE</div>
          <div style={styles.statValue}>🎲 {diceEarned}</div>
        </div>
      </div>

      {!isActive ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', color: '#fff' }}>
            <label>
              <input 
                type="checkbox" 
                checked={shareRoute} 
                onChange={(e) => setShareRoute(e.target.checked)}
              /> Share Route (Private by default)
            </label>
          </div>
          <button style={styles.button} onClick={startRun}>START RUN</button>
        </div>
      ) : (
        <div style={styles.controls}>
          {isPaused ? (
            <button style={styles.button} onClick={resumeRun}>RESUME</button>
          ) : (
            <button style={styles.button} onClick={pauseRun}>PAUSE</button>
          )}
          <button style={{...styles.button, background: '#ff3050'}} onClick={endRun}>STOP</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px"
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
  controls: { display: "flex", gap: "10px" }
};
