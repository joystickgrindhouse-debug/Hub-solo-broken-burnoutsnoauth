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
      // Real-time user tracking
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const q = query(
        collection(db, "users"), 
        where("lastSeen", ">=", Timestamp.fromDate(fiveMinutesAgo))
      );
      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const liveUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(prev => {
          const others = prev.filter(p => !liveUsers.find(l => l.id === p.id));
          return [...liveUsers, ...others];
        });
      });

      if (activeTab === "chat") {
        const qChat = query(collection(db, "globalChat"), orderBy("timestamp", "desc"), limit(50));
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

  const getStatusColor = (user) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const lastSeen = user.lastSeen?.toMillis() || 0;
    return lastSeen >= fiveMinutesAgo ? "text-green-500" : "text-zinc-500";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-red-600">COMMAND CENTER</h1>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded ${activeTab === "users" ? "bg-red-600" : "bg-zinc-800"}`}>LIVE USERS</button>
            <button onClick={() => setActiveTab("chat")} className={`px-4 py-2 rounded ${activeTab === "chat" ? "bg-red-600" : "bg-zinc-800"}`}>CHAT</button>
            <button onClick={() => setActiveTab("logs")} className={`px-4 py-2 rounded ${activeTab === "logs" ? "bg-red-600" : "bg-zinc-800"}`}>LOGS</button>
            <button onClick={() => setActiveTab("raffle")} className={`px-4 py-2 rounded ${activeTab === "raffle" ? "bg-red-600" : "bg-zinc-800"}`}>RAFFLE</button>
          </div>
        </div>

        {activeTab === "users" && (
          <div className="grid gap-4">
            <div className="flex justify-between items-center mb-2 px-2 text-zinc-500 text-xs">
              <span>ACTIVE USER / ACTIVITY</span>
              <span>CONTROLS</span>
            </div>
            {users.map(u => (
              <div key={u.id} className="bg-zinc-900 p-4 rounded border border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(u)} bg-current shadow-[0_0_8px_currentColor]`} />
                  <div>
                    <h3 className="font-bold text-lg">{u.nickname || "Anonymous"}</h3>
                    <p className={`text-xs ${getStatusColor(u)} uppercase tracking-widest`}>
                      {u.currentActivity ? `LOCATION: ${u.currentActivity}` : "IDLE"}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">{u.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUserAction(u.id, "ban", !u.isBanned)} className="bg-red-900/50 hover:bg-red-600 text-[10px] px-3 py-1 rounded border border-red-900 transition-colors">
                    {u.isBanned ? "UNBAN" : "BAN"}
                  </button>
                  <button onClick={() => handleUserAction(u.id, "mute", !u.isMuted)} className="bg-yellow-900/50 hover:bg-yellow-600 text-[10px] px-3 py-1 rounded border border-yellow-900 transition-colors">
                    {u.isMuted ? "UNMUTE" : "MUTE"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="bg-zinc-900 p-4 rounded border border-zinc-800 max-h-[70vh] overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className="border-b border-zinc-800 py-3 flex justify-between items-start">
                <div>
                  <p className="text-red-500 font-bold text-sm">{m.nickname || m.userName}</p>
                  <p className="text-white mt-1">{m.text}</p>
                </div>
                <button onClick={() => handleDeleteMessage(m.id)} className="text-zinc-600 hover:text-red-500">DELETE</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-zinc-900 p-4 rounded border border-zinc-800 max-h-[70vh] overflow-y-auto">
            <button onClick={fetchSystemLogs} className="mb-4 bg-zinc-800 px-4 py-1 rounded text-xs">REFRESH</button>
            {logs.map(l => (
              <div key={l.id} className={`border-b border-zinc-800 py-3 ${l.type === 'error' ? 'bg-red-950/20' : ''}`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${l.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {l.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {l.timestamp ? new Date(l.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <p className="text-white mt-2 font-mono text-xs break-all">{l.message || JSON.stringify(l)}</p>
                {l.stack && <pre className="text-[10px] text-zinc-500 mt-2 p-2 bg-black rounded overflow-x-auto">{l.stack}</pre>}
              </div>
            ))}
          </div>
        )}

        {activeTab === "raffle" && (
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={handleDrawRaffle} className="bg-red-600 p-4 rounded font-bold hover:bg-red-700">TRIGGER WEEKLY DRAW</button>
            <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
              <h2 className="text-xl font-bold mb-4 text-zinc-400">WINNER HISTORY</h2>
              {raffleWinners.map(w => (
                <div key={w.id} className="bg-black p-3 mb-2 rounded border border-zinc-800">
                  <p className="text-red-500 font-bold">{w.userName}</p>
                  <p className="text-xs text-zinc-400">{new Date(w.drawDate?.seconds * 1000).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
