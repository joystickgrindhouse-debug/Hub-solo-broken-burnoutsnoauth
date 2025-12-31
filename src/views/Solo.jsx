import React, { useEffect } from "react";
import { auth } from "../firebase.js";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function Solo({ user, userProfile }) {
  useEffect(() => {
    if (user) {
      // Get the auth token and redirect to the external Solo app
      user.getIdToken().then((token) => {
        // Build the external app URL with authentication parameters
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

  // Show loading screen while redirecting
  return <LoadingScreen />;
}
