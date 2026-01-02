import React from "react";

const WaitingForUpload = () => {
  return (
    <div className="hero-background" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      textAlign: "center",
      color: "#fff"
    }}>
      <div className="overlay-card" style={{ maxWidth: "500px" }}>
        <h1 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          color: "#ff3050",
          marginBottom: "2rem",
          fontSize: "1.5rem"
        }}>
          IDENTITY PENDING
        </h1>
        <p style={{ lineHeight: "1.6", marginBottom: "2rem" }}>
          Your legend is registered, but the arena needs to see who you are. 
        </p>
        <div style={{
          padding: "2rem",
          border: "2px dashed #ff3050",
          borderRadius: "12px",
          background: "rgba(255, 48, 80, 0.05)",
          marginBottom: "2rem"
        }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "#ff3050" }}>
            [ SYSTEM STATUS: WAITING FOR PHOTO UPLOAD ]
          </p>
        </div>
        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          Our admins are currently preparing the secure upload terminal. Please stay tuned as we finalize the hardware bridge.
        </p>
      </div>
    </div>
  );
};

export default WaitingForUpload;
