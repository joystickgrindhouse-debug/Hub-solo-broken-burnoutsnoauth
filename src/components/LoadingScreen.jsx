import React, { useState, useEffect } from "react";

export default function LoadingScreen({ onSkip }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // ✅ FIX: The original component injected `body { position: fixed; overflow: hidden }`
    // via a <style> tag that NEVER got cleaned up. Once the loading screen faded out,
    // those body styles stayed active permanently — locking scroll across the entire app.
    // Fixed by applying overflow:hidden directly to body in JS on mount, and
    // restoring it on unmount via the useEffect cleanup function.
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    const timer = setTimeout(() => {
      setFadeOut(true);
      if (onSkip) {
        setTimeout(onSkip, 500);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      // Restore body styles when loading screen unmounts
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.width = "";
      document.body.style.height = "";
    };
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
