import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, limit, orderBy } from "firebase/firestore";

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
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      const userRef = doc(db, "live_competitions", compId, "participants", user.uid);

      setDoc(userRef, {
        nickname: userProfile?.nickname || "Rival",
        avatar: userProfile?.avatar || "",
        score: 0,
        isEliminated: false,
        joinedAt: serverTimestamp(),
        lastUpdate: serverTimestamp()
      });

      const q = query(
        collection(db, "live_competitions", compId, "participants"),
        orderBy("joinedAt", "asc"),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const participants = [];
        snapshot.forEach((doc) => {
          participants.push({ id: doc.id, ...doc.data() });
        });
        
        const activeOnes = participants.filter(p => !p.isEliminated);
        setRivals(participants);
        
        if (activeOnes.length > 0) {
          // Simplistic turn logic: oldest joined player who isn't eliminated goes first
          setActivePlayerId(activeOnes[0].id);
          setGameStarted(activeOnes.length >= 1);
        } else {
          setActivePlayerId(null);
          setGameStarted(false);
        }

        const me = participants.find(p => p.id === user.uid);
        if (me?.isEliminated) setIsEliminated(true);
      });

      return () => {
        unsubscribe();
        deleteDoc(userRef).catch(console.error);
      };
    }
  }, [selectedShowdown, user, userProfile]);

  const handleScoreUpdate = () => {
    if (activePlayerId !== user.uid || isEliminated) return;
    
    const newScore = score + 1;
    setScore(newScore);
    const compId = `live_${selectedShowdown.id}`;
    updateDoc(doc(db, "live_competitions", compId, "participants", user.uid), {
      score: newScore,
      lastUpdate: serverTimestamp()
    }).catch(console.error);
  };

  const handleQuit = () => {
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      updateDoc(doc(db, "live_competitions", compId, "participants", user.uid), {
        isEliminated: true,
        lastUpdate: serverTimestamp()
      }).then(() => setSelectedShowdown(null)).catch(console.error);
    }
  };

  const passTurn = () => {
    if (activePlayerId !== user.uid) return;
    // In this "Last Man Standing" turn-based mode, passing turn means you're done for now
    // but the next person gets to try and beat your score or keep going.
    // For now, let's keep it simple: one person goes at a time.
  };

  if (!selectedShowdown) {
    return (
      <div className="live-selection" style={{ padding: "20px", textAlign: "center", minHeight: "calc(100vh - 64px)", background: "#000" }}>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#ff3050", marginBottom: "30px", fontSize: "24px" }}>LAST MAN STANDING</h1>
        <p style={{ color: "white", marginBottom: "40px", fontFamily: "sans-serif" }}>Real-time elimination showdown</p>
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
                boxShadow: "0 0 10px rgba(255,48,80,0.3)"
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isMyTurn = activePlayerId === user.uid;

  return (
    <div className="live-arena" style={{ height: "calc(100vh - 64px)", background: "black", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "15px", borderBottom: "2px solid #ff3050", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px" }}>{selectedShowdown.name}</span>
        <button 
          onClick={handleQuit}
          style={{ background: "transparent", border: "1px solid #ff3050", color: "#ff3050", padding: "5px 10px", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", cursor: "pointer" }}
        >
          {isEliminated ? "BACK" : "SURRENDER"}
        </button>
      </div>
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, borderRight: "2px solid #ff3050", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {isEliminated ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive" }}>ELIMINATED</h2>
              <p style={{ color: "white" }}>You are spectating the remaining rivals.</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "72px", color: isMyTurn ? "white" : "#444", fontFamily: "'Press Start 2P', cursive", textShadow: isMyTurn ? "0 0 20px #ff3050" : "none" }}>{score}</div>
              <div style={{ color: isMyTurn ? "#ff3050" : "#444", marginTop: "10px", fontFamily: "'Press Start 2P', cursive", fontSize: "14px" }}>REPS</div>
              
              <div style={{ marginTop: "50px", textAlign: "center", padding: "20px", background: isMyTurn ? "rgba(255,48,80,0.1)" : "transparent", borderRadius: "10px", border: isMyTurn ? "1px dashed #ff3050" : "1px solid #222" }}>
                <p style={{ color: "white", marginBottom: "15px", fontSize: "12px", fontFamily: "'Press Start 2P', cursive" }}>
                  {isMyTurn ? "YOUR TURN!" : "WAITING FOR RIVAL..."}
                </p>
                {isMyTurn && (
                  <button 
                    onClick={handleScoreUpdate}
                    style={{ padding: "15px 30px", background: "#ff3050", border: "none", color: "white", fontFamily: "'Press Start 2P', cursive", fontSize: "12px", cursor: "pointer", boxShadow: "0 4px 0 #900" }}
                  >
                    DO REP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ width: "280px", padding: "15px", display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
          <h3 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px", marginBottom: "20px", textAlign: "center" }}>SURVIVORS</h3>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {rivals.map((rival) => (
              <div 
                key={rival.id} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "12px", 
                  marginBottom: "8px", 
                  background: rival.id === activePlayerId ? "rgba(255,48,80,0.2)" : "transparent",
                  border: rival.id === activePlayerId ? "1px solid #ff3050" : "1px solid #222",
                  opacity: rival.isEliminated ? 0.3 : 1
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "white", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{rival.nickname} {rival.id === user.uid && "(YOU)"}</span>
                  {rival.isEliminated && <span style={{ color: "#ff3050", fontSize: "8px" }}>OUT</span>}
                  {rival.id === activePlayerId && !rival.isEliminated && <span style={{ color: "#0f0", fontSize: "8px" }}>ACTIVE</span>}
                </div>
                <span style={{ color: "white", fontSize: "14px", fontFamily: "'Press Start 2P', cursive" }}>{rival.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
