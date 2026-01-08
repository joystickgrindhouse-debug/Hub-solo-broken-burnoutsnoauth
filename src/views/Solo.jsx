import React, { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { auth } from "../firebase.js";

export default function Solo({ user }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const externalAppUrl = "https://rivalis-solo.netlify.app/";

  useEffect(() => {
    const getAuthToken = async () => {
      try {
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          setToken(idToken);
        }
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
    };
    getAuthToken();
  }, []);

  const handleLoad = () => {
    setLoading(false);
  };

  const iframeSrc = token 
    ? `${externalAppUrl}?token=${token}&userId=${user?.uid || ""}&userEmail=${user?.email || ""}&displayName=${encodeURIComponent(user?.displayName || user?.email || "")}`
    : externalAppUrl;

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", position: "relative", overflow: "hidden", background: "#000" }}>
      {loading && <LoadingScreen />}
      <iframe
        src={iframeSrc}
        title="Solo Mode"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
        allow="camera; microphone; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
}
