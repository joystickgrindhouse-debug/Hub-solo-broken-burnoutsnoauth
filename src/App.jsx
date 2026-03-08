import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import BackgroundShell from "./components/BackgroundShell";
import OnboardingSlides from "./components/OnboardingSlides";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";
import AdBanner from "./components/AdBanner";

import FloatingLayer from "./components/floating/FloatingLayer";
import { VoiceProvider } from "./context/VoiceContext";
import UIRoot from "./context/UIRoot";

import Login from "./views/Login";

/* Lazy Views */
const Dashboard = lazy(() => import("./views/Dashboard"));
const Solo = lazy(() => import("./views/Solo"));
const Burnouts = lazy(() => import("./views/Burnouts"));
const Live = lazy(() => import("./views/Live"));
const Leaderboard = lazy(() => import("./views/Leaderboard"));
const Settings = lazy(() => import("./views/Settings"));
const Subscription = lazy(() => import("./views/Subscription"));
const Profile = lazy(() => import("./views/Profile"));
const AdminDashboard = lazy(() => import("./views/AdminDashboard"));
const RaffleRoom = lazy(() => import("./views/RaffleRoom"));
const MerchShop = lazy(() => import("./views/MerchShop"));
const Chat = lazy(() => import("./views/GlobalChat"));
const DMs = lazy(() => import("./views/DMChat"));
const FitnessDashboard = lazy(() => import("./views/FitnessDashboard"));
const Run = lazy(() => import("./views/Run"));

export default function App() {

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();

  }, []);

  if (!authChecked) {
    return <LoadingScreen />;
  }

  return (
    <VoiceProvider>
      <UIRoot>
        <BackgroundShell>

          {/* NOT LOGGED IN */}
          {!user && (
            <>
              <OnboardingSlides />

              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </>
          )}

          {/* LOGGED IN */}
          {user && (
            <>
              {/* Top Navigation */}
              <Navbar />
              <ThemeToggle />

              {/* Main Pages */}
              <Suspense fallback={<LoadingScreen />}>
                <Routes>

                  <Route path="/" element={
                    <ProtectedRoute user={user}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/solo" element={
                    <ProtectedRoute user={user}>
                      <Solo />
                    </ProtectedRoute>
                  } />

                  <Route path="/burnouts" element={
                    <ProtectedRoute user={user}>
                      <Burnouts />
                    </ProtectedRoute>
                  } />

                  <Route path="/live" element={
                    <ProtectedRoute user={user}>
                      <Live />
                    </ProtectedRoute>
                  } />

                  <Route path="/leaderboard" element={
                    <ProtectedRoute user={user}>
                      <Leaderboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/settings" element={
                    <ProtectedRoute user={user}>
                      <Settings />
                    </ProtectedRoute>
                  } />

                  <Route path="/subscription" element={
                    <ProtectedRoute user={user}>
                      <Subscription />
                    </ProtectedRoute>
                  } />

                  <Route path="/profile/:uid" element={
                    <ProtectedRoute user={user}>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <ProtectedRoute user={user}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/raffle" element={
                    <ProtectedRoute user={user}>
                      <RaffleRoom />
                    </ProtectedRoute>
                  } />

                  <Route path="/merch" element={
                    <ProtectedRoute user={user}>
                      <MerchShop />
                    </ProtectedRoute>
                  } />

                  <Route path="/chat" element={
                    <ProtectedRoute user={user}>
                      <Chat />
                    </ProtectedRoute>
                  } />

                  <Route path="/dms" element={
                    <ProtectedRoute user={user}>
                      <DMs />
                    </ProtectedRoute>
                  } />

                  <Route path="/fitness-dashboard" element={
                    <ProtectedRoute user={user}>
                      <FitnessDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/run" element={
                    <ProtectedRoute user={user}>
                      <Run />
                    </ProtectedRoute>
                  } />

                </Routes>
              </Suspense>

              {/* Floating Systems */}
              <FloatingLayer />

              {/* Ads Render Last (Behind UI) */}
              <AdBanner />

            </>
          )}

        </BackgroundShell>
      </UIRoot>
    </VoiceProvider>
  );
}
