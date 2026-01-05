import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, onSnapshot, query, orderBy, limit, Timestamp, where } from "firebase/firestore";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [raffleWinners, setRaffleWinners] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const savedKey = localStorage.getItem("rivalis_admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  const fetchData = async () => {
    try {
      const userSnap = await getDocs(collection(db, "users"));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const winnerSnap = await getDocs(collection(db, "raffle_winners"));
      setRaffleWinners(winnerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      // Real-time listener for ALL users (online and offline)
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort: Live/Online first, then offline
        setUsers(allUsers.sort((a, b) => {
          const aLive = isUserLive(a);
          const bLive = isUserLive(b);
          if (aLive && !bLive) return -1;
          if (!aLive && bLive) return 1;
          return 0;
        }));
      });

      if (activeTab === "chat") {
        // Updated to use 'globalChat' which is the active collection
        const qChat = query(collection(db, "globalChat"), orderBy("timestamp", "desc"), limit(100));
        const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
          setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubscribeUsers(); unsubscribeChat(); };
      }

      if (activeTab === "logs") {
        fetchSystemLogs();
      }

      return () => unsubscribeUsers();
    }
  }, [isAuthorized, activeTab]);

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch("/api/admin/system-logs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminKey}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const adminAction = async (endpoint, body) => {
    try {
      const response = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        alert("Action successful");
        fetchData();
      } else {
        alert("Failed: " + data.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDrawRaffle = () => adminAction("raffle-draw", {});
  const handleUserAction = (userId, action, value, message) => adminAction("user-action", { userId, action, data: { value, message } });
  const handleDeleteMessage = (messageId) => adminAction("delete-message", { messageId, collection: "globalChat" });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 border border-red-600 rounded-lg max-w-md w-full">
          <h2 className="text-red-600 text-2xl font-bold mb-6 text-center">ADMIN ACCESS</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Secret" 
            className="w-full bg-black border border-zinc-700 text-white p-3 rounded mb-4"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <button 
            className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
            onClick={() => {
              localStorage.setItem("rivalis_admin_key", adminKey);
              setIsAuthorized(true);
              fetchData();
            }}
          >
            AUTHORIZE
          </button>
        </div>
      </div>
    );
  }

  const isUserLive = (user) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return (user.lastSeen?.toMillis() || 0) >= fiveMinutesAgo;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-red-600 tracking-tighter">COMMAND CENTER</h1>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            <button 
              type="button"
              onClick={() => setActiveTab("users")} 
              className={`px-4 py-2 rounded flex-shrink-0 transition-all font-bold text-xs tracking-widest ${activeTab === "users" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,48,80,0.4)]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              ALL USERS
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("chat")} 
              className={`px-4 py-2 rounded flex-shrink-0 transition-all font-bold text-xs tracking-widest ${activeTab === "chat" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,48,80,0.4)]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              CHAT LOGS
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("logs")} 
              className={`px-4 py-2 rounded flex-shrink-0 transition-all font-bold text-xs tracking-widest ${activeTab === "logs" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,48,80,0.4)]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              SYSTEM LOGS
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("raffle")} 
              className={`px-4 py-2 rounded flex-shrink-0 transition-all font-bold text-xs tracking-widest ${activeTab === "raffle" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,48,80,0.4)]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              RAFFLE
            </button>
          </div>
        </div>

        {activeTab === "users" && (
          <div className="grid gap-4">
            <div className="flex justify-between items-center mb-2 px-2 text-zinc-500 text-[10px] font-mono tracking-widest">
              <span>USER STATUS & ACTIVITY</span>
              <span>MODERATION</span>
            </div>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex justify-between items-center backdrop-blur-sm transition-all hover:border-zinc-700">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isUserLive(u) ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-zinc-700 opacity-50"}`} title={isUserLive(u) ? "Online" : "Offline"} />
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {u.nickname || "Anonymous"}
                        {u.role === 'admin' && <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">MOD</span>}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className={`text-[10px] ${isUserLive(u) ? "text-green-400" : "text-zinc-500"} uppercase tracking-widest font-mono`}>
                          {u.currentActivity ? `ACTION: ${u.currentActivity}` : "IDLE"}
                        </p>
                        {u.isBanned && <span className="text-[9px] bg-red-900/30 text-red-500 border border-red-900/50 px-1.5 rounded uppercase font-bold">BANNED</span>}
                        {u.isMuted && <span className="text-[9px] bg-yellow-900/30 text-yellow-500 border border-yellow-900/50 px-1.5 rounded uppercase font-bold">MUTED</span>}
                      </div>
                      <p className="text-[9px] text-zinc-600 mt-1 font-mono">{u.id} {u.email && `| ${u.email}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUserAction(u.id, "ban", !u.isBanned)} className={`text-[9px] px-3 py-1.5 rounded border font-bold transition-all ${u.isBanned ? "bg-red-600 text-white border-red-600" : "bg-red-950/20 text-red-500 border-red-900/50 hover:bg-red-900/40"}`}>
                      {u.isBanned ? "RESTORE" : "BAN"}
                    </button>
                    <button onClick={() => handleUserAction(u.id, "mute", !u.isMuted)} className={`text-[9px] px-3 py-1.5 rounded border font-bold transition-all ${u.isMuted ? "bg-yellow-600 text-black border-yellow-600" : "bg-yellow-950/20 text-yellow-500 border-yellow-900/50 hover:bg-yellow-900/40"}`}>
                      {u.isMuted ? "UNMUTE" : "MUTE"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 max-h-[70vh] overflow-y-auto custom-scrollbar backdrop-blur-sm">
            <h2 className="text-zinc-500 text-[10px] font-mono tracking-widest mb-4 px-2 uppercase">Global Chat History (Last 100)</h2>
            <div className="space-y-1">
              {messages.map(m => (
                <div key={m.id} className="group border-b border-zinc-800/50 py-3 flex justify-between items-start hover:bg-white/5 px-2 rounded transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-red-500 font-bold text-xs uppercase tracking-tight">{m.nickname || m.userName}</p>
                      <p className="text-[9px] text-zinc-600 font-mono">{new Date(m.timestamp?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <p className="text-zinc-200 mt-1 text-sm leading-relaxed">{m.text}</p>
                  </div>
                  <button onClick={() => handleDeleteMessage(m.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 font-bold text-[10px] transition-all px-2 py-1">PURGE</button>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-zinc-600 py-12 font-mono italic">No communication logs found in arena</p>}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 max-h-[70vh] overflow-y-auto custom-scrollbar backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">Anomaly & Event Registry</h2>
              <button onClick={fetchSystemLogs} className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] px-3 py-1 rounded border border-zinc-700 font-bold transition-all">REFRESH</button>
            </div>
            <div className="space-y-2">
              {logs.map(l => (
                <div key={l.id} className={`p-3 rounded-md border ${l.type === 'error' ? 'bg-red-950/10 border-red-900/30' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${l.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                      {l.type}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {l.timestamp ? new Date(l.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-mono text-[11px] break-all leading-relaxed">{l.message || JSON.stringify(l)}</p>
                  {l.stack && <pre className="text-[9px] text-zinc-600 mt-2 p-2 bg-black/40 rounded overflow-x-auto border border-zinc-800/50 no-scrollbar">{l.stack}</pre>}
                </div>
              ))}
              {logs.length === 0 && <p className="text-center text-zinc-600 py-12 font-mono italic">Log registry clear. No anomalies detected.</p>}
            </div>
          </div>
        )}

        {activeTab === "raffle" && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center backdrop-blur-md">
                <h2 className="text-zinc-500 text-[10px] font-mono tracking-widest mb-6 uppercase">Weekly Raffle Protocol</h2>
                <button onClick={handleDrawRaffle} className="w-full bg-red-600 p-6 rounded-lg font-bold hover:bg-red-500 shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all text-lg tracking-tighter uppercase">
                  TRIGGER SUNDAY DRAW
                </button>
                <div className="mt-6 p-4 rounded bg-red-950/10 border border-red-900/30 text-[10px] text-red-400 leading-relaxed text-left italic">
                  <p className="font-bold not-italic mb-1 uppercase tracking-widest">⚠️ Protocol Warning:</p>
                  Execution will finalize all tickets for the current active window and generate a permanent winner record. This action cannot be reverted.
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 backdrop-blur-md">
              <h2 className="text-zinc-500 text-[10px] font-mono tracking-widest mb-6 uppercase border-b border-zinc-800/50 pb-2">Champion Registry</h2>
              <div className="space-y-3">
                {raffleWinners.length > 0 ? raffleWinners.map(w => (
                  <div key={w.id} className="bg-black/40 p-4 rounded border border-zinc-800/50 flex justify-between items-center group hover:border-red-900/30 transition-all">
                    <div>
                      <p className="text-red-500 font-bold text-sm uppercase">{w.userName}</p>
                      <p className="text-[9px] text-zinc-600 font-mono tracking-tighter">TX_REF: {w.ticket}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 font-mono">{new Date(w.drawDate?.seconds * 1000).toLocaleDateString()}</p>
                      <p className="text-[8px] text-zinc-600 uppercase">Verified</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16">
                    <p className="text-zinc-700 font-mono italic text-sm">Registry is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
