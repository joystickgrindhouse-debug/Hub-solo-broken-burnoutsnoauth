import React from "react";

export default function BackgroundShell({ children }) {
  return (
    <div className="relative min-h-screen w-full">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')"
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>

    </div>
  );
}
