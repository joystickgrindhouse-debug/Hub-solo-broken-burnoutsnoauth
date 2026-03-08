import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ModeCard({ mode, onClick }) {

  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const icons = {
    solo: "🎯",
    burnouts: "🔥",
    run: "🏃",
    live: "⚡",
    raffle: "🎟️",
    merch: "👕",
    fitness: "📊"
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,0,51,0.15)"
          : "rgba(255,255,255,0.04)",
        border: hovered
          ? "1px solid rgba(255,0,51,0.6)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .3s ease",
        padding: 0,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 8px 30px rgba(255,0,51,0.25)"
          : "0 2px 8px rgba(0,0,0,0.3)"
      }}
    >

      {/* Image Area */}
      <div
        style={{
          height: "160px",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {!imgError ? (
          <img
            src={mode.image}
            alt={mode.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <span style={{ fontSize: "48px" }}>
            {icons[mode.id] || "🏋️"}
          </span>
        )}

        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 50%, rgba(255,0,51,0.3) 100%)",
              pointerEvents: "none"
            }}
          />
        )}
      </div>

      {/* Title */}
      <div
        style={{
          padding: "14px 16px",
          fontWeight: "bold",
          fontSize: "11px",
          textAlign: "center",
          letterSpacing: "2px",
          color: hovered ? "#ff3050" : "#fff",
          transition: "color .3s ease",
          fontFamily: "'Press Start 2P', cursive"
        }}
      >
        {mode.name.toUpperCase()}
      </div>

    </button>
  );
}

export default function Dashboard() {

  const navigate = useNavigate();

  const modes = [
    { id: "solo", name: "Solo", image: "/assets/images/solo.png", link: "/modes/solo" },
    { id: "burnouts", name: "Burnouts", image: "/assets/images/burnouts.png", link: "/modes/burnouts" },
    { id: "run", name: "Run", image: "/assets/images/run.png", link: "/modes/run" },
    { id: "live", name: "Live Arena", image: "/assets/images/live.png", link: "/modes/live" },
    { id: "raffle", name: "Raffle Room", image: "/assets/images/raffle.png", link: "/raffle" },
    { id: "merch", name: "Merch Shop", image: "/assets/images/shop.png", link: "/merch" },
    { id: "fitness", name: "Fitness Dashboard", image: "/assets/images/fitness.png", link: "/fitness-dashboard" }
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        paddingBottom: "80px"
      }}
    >

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px"
        }}
      >
        <h2
          style={{
            fontSize: "11px",
            fontFamily: "'Press Start 2P', cursive",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "3px"
          }}
        >
          SELECT MODE
        </h2>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
          width: "100%"
        }}
      >
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onClick={() => navigate(mode.link)}
          />
        ))}
      </div>

    </div>
  );
}
