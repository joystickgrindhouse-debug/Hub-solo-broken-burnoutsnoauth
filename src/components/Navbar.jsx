import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <nav className="w-full bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

      {/* Logo */}
      <Link
        to="/"
        className="text-xl font-bold text-white tracking-wide"
      >
        Rivalis
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 text-sm text-gray-300">

        <Link to="/solo" className="hover:text-white">
          Solo
        </Link>

        <Link to="/burnouts" className="hover:text-white">
          Burnouts
        </Link>

        <Link to="/live" className="hover:text-white">
          Live
        </Link>

        <Link to="/leaderboard" className="hover:text-white">
          Leaderboard
        </Link>

        <Link to="/subscription" className="hover:text-white">
          Subscription
        </Link>

        <Link to="/settings" className="hover:text-white">
          Settings
        </Link>

        {user && (
          <button
            onClick={handleLogout}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1 rounded-md"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
