import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates the enoughprosperabsorbed ad script (300x250).
 */
const AdBanner = () => {
  useEffect(() => {
    // We create the atOptions script
    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : '38ce9df69c690693704a9ca7a12af52a',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    document.body.appendChild(atOptionsScript);

    // We create the invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://enoughprosperabsorbed.com/38ce9df69c690693704a9ca7a12af52a/invoke.js";
    document.body.appendChild(invokeScript);

    return () => {
      // Cleanup
      if (document.body.contains(atOptionsScript)) {
        document.body.removeChild(atOptionsScript);
      }
      if (document.body.contains(invokeScript)) {
        document.body.removeChild(invokeScript);
      }
    };
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      justifyContent: "center", 
      margin: "15px 0",
      minHeight: "250px" 
    }}>
      <div id="ad-container-38ce9df69c690693704a9ca7a12af52a"></div>
    </div>
  );
};

export default AdBanner;