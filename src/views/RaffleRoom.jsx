import React, { useState, useEffect } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";

export default function RaffleRoom({ user }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    const result = await LeaderboardService.getAllTopScores(10);
    if (result.success) {
      setLeaderboard(result.scores);
    }
    setLoading(false);
  };

  const spinWheel = () => {
    if (isSpinning || leaderboard.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    // Simulate wheel spin
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * leaderboard.length);
      setWinner(leaderboard[randomIndex]);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="hero-background" style={styles.container}>
      <div style={styles.roomLayout}>
        {/* Left Side: Raffle Wheel */}
        <div style={styles.wheelSection}>
          <h1 className="rivalis-text" style={styles.title}>RAFFLE ROOM</h1>
          <div style={{...styles.wheel, animation: isSpinning ? "spin 3s cubic-bezier(0.15, 0, 0.15, 1) infinite" : "none"}}>
            <div style={styles.wheelInner}>
              <div style={styles.pointer}>▼</div>
              <div style={styles.bingoBall}>
                {isSpinning ? "?" : winner ? "🏆" : "🎟️"}
              </div>
            </div>
          </div>
          
          <button 
            onClick={spinWheel} 
            disabled={isSpinning || leaderboard.length === 0}
            style={{...styles.button, opacity: (isSpinning || leaderboard.length === 0) ? 0.5 : 1}}
          >
            {isSpinning ? "DRAWING..." : "DRAW WINNER"}
          </button>

          {winner && !isSpinning && (
            <div style={styles.winnerAnnouncement}>
              <h2>CONGRATULATIONS!</h2>
              <p style={styles.winnerName}>{winner.userName}</p>
              <p>HAS WON THE RAFFLE!</p>
            </div>
          )}
        </div>

        {/* Right Side: Real-time Leaderboard */}
        <div style={styles.leaderboardSection}>
          <h2 style={styles.subTitle}>LIVE TICKETS</h2>
          <div style={styles.leaderboardList}>
            {loading ? (
              <div style={{textAlign: "center", color: "#fff"}}>SYNCING...</div>
            ) : (
              leaderboard.map((player, idx) => (
                <div key={idx} style={{
                  ...styles.playerRow,
                  borderLeft: `4px solid ${idx === 0 ? "#FFD700" : "#ff3050"}`
                }}>
                  <span style={styles.rank}>#{idx + 1}</span>
                  <span style={styles.name}>{player.userName}</span>
                  <span style={styles.tickets}>{player.score} 🎟️</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(1080deg); }
        }
        .rivalis-text {
          text-shadow: 0 0 15px #ff3050, 0 0 30px #ff3050;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "100px 20px 40px",
    display: "flex",
    justifyContent: "center",
  },
  roomLayout: {
    display: "flex",
    gap: "40px",
    maxWidth: "1200px",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  wheelSection: {
    flex: "1",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(0,0,0,0.7)",
    padding: "30px",
    borderRadius: "20px",
    border: "2px solid #ff3050",
    boxShadow: "0 0 30px rgba(255, 48, 80, 0.3)"
  },
  title: {
    fontSize: "32px",
    color: "#fff",
    marginBottom: "40px",
    fontFamily: "'Arial Black', sans-serif"
  },
  wheel: {
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    border: "8px solid #ff3050",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    background: "radial-gradient(circle, #222 0%, #000 100%)",
    marginBottom: "40px",
    boxShadow: "0 0 50px rgba(255, 48, 80, 0.5)"
  },
  wheelInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  pointer: {
    position: "absolute",
    top: "-30px",
    fontSize: "40px",
    color: "#ff3050",
    textShadow: "0 0 10px #ff3050"
  },
  bingoBall: {
    fontSize: "80px",
    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))"
  },
  button: {
    padding: "15px 40px",
    background: "#ff3050",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.5)",
    transition: "transform 0.2s"
  },
  leaderboardSection: {
    flex: "1",
    minWidth: "300px",
    background: "rgba(0,0,0,0.8)",
    padding: "30px",
    borderRadius: "20px",
    border: "2px solid #667eea",
    boxShadow: "0 0 30px rgba(102, 126, 234, 0.3)"
  },
  subTitle: {
    color: "#667eea",
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center"
  },
  leaderboardList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  playerRow: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  rank: { color: "#ff3050", fontWeight: "bold", width: "30px" },
  name: { color: "#fff", flex: 1, fontWeight: "500" },
  tickets: { color: "#ff3050", fontWeight: "bold" },
  winnerAnnouncement: {
    marginTop: "30px",
    textAlign: "center",
    color: "#fff",
    animation: "fadeIn 0.5s ease-out"
  },
  winnerName: {
    fontSize: "24px",
    color: "#ffd700",
    fontWeight: "bold",
    margin: "10px 0"
  }
};
