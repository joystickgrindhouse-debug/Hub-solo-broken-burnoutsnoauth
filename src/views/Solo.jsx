import React, { useState } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";
import SoloSelection from "../components/Solo/SoloSelection.jsx";
import SoloSession from "../components/Solo/SoloSession.jsx";
import "../styles/Solo.css";

export default function Solo({ user, userProfile }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSessionEnd = async (stats) => {
    if (!user || !stats) return;

    const urlParams = new URLSearchParams(window.location.search);
    const isLive = urlParams.get('mode') === 'live';

    if (isLive) {
      window.parent.postMessage({
        type: "SESSION_STATS",
        stats: stats
      }, window.location.origin);
      setSelectedGroup(null);
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

    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <SoloSession
        userId={user?.uid}
        muscleGroup={selectedGroup}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return <SoloSelection onSelect={setSelectedGroup} />;
}
