import React, { useState, useEffect } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";

export default function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState("all");

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMode]);

  const loadLeaderboard = async () => {
    setLoading(true);
    let result;
    
    if (selectedMode === "all") {
      result = await LeaderboardService.getAllTopScores(50);
    } else {
      result = await LeaderboardService.getTopScores(selectedMode, 50);
    }

    if (result.success) {
      const aggregated = aggregateScores(result.scores);
      setLeaderboard(aggregated);
    }
    setLoading(false);
  };

  const aggregateScores = (scores) => {
    const userScores = {};

    scores.forEach((scoreEntry) => {
      const userId = scoreEntry.userId;
      if (!userScores[userId]) {
        userScores[userId] = {
          userId,
          userName: scoreEntry.userName,
          totalScore: 0,
          gameScores: {}
        };
      }

      userScores[userId].totalScore += scoreEntry.score;
      
      if (!userScores[userId].gameScores[scoreEntry.gameMode]) {
        userScores[userId].gameScores[scoreEntry.gameMode] = 0;
      }
      userScores[userId].gameScores[scoreEntry.gameMode] += scoreEntry.score;
    });

    const leaderboardArray = Object.values(userScores);
    leaderboardArray.sort((a, b) => b.totalScore - a.totalScore);

    return leaderboardArray;
  };

  const gameModes = [
    { id: "all", name: "All Modes" },
    { id: "solo", name: "Solo" },
    { id: "burnouts", name: "Burnouts" },
    { id: "live", name: "Live" },
    { id: "run", name: "Run" },
    { id: "gameboard", name: "Gameboard" }
  ];

  return (
    <div className="hero-background">
      <div className="overlay-card" style={{ maxWidth: "800px", margin: "2rem auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Leaderboard</h2>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                padding: "0.5rem 1rem",
                background: selectedMode === mode.id ? "#ff4081" : "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: selectedMode === mode.id ? "700" : "400"
              }}
            >
              {mode.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255, 255, 255, 0.6)" }}>
            No scores yet. Be the first to compete!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {leaderboard.map((player, idx) => (
              <div
                key={player.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  background: player.userId === user?.uid 
                    ? "rgba(255, 64, 129, 0.2)" 
                    : "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: player.userId === user?.uid ? "2px solid #ff4081" : "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "700", 
                  width: "40px",
                  color: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "#fff"
                }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                    {player.userName}
                    {player.userId === user?.uid && <span style={{ color: "#ff4081" }}> (You)</span>}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                    {Object.entries(player.gameScores).map(([mode, score]) => (
                      <span key={mode} style={{ marginRight: "1rem" }}>
                        {mode}: {score} pts
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ff4081" }}>
                  {player.totalScore} pts
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(102, 126, 234, 0.1)", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>How Scoring Works</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)" }}>
            <li><strong>Solo Mode:</strong> 1 rep = 1 point</li>
            <li><strong>Other Modes:</strong> Scores vary by game mode</li>
            <li>Your total score is the sum of all your game scores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
