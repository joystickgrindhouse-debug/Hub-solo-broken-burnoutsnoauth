import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates with Google AdSense or falls back to internal promotions.
 * Replace 'ca-pub-XXXXXXXXXXXXXXXX' and '1234567890' with your real AdSense details.
 */
const AdBanner = ({ isProduction = false }) => {
  useEffect(() => {
    if (isProduction) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isProduction]);

  if (isProduction) {
    return (
      <div style={{ width: "100%", textAlign: "center", margin: "10px 0", overflow: "hidden" }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Fallback / Internal Ad (Fastest to set up)
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
      zIndex: 1000,
      position: 'relative'
    }}>
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <span style={{ color: "#ff3050", fontWeight: "bold" }}>PROMO</span>
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
            fontWeight: "bold",
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          SHOP
        </a>
      </div>
    </div>
  );
};

export default AdBanner;