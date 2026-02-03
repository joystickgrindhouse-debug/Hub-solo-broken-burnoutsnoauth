import React, { useEffect, useState } from "react";

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
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "scale(1.02)";
      e.currentTarget.style.boxShadow = `0 0 20px ${color}88`;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = `0 0 10px ${color}44`;
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: "4px", color: color }}>{title}</div>
    <div style={{ fontSize: "6px" }}>{subtitle} {discount && <span style={{ color: "#00ff00" }}>{discount}</span>}</div>
  </a>
);

/**
 * AdBanner Component
 * Integrates external and internal ads.
 */
const AdBanner = () => {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    // External Ad (468x60)
    const container1 = document.getElementById("ad-container-69c3ae6b085d581d286b14b236fb4787");
    if (container1) {
      container1.innerHTML = ''; // Clear if re-rendering
      const script1 = document.createElement("script");
      script1.type = "text/javascript";
      script1.innerHTML = `
        atOptions = {
          'key' : '69c3ae6b085d581d286b14b236fb4787',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      container1.appendChild(script1);

      const invoke1 = document.createElement("script");
      invoke1.type = "text/javascript";
      invoke1.src = "https://enoughprosperabsorbed.com/69c3ae6b085d581d286b14b236fb4787/invoke.js";
      container1.appendChild(invoke1);
    }

    // Rotate internal ads every 5 seconds
    const interval = setInterval(() => {
      setCurrentAd(prev => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      flexDirection: "row",
      flexWrap: "nowrap",
      justifyContent: "center", 
      alignItems: "center",
      gap: "15px",
      margin: "10px 0",
      minHeight: "60px",
      position: "relative",
      zIndex: 10000,
      padding: "0 10px"
    }}>
      <div id="ad-container-69c3ae6b085d581d286b14b236fb4787" style={{ minWidth: "468px", minHeight: "60px", background: "#222", flexShrink: 0 }}></div>
      <div style={{ display: 'flex', minWidth: '300px', height: '60px', overflow: 'hidden' }}>
        <InternalAd 
          title="RIVALIS SUBSCRIPTION" 
          subtitle="LEVEL UP YOUR GAINS" 
          discount="25% OFF NOW" 
          link="/subscription" 
          color="#ff3050"
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