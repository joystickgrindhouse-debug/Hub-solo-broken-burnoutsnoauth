import React from "react";

export default function LoadingScreen() {
  return (
    <div className="hero-background">
      <div style={{
        maxWidth: "600px",
        width: "90%",
        background: "rgba(0, 0, 0, 0.85)",
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 0 30px rgba(255, 48, 80, 0.5), inset 0 0 20px rgba(255, 48, 80, 0.05)"
      }}>
        <h1 style={{ 
          color: "#ff3050",
          fontSize: "clamp(2rem, 8vw, 3rem)",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "4px",
          textShadow: `
            0 0 10px rgba(255, 48, 80, 0.8),
            0 0 20px rgba(255, 48, 80, 0.6),
            0 0 30px rgba(255, 48, 80, 0.4),
            0 0 40px rgba(255, 48, 80, 0.2)
          `,
          animation: "flicker 3s infinite",
          margin: "0 0 1rem 0",
          textAlign: "center"
        }}>
          RIVALIS
        </h1>
        
        <p style={{
          color: "#ff3050",
          fontSize: "0.9rem",
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: "bold",
          textShadow: "0 0 8px rgba(255, 48, 80, 0.5)"
        }}>
          Fitness meets gaming
        </p>

        <div style={{
          color: "#fff",
          fontSize: "0.95rem",
          lineHeight: "1.8",
          marginBottom: "2rem"
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ color: "#ff3050", fontWeight: "bold" }}>💪 AI-Powered Workouts</span>
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Use your camera for automatic rep counting with pose detection
            </span>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <span style={{ color: "#ff3050", fontWeight: "bold" }}>🎮 Gamified Training</span>
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Solo mode, Burnouts, Live challenges & more game modes
            </span>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <span style={{ color: "#ff3050", fontWeight: "bold" }}>🏆 Compete & Connect</span>
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Global leaderboards, achievements, and real-time chat
            </span>
          </div>

          <div>
            <span style={{ color: "#ff3050", fontWeight: "bold" }}>🎲 Earn Rewards</span>
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              Get dice for completing workouts across 16 exercises
            </span>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          alignItems: "center"
        }}>
          <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 10px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
          <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 10px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out 0.2s infinite"
          }} />
          <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 10px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out 0.4s infinite"
          }} />
        </div>

        <p style={{
          color: "#ff3050",
          fontSize: "0.8rem",
          textAlign: "center",
          marginTop: "1.5rem",
          opacity: 0.8
        }}>
          Loading your profile...
        </p>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow: 
              0 0 10px rgba(255, 48, 80, 0.8),
              0 0 20px rgba(255, 48, 80, 0.6),
              0 0 30px rgba(255, 48, 80, 0.4),
              0 0 40px rgba(255, 48, 80, 0.2);
          }
          20%, 24%, 55% {
            text-shadow: 
              0 0 5px rgba(255, 48, 80, 0.4),
              0 0 10px rgba(255, 48, 80, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
