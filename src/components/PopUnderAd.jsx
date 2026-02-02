import { useEffect } from "react";

/**
 * PopUnderAd Component
 * Injects the pop-under ad script into the document.
 */
const PopUnderAd = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pl28628138.effectivegatecpm.com/a4/6f/60/a46f60e4c5d35df7d4546ce6f3e1d521.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PopUnderAd;