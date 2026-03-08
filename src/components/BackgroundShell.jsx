import React from "react";

export default function BackgroundShell({ children }) {

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: "url('/assets/images/rivalis-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >

      {/* overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 1
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 2
        }}
      >
        {children}
      </div>

    </div>
  );
}
