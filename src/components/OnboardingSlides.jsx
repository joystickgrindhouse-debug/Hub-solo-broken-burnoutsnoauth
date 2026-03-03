import React from "react";

export default function BackgroundShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {children}
    </div>
  );
}
