import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { UserService } from "./services/userService.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import OnboardingSlides from "./components/OnboardingSlides.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import ChatbotTour from "./components/ChatbotTour/ChatbotTour.jsx";

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
const OtherApps = lazy(() => import("./views/OtherApps.jsx"));
const BoxingArena = lazy(() => import("./boxing/pages/Arena.tsx"));

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
  const [showBot, setShowBot] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "red-black";
  });
  const location = useLocation();

  useEffect(() => {
    document.body.classList.remove("theme-red-black", "theme-white-black", "theme-black-white");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
    // Explicitly set default theme for new users or if class is missing
    if (!document.body.classList.contains(`theme-${theme}`)) {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes = ["red-black", "white-black", "theme-black-white"]; // Using requested names
    setTheme(prev => {
      if (prev === "red-black") return "white-black";
      if (prev === "white-black") return "black-white";
      return "red-black";
    });
  };

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
    <div style={{ background: 'var(--bg-color, #111)', minHeight: '100vh', color: 'var(--text-color, #fff)', transition: 'color 0.3s ease' }}>
      {user && <Navbar user={user} userProfile={userProfile} theme={theme} cycleTheme={cycleTheme} />}
      
      {!user && location.pathname === "/login" && (
        <button 
          onClick={cycleTheme}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 10002,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--accent-color, #ff3050)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            color: "var(--accent-color, #ff3050)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem"
          }}
          title="Cycle Themes"
        >
          {theme === "red-black" ? "🔴" : theme === "white-black" ? "⚪" : "⚫"}
        </button>
      )}
      
      {user && !loading && !checkingSetup && profileLoaded && !initialHype && !showOnboarding && (
        <>
          <button 
            onClick={() => setShowBot(!showBot)}
            style={botStyles.botTrigger}
            aria-label="Rivalis Coach"
          >
            {showBot ? '✕' : '🦾'}
          </button>

          {showBot && (
            <div style={botStyles.botContainer}>
              <ChatbotTour 
                user={user} 
                userProfile={userProfile}
                onTourComplete={() => console.log('Tour finished')}
                initialMessage="Hey Rival! I'm Rivalis Coach. Ready to optimize? Let's take the tour!"
              />
            </div>
          )}
        </>
      )}

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
          <Route 
            path="/admin-control" 
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <Suspense fallback={<div>LOADING...</div>}>
                  <AdminDashboard userProfile={userProfile} />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/other-apps" 
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <OtherApps />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/boxing" 
            element={
              <ProtectedRoute user={user} userProfile={userProfile}>
                <BoxingArena />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </div>
  );
}

const botStyles = {
  botTrigger: {
    position: 'fixed',
    bottom: '85px',
    right: '20px',
    background: '#FF0000',
    color: '#FFF',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px #FF0000',
    zIndex: 10001,
    fontSize: '20px',
    transition: 'all 0.3s ease',
  },
  botContainer: {
    position: 'fixed',
    bottom: '145px',
    right: '20px',
    width: '350px',
    height: '500px',
    zIndex: 10001,
    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
  }
};
