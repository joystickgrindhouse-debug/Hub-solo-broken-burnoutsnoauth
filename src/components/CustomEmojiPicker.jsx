import React from "react";

const gamingEmojis = [
  "😠", "💀", "🎮", "❓", "📻", "🖕", "💪", "😢",
  "😂", "🕹️", "🔥", "😈", "❌", "🍿", "💥", "🟢",
  "⚔️", "🎯", "👾", "👋", "💣", "😎", "🏆", "⚡",
  "💎", "🎲", "🎪", "🚀", "💊", "🗡️", "🛡️", "👑"
];

export default function CustomEmojiPicker({ onEmojiSelect, onClose }) {
  return (
    <div 
      style={{
        background: "#000000",
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 0 20px rgba(255, 48, 80, 0.6), inset 0 0 20px rgba(255, 48, 80, 0.1)",
        maxWidth: "300px",
        position: "relative"
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.5rem",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid rgba(255, 48, 80, 0.3)"
      }}>
        <h4 style={{ 
          margin: 0, 
          color: "#ff3050",
          textShadow: "0 0 10px rgba(255, 48, 80, 0.8)",
          fontSize: "14px"
        }}>
          GAMING EMOJIS
        </h4>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid #ff3050",
            color: "#ff3050",
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold"
          }}
        >
          ✕
        </button>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "0.5rem",
        maxHeight: "200px",
        overflowY: "auto"
      }}>
        {gamingEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            style={{
              background: "rgba(255, 48, 80, 0.1)",
              border: "1px solid rgba(255, 48, 80, 0.3)",
              borderRadius: "6px",
              padding: "0.5rem",
              cursor: "pointer",
              fontSize: "20px",
              transition: "all 0.2s",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 48, 80, 0.3)";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 48, 80, 0.6)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 48, 80, 0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
