import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, userProfile, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!userProfile || !userProfile.hasCompletedSetup) {
    return <Navigate to="/" replace />;
  }

  return children;
}
