import React, { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { auth } from "../firebase";
import { LeaderboardService } from "../services/leaderboardService";
import { useNavigate } from "react-router-dom";

export default function Burnouts({ user, userProfile }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const navigate = useNavigate();
  const externalAppUrl = "https://rivburnouts.netlify.app/";

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

    // Listen for messages from the iframe
    const handleMessage = (event) => {
      if (event.origin !== new URL(externalAppUrl).origin) return;
      
      if (event.data.type === "SESSION_STARTED") {
        setSessionActive(true);
      } else if (event.data.type === "SESSION_STATS") {
        handleSessionEnd(event.data.stats);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSessionEnd = async (stats) => {
    if (!user || !stats) return;

    setLoading(true);
    try {
      await LeaderboardService.submitScore({
        userId: user.uid,
        userName: userProfile?.nickname || user.email,
        gameMode: "burnouts",
        score: stats.reps || 0,
        duration: stats.duration || 0,
        metadata: {
          exercises: stats.exercises || [],
          calories: stats.calories || 0
        }
      });
      alert("Session saved! Tickets earned.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save burnout session:", error);
      alert("Failed to save session stats.");
    } finally {
      setLoading(false);
    }
  };

  const forceEndSession = () => {
    const iframe = document.getElementById("burnouts-iframe");
    if (iframe) {
      iframe.contentWindow.postMessage({ type: "END_SESSION_REQUEST" }, externalAppUrl);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const iframeSrc = token 
    ? `${externalAppUrl}?token=${token}`
    : externalAppUrl;

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", position: "relative", overflow: "hidden", backgroundColor: "#000" }}>
      {loading && <LoadingScreen />}
      
      {/* End Session Button Overlay */}
      {sessionActive && (
        <button 
          onClick={forceEndSession}
          style={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            backgroundColor: "#ff3050",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(255, 48, 80, 0.5)",
            animation: "pulse 2s infinite"
          }}
        >
          END SESSION
        </button>
      )}

      <iframe
        id="burnouts-iframe"
        src={iframeSrc}
        title="Burnouts Mode"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
        allow="camera; microphone; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: "none" }}
      />

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 48, 80, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 48, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 48, 80, 0); }
        }
      `}</style>
    </div>
  );
}
