import React, { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { LeaderboardService } from "../services/leaderboardService.js";
import { useNavigate } from "react-router-dom";
import SoloSession from "../components/Solo/SoloSession.jsx";
import "../styles/Solo.css";

export default function Solo({ user, userProfile }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useState(() => {
    setTimeout(() => setLoading(false), 2000);
  });

  const handleSessionEnd = async (stats) => {
    if (!user || !stats) return;

    setLoading(true);
    try {
      await LeaderboardService.submitScore({
        userId: user.uid,
        userName: userProfile?.nickname || user.email,
        gameMode: "solo",
        score: stats.reps || 0,
        duration: stats.duration || 0,
        metadata: {
          category: stats.category,
          type: 'solo'
        }
      });
      alert(`Session Complete! ${stats.reps} reps submitted.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save solo session:", error);
      alert("Failed to save session stats.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", position: "relative", overflow: "hidden", backgroundColor: "#000" }}>
      {loading && <LoadingScreen />}

      <SoloSession
        userId={user.uid}
        onSessionEnd={handleSessionEnd}
      />
    </div>
  );
}
