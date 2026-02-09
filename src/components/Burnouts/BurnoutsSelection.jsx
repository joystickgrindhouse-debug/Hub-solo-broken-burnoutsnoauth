import { useNavigate } from "react-router-dom";

const MUSCLE_GROUPS = [
  { name: "Arms", icon: "💪" },
  { name: "Legs", icon: "🦵" },
  { name: "Core", icon: "🔥" },
  { name: "Full Body", icon: "⚡" },
];

export default function BurnoutsSelection({ onSelect }) {
  const navigate = useNavigate();

  return (
    <div className="burnouts-selection-container">
      <div className="burnouts-hero-text">
        <h1 className="rivalis-title">BURNOUTS</h1>
        <h2 className="burnouts-subtitle">Can You Outlast The Deck?</h2>
      </div>
      <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px', letterSpacing: '1px' }}>SELECT MUSCLE GROUP</h3>
      <div className="burnouts-buttons-grid">
        {MUSCLE_GROUPS.map((group) => (
          <div 
            key={group.name} 
            className="burnouts-button-card" 
            onClick={() => onSelect(group.name)}
          >
            <span className="burnouts-button-icon">{group.icon}</span>
            <span>{group.name}</span>
          </div>
        ))}
      </div>
      <button 
        className="burnouts-back-btn"
        onClick={() => navigate('/dashboard')}
      >
        BACK TO HUB
      </button>
    </div>
  );
}
