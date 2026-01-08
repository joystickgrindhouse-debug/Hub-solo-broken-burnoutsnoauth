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
      width: "100%",
      height: "100%",
      backgroundColor: "#000",
      zIndex: 9999,
      touchAction: "none",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.5s ease-in-out",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden !important;
          width: 100%;
          height: 100%;
          position: fixed;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .loading-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: #000;
          animation: pulse 3s ease-in-out infinite;
        }
        @media (max-aspect-ratio: 1/1) {
          .loading-image {
            object-fit: cover;
          }
        }
      `}</style>
      <img 
        src="/assets/images/loading-bg.jpeg" 
        alt="Rivalis Loading" 
        className="loading-image"
      />
    </div>
  );
}
