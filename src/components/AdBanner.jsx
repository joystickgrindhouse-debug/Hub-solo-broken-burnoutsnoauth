import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates two ads side-by-side with unique handling.
 */
const AdBanner = () => {
  useEffect(() => {
    // Ad 1 (468x60)
    const container1 = document.getElementById("ad-container-69c3ae6b085d581d286b14b236fb4787");
    if (container1) {
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
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      flexWrap: "wrap",
      justifyContent: "center", 
      alignItems: "center",
      gap: "20px",
      margin: "15px 0",
      minHeight: "60px",
      position: "relative",
      zIndex: 10000
    }}>
      <div id="ad-container-69c3ae6b085d581d286b14b236fb4787" style={{ minWidth: "468px", minHeight: "60px", background: "#222" }}></div>
    </div>
  );
};

export default AdBanner;