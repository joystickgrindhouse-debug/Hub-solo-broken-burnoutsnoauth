import React, { useState, useEffect } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";
import { BuddyService } from "../services/buddyService.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Leaderboard({ user }) {
  const t = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState("all");
  const [filterType, setFilterType] = useState("global"); // 'global' or 'buddies'

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const unsub = LeaderboardService.listenTopScores(selectedMode, 100, async (scores) => {
      if (cancelled) return;
      let filteredScores = scores;

      if (filterType === "buddies" && user) {
        try {
          const friendIds = await BuddyService.getFriends(user.uid);
          if (cancelled) return;
          const buddySet = new Set([...friendIds, user.uid]);
          filteredScores = filteredScores.filter(s => buddySet.has(s.userId));
        } catch (err) {
          console.error("Error fetching buddies:", err);
        }
      }

      const aggregated = aggregateScores(filteredScores);
      setLeaderboard(aggregated);
      setLoading(false);
    });
    return () => { cancelled = true; unsub(); };
  }, [selectedMode, filterType, user?.uid]);

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
  ];

  return (
    <div className="hero-background">
      <div className="overlay-card" style={{ maxWidth: "800px", margin: "2rem auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Leaderboard</h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setFilterType("global")}
            style={{
              padding: "8px 16px",
              background: filterType === "global" ? t.accent : "transparent",
              border: `1px solid ${t.accent}`,
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "0.6rem"
            }}
          >GLOBAL</button>
          <button 
            onClick={() => setFilterType("buddies")}
            style={{
              padding: "8px 16px",
              background: filterType === "buddies" ? t.accent : "transparent",
              border: `1px solid ${t.accent}`,
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "0.6rem"
            }}
          >BUDDIES</button>
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                padding: "0.5rem 1rem",
                background: selectedMode === mode.id ? t.accent : "rgba(255, 255, 255, 0.1)",
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
                    ? t.hoverBg
                    : "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: player.userId === user?.uid ? `2px solid ${t.accent}` : "1px solid rgba(255, 255, 255, 0.1)"
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
                    {player.userId === user?.uid && <span style={{ color: t.accent }}> (You)</span>}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                    {Object.entries(player.gameScores).map(([mode, score]) => (
                      <span key={mode} style={{ marginRight: "1rem" }}>
                        {mode}: {score} tickets
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: t.accent }}>
                  {player.totalScore} tickets
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(102, 126, 234, 0.1)", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>How Tickets Work</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)" }}>
            <li><strong>Solo Mode:</strong> 1 rep = 1 raffle ticket</li>
            <li><strong>Other Modes:</strong> 1 point = 1 raffle ticket</li>
            <li>Your total raffle tickets are the sum of all tickets earned across game modes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
