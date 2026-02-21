import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";
import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ user, userProfile, themeMode, toggleThemeMode }) {
	const [open, setOpen] = useState(false);
	const [profileSubmenuOpen, setProfileSubmenuOpen] = useState(false);
	const t = useTheme();

	const handleLogout = () => auth.signOut();
	const closeDropdown = () => { setOpen(false); setProfileSubmenuOpen(false); };

	const avatarURL = userProfile?.avatarURL || user?.photoURL || "";
	const nickname = userProfile?.nickname || user?.displayName || "User";

	return (
		<nav className="navbar">
			<div className="logo">RIVALIS Hub</div>
			<div className="nav-right">
				<ThemeToggle mode={themeMode} onToggle={toggleThemeMode} />

				<div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
					<div style={{ textAlign: 'right', lineHeight: 1 }}>
						<div style={{ color: '#fff', fontWeight: 700 }}>{nickname}</div>
						<div style={{ color: t.accent, fontSize: '11px' }}>🎟 {userProfile?.ticketBalance ?? 0}</div>
					</div>

					<div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${t.accent}`, background: '#fff' }}>
						{avatarURL ? (
							<img src={avatarURL} alt={nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
						) : (
							<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff' }}>{nickname[0]}</div>
						)}
					</div>

					<div className="menu">
						<button onClick={() => setOpen(!open)} aria-label="Open menu">☰</button>
						{open && (
							<div className="dropdown">
								<Link to="/dashboard" onClick={closeDropdown}>Home</Link>
								<button onClick={() => setProfileSubmenuOpen(p => !p)} style={{ background: 'transparent', color: '#fff', border: 'none', textAlign: 'left' }}>Profile {profileSubmenuOpen ? '▼' : '▶'}</button>
								{profileSubmenuOpen && (
									<div style={{ paddingLeft: '0.5rem' }}>
										<Link to="/profile" onClick={closeDropdown}>View Profile</Link>
										<Link to="/avatar-creator" onClick={closeDropdown}>Avatar Creator</Link>
										<Link to="/achievements" onClick={closeDropdown}>Achievements</Link>
									</div>
								)}
								<Link to="/fitness" onClick={closeDropdown}>Fitness Dashboard</Link>
								<Link to="/chat" onClick={closeDropdown}>Chat</Link>
								<Link to="/dm" onClick={closeDropdown}>DM</Link>
								<Link to="/leaderboard" onClick={closeDropdown}>Leaderboard</Link>
								{(userProfile?.role === 'admin' || userProfile?.userId === "Socalturfexperts@gmail.com" || user?.email === "socalturfexperts@gmail.com") && (
									<Link to="/admin-control" onClick={closeDropdown} style={{ color: t.accent, fontWeight: 'bold' }}>Admin Console</Link>
								)}
								<Link to="/shop" onClick={closeDropdown}>Shop</Link>
								<Link to="/settings" onClick={closeDropdown}>Settings</Link>
								<button onClick={() => { handleLogout(); closeDropdown(); }}>Logout</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

