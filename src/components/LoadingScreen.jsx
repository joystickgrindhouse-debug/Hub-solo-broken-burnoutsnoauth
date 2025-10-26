import React from "react";

export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000"
    }}>
      <h1 style={{ color: "#fff" }}>Rivalis Hub Loading...</h1>
    </div>
  );
}
