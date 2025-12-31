import React, { useEffect } from "react";
import { auth } from "../firebase.js";

export default function Solo({ user, userProfile }) {
  useEffect(() => {
    if (user) {
      // Get the auth token and redirect to the external Solo app
      user.getIdToken().then((token) => {
        // Pass the token and user info to the external app via URL parameters
        const externalAppUrl = new URL("https://solomode.netlify.app/");
        externalAppUrl.searchParams.set("token", token);
        externalAppUrl.searchParams.set("userId", user.uid);
        externalAppUrl.searchParams.set("userEmail", user.email);
        
        // Redirect to the external app
        window.location.href = externalAppUrl.toString();
      }).catch((error) => {
        console.error("Error getting auth token:", error);
      });
    }
  }, [user]);

  return (
    <div style={{ 
      width: "100%", 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#000",
      color: "#00ff00"
    }}>
      <div style={{ textAlign: "center" }}>
        <p>Redirecting to Solo Mode...</p>
        <p style={{ fontSize: "12px", marginTop: "10px" }}>If you are not redirected, click <a href="https://solomode.netlify.app/" style={{ color: "#00ff00" }}>here</a></p>
      </div>
    </div>
  );
}
