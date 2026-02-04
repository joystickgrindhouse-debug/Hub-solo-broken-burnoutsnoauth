import React, { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { auth } from "../firebase.js";

import { LeaderboardService } from "../services/leaderboardService.js";
import { useNavigate } from "react-router-dom";

export default function Solo({ user, userProfile }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const externalAppUrl = "https://solochallenge.netlify.app/";

  useEffect(() => {
    const getAuthToken = async () => {
      try {
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          setToken(idToken);
        }
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
    };
    getAuthToken();

    const handleMessage = async (event) => {
      // Allow messages from the new solo app
      if (event.origin !== "https://solochallenge.netlify.app" && event.origin !== window.location.origin) return;
      
      if (event.data.type === "SESSION_STATS") {
        await handleSessionEnd(event.data.stats);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [user]);

  const handleSessionEnd = async (stats) => {
    if (!user || !stats) return;
    
    // Check if we are in live mode
    const urlParams = new URLSearchParams(window.location.search);
    const isLive = urlParams.get('mode') === 'live';

    if (isLive) {
      window.parent.postMessage({
        type: "SESSION_STATS",
        stats: stats
      }, window.location.origin);
      return;
    }

    try {
      await LeaderboardService.submitScore({
        userId: user.uid,
        userName: userProfile?.nickname || user.email,
        gameMode: "solo",
        score: stats.reps || 0,
        metadata: {
          exercise: stats.exercise,
          type: stats.type
        }
      });
      alert(`Card Complete! ${stats.reps} reps submitted.`);
    } catch (error) {
      console.error("Failed to save solo session:", error);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const iframeSrc = token 
    ? `${externalAppUrl}?token=${token}&userId=${user?.uid || ""}&userEmail=${user?.email || ""}&displayName=${encodeURIComponent(user?.displayName || user?.email || "")}`
    : externalAppUrl;

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", position: "relative", overflow: "hidden", background: "#000" }}>
      {loading && <LoadingScreen />}
      <iframe
        src={iframeSrc}
        title="Solo Mode"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
        allow="camera; microphone; autoplay; clipboard-write; encrypted-media; gyroscope; accelerometer; magnetometer; display-capture; picture-in-picture"
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
}
