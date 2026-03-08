import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { User, Settings, Trophy, MessageSquare, Mail, Layout, LogOut, Shield, ChevronDown } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.email === "socalturfexperts@gmail.com";

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const menuItems = [
    { label: "Profile", icon: <User size={16} />, path: `/profile/${user?.uid}` },
    { label: "Settings", icon: <Settings size={16} />, path: "/settings" },
    { label: "Leaderboard", icon: <Trophy size={16} />, path: "/leaderboard" },
    { label: "Global Chat", icon: <MessageSquare size={16} />, path: "/chat" },
    { label: "DM's", icon: <Mail size={16} />, path: "/dms" },
    { label: "Fitness Dashboard", icon: <Layout size={16} />, path: "/fitness-dashboard" },
  ];

  return (
    <nav
      style={{
        width: "100%",
        background: "#000",
        borderBottom: "1px solid #27272a",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed", // FIXED
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000 // FIXED
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#fff",
          textDecoration: "none"
        }}
      >
        <span style={{ color: "#dc2626" }}>RIVALIS</span> HUB
      </Link>

      {user && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#18181b",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #27272a",
              cursor: "pointer",
              color: "#fff"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}
            >
              {user.email?.[0].toUpperCase()}
            </div>

            <ChevronDown size={14} />
          </button>

          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "224px",
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                padding: "8px 0",
                zIndex: 2000 // ensures above ads
              }}
            >
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "8px 16px",
                    color: "#d1d5db",
                    textDecoration: "none"
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "8px 16px",
                    color: "#f87171",
                    textDecoration: "none"
                  }}
                >
                  <Shield size={16} />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
