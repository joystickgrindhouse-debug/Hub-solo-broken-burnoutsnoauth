import React, { useState, useEffect } from "react";

const HYPE_MESSAGES = [
  {
    title: "A NEW BREED OF FITNESS",
    description: "Rivalis gamifies your grind. Track workouts with AI, earn raffle tickets, and dominate the gameboard. Join the movement now!"
  },
  {
    title: "SIGN UP. LEVEL UP.",
    description: "New here? Create your legend to start earning rewards. Already a rival? Sign in to reclaim your throne."
  },
  {
    title: "GEAR UP AT THE SHOP",
    description: "Check out our exclusive merch shop! Rep the Rivalis colors in the real world with premium fitness apparel."
  },
  {
    title: "EARN YOUR ENTRIES",
    description: "Every 30 reps or half-mile ran earns you raffle tickets. Spend them on the board and conquer the arena."
  },
  {
    title: "REAL WORLD REWARDS",
    description: "Top contenders who complete the board or go the furthest each cycle win exclusive real-world rewards."
  }
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % HYPE_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-background" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#000",
      backgroundImage: "url('/loading-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      zIndex: 9999,
      touchAction: "none"
    }}>
      {/* Scanline effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))",
        zIndex: 2,
        backgroundSize: "100% 2px, 3px 100%",
        pointerEvents: "none"
      }} />

      {/* Background Overlay for text readability */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        zIndex: 1
      }} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        position: "relative",
        zIndex: 3,
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "3rem", animation: "glitch 1s infinite" }}>
          <h1 style={{ 
            fontFamily: "'Press Start 2P', cursive",
            color: "#ff3050",
            fontSize: "clamp(2rem, 8vw, 4rem)",
            fontWeight: "normal",
            textTransform: "uppercase",
            letterSpacing: "8px",
            margin: "0",
            textShadow: `
              3px 3px 0px #000,
              -1px -1px 0px #fff,
              0 0 20px rgba(255, 48, 80, 0.6)
            `
          }}>
            RIVALIS
          </h1>
          <div style={{
            height: "4px",
            width: "100%",
            background: "#ff3050",
            marginTop: "10px",
            boxShadow: "0 0 15px #ff3050"
          }} />
        </div>

        {/* Hype Content Container */}
        <div style={{
          maxWidth: "600px",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h2 key={`title-${msgIndex}`} style={{
            fontFamily: "'Press Start 2P', cursive",
            color: "#ff3050",
            fontSize: "clamp(0.8rem, 3vw, 1.2rem)",
            lineHeight: "1.6",
            marginBottom: "1.5rem",
            animation: "slideUpFade 0.5s ease-out forwards",
            textShadow: "2px 2px 0px #000, 0 0 10px rgba(255, 48, 80, 0.3)",
            fontWeight: "normal"
          }}>
            {HYPE_MESSAGES[msgIndex].title}
          </h2>
          <p key={`desc-${msgIndex}`} style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            lineHeight: "1.6",
            maxWidth: "450px",
            animation: "slideUpFade 0.5s ease-out 0.2s forwards",
            opacity: 0
          }}>
            {HYPE_MESSAGES[msgIndex].description}
          </p>
        </div>

        {/* Loading progress bar */}
        <div style={{
          width: "280px",
          height: "8px",
          background: "rgba(255, 48, 80, 0.2)",
          borderRadius: "4px",
          marginTop: "4rem",
          padding: "2px",
          border: "1px solid rgba(255, 48, 80, 0.3)"
        }}>
          <div style={{
            height: "100%",
            background: "#ff3050",
            borderRadius: "2px",
            boxShadow: "0 0 15px #ff3050",
            animation: "loadingBar 30s ease-in-out infinite"
          }} />
        </div>

        <p style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "0.6rem",
          color: "#ff3050",
          marginTop: "1.5rem",
          letterSpacing: "2px",
          animation: "blink 1s step-end infinite"
        }}>
          INITIALIZING ARENA...
        </p>
      </div>
      
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}
