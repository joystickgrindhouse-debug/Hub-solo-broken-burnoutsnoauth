import React, { useState, useEffect } from "react";
import { LeaderboardService } from "../services/leaderboardService.js";

export default function Solo({ user, userProfile }) {
  const [reps, setReps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessionReps, setSessionReps] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const incrementReps = () => {
    setReps(reps + 1);
    setSessionReps(sessionReps + 1);
  };

  const startWorkout = () => {
    setIsActive(true);
    setSessionReps(0);
    setTimer(0);
  };

  const endWorkout = async () => {
    setIsActive(false);
    
    if (sessionReps > 0) {
      await LeaderboardService.submitScore({
        userId: user.uid,
        userName: userProfile?.nickname || user.displayName || user.email,
        gameMode: 'solo',
        score: sessionReps,
        metadata: {
          duration: timer,
          totalReps: reps
        }
      });
      
      alert(`Workout complete! ${sessionReps} reps submitted to leaderboard.`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hero-background">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>SOLO MODE</h1>
          <p style={styles.subtitle}>Track your reps. Every rep = 1 point on the leaderboard.</p>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Session Reps</div>
            <div style={styles.statValue}>{sessionReps}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Reps</div>
            <div style={styles.statValue}>{reps}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Time</div>
            <div style={styles.statValue}>{formatTime(timer)}</div>
          </div>
        </div>

        <div style={styles.controlsContainer}>
          {!isActive ? (
            <button onClick={startWorkout} style={{...styles.button, ...styles.startButton}}>
              START WORKOUT
            </button>
          ) : (
            <>
              <button 
                onClick={incrementReps} 
                style={{...styles.button, ...styles.repButton}}
              >
                + REP
              </button>
              <button onClick={endWorkout} style={{...styles.button, ...styles.endButton}}>
                END WORKOUT
              </button>
            </>
          )}
        </div>

        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>How it works:</h3>
          <ul style={styles.infoList}>
            <li>Click START WORKOUT to begin tracking</li>
            <li>Click + REP for each rep you complete</li>
            <li>Click END WORKOUT when you're done</li>
            <li>Your reps are automatically submitted to the leaderboard (1 rep = 1 point)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "56px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #667eea 0%, #ff4081 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
    letterSpacing: "4px",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "30px 20px",
    textAlign: "center",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  statLabel: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "10px",
    fontWeight: "600",
  },
  statValue: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#ff4081",
    textShadow: "0 0 20px rgba(255, 64, 129, 0.5)",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "40px",
  },
  button: {
    padding: "20px 40px",
    fontSize: "24px",
    fontWeight: "700",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  startButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 8px 30px rgba(102, 126, 234, 0.4)",
  },
  repButton: {
    background: "linear-gradient(135deg, #ff4081 0%, #ff6e40 100%)",
    color: "#fff",
    boxShadow: "0 8px 30px rgba(255, 64, 129, 0.4)",
    fontSize: "36px",
    padding: "40px",
  },
  endButton: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "2px solid rgba(255, 255, 255, 0.3)",
  },
  infoBox: {
    background: "rgba(102, 126, 234, 0.1)",
    borderRadius: "12px",
    padding: "20px 30px",
    border: "1px solid rgba(102, 126, 234, 0.3)",
  },
  infoTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "10px",
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    lineHeight: "1.8",
  },
};
