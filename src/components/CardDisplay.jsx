import React from 'react';
import './CardDisplay.css';

export default function CardDisplay({ exercise, suit, value, group, reps, repGoal }) {
  const suitSymbols = {
    Arms: '♥',
    Legs: '♠',
    Core: '♣',
    Cardio: '♦'
  };

  const suitColors = {
    Arms: '#e63946',      // red
    Legs: '#000',         // black
    Core: '#000',         // black
    Cardio: '#e63946'     // red
  };

  const symbol = suitSymbols[group] || '♠';
  const color = suitColors[group] || '#000';

  return (
    <div className="playing-card" style={{ '--card-color': color }}>
      {/* Top Left Corner */}
      <div className="card-corner top-left">
        <div className="corner-symbol">{symbol}</div>
        <div className="corner-value">{value}</div>
      </div>

      {/* Center Content */}
      <div className="card-center">
        <div className="exercise-name">{exercise}</div>
        <div className="card-divider"></div>
        <div className="rep-info">
          <span className="rep-count">{reps}</span>
          <span className="rep-slash">/</span>
          <span className="rep-goal">{repGoal}</span>
        </div>
        <div className="muscle-group">{group}</div>
      </div>

      {/* Bottom Right Corner (inverted) */}
      <div className="card-corner bottom-right">
        <div className="corner-value">{value}</div>
        <div className="corner-symbol">{symbol}</div>
      </div>

      {/* Background pattern */}
      <div className="card-pattern"></div>
    </div>
  );
}
