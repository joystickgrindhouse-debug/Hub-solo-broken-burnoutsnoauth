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

      {/* Page Content */}
      <div
        style={{
          paddingTop: "110px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 10
        }}
      >
        <Outlet />
      </div>

      {/* Floating UI */}
      <FloatingLayer />

      {/* Ads always last */}
      <AdBanner />
    </>
  );
}
