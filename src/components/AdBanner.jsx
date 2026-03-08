import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const InternalAd = ({ title, subtitle, discount, link, color, visible }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      minWidth: "300px",
      height: "60px",
      flexShrink: 0,
      background: `linear-gradient(135deg, #111 0%, ${color} 100%)`,
      border: `1px solid ${color}`,
      borderRadius: "4px",
      display: visible ? "flex" : "none",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "0 10px",
      textDecoration: "none",
      color: "#fff",
      fontFamily: "'Press Start 2P', cursive",
      fontSize: "7px",
      boxShadow: `0 0 10px ${color}44`,
      transition: "all 0.5s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.95)"
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: "4px", color: color }}>
      {title}
    </div>
    <div style={{ fontSize: "6px" }}>
      {subtitle}{" "}
      {discount && <span style={{ color: "#00ff00" }}>{discount}</span>}
    </div>
  </a>
);

const AdBanner = () => {
  const t = useTheme();
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        margin: "10px 0",
        minHeight: "60px",
        position: "relative",
        zIndex: 5, // FIXED (was 10000)
        padding: "0 10px"
      }}
    >
      <div
        style={{
          display: "flex",
          minWidth: "300px",
          width: "100%",
          maxWidth: "468px",
          height: "60px",
          overflow: "hidden",
          justifyContent: "center"
        }}
      >
        <InternalAd
          title="RIVALIS SUBSCRIPTION"
          subtitle="FOR AN AD FREE EXPERIENCE"
          discount="50% OFF NOW"
          link="/subscription"
          color={t.accent}
          visible={currentAd === 0}
        />

        <InternalAd
          title="RIVALIS MERCH SHOP"
          subtitle="GEAR UP LIKE A PRO"
          link="/merch"
          color="#00f2ff"
          visible={currentAd === 1}
        />
      </div>
    </div>
  );
};

export default AdBanner;
