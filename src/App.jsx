import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar";

const Login = lazy(() => import("./views/Login"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const Solo = lazy(() => import("./views/Solo"));
const Burnouts = lazy(() => import("./views/Burnouts"));
const Run = lazy(() => import("./views/Run"));
const Live = lazy(() => import("./views/Live"));
const RaffleRoom = lazy(() => import("./views/RaffleRoom"));
const MerchShop = lazy(() => import("./views/MerchShop"));

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
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
    <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
      {user && <Navbar user={user} />}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/solo"
          element={user ? <Solo /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/burnouts"
          element={user ? <Burnouts /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/run"
          element={user ? <Run /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/live"
          element={user ? <Live /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/raffle"
          element={user ? <RaffleRoom /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/merch"
          element={user ? <MerchShop /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}