import React from "react";

export default function Achievements() {
  const achievements = [
    "First Login",
    "Completed Tutorial",
    "Reached Level 5",
    "Won First Duel"
  ];

  return (
    <div className="hero-background">
      <div className="overlay-card">
        <h2>Achievements</h2>
        <ul>
          {achievements.map((a, idx) => <li key={idx}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
