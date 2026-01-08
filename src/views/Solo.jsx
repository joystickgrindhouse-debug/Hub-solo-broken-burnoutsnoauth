import React, { useEffect } from "react";
import { auth } from "../firebase.js";

export default function Solo({ user }) {
  const externalAppUrl = "https://rivalis-solo.netlify.app/";

  useEffect(() => {
    const redirectWithAuth = async () => {
      try {
        let token = "";
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken(true);
        }
        
        const authData = {
          token: token,
          userId: user?.uid || "",
          userEmail: user?.email || "",
          displayName: user?.displayName || user?.email || ""
        };
        
        const params = new URLSearchParams(authData);
        window.location.href = `${externalAppUrl}?${params.toString()}`;
      } catch (error) {
        console.error("Error redirecting to Solo Mode:", error);
        window.location.href = externalAppUrl;
      }
    };
    redirectWithAuth();
  }, [user, externalAppUrl]);

  return null;
}
