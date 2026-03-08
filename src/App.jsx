import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import BackgroundShell from "./components/BackgroundShell";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";
import AdBanner from "./components/AdBanner";

import Login from "./views/Login";

/* Lazy views */
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
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {

    let unsubProfile;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {

      if (!firebaseUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      const ref = doc(db, "users", firebaseUser.uid);

      unsubProfile = onSnapshot(ref, snap => {

        const data = snap.data() || {};

        setUser({
          ...firebaseUser,
          ...data
        });

        setAuthReady(true);

      });

    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };

  }, []);

  if (!authReady) return <LoadingScreen />;

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
          <Navbar user={user} />
          <ThemeToggle />

          <div style={{ paddingTop: "110px", minHeight: "100vh" }}>
            <Suspense fallback={<LoadingScreen />}>

              <Routes>

                <Route path="/" element={<Dashboard user={user} />} />

                <Route path="/modes/solo" element={<Solo user={user} />} />
                <Route path="/modes/burnouts" element={<Burnouts user={user} />} />
                <Route path="/modes/live" element={<Live user={user} />} />
                <Route path="/modes/run" element={<Run user={user} />} />

                <Route path="/leaderboard" element={<Leaderboard user={user} />} />
                <Route path="/settings" element={<Settings user={user} />} />
                <Route path="/profile/:uid" element={<Profile user={user} />} />

                <Route path="/chat" element={<Chat user={user} />} />
                <Route path="/dms" element={<DMs user={user} />} />

                <Route path="/merch" element={<MerchShop />} />
                <Route path="/raffle" element={<RaffleRoom />} />

                <Route path="/subscription" element={<Subscription />} />
                <Route path="/fitness-dashboard" element={<FitnessDashboard user={user} />} />

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
