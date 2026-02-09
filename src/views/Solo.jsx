import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeaderboardService } from "../services/leaderboardService.js";
import SoloSession from "../components/Solo/SoloSession.jsx";
import "../styles/Solo.css";

export default function Solo({ user, userProfile }) {
  const [sessionActive, setSessionActive] = useState(true);
  const navigate = useNavigate();

  const handleSessionEnd = async (stats) => {
    if (!user || !stats) return;

    const urlParams = new URLSearchParams(window.location.search);
    const isLive = urlParams.get('mode') === 'live';

    if (isLive) {
      window.parent.postMessage({
        type: "SESSION_STATS",
        stats: stats
      }, window.location.origin);
      setSessionActive(false);
      return;
    }

    try {
      await LeaderboardService.submitScore({
        userId: user.uid,
        userName: userProfile?.nickname || user.email,
        gameMode: "solo",
        score: stats.reps || 0,
        metadata: {
          category: stats.category,
          type: 'solo'
        }
      });
      alert(`Session Complete! ${stats.reps} reps submitted.`);
    } catch (error) {
      console.error("Failed to save solo session:", error);
    }

    setSessionActive(false);
  };

  if (!sessionActive) {
    return (
      <div className="solo-complete-screen">
        <h1 className="solo-title">SESSION COMPLETE</h1>
        <p className="solo-subtitle">Great work, Rival!</p>
        <div className="solo-complete-actions">
          <button className="solo-play-again-btn" onClick={() => setSessionActive(true)}>
            PLAY AGAIN
          </button>
          <button className="solo-back-btn" onClick={() => navigate('/dashboard')}>
            BACK TO HUB
          </button>
        </div>
      </div>
    );
  }

  return (
    <SoloSession
      userId={user?.uid}
      onSessionEnd={handleSessionEnd}
    />
  );
}
