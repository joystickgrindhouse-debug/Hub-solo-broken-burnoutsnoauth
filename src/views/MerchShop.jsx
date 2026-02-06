import React, { useState } from "react";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function MerchShop() {
  const [loading, setLoading] = useState(true);
  const shopUrl = "https://rivalis.printful.me";

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", background: "#000", position: "relative" }}>
      {loading && <LoadingScreen />}
      <iframe
        src={shopUrl}
        title="Merch Shop"
        width="100%"
        height="100%"
        onLoad={() => setLoading(false)}
        style={{ border: "none" }}
      />
    </div>
  );
}
