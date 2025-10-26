import React from "react";

export default function Burnouts() {
  return (
    <div className="hero-background">
      <div style={styles.container}>
        <h1 style={styles.title}>Burnouts</h1>
        <p style={styles.message}>Coming Soon!</p>
        <p style={styles.subtitle}>
          Push yourself to the limit with intense workout challenges
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "40px 20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "48px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #ff4081 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "20px",
  },
  message: {
    fontSize: "32px",
    color: "#fff",
    fontWeight: "600",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.7)",
  },
};
