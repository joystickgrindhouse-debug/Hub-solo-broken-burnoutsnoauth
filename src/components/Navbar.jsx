import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { User, Settings, Trophy, MessageSquare, Mail, Layout, LogOut, Shield, ChevronDown } from "lucide-react";

// ✅ FIX 3: Added inline style fallbacks on every element so Navbar renders correctly
// even if Tailwind fails to compile (missing tailwind.config.js, postcss config, etc.)

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
    { label: "Profile",           icon: <User size={16} />,          path: `/profile/${user?.uid}` },
    { label: "Settings",          icon: <Settings size={16} />,       path: "/settings" },
    { label: "Leaderboard",       icon: <Trophy size={16} />,         path: "/leaderboard" },
    { label: "Global Chat",       icon: <MessageSquare size={16} />,  path: "/chat" },
    { label: "DM's",              icon: <Mail size={16} />,           path: "/dms" },
    { label: "Fitness Dashboard", icon: <Layout size={16} />,         path: "/fitness-dashboard" },
  ];

  return (
    <nav
      className="w-full bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50"
      style={{
        width: "100%",
        background: "#000",
        borderBottom: "1px solid #27272a",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-xl font-bold text-white tracking-wide flex items-center gap-2"
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#fff",
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}
      >
        <span className="text-red-600" style={{ color: "#dc2626" }}>RIVALIS</span> HUB
      </Link>

      {/* Desktop Navigation Links */}
      <div
        className="hidden md:flex items-center gap-6 text-sm text-gray-400"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          fontSize: "14px",
          color: "#9ca3af",
        }}
      >
        <Link to="/solo"     style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white transition-colors">Solo</Link>
        <Link to="/burnouts" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white transition-colors">Burnouts</Link>
        <Link to="/live"     style={{ color: "inherit", textDecoration: "none" }} className="hover:text-white transition-colors">Live</Link>
      </div>

      {/* Profile Dropdown */}
      {user && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-800 transition-all"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#18181b",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #27272a",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <div
              className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {user.email?.[0].toUpperCase()}
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
              style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-[100]"
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
                zIndex: 100,
              }}
            >
              <div
                className="px-4 py-2 border-b border-zinc-800 mb-2"
                style={{ padding: "8px 16px", borderBottom: "1px solid #27272a", marginBottom: "8px" }}
              >
                <p
                  className="text-xs text-gray-500 truncate"
                  style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {user.email}
                </p>
              </div>

              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: "#d1d5db",
                    textDecoration: "none",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors border-t border-zinc-800 mt-2 pt-2"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: "#f87171",
                    textDecoration: "none",
                    borderTop: "1px solid #27272a",
                    marginTop: "8px",
                    paddingTop: "8px",
                  }}
                >
                  <Shield size={16} />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors border-t border-zinc-800 mt-2 pt-2"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  color: "#9ca3af",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid #27272a",
                  marginTop: "8px",
                  paddingTop: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
