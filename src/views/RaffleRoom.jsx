import React, { useState, useEffect } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";

export default function RaffleRoom({ user, userProfile }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawHistory, setDrawHistory] = useState([]);

  const isAdmin = userProfile?.role === "admin" || user?.email === "admin@rivalis.com" || user?.email === "Socalturfexperts@gmail.com" || user?.uid === "v3h9WiCKKoTPH5Cyi5dVr0Pb2f03"; // Add your admin email here

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    const result = await LeaderboardService.getAllTopScores(100); // Get more for a bigger pool
    if (result.success) {
      setLeaderboard(result.scores);
    }
    setLoading(false);
  };

  const getRafflePeriodMessage = () => {
    const now = new Date();
    const day = now.getDay();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - day);
    lastSunday.setHours(20, 0, 0, 0);
    if (now < lastSunday) lastSunday.setDate(lastSunday.getDate() - 7);
    
    const nextSunday = new Date(lastSunday);
    nextSunday.setDate(lastSunday.getDate() + 7);
    
    // Check if drawing is happening now (Sunday 8:00 PM - 8:15 PM)
    const isDrawingTime = now >= nextSunday && now < new Date(nextSunday.getTime() + 15 * 60000);
    
    if (isDrawingTime) {
      return "🎰 DRAWING IN PROGRESS! 🎰";
    }
    
    return `Next Draw: ${nextSunday.toLocaleDateString()} @ 8:00 PM`;
  };

  const spinWheel = () => {
    if (isSpinning || leaderboard.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    // Collect all unique ticket references from all users
    const allTickets = [];
    leaderboard.forEach(player => {
      if (player.ticketRefs) {
        player.ticketRefs.forEach(ref => {
          allTickets.push({ ref, userName: player.userName, userId: player.userId });
        });
      } else {
        // Fallback for mock data without refs
        for (let i = 0; i < player.score; i++) {
          allTickets.push({ 
            ref: `MOCK-${player.userId}-${i}`, 
            userName: player.userName, 
            userId: player.userId 
          });
        }
      }
    });

    // Simulate wheel spin
    setTimeout(() => {
      const luckyTicket = allTickets[Math.floor(Math.random() * allTickets.length)];
      setWinner(luckyTicket);
      setDrawHistory(prev => [{
        ...luckyTicket,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      setIsSpinning(false);
    }, 3000);
  };

  const clearChat = async () => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete all lobby chat messages?")) {
      const result = await ChatService.clearAllGlobalMessages();
      if (result.success) {
        alert("Lobby chat cleared!");
      } else {
        alert("Error: " + result.error);
      }
    }
  };

  return (
    <div className="hero-background" style={styles.container}>
      <div style={styles.roomLayout}>
        {/* Left Side: Raffle Wheel */}
        <div style={styles.wheelSection}>
          <h1 className="rivalis-text" style={styles.title}>RAFFLE ROOM</h1>
          <p style={styles.periodText}>{getRafflePeriodMessage()}</p>
          
          {isAdmin && (
            <button 
              onClick={clearChat}
              style={{...styles.button, background: "#333", marginBottom: "20px", fontSize: "14px", padding: "10px 20px"}}
            >
              🗑️ CLEAR LOBBY CHAT
            </button>
          )}

          <div style={{...styles.wheel, animation: isSpinning ? "spin 3s cubic-bezier(0.15, 0, 0.15, 1) infinite" : "none"}}>
            <div style={styles.wheelInner}>
              <div style={styles.pointer}>▼</div>
              <div style={styles.bingoBall}>
                {isSpinning ? "?" : winner ? "🏆" : "🎟️"}
              </div>
            </div>
          </div>
          
          {isAdmin ? (
            <button 
              onClick={spinWheel} 
              disabled={isSpinning || leaderboard.length === 0}
              style={{...styles.button, opacity: (isSpinning || leaderboard.length === 0) ? 0.5 : 1}}
            >
              {isSpinning ? "DRAWING..." : "DRAW WINNER"}
            </button>
          ) : (
            <div style={styles.adminOnlyMessage}>
              <span style={{fontSize: "24px"}}>🔒</span>
              <p>DRAWING IS ADMIN ONLY</p>
            </div>
          )}

          {winner && !isSpinning && (
            <div style={styles.winnerAnnouncement}>
              <h2>CONGRATULATIONS!</h2>
              <p style={styles.winnerName}>{winner.userName}</p>
              <p style={{fontFamily: "monospace", color: "#ff3050"}}>REF: {winner.ref}</p>
              <p>HAS WON THE RAFFLE!</p>
            </div>
          )}

          {/* Draw History */}
          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>📜 DRAW HISTORY</h3>
            <div style={styles.historyList}>
              {drawHistory.map((draw, idx) => (
                <div key={idx} style={styles.historyItem}>
                  <span>{draw.timestamp}</span>
                  <span style={{color: "#ffd700"}}>{draw.userName}</span>
                  <span style={{fontFamily: "monospace", fontSize: "0.8rem"}}>{draw.ref}</span>
                </div>
              ))}
              {drawHistory.length === 0 && <div style={{color: "rgba(255,255,255,0.4)"}}>No draws yet</div>}
            </div>
          </div>
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
    marginBottom: "10px",
    fontFamily: "'Arial Black', sans-serif"
  },
  periodText: {
    color: "#ff3050",
    fontSize: "12px",
    marginBottom: "30px",
    fontWeight: "bold",
    letterSpacing: "1px"
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
  },
  historySection: {
    marginTop: "40px",
    width: "100%",
    borderTop: "1px solid rgba(255, 48, 80, 0.2)",
    paddingTop: "20px"
  },
  historyTitle: {
    color: "#fff",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
    opacity: 0.8
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "150px",
    overflowY: "auto"
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.05)",
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "0.9rem",
    color: "#fff"
  },
  adminOnlyMessage: {
    padding: "15px 30px",
    background: "rgba(255, 48, 80, 0.1)",
    border: "2px solid rgba(255, 48, 80, 0.3)",
    borderRadius: "30px",
    color: "#fff",
    textAlign: "center",
    fontFamily: "'Arial Black', sans-serif",
    fontSize: "14px",
    opacity: 0.8
  }
};
