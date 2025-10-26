import React from "react";

export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#000000",
      gap: "2rem"
    }}>
      <h1 style={{ 
        color: "#ff3050",
        fontSize: "3rem",
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
        margin: 0
      }}>
        RIVALIS
      </h1>
      <div style={{
        display: "flex",
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
