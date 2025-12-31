import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Solo({ user, userProfile }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the standalone solo app
    window.location.href = "/solo/";
  }, []);

  return <div>Redirecting to Solo Mode...</div>;
}
