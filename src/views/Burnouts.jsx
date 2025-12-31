import React, { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { auth } from "../firebase";

export default function Burnouts({ user }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const externalAppUrl = "https://rivburnouts.netlify.app/";

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
    ? `${externalAppUrl}?token=${token}`
    : externalAppUrl;

  return (
    <div style={{ width: "100%", height: "calc(100vh - 64px)", position: "relative", overflow: "hidden" }}>
      {loading && <LoadingScreen />}
      <iframe
        src={iframeSrc}
        title="Burnouts Mode"
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
        allow="camera; microphone; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: "none" }}
      />
    </div>
  );
}
