import React, { useState, useEffect } from "react";

export default function LoadingScreen({ onSkip }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      if (onSkip) {
        setTimeout(onSkip, 500); // Wait for fade animation
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [onSkip]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#000",
      backgroundImage: "url('/assets/images/loading-bg.jpeg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      zIndex: 9999,
      touchAction: "none",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.5s ease-in-out",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .loading-image-container {
          width: 100%;
          height: 100%;
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
      <div className="loading-image-container" />
    </div>
  );
}
