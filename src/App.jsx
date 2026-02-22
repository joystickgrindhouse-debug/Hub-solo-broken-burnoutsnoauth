import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./index.css";

import Navbar from "./components/Navbar.jsx";
import DemoToggle from "./components/DemoToggle.jsx";

import { AccessibilityProvider } from "./context/AccessibilityContext";
import { AccessibilityWrapper } from "./components/accessibility/AccessibilityWrapper";
import { VoiceNavigator } from "./components/accessibility/VoiceNavigator";

import { db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";

/* ===========================
   LAZY VIEWS
=========================== */

const Login = lazy(() => import("./views/Login.jsx"));
const Dashboard = lazy(() => import("./views/Dashboard.jsx"));
const Run = lazy(() => import("./views/Run.jsx"));
const Raffle = lazy(() => import("./views/RaffleRoom.jsx"));
const Profile = lazy(() => import("./views/Profile.jsx"));
const Live = lazy(() => import("./views/Live.jsx"));
const Merch = lazy(() => import("./views/MerchShop.jsx"));
const Achievements = lazy(() => import("./views/Achievements.jsx"));

/* ===========================
   ADMIN
=========================== */

const AdminDashboard = lazy(() => import("./views/admin/AdminDashboard.jsx"));
const AdminMetrics = lazy(() => import("./views/admin/AdminMetrics.jsx"));
const AdminFlags = lazy(() => import("./views/admin/AdminFlags.jsx"));
const AdminDeploys = lazy(() => import("./views/admin/AdminDeploys.jsx"));
const AdminUsers = lazy(() => import("./views/admin/AdminUsers.jsx"));
const AdminLogs = lazy(() => import("./views/admin/AdminLogs.jsx"));
const AdminAnalytics = lazy(() => import("./views/admin/AdminAnalytics.jsx"));

const AdBanner = () => (
  <div className="ad-banner">
    ADVERTISEMENT BANNER (728x90)
  </div>
);

export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [userProfile, setUserProfile] = useState(null);

  /* ===========================
     THEME
  =========================== */

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ===========================
     AUTH
  =========================== */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ===========================
     PROFILE LOAD
  =========================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!cancelled) {
          setUserProfile(snap.exists() ? snap.data() : null);
        }
      } catch (err) {
        console.error("Profile load failed", err);
        if (!cancelled) setUserProfile(null);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{
        background: "#000",
        color: "#fff",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <AccessibilityWrapper>
        <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>

          <Navbar
            user={user}
            userProfile={userProfile}
            themeMode={theme}
            toggleThemeMode={toggleTheme}
          />

          <DemoToggle />
          <VoiceNavigator />

          {location.pathname !== "/login" && <AdBanner />}

          <Routes>

            {/* ROOT */}
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />

            {/* LOGIN */}
            <Route path="/login" element={<Login />} />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />

            {/* CORE ROUTES */}
            <Route path="/run" element={user ? <Run /> : <Navigate to="/login" />} />
            <Route path="/raffle" element={user ? <Raffle /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/live" element={user ? <Live /> : <Navigate to="/login" />} />
            <Route path="/merch" element={user ? <Merch /> : <Navigate to="/login" />} />
            <Route path="/achievements" element={user ? <Achievements /> : <Navigate to="/login" />} />

            {/* ADMIN */}
            <Route
              path="/admin/*"
              element={user ? <AdminDashboard /> : <Navigate to="/login" />}
            >
              <Route path="metrics" element={<AdminMetrics />} />
              <Route path="flags" element={<AdminFlags />} />
              <Route path="deploys" element={<AdminDeploys />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "white"
                }}>
                  404 — Route Not Found
                </div>
              }
            />

          </Routes>

        </Suspense>
      </AccessibilityWrapper>
    </AccessibilityProvider>
  );
}