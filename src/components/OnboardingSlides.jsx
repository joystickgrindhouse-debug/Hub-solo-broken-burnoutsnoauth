import React from "react";

export default function BackgroundShell({ children }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Red → Black Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br 
                      from-red-900/70 
                      via-black/70 
                      to-black/90" />

      {/* Content Layer */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {children}
      </div>

    </div>
  );
}
