import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { UserService } from "./services/userService.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./views/Login.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Profile from "./views/Profile.jsx";
import AvatarCreator from "./views/AvatarCreator.jsx";
import Achievements from "./views/Achievements.jsx";
import GlobalChat from "./views/GlobalChat.jsx";
import DMChat from "./views/DMChat.jsx";
import Leaderboard from "./views/Leaderboard.jsx";
import Solo from "./views/Solo.jsx";
import Burnouts from "./views/Burnouts.jsx";
import Live from "./views/Live.jsx";
import Run from "./views/Run.jsx";
import Gameboard from "./views/Gameboard.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Loading timeout - forcing end of loading state");
      setLoading(false);
      setCheckingSetup(false);
      setProfileLoaded(true);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      
      if (currentUser) {
        console.log("Fetching user profile for:", currentUser.uid);
        try {
          const result = await UserService.getUserProfile(currentUser.uid);
          console.log("Profile fetch result:", result);
          if (result.success && result.profile) {
            setUserProfile(result.profile);
          } else {
            console.log("No profile found or fetch failed, will show avatar creator");
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setUserProfile(null);
        }
        setProfileLoaded(true);
      } else {
        setUserProfile(null);
        setProfileLoaded(true);
      }
      
      clearTimeout(timeout);
      setLoading(false);
      setCheckingSetup(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading || checkingSetup || !profileLoaded) return <LoadingScreen />;

  if (!user) return <Login />;

  if (!userProfile || !userProfile.hasCompletedSetup) {
    return (
      <AvatarCreator 
        user={user} 
        isFirstTimeSetup={true} 
        onSetupComplete={(profile) => {
          console.log("Setup complete, updating profile:", profile);
          setUserProfile(profile);
        }} 
      />
    );
  }

  return (
    <div>
      <Navbar user={user} userProfile={userProfile} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Profile user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/avatar-creator" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <AvatarCreator user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/solo" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Solo user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/burnouts" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Burnouts user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/live" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Live user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/run" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Run user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gameboard" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Gameboard user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/achievements" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Achievements user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <GlobalChat user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dm" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <DMChat user={user} userProfile={userProfile} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute user={user} userProfile={userProfile}>
              <Leaderboard user={user} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}
