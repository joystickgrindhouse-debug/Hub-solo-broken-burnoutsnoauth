import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";

import "./index.css";

import Navbar from "./components/Navbar.jsx";
import DemoToggle from "./components/DemoToggle.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { AccessibilityProvider } from "./context/AccessibilityContext";
import { AccessibilityWrapper } from "./components/accessibility/AccessibilityWrapper";
import { VoiceNavigator } from "./components/accessibility/VoiceNavigator";

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
      <div
        style={{
          background: "#000",
          color: "#fff",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* LOGIN */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/run"
              element={
                <ProtectedRoute user={user}>
                  <Run />
                </ProtectedRoute>
              }
            />

            <Route
              path="/raffle"
              element={
                <ProtectedRoute user={user}>
                  <Raffle />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile />
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
              path="/merch"
              element={
                <ProtectedRoute user={user}>
                  <Merch />
                </ProtectedRoute>
              }
            />

            <Route
              path="/achievements"
              element={
                <ProtectedRoute user={user}>
                  <Achievements />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute user={user}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route path="metrics" element={<AdminMetrics />} />
              <Route path="flags" element={<AdminFlags />} />
              <Route path="deploys" element={<AdminDeploys />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* FALLBACK */}
            <Route
              path="*"
              element={
                <Navigate
                  to={user ? "/dashboard" : "/login"}
                  replace
                />
              }
            />

          </Routes>

        </Suspense>
      </AccessibilityWrapper>
    </AccessibilityProvider>
  );
}