import React, { useState, useEffect, Suspense } from "react";
import Modal from "react-modal";

import { LiveService } from "../services/liveService.js";
import LogsGraph from "../components/ChatbotTour/LogsGraph.jsx";
import { UsageService } from "../services/usageService.js";
import { UserService } from "../services/userService.js";
import { ChatService } from "../services/chatService.js";
import { LeaderboardService } from "../services/leaderboardService.js";
import AdminBotsModule from "../components/Admin/AdminBotsModule.jsx";

// ✅ FIX: Added inline style fallbacks on all elements.
// Pure Tailwind classes render as unstyled if Tailwind CSS is not compiled/loaded.

const TABS = ["users","chat","logs","raffle","urgencies","broadcast","rooms","bots","analytics","system","extensibility"];

function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminActions, setAdminActions] = useState([]);
  const [urgencies, setUrgencies] = useState([]);
  const [raffle, setRaffle] = useState({ leaderboard: [], drawHistory: [] });
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState("");
  const [impersonateUser, setImpersonateUser] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [dau, setDau] = useState([]);
  const [mau, setMau] = useState([]);
  const [retention, setRetention] = useState([]);
  const [sessionLengths, setSessionLengths] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  useEffect(() => {
    UserService.getAllUsers(20).then(res => {
      if (res.success) setUsers(res.users);
    });
  }, []);

  useEffect(() => {
    const unsub = ChatService.subscribeToGlobalMessages(setChatMessages, 20);
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    if (tab === "rooms") {
      const unsub = LiveService.subscribeToRooms(setRooms);
      return () => unsub && unsub();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "analytics") {
      UsageService.getDAU(14).then(setDau);
      UsageService.getMAU(6).then(setMau);
      UsageService.getRetention().then(setRetention);
      UsageService.getSessionLengths().then(setSessionLengths);
      UsageService.getTopGamesAndUsers().then(({ topGames, topUsers }) => {
        setTopGames(topGames);
        setTopUsers(topUsers);
      });
    }
  }, [tab]);

  return (
    <div
      className="p-4 text-white"
      style={{ padding: "16px", color: "#fff", minHeight: "100vh", background: "#000" }}
    >
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
      >
        Admin Dashboard
      </h1>

      <div
        className="flex flex-wrap gap-4 mb-6"
        style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}
      >
        {TABS.map(t => (
          <button
            key={t}
            className={tab === t ? "font-bold underline" : ""}
            onClick={() => setTab(t)}
            style={{
              fontWeight: tab === t ? "bold" : "normal",
              textDecoration: tab === t ? "underline" : "none",
              color: tab === t ? "#ff2a7a" : "rgba(255,255,255,0.7)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px 0",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "bots" && (
        <div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}
          >
            Bot Management
          </h2>
          <Suspense fallback={<div style={{ color: "rgba(255,255,255,0.5)" }}>Loading bot module...</div>}>
            <AdminBotsModule />
          </Suspense>
        </div>
      )}

      {tab === "analytics" && (
        <div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}
          >
            Analytics
          </h2>
          <LogsGraph
            data={dau.map(d => ({
              date: d.date,
              mood: d.count >= 1 ? "Great" : "Struggling"
            }))}
            type="mood"
          />
        </div>
      )}

      {tab === "system" && <ServerHealth />}
    </div>
  );
}

export default AdminDashboard;

function ServerHealth() {
  const [status, setStatus] = useState("loading");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch("/api/live-engine/health")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("ok");
          setDetails(data.health);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div
      className="mb-4"
      style={{ marginBottom: "16px" }}
    >
      <h3
        className="font-semibold mb-1"
        style={{ fontWeight: "600", marginBottom: "4px" }}
      >
        Server Health
      </h3>
      {status === "loading" && <span className="text-yellow-400" style={{ color: "#facc15" }}>Checking...</span>}
      {status === "ok" && <span className="text-green-400" style={{ color: "#4ade80" }}>Healthy</span>}
      {status === "error" && <span className="text-red-400" style={{ color: "#f87171" }}>Unreachable</span>}
      {details && (
        <pre
          className="bg-zinc-900 rounded p-2 mt-2 text-xs overflow-x-auto"
          style={{
            background: "#18181b",
            borderRadius: "6px",
            padding: "8px",
            marginTop: "8px",
            fontSize: "12px",
            overflowX: "auto",
            color: "#fff",
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}
