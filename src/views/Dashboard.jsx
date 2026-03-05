import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SafeImg({ src, alt }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? "/assets/images/loading-bg.jpeg" : src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "12px",
      }}
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  // ✅ FIX 2: Removed duplicate .png.png extensions — was causing all images to 404
  const modes = [
    { id: "solo",    name: "Solo",               image: "/assets/images/solo.png",    link: "/solo" },
    { id: "burnouts",name: "Burnouts",            image: "/assets/images/burnouts.png",link: "/burnouts" },
    { id: "run",     name: "Run",                 image: "/assets/images/run.png",     link: "/run" },
    { id: "live",    name: "Live Arena",          image: "/assets/images/live.png",    link: "/live" },
    { id: "raffle",  name: "Raffle Room",         image: "/assets/images/raffle.png",  link: "/raffle" },
    { id: "merch",   name: "Merch Shop",          image: "/assets/images/shop.png",    link: "/merch" },
    { id: "fitness", name: "Fitness Dashboard",   image: "/assets/images/fitness.png", link: "/fitness-dashboard" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505 0%, #0a0a0a 100%)",
        color: "#fff",
        padding: "40px 24px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "6px" }}>
          RIVALIS HUB
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          Choose your mode. Dominate your rivals.
        </p>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => navigate(mode.link)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          >
            <div style={{ height: "180px" }}>
              <SafeImg src={mode.image} alt={mode.name} />
            </div>

            <div
              style={{
                padding: "16px",
                fontWeight: "bold",
                fontSize: "14px",
                textAlign: "center",
                letterSpacing: "1px",
              }}
            >
              {mode.name.toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {/* AI BUTTON */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "#ff0033",
            color: "#fff",
            border: "none",
            padding: "14px 18px",
            borderRadius: "50px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 8px 25px rgba(255,0,51,0.4)",
          }}
        >
          AI
        </button>
      )}
    </div>
  );
}
