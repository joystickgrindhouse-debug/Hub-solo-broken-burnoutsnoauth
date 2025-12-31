import React, { useState } from "react";

export default function Solo({ user, userProfile }) {
  const [isActive, setIsActive] = useState(false);

  const handleStartSolo = () => {
    setIsActive(true);
  };

  const handleEndSolo = () => {
    setIsActive(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SOLO MODE</h1>
      {!isActive ? (
        <button onClick={handleStartSolo} style={styles.button}>
          START SOLO SESSION
        </button>
      ) : (
        <div style={styles.sessionContainer}>
          <p>Solo session active...</p>
          <button onClick={handleEndSolo} style={styles.button}>
            END SESSION
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
    color: "#fff"
  },
  title: {
    fontSize: "3rem",
    fontFamily: "'Press Start 2P', cursive",
    color: "#ff3050",
    marginBottom: "2rem",
    textShadow: "0 0 20px rgba(255, 48, 80, 0.8)"
  },
  button: {
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    background: "#ff3050",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.5)"
  },
  sessionContainer: {
    textAlign: "center",
    padding: "2rem",
    border: "2px solid #ff3050",
    borderRadius: "8px",
    background: "rgba(255, 48, 80, 0.1)"
  }
};
