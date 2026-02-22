import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminDashboard.css";

const navItems = [
  { path: "metrics", label: "System Metrics" },
  { path: "flags", label: "Feature Flags" },
  { path: "deploys", label: "Deploy / Rollback" },
  { path: "users", label: "User Management" },
  { path: "logs", label: "Logs" },
  { path: "analytics", label: "Analytics" },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Admin Console</h2>

        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                isActive
                  ? "admin-nav-link active"
                  : "admin-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}