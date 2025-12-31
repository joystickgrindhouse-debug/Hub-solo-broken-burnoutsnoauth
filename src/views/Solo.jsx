import React from "react";

export default function Solo({ user, userProfile }) {
  return (
    <iframe 
      src="/solo/index.html" 
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block"
      }}
      title="Solo Mode"
      allow="camera *"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
