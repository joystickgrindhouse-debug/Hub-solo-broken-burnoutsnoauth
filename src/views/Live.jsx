import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, limit } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";

const SHOWDOWNS = [
  { id: "arms", name: "Arm Showdown", category: "Arms" },
  { id: "legs", name: "Legs Showdown", category: "Legs" },
  { id: "core", name: "Core Showdown", category: "Core" },
  { id: "total", name: "Total Body Showdown", category: "Full Body" }
];

export default function Live({ user, userProfile }) {
  const [selectedShowdown, setSelectedShowdown] = useState(null);
  const [rivals, setRivals] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      const userRef = doc(db, "live_competitions", compId, "participants", user.uid);

      // Join competition
      setDoc(userRef, {
        nickname: userProfile?.nickname || "Rival",
        avatar: userProfile?.avatar || "",
        score: 0,
        lastUpdate: serverTimestamp()
      });

      // Listen for rivals (top 10)
      const q = query(collection(db, "live_competitions", compId, "participants"), limit(10));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const participants = [];
        snapshot.forEach((doc) => {
          if (doc.id !== user.uid) {
            participants.push({ id: doc.id, ...doc.data() });
          }
        });
        setRivals(participants.sort((a, b) => b.score - a.score));
      });

      return () => {
        unsubscribe();
        deleteDoc(userRef).catch(console.error);
      };
    }
  }, [selectedShowdown, user, userProfile]);

  const handleScoreUpdate = () => {
    const newScore = score + 1;
    setScore(newScore);
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      updateDoc(doc(db, "live_competitions", compId, "participants", user.uid), {
        score: newScore,
        lastUpdate: serverTimestamp()
      }).catch(console.error);
    }
  };

  if (!selectedShowdown) {
    return (
      <div className="live-selection" style={{ padding: "20px", textAlign: "center", minHeight: "calc(100vh - 64px)", background: "#000" }}>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#ff3050", marginBottom: "30px", fontSize: "24px" }}>LIVE SHOWDOWN</h1>
        <p style={{ color: "white", marginBottom: "40px", fontFamily: "sans-serif" }}>Choose your battleground</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", maxWidth: "500px", margin: "0 auto" }}>
          {SHOWDOWNS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedShowdown(s)}
              style={{
                padding: "25px",
                background: "black",
                border: "2px solid #ff3050",
                color: "white",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255,48,80,0.3)",
                transition: "all 0.2s"
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="live-arena" style={{ height: "calc(100vh - 64px)", background: "black", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "15px", borderBottom: "2px solid #ff3050", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px" }}>{selectedShowdown.name}</span>
        <button 
          onClick={() => setSelectedShowdown(null)}
          style={{ background: "transparent", border: "1px solid #555", color: "white", padding: "5px 10px", fontSize: "10px", cursor: "pointer" }}
        >
          QUIT
        </button>
      </div>
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Mock Pose Tracking Area */}
        <div style={{ flex: 1, borderRight: "2px solid #ff3050", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ fontSize: "72px", color: "white", fontFamily: "'Press Start 2P', cursive", textShadow: "0 0 20px #ff3050" }}>{score}</div>
          <div style={{ color: "#ff3050", marginTop: "10px", fontFamily: "'Press Start 2P', cursive", fontSize: "14px" }}>REPS</div>
          
          <div style={{ marginTop: "50px", textAlign: "center", padding: "20px", background: "rgba(255,48,80,0.1)", borderRadius: "10px", border: "1px dashed #ff3050" }}>
            <p style={{ color: "white", marginBottom: "15px", fontSize: "12px" }}>AI POSE TRACKING ACTIVE</p>
            <button 
              onClick={handleScoreUpdate}
              style={{ padding: "15px 30px", background: "#ff3050", border: "none", color: "white", fontFamily: "'Press Start 2P', cursive", fontSize: "12px", cursor: "pointer", boxShadow: "0 4px 0 #900" }}
            >
              SIMULATE REP
            </button>
          </div>
          
          <div style={{ position: "absolute", bottom: "20px", color: "#444", fontSize: "10px" }}>
            CONNECTED TO RIVALIS ENGINE v2.4
          </div>
        </div>

        {/* Real-time Leaderboard */}
        <div style={{ width: "250px", padding: "15px", display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
          <h3 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px", marginBottom: "20px", textAlign: "center" }}>RIVALS</h3>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", marginBottom: "10px", background: "rgba(255,48,80,0.2)", border: "1px solid #ff3050" }}>
              <span style={{ color: "white", fontWeight: "bold" }}>YOU</span>
              <span style={{ color: "white" }}>{score}</span>
            </div>
            {rivals.length === 0 && (
              <p style={{ color: "#555", fontSize: "10px", textAlign: "center", marginTop: "20px" }}>WAITING FOR RIVALS...</p>
            )}
            {rivals.map((rival) => (
              <div key={rival.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #222" }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>{rival.nickname}</span>
                <span style={{ color: "white", fontSize: "12px" }}>{rival.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
