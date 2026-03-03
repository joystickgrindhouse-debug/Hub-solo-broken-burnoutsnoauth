import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { User, Settings, Trophy, MessageSquare, Mail, Layout, LogOut, Shield, Menu, ChevronDown } from "lucide-react";

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
    <nav className="w-full bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/"
        className="text-xl font-bold text-white tracking-wide flex items-center gap-2"
      >
        <span className="text-red-600">RIVALIS</span> HUB
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
        <Link to="/solo" className="hover:text-white transition-colors">Solo</Link>
        <Link to="/burnouts" className="hover:text-white transition-colors">Burnouts</Link>
        <Link to="/live" className="hover:text-white transition-colors">Live</Link>
      </div>

      {/* Profile Dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-800 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-[100]">
              <div className="px-4 py-2 border-b border-zinc-800 mb-2">
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
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
                >
                  <Shield size={16} />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors border-t border-zinc-800 mt-2 pt-2"
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
