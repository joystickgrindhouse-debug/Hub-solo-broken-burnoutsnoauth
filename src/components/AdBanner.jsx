import React from "react";

export default function AdBanner() {
  return (
    <div
      style={{
        width: "100%",
        padding: "12px",
        display: "flex",
        justifyContent: "center",
        marginTop: "20px"
      }}
    >
      <div
        style={{
          width: "320px",
          height: "60px",
          background: "#111",
          border: "1px solid #ff0033",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "10px",
          fontFamily: "'Press Start 2P', cursive",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px rgba(255,0,51,0.5)"
        }}
      >
        RIVALIS PRO — REMOVE ADS
      </div>
    </div>
  );
}
