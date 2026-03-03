import React, { useEffect, useState } from "react";
import Login from "../views/Login";

export default function OnboardingSlides() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  const slides = [
    {
      title: "COMPETE & CONNECT",
      description:
        "Global leaderboards, achievements, and real-time chat."
    },
    {
      title: "LIVE COMPETITIONS",
      description:
        "Real-time multiplayer fitness battles."
    },
    {
      title: "PRECISION TRACKING",
      description:
        "MediaPipe-powered rep validation."
    }
  ];

  useEffect(() => {
    if (showLogin) return;

    const timer = setTimeout(() => {
      if (slideIndex < slides.length - 1) {
        setSlideIndex((prev) => prev + 1);
      } else {
        setShowLogin(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [slideIndex, showLogin]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: showLogin ? "420px" : "600px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,0,80,0.4)",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 0 30px rgba(255,0,80,0.4)"
        }}
      >
        {!showLogin ? (
          <>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#ff2a7a",
                marginBottom: "16px"
              }}
            >
              {slides[slideIndex].title}
            </h1>

            <p style={{ color: "#ddd" }}>
              {slides[slideIndex].description}
            </p>
          </>
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}
