import React, { useEffect } from "react";

/**
 * AdBanner Component
 * Integrates the highperformanceformat ad script.
 */
const AdBanner = () => {
  useEffect(() => {
    // We create the atOptions script
    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : '216b83ae1cc7be8e80e9273c5ce952d9',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    document.body.appendChild(atOptionsScript);

    // We create the invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/216b83ae1cc7be8e80e9273c5ce952d9/invoke.js";
    document.body.appendChild(invokeScript);

    return () => {
      // Cleanup if needed (though ad scripts usually stick around)
      document.body.removeChild(atOptionsScript);
      document.body.removeChild(invokeScript);
    };
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      justifyContent: "center", 
      margin: "10px 0",
      minHeight: "50px" 
    }}>
      {/* The ad will be injected here or as an iframe by the script */}
      <div id="ad-container-216b83ae1cc7be8e80e9273c5ce952d9"></div>
    </div>
  );
};

export default AdBanner;