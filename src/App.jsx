import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { UserService } from "./services/userService.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import OnboardingSlides from "./components/OnboardingSlides.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";

// Lazy load views for better performance
const Login = lazy(() => import("./views/Login.jsx"));
const Dashboard = lazy(() => import("./views/Dashboard.jsx"));
const Profile = lazy(() => import("./views/Profile.jsx"));
const Achievements = lazy(() => import("./views/Achievements.jsx"));
const GlobalChat = lazy(() => import("./views/GlobalChat.jsx"));
const DMChat = lazy(() => import("./views/DMChat.jsx"));
const Leaderboard = lazy(() => import("./views/Leaderboard.jsx"));
const Solo = lazy(() => import("./views/Solo.jsx"));
const Burnouts = lazy(() => import("./views/Burnouts.jsx"));
const Live = lazy(() => import("./views/Live.jsx"));
const Run = lazy(() => import("./views/Run.jsx"));
const RaffleRoom = lazy(() => import("./views/RaffleRoom.jsx"));
const WaitingForUpload = lazy(() => import("./views/WaitingForUpload.jsx"));
const AdminDashboard = lazy(() => import("./views/AdminDashboard.jsx"));

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
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [initialHype, setInitialHype] = useState(false);
  const location = useLocation();

  // Activity tracking
  useEffect(() => {
    if (user) {
      const path = location.pathname.split('/')[1] || 'dashboard';
      UserService.updateHeartbeat(user.uid, path);
      
      const interval = setInterval(() => {
        UserService.updateHeartbeat(user.uid, path);
      }, 30000); // Heartbeat every 30s
      
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  // Force a minimum loading time for the hype screen even if auth is fast
  useEffect(() => {
    const timer = setTimeout(() => setInitialHype(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    setLoading(true);
    setCheckingSetup(true);
    setProfileLoaded(false);
    setInitialHype(true);
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
            // Existing user logging in - skip onboarding if setup complete
            if (result.profile.hasCompletedSetup) {
              setShowOnboarding(false);
              setOnboardingComplete(true);
              setIsNewSignup(false);
            } else {
              // User has profile but setup not complete (shouldn't happen normally)
              setShowOnboarding(true);
              setIsNewSignup(true);
            }
          } else {
            console.log("No profile found - new user signing up");
            setUserProfile(null);
            // New user signing up - show onboarding slides
            setShowOnboarding(true);
            setIsNewSignup(true);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setUserProfile(null);
          setShowOnboarding(true);
          setIsNewSignup(true);
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
        setIsNewSignup(false);
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

  const skipLoading = () => {
    setInitialHype(false);
    setLoading(false);
    setCheckingSetup(false);
    setProfileLoaded(true);
  };

  // Show initial loading screen or hype screen
  if (loading || checkingSetup || !profileLoaded || initialHype) {
    return <LoadingScreen onSkip={skipLoading} />;
  }

  // Show onboarding slides after login/signup but before main app (only for logged-in users)
  if (user && showOnboarding && !onboardingComplete) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  // After onboarding, check if user needs to complete setup (only for NEW signups)
  if (user && isNewSignup && (!userProfile || !userProfile.hasCompletedSetup)) {
    return <WaitingForUpload user={user} onSetupComplete={() => refreshUserProfile(user.uid).then(handleSetupComplete)} />;
  }

  // Render routes (public and protected)
  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff' }}>
      {user && <Navbar user={user} userProfile={userProfile} />}
      <Suspense fallback={<div style={{ color: '#ff3050', padding: '20px', textAlign: 'center' }}>LOADING ARENA...</div>}>
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
            element={
              user ? (
                isNewSignup ? (
                  <WaitingForUpload />
                ) : (
                  <Profile user={user} userProfile={userProfile} />
                )
              ) : (
                <Login />
              )
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
            path="/raffle" 
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <RaffleRoom user={user} userProfile={userProfile} />
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
          <Route path="/admin-control" element={<Suspense fallback={<div>LOADING...</div>}><AdminDashboard /></Suspense>} />
        </Routes>
      </Suspense>
    </div>
  );
}
