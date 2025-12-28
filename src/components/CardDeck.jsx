import React, { useState, useEffect } from 'react';
import CardDisplay from './CardDisplay';
import './CardDeck.css';

export default function CardDeck({ 
  currentExercise, 
  currentSuit, 
  currentValue, 
  currentGroup,
  currentReps, 
  repGoal, 
  onDrawCard 
}) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleDrawCard = async () => {
    setIsFlipping(true);
    setTimeout(() => {
      onDrawCard();
      setIsFlipping(false);
    }, 600);
  };

  return (
    <div className="card-deck-container">
      <div className="deck-header">
        <h2>EXERCISE DECK</h2>
        <div className="deck-stats">
          <div className="stat">
            <span className="label">REPS</span>
            <span className="value">{currentReps}/{repGoal}</span>
          </div>
          <div className="stat">
            <span className="label">SUIT</span>
            <span className="value">{currentGroup || '---'}</span>
          </div>
        </div>
      </div>

      <div className="card-display-area">
        {currentExercise ? (
          <div className={`card-flip-wrapper ${isFlipping ? 'flipping' : ''}`}>
            <CardDisplay
              exercise={currentExercise}
              suit={currentSuit}
              value={currentValue}
              group={currentGroup}
              reps={currentReps}
              repGoal={repGoal}
            />
          </div>
        ) : (
          <div className="empty-card">
            <div className="card-placeholder">
              <p>NO CARD</p>
              <p className="small">DRAW A CARD TO BEGIN</p>
            </div>
          </div>
        )}
      </div>

      <button 
        className="draw-button" 
        onClick={handleDrawCard}
        disabled={isFlipping}
      >
        {isFlipping ? 'DRAWING...' : 'DRAW CARD'}
      </button>
    </div>
  );
}
