import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates two ads side-by-side.
 */
const AdBanner = () => {
  useEffect(() => {
    // Ad 1 (468x60)
    const atOptionsScript1 = document.createElement("script");
    atOptionsScript1.type = "text/javascript";
    atOptionsScript1.innerHTML = `
      atOptions = {
        'key' : '69c3ae6b085d581d286b14b236fb4787',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    document.body.appendChild(atOptionsScript1);

    const invokeScript1 = document.createElement("script");
    invokeScript1.type = "text/javascript";
    invokeScript1.src = "https://enoughprosperabsorbed.com/69c3ae6b085d581d286b14b236fb4787/invoke.js";
    document.body.appendChild(invokeScript1);

    // Ad 2 (320x50)
    const atOptionsScript2 = document.createElement("script");
    atOptionsScript2.type = "text/javascript";
    atOptionsScript2.innerHTML = `
      atOptions = {
        'key' : '216b83ae1cc7be8e80e9273c5ce952d9',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    document.body.appendChild(atOptionsScript2);

    const invokeScript2 = document.createElement("script");
    invokeScript2.type = "text/javascript";
    invokeScript2.src = "https://enoughprosperabsorbed.com/216b83ae1cc7be8e80e9273c5ce952d9/invoke.js";
    document.body.appendChild(invokeScript2);

    return () => {
      // Cleanup
      [atOptionsScript1, invokeScript1, atOptionsScript2, invokeScript2].forEach(script => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      flexWrap: "wrap",
      justifyContent: "center", 
      alignItems: "center",
      gap: "10px",
      margin: "15px 0",
      minHeight: "60px" 
    }}>
      <div id="ad-container-69c3ae6b085d581d286b14b236fb4787"></div>
      <div id="ad-container-216b83ae1cc7be8e80e9273c5ce952d9"></div>
    </div>
  );
};

export default AdBanner;