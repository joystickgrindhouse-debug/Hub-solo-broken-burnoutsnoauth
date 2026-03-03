import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BackgroundShell from "./components/BackgroundShell";

/* ===============================
   LAZY LOADED VIEWS
================================= */

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

/* ===============================
   APP ROOT
================================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <BackgroundShell>
      {user && <Navbar />}

      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          {/* Public Route */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />

          {/* Protected Routes */}
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Suspense>
    </BackgroundShell>
  );
}
