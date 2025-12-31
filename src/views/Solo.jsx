import React, { useEffect } from "react";

export default function Solo({ user, userProfile }) {
  useEffect(() => {
    // Load MediaPipe pose bundle
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose_bundle.js';
    script.onload = () => {
      // After MediaPipe loads, load the app
      const appScript = document.createElement('script');
      appScript.src = '/solo/app.js';
      document.body.appendChild(appScript);
    };
    document.body.appendChild(script);

    // Load styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/solo/style.css';
    document.head.appendChild(link);
  }, []);

  return (
    <div id="solo-root" style={{ width: "100%", height: "100vh" }}>
      <div className="app-container">
        <video className="input_video" playsInline muted style={{display: 'none'}}></video>
        <canvas className="output_canvas"></canvas>
        <div id="loading-overlay" className="overlay active">
          <div className="spinner"></div>
          <p>Initializing AI Core...</p>
        </div>
        <div className="ui-layer">
          <header className="top-bar">
            <div id="solo-mode-stats" className="session-stats hidden">
              <div className="stat-item">
                <span className="stat-label">TOTAL REPS</span>
                <span id="total-reps" className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">DICE</span>
                <span id="dice-earned" className="stat-value">0</span>
              </div>
              <div id="session-timer" className="stat-value">00:00</div>
            </div>
            <div className="status-badge" id="camera-status">📷 OFF</div>
          </header>
          <main className="stats-container">
            <div id="exercise-card" className="card-display hidden">
              <div className="card-header">
                <span id="card-suit" className="suit">♥</span>
                <span id="card-value" className="value">A</span>
              </div>
              <div className="card-body">
                <h2 id="card-exercise-name">PUSH-UPS</h2>
                <div className="progress-container">
                  <div id="card-progress-bar" className="progress-bar"></div>
                </div>
                <div className="target-text">TARGET: <span id="card-target">10</span></div>
              </div>
            </div>
            <div id="standard-stats" className="counter-box">
              <span className="label">REPS</span>
              <span id="rep-count" className="big-number">0</span>
            </div>
            <div className="feedback-box">
              <div id="feedback-state" className="state-indicator">READY</div>
              <div id="feedback-message" className="sub-text">Select exercise & start</div>
            </div>
          </main>
          <footer className="controls">
            <button id="start-btn" className="primary-btn">RUN SESSION</button>
          </footer>
        </div>
      </div>
    </div>
  );
}
