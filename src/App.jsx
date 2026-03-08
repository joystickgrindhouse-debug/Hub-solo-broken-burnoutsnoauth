import React, { useEffect, useState, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import BackgroundShell from "./components/BackgroundShell";
import LoadingScreen from "./components/LoadingScreen";
import OnboardingSlides from "./components/OnboardingSlides";
import { VoiceProvider } from "./context/VoiceContext";
import UIRoot from "./context/UIRoot";

import AppLayout from "./layouts/AppLayout";

import Login from "./views/Login";

/* Lazy Pages */
const Dashboard = lazy(() => import("./views/Dashboard"));
const Solo = lazy(() => import("./views/Solo"));
const Burnouts = lazy(() => import("./views/Burnouts"));
const Live = lazy(() => import("./views/Live"));
const Run = lazy(() => import("./views/Run"));
const Leaderboard = lazy(() => import("./views/Leaderboard"));
const Profile = lazy(() => import("./views/Profile"));
const Settings = lazy(() => import("./views/Settings"));
const Chat = lazy(() => import("./views/GlobalChat"));
const DMs = lazy(() => import("./views/DMChat"));
const MerchShop = lazy(() => import("./views/MerchShop"));
const RaffleRoom = lazy(() => import("./views/RaffleRoom"));
const Subscription = lazy(() => import("./views/Subscription"));
const FitnessDashboard = lazy(() => import("./views/FitnessDashboard"));
const AdminDashboard = lazy(() => import("./views/AdminDashboard"));

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

  if (!authChecked) return <LoadingScreen />;

  return (
    <VoiceProvider>
      <UIRoot>
        <BackgroundShell>

          {!user && (
            <>
              <OnboardingSlides />

              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </>
          )}

          {user && (
            <Routes>

              <Route element={<AppLayout />}>

                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Modes */}
                <Route path="/modes/solo" element={<Solo />} />
                <Route path="/modes/burnouts" element={<Burnouts />} />
                <Route path="/modes/live" element={<Live />} />
                <Route path="/modes/run" element={<Run />} />

                {/* Social */}
                <Route path="/chat" element={<Chat />} />
                <Route path="/dms" element={<DMs />} />

                {/* Profile */}
                <Route path="/profile/:uid" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />

                {/* Stats */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/fitness-dashboard" element={<FitnessDashboard />} />

                {/* Shop */}
                <Route path="/merch" element={<MerchShop />} />
                <Route path="/raffle" element={<RaffleRoom />} />

                {/* Subscription */}
                <Route path="/subscription" element={<Subscription />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminDashboard />} />

              </Route>

            </Routes>
          )}

        </BackgroundShell>
      </UIRoot>
    </VoiceProvider>
  );
}
