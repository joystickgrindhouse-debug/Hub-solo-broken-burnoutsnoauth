import React from "react";

// ✅ FIX: ThemeToggle used only CSS class names (theme-switch-wrap, theme-switch,
// theme-switch-thumb, etc.) with zero inline styles and no CSS import.
// Those classes are defined nowhere in the project's uploaded stylesheets,
// so the entire toggle rendered as an invisible/unstyled element.
// Replaced with a fully self-contained inline-styled toggle.

export default function ThemeToggle({ mode = "dark", onToggle, className = "" }) {
  const isLight = mode === "light";

  return (
    <div
      className={`theme-switch-wrap ${className}`.trim()}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "6px 10px",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="theme-switch-label"
        style={{
          fontSize: "9px",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Press Start 2P', cursive",
          letterSpacing: "0.5px",
        }}
      >
        {isLight ? "LIGHT" : "DARK"}
      </span>

      <button
        type="button"
        className={`theme-switch ${isLight ? "is-light" : ""}`.trim()}
        onClick={onToggle}
        role="switch"
        aria-checked={isLight}
        aria-label="Toggle light and dark mode"
        style={{
          position: "relative",
          width: "40px",
          height: "22px",
          borderRadius: "11px",
          background: isLight
            ? "linear-gradient(135deg, #ffe066, #ffb300)"
            : "linear-gradient(135deg, #ff2a7a, #cc0033)",
          border: "none",
          cursor: "pointer",
          padding: 0,
          transition: "background 0.3s ease",
          boxShadow: isLight
            ? "0 0 8px rgba(255,200,0,0.4)"
            : "0 0 8px rgba(255,42,122,0.4)",
        }}
      >
        {/* Hidden text labels for accessibility */}
        <span
          className="theme-switch-text theme-switch-text-dark"
          style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          Dark
        </span>
        <span
          className="theme-switch-text theme-switch-text-light"
          style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          Light
        </span>

        {/* Thumb */}
        <span
          className="theme-switch-thumb"
          style={{
            position: "absolute",
            top: "3px",
            left: isLight ? "21px" : "3px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.25s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            lineHeight: 1,
          }}
        >
          {isLight ? "☀️" : "🌙"}
        </span>
      </button>
    </div>
  );
}
