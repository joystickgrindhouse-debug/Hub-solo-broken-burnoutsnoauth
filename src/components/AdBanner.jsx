import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates the enoughprosperabsorbed ad script (468x60).
 */
const AdBanner = () => {
  useEffect(() => {
    // We create the atOptions script
    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : '69c3ae6b085d581d286b14b236fb4787',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    document.body.appendChild(atOptionsScript);

    // We create the invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://enoughprosperabsorbed.com/69c3ae6b085d581d286b14b236fb4787/invoke.js";
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
      minHeight: "60px" 
    }}>
      <div id="ad-container-69c3ae6b085d581d286b14b236fb4787"></div>
    </div>
  );
};

export default AdBanner;