import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [raffleWinners, setRaffleWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("rivalis_admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
      setIsAuthorized(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userSnap = await getDocs(collection(db, "users"));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const winnerSnap = await getDocs(collection(db, "raffle_winners"));
      setRaffleWinners(winnerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Fetch failed:", error);
    }
    setLoading(false);
  };

  const handleDrawRaffle = async () => {
    if (!adminKey) return alert("Admin Key Required");
    try {
      const response = await fetch("/api/admin/raffle-draw", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminKey}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        alert("Raffle drawn successfully!");
        fetchData();
      } else {
        alert("Draw failed: " + data.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert("Role updated");
      fetchData();
    } catch (error) {
      alert("Update failed");
    }
  };

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

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-red-600">COMMAND CENTER</h1>
          <button 
            onClick={handleDrawRaffle}
            className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700"
          >
            TRIGGER WEEKLY DRAW
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-4 text-zinc-400">USER MANAGEMENT</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center bg-black p-3 rounded border border-zinc-800">
                  <div>
                    <p className="font-bold">{u.nickname || "Anonymous"}</p>
                    <p className="text-xs text-zinc-500">{u.id}</p>
                  </div>
                  <select 
                    value={u.role || "user"} 
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    className="bg-zinc-800 text-xs p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-4 text-zinc-400">RAFFLE HISTORY</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {raffleWinners.map(w => (
                <div key={w.id} className="bg-black p-3 rounded border border-zinc-800">
                  <p className="text-red-500 font-bold">WINNER: {w.userName}</p>
                  <p className="text-xs text-zinc-400">Date: {new Date(w.drawDate?.seconds * 1000).toLocaleDateString()}</p>
                  <p className="text-xs text-zinc-500">Ticket: {w.ticket}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
