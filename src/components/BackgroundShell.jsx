import React from "react";

export default function BackgroundShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative"
      }}
    >

      {/* gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(120,0,0,0.65) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.9) 100%)"
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {children}
      </div>

    </div>
  );
}
