import { useNavigate } from "react-router-dom";

const MUSCLE_GROUPS = [
  { name: "Arms", icon: "💪" },
  { name: "Legs", icon: "🦵" },
  { name: "Core", icon: "🔥" },
  { name: "Full Body", icon: "⚡" },
];

export default function SoloSelection({ onSelect }) {
  const navigate = useNavigate();

  return (
    <div className="solo-selection-container">
      <div className="solo-hero-text">
        <h1 className="solo-title">SOLO</h1>
        <h2 className="solo-subtitle">Draw Your Deck. Crush Every Card.</h2>
      </div>
      <h3 className="solo-prompt">SELECT MUSCLE GROUP</h3>
      <div className="solo-buttons-grid">
        {MUSCLE_GROUPS.map((group) => (
          <div
            key={group.name}
            className="solo-button-card"
            onClick={() => onSelect(group.name)}
          >
            <span className="solo-button-icon">{group.icon}</span>
            <span>{group.name}</span>
          </div>
        ))}
      </div>
      <button
        className="solo-back-btn"
        onClick={() => navigate('/dashboard')}
      >
        BACK TO HUB
      </button>
    </div>
  );
}
