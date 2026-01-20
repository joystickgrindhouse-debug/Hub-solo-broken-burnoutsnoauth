import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";

export default function Navbar({ user, userProfile, isDarkMode, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [profileSubmenuOpen, setProfileSubmenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  const closeDropdown = () => {
    setOpen(false);
    setProfileSubmenuOpen(false);
  };

  const avatarURL = userProfile?.avatarURL || user?.photoURL || "";
  const nickname = userProfile?.nickname || user?.displayName || "User";
  const hasCompletedSetup = userProfile?.hasCompletedSetup || false;
  
  return (
    <nav className="navbar">
      <div className="logo">RIVALIS Hub</div>
      <div className="nav-right">
        <button 
          onClick={toggleTheme}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "drop-shadow(0 0 5px rgba(255, 48, 80, 0.5))"
          }}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        {hasCompletedSetup && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {avatarURL && (
              <img 
                src={avatarURL} 
                alt={nickname} 
                style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%", 
                  background: "#fff",
                  border: "2px solid #ff4081"
                }}
              />
            )}
            <span style={{ color: "#fff", fontWeight: "600" }}>{nickname}</span>
          </div>
        )}
        <div className="menu">
          <button onClick={() => setOpen(!open)}>Menu</button>
          {open && (
            <div className="dropdown">
              <Link to="/dashboard" onClick={closeDropdown}>Home</Link>
              <div style={{ position: "relative" }}>
                <button 
                  onClick={() => setProfileSubmenuOpen(!profileSubmenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setProfileSubmenuOpen(!profileSubmenuOpen);
                    }
                  }}
                  style={{ 
                    color: "#fff",
                    padding: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "inherit",
                    fontFamily: "inherit"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 50, 80, 0.1)";
                    e.currentTarget.style.borderRadius = "4px";
                    e.currentTarget.style.borderLeft = "3px solid #ff3050";
                    e.currentTarget.style.paddingLeft = "0.7rem";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 48, 80, 0.4), inset 0 0 10px rgba(255, 48, 80, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderRadius = "0";
                    e.currentTarget.style.borderLeft = "none";
                    e.currentTarget.style.paddingLeft = "0.5rem";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Profile <span style={{ marginLeft: "0.5rem" }}>{profileSubmenuOpen ? "▼" : "▶"}</span>
                </button>
                {profileSubmenuOpen && (
                  <div style={{
                    position: "absolute",
                    left: "100%",
                    top: "0",
                    background: "#000000",
                    border: "1px solid #ff3050",
                    borderRadius: "8px",
                    padding: "0.5rem",
                    marginLeft: "0.5rem",
                    minWidth: "150px",
                    boxShadow: "0 0 15px rgba(255, 48, 80, 0.5), 0 0 30px rgba(255, 48, 80, 0.3), inset 0 0 20px rgba(255, 48, 80, 0.05)",
                    zIndex: 10000
                  }}>
                    <Link 
                      to="/profile" 
                      onClick={closeDropdown}
                      style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.5rem",
                        display: "block",
                        transition: "all 0.3s ease",
                        textShadow: "0 0 8px rgba(255, 48, 80, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 50, 80, 0.1)";
                        e.currentTarget.style.borderRadius = "4px";
                        e.currentTarget.style.borderLeft = "3px solid #ff3050";
                        e.currentTarget.style.paddingLeft = "0.7rem";
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 48, 80, 0.4), inset 0 0 10px rgba(255, 48, 80, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderRadius = "0";
                        e.currentTarget.style.borderLeft = "none";
                        e.currentTarget.style.paddingLeft = "0.5rem";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      View Profile
                    </Link>
                    <Link 
                      to="/avatar-creator" 
                      onClick={closeDropdown}
                      style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.5rem",
                        display: "block",
                        transition: "all 0.3s ease",
                        textShadow: "0 0 8px rgba(255, 48, 80, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 50, 80, 0.1)";
                        e.currentTarget.style.borderRadius = "4px";
                        e.currentTarget.style.borderLeft = "3px solid #ff3050";
                        e.currentTarget.style.paddingLeft = "0.7rem";
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 48, 80, 0.4), inset 0 0 10px rgba(255, 48, 80, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderRadius = "0";
                        e.currentTarget.style.borderLeft = "none";
                        e.currentTarget.style.paddingLeft = "0.5rem";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Avatar Creator
                    </Link>
                    <Link 
                      to="/achievements" 
                      onClick={closeDropdown}
                      style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.5rem",
                        display: "block",
                        transition: "all 0.3s ease",
                        textShadow: "0 0 8px rgba(255, 48, 80, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 50, 80, 0.1)";
                        e.currentTarget.style.borderRadius = "4px";
                        e.currentTarget.style.borderLeft = "3px solid #ff3050";
                        e.currentTarget.style.paddingLeft = "0.7rem";
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 48, 80, 0.4), inset 0 0 10px rgba(255, 48, 80, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderRadius = "0";
                        e.currentTarget.style.borderLeft = "none";
                        e.currentTarget.style.paddingLeft = "0.5rem";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Achievements
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/chat" onClick={closeDropdown}>Chat</Link>
              <Link to="/dm" onClick={closeDropdown}>DM</Link>
              <Link to="/leaderboard" onClick={closeDropdown}>Leaderboard</Link>
              {(userProfile?.role === 'admin' || userProfile?.userId === "Socalturfexperts@gmail.com" || user?.email === "socalturfexperts@gmail.com") && (
                <Link 
                  to="/admin-control" 
                  onClick={closeDropdown}
                  style={{
                    color: "#ff3050",
                    fontWeight: "bold",
                    textShadow: "0 0 10px rgba(255, 48, 80, 0.3)"
                  }}
                >
                  Admin Console
                </Link>
              )}
              <a href="https://squarespace.com" target="_blank" rel="noopener noreferrer" onClick={closeDropdown} style={{
                color: "#fff",
                textDecoration: "none",
                padding: "0.5rem",
                display: "block",
                transition: "all 0.3s ease"
              }}>Shop</a>
              <button onClick={() => { handleLogout(); closeDropdown(); }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
