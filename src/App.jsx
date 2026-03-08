import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import BackgroundShell from "./components/BackgroundShell";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";
import AdBanner from "./components/AdBanner";

import Login from "./views/Login";

const Dashboard = lazy(() => import("./views/Dashboard"));
const Solo = lazy(() => import("./views/Solo"));
const Burnouts = lazy(() => import("./views/Burnouts"));
const Live = lazy(() => import("./views/Live"));
const Run = lazy(() => import("./views/Run"));
const Leaderboard = lazy(() => import("./views/Leaderboard"));
const Settings = lazy(() => import("./views/Settings"));
const Profile = lazy(() => import("./views/Profile"));
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
    <BackgroundShell>

      {!user && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {user && (
        <>
          <Navbar />
          <ThemeToggle />

          <div
            style={{
              paddingTop: "110px",
              minHeight: "100vh"
            }}
          >
            <Suspense fallback={<LoadingScreen />}>

              <Routes>

                <Route path="/" element={<Dashboard />} />

                <Route path="/modes/solo" element={<Solo />} />
                <Route path="/modes/burnouts" element={<Burnouts />} />
                <Route path="/modes/live" element={<Live />} />
                <Route path="/modes/run" element={<Run />} />

                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile/:uid" element={<Profile />} />

                <Route path="/chat" element={<Chat />} />
                <Route path="/dms" element={<DMs />} />

                <Route path="/merch" element={<MerchShop />} />
                <Route path="/raffle" element={<RaffleRoom />} />

                <Route path="/subscription" element={<Subscription />} />
                <Route path="/fitness-dashboard" element={<FitnessDashboard />} />

                <Route path="/admin" element={<AdminDashboard />} />

              </Routes>

            </Suspense>
          </div>

          <AdBanner />

        </>
      )}

    </BackgroundShell>
  );
}
