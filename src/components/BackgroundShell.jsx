import React from "react";

export default function BackgroundShell({ children }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {children}
      </div>

    </div>
  );
}
