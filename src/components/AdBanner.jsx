import React from "react";

const AdBanner = () => {
  return (
    <div style={{
      width: "100%",
      height: "40px",
      backgroundColor: "#111",
      borderBottom: "1px solid #ff3050",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      zIndex: 1000
    }}>
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <span style={{ color: "#ff3050", fontWeight: "bold" }}>AD</span>
        <span>Get 20% off all gear with code RIVALIS20</span>
        <a 
          href="https://squarespace.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#ff3050",
            color: "#fff",
            padding: "2px 10px",
            borderRadius: "2px",
            textDecoration: "none",
            fontSize: "0.7rem",
            fontWeight: "bold"
          }}
        >
          SHOP
        </a>
      </div>
    </div>
  );
};

export default AdBanner;