import React, { useEffect } from "react";
import { auth } from "../firebase.js";

export default function Solo({ user, userProfile }) {
  useEffect(() => {
    if (user) {
      // Get the auth token and redirect to the external Solo app seamlessly
      user.getIdToken().then((token) => {
        // Build the external app URL with authentication parameters
        const externalAppUrl = new URL("https://solomode.netlify.app/");
        externalAppUrl.searchParams.set("token", token);
        externalAppUrl.searchParams.set("userId", user.uid);
        externalAppUrl.searchParams.set("userEmail", user.email);
        
        // Redirect seamlessly without visible transition
        window.location.href = externalAppUrl.toString();
      }).catch((error) => {
        console.error("Error getting auth token:", error);
      });
    }
  }, [user]);

  // Seamless black screen while redirecting
  return <div style={{ width: "100%", height: "100vh", backgroundColor: "#000" }} />;
}
