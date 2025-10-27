import React from "react";

export default function LoadingScreen() {
  return (
    <div className="hero-background" style={{
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Crossing screen effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(
            to bottom,
            transparent 0%,
            transparent 48%,
            rgba(255, 48, 80, 0.1) 49%,
            rgba(255, 48, 80, 0.1) 51%,
            transparent 52%,
            transparent 100%
          )
        `,
        animation: "crossingScreen 2s linear infinite",
        pointerEvents: "none",
        zIndex: 10
      }} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        position: "relative",
        zIndex: 1
      }}>
        <h1 style={{ 
          fontFamily: "'Press Start 2P', cursive",
          color: "#ff3050",
          fontSize: "clamp(1.5rem, 5vw, 3rem)",
          fontWeight: "normal",
          textTransform: "uppercase",
          letterSpacing: "4px",
          textAlign: "center",
          lineHeight: "1.8",
          textShadow: `
            0 0 10px rgba(255, 48, 80, 0.8),
            0 0 20px rgba(255, 48, 80, 0.6),
            0 0 30px rgba(255, 48, 80, 0.4),
            0 0 40px rgba(255, 48, 80, 0.2),
            2px 2px 0 rgba(0, 0, 0, 0.8)
          `,
          animation: "neonFlicker 3s infinite, fadeIn 1s ease-in",
          margin: "0",
          padding: "1rem",
          maxWidth: "90%"
        }}>
          RIVALIS
          <br />
          <span style={{
            fontSize: "clamp(0.8rem, 2.5vw, 1.5rem)",
            display: "block",
            marginTop: "1rem"
          }}>
            FITNESS REIMAGINED
          </span>
        </h1>

        {/* Loading dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.8rem",
          alignItems: "center",
          marginTop: "3rem"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out 0.2s infinite"
          }} />
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#ff3050",
            boxShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
            animation: "pulse 1.5s ease-in-out 0.4s infinite"
          }} />
        </div>
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
        @keyframes neonFlicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow: 
              0 0 10px rgba(255, 48, 80, 0.8),
              0 0 20px rgba(255, 48, 80, 0.6),
              0 0 30px rgba(255, 48, 80, 0.4),
              0 0 40px rgba(255, 48, 80, 0.2),
              2px 2px 0 rgba(0, 0, 0, 0.8);
          }
          20%, 24%, 55% {
            text-shadow: 
              0 0 5px rgba(255, 48, 80, 0.4),
              0 0 10px rgba(255, 48, 80, 0.3),
              2px 2px 0 rgba(0, 0, 0, 0.8);
          }
        }
        @keyframes crossingScreen {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
