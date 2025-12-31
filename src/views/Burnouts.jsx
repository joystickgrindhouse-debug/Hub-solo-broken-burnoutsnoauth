import React, { useState } from "react";

export default function Burnouts({ user, userProfile }) {
  const [selectedBurnoutType, setSelectedBurnoutType] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const burnoutTypes = ["FULL BODY", "UPPER", "LOWER", "CARDIO"];

  const handleStartBurnout = (type) => {
    setSelectedBurnoutType(type);
    setIsActive(true);
  };

  const handleEndBurnout = () => {
    setIsActive(false);
    setSelectedBurnoutType(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BURNOUTS</h1>
      {!isActive ? (
        <div style={styles.typeSelection}>
          {burnoutTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleStartBurnout(type)}
              style={styles.typeButton}
            >
              {type}
            </button>
          ))}
        </div>
      ) : (
        <div style={styles.sessionContainer}>
          <p style={styles.activeType}>{selectedBurnoutType} BURNOUT</p>
          <p>Burnout session active...</p>
          <button onClick={handleEndBurnout} style={styles.button}>
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
  typeSelection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "2rem"
  },
  typeButton: {
    padding: "1rem 1.5rem",
    fontSize: "1rem",
    background: "#ff3050",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.5)",
    transition: "all 0.3s ease"
  },
  sessionContainer: {
    textAlign: "center",
    padding: "2rem",
    border: "2px solid #ff3050",
    borderRadius: "8px",
    background: "rgba(255, 48, 80, 0.1)"
  },
  activeType: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#ff3050"
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
    boxShadow: "0 0 20px rgba(255, 48, 80, 0.5)",
    marginTop: "1rem"
  }
};
