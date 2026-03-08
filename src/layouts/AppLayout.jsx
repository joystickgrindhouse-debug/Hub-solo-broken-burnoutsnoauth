import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";
import FloatingLayer from "../components/floating/FloatingLayer";
import AdBanner from "../components/AdBanner";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <ThemeToggle />

      {/* Page Container */}
      <main
        style={{
          minHeight: "100vh",
          paddingTop: "110px",
          paddingLeft: "20px",
          paddingRight: "20px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Outlet />
      </main>

      <FloatingLayer />

      <AdBanner />
    </>
  );
}
