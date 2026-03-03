import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import LoadingScreen from "./components/LoadingScreen";
import OnboardingSlides from "./components/OnboardingSlides";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";
import AdBanner from "./components/AdBanner";
import ChatbotTour from "./components/ChatbotTour/ChatbotTour";
import BackgroundShell from "./components/BackgroundShell";

/* Lazy Views */
const Login = lazy(() => import("./views/Login"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const Solo = lazy(() => import("./views/Solo"));
const Burnouts = lazy(() => import("./views/Burnouts"));
const Live = lazy(() => import("./views/Live"));
const Leaderboard = lazy(() => import("./views/Leaderboard"));
const Settings = lazy(() => import("./views/Settings"));
const Subscription = lazy(() => import("./views/Subscription"));
const Profile = lazy(() => import("./views/Profile"));
const AdminDashboard = lazy(() => import("./views/AdminDashboard"));

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) return <LoadingScreen />;

  return (
    <BackgroundShell>

      {/* Global UI Elements */}
      {user && <Navbar />}
      <ThemeToggle />
      <AdBanner />
      <ChatbotTour />

      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/solo"
            element={
              <ProtectedRoute user={user}>
                <Solo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/burnouts"
            element={
              <ProtectedRoute user={user}>
                <Burnouts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/live"
            element={
              <ProtectedRoute user={user}>
                <Live />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute user={user}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription"
            element={
              <ProtectedRoute user={user}>
                <Subscription />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:uid"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Suspense>

      {!user && <OnboardingSlides />}

    </BackgroundShell>
  );
}
