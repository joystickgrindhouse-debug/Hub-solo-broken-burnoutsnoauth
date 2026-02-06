import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BuddyService } from "../services/buddyService.js";
import ChatbotTour from "../components/ChatbotTour/ChatbotTour.jsx";
import CoachsCorner from "../components/CoachsCorner/CoachsCorner.jsx";
import soloImage from "/assets/images/solo.png";
import burnoutsImage from "/assets/images/burnouts.png";
import liveImage from "/assets/images/live.png";
import runImage from "/assets/images/run.png";
import gameboardImage from "/assets/images/gameboard.jpeg";
import shopImage from "/assets/circuit-board.png"; // Using circuit board as placeholder

const gameModes = [
  {
    id: "solo",
    name: "Solo",
    image: soloImage,
    link: "/solo",
    external: false,
  },
  {
    id: "burnouts",
    name: "Burnouts",
    image: burnoutsImage,
    link: "/burnouts",
    external: false,
  },
  {
    id: "live",
    name: "Live",
    image: liveImage,
    link: "/live",
    external: false,
  },
  {
    id: "run",
    name: "Run",
    image: runImage,
    link: "/run",
    external: false,
  },
  {
    id: "raffle",
    name: "Raffle Room",
    image: gameboardImage,
    link: "/raffle",
    external: false,
  },
  {
    id: "shop",
    name: "Merch Shop",
    image: shopImage,
    link: "/merch",
    external: false,
  },
];

export default function Dashboard({ user, userProfile }) {
  const navigate = useNavigate();
  const [showBot, setShowBot] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState([]);

  useEffect(() => {
    if (user) {
      BuddyService.getActiveChallenges(user.uid).then(setActiveChallenges);
    }
  }, [user]);

  const handleTileClick = async (mode) => {
    navigate(mode.link);
  };

  console.log("Dashboard rendering with", gameModes.length, "game modes:", gameModes.map(m => m.name));

  return (
    <div className="dashboard-background">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 className="rivalis-text" style={styles.rivalisTitle}>
            RIVALIS
          </h1>
          <h1 className="fitness-reimagined-breathing" style={styles.mainTitle}>
            FITNESS REIMAGINED
          </h1>
        </div>
        
        <CoachsCorner />

        {activeChallenges.length > 0 && (
          <div style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background: "rgba(255, 48, 80, 0.1)",
            border: "2px solid #ff3050",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.2)"
          }}>
            <h3 style={{ color: "#ff3050", marginBottom: "1rem", fontFamily: "'Press Start 2P', cursive", fontSize: "0.8rem" }}>ACTIVE BUDDY CHALLENGES</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {activeChallenges.map(challenge => (
                <div key={challenge.id} style={{ background: "#000", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255, 48, 80, 0.3)" }}>
                  <div style={{ color: "#ff3050", fontWeight: "bold", marginBottom: "0.5rem" }}>{challenge.type.toUpperCase()} GOAL: {challenge.goal}</div>
                  <div style={{ fontSize: "0.8rem", color: "#ccc" }}>Status: {challenge.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.tilesGrid}>
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => handleTileClick(mode)}
              style={styles.tile}
            >
              <img src={mode.image} alt={mode.name} style={styles.tileImage} />
              <div style={styles.tileOverlay}>
                <h2 style={styles.tileName}>{mode.name}</h2>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.otherAppsSection}>
          <button style={styles.otherAppsButton} onClick={() => navigate("/other-apps")}>
            TRY OUR OTHER APPS
          </button>
        </div>
      </div>

      <style>{`
        @keyframes breathing {
          0%, 100% { 
            transform: scale(1); 
            text-shadow: 0 0 20px #ff4081, 0 0 40px #ff4081, 0 0 60px #ff4081; 
          }
          50% { 
            transform: scale(1.05); 
            text-shadow: 0 0 30px #ff4081, 0 0 60px #ff4081, 0 0 90px #ff4081; 
          }
        }
        
        .fitness-reimagined-breathing {
          animation: breathing 3s ease-in-out infinite;
        }

        .rivalis-text {
          text-shadow: 0 0 15px #667eea, 0 0 30px #667eea, 0 0 45px #667eea;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    position: 'relative',
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "20px 10px",
    width: "100%",
    overflow: "hidden",
  },
  rivalisTitle: {
    fontSize: "clamp(28px, 7vw, 48px)",
    fontWeight: "900",
    color: "#fff",
    letterSpacing: "clamp(2px, 1.5vw, 10px)",
    margin: "0 0 10px 0",
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    whiteSpace: "nowrap",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mainTitle: {
    fontSize: "clamp(28px, 8vw, 72px)",
    fontWeight: "900",
    color: "#fff",
    letterSpacing: "clamp(2px, 1vw, 8px)",
    margin: "0 0 20px 0",
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    wordWrap: "break-word",
    maxWidth: "100%",
    lineHeight: "1.2",
  },
  tilesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "24px",
    width: "100%",
    padding: "0 10px 40px 10px",
  },
  tile: {
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
    height: "200px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
  },
  tileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  tileOverlay: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    background: "linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tileName: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
    margin: "0",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
  },
  otherAppsSection: {
    marginTop: "40px",
    textAlign: "center",
    padding: "20px",
  },
  otherAppsButton: {
    background: "linear-gradient(45deg, #ff3050 0%, #ff6b6b 100%)",
    color: "white",
    border: "none",
    padding: "15px 40px",
    fontSize: "18px",
    fontWeight: "bold",
    borderRadius: "30px",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.3)",
    transition: "all 0.3s ease",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "0.8rem"
  }
};
