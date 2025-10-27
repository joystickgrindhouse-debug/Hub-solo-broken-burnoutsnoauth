import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { UserService } from "./services/userService.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import OnboardingSlides from "./components/OnboardingSlides.jsx";
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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Function to refresh user profile (used after avatar creation)
  const refreshUserProfile = async (userId) => {
    try {
      const result = await UserService.getUserProfile(userId);
      if (result.success && result.profile) {
        setUserProfile(result.profile);
        return result.profile;
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
    return null;
  };

  useEffect(() => {
    const MINIMUM_LOADING_TIME = 3000;
    const timeout = setTimeout(() => {
      console.log("Loading timeout - forcing end of loading state");
      setLoading(false);
      setCheckingSetup(false);
      setProfileLoaded(true);
    }, MINIMUM_LOADING_TIME);

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
            // Existing user logging in - show onboarding slides
            setShowOnboarding(true);
          } else {
            console.log("No profile found or fetch failed, will show avatar creator after onboarding");
            setUserProfile(null);
            // New user signing up - show onboarding slides
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setUserProfile(null);
          setShowOnboarding(true);
        }
        setProfileLoaded(true);
        
        const elapsedTime = Date.now() - loadingStartTime;
        const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
        
        setTimeout(() => {
          clearTimeout(timeout);
          setLoading(false);
          setCheckingSetup(false);
        }, remainingTime);
      } else {
        setUserProfile(null);
        setProfileLoaded(true);
        setShowOnboarding(false);
        setOnboardingComplete(false);
        clearTimeout(timeout);
        setLoading(false);
        setCheckingSetup(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [loadingStartTime]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingComplete(true);
  };

  const handleSetupComplete = async (profile) => {
    // Refresh the profile after avatar creation
    const updatedProfile = await refreshUserProfile(user.uid);
    if (updatedProfile && updatedProfile.hasCompletedSetup) {
      setOnboardingComplete(true);
      // Navigate to dashboard after successful setup
      setTimeout(() => navigate("/dashboard"), 100);
    }
  };

  // Show initial loading screen
  if (loading || checkingSetup || !profileLoaded) return <LoadingScreen />;

  // Show onboarding slides after login/signup but before main app (only for logged-in users)
  if (user && showOnboarding && !onboardingComplete) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  // After onboarding, check if user needs to complete setup (only for logged-in users)
  if (user && (!userProfile || !userProfile.hasCompletedSetup)) {
    return <AvatarCreator user={user} isFirstTimeSetup={true} onSetupComplete={handleSetupComplete} userProfile={userProfile} />;
  }

  // Render routes (public and protected)
  return (
    <div>
      {user && <Navbar user={user} userProfile={userProfile} />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Public routes */}
        <Route 
          path="/burnouts" 
          element={<Burnouts user={user} userProfile={userProfile} />} 
        />
        
        {/* Protected routes */}
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
          element={user ? <AvatarCreator user={user} userProfile={userProfile} /> : <Navigate to="/login" />} 
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
