import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, limit, orderBy } from "firebase/firestore";

const SHOWDOWNS = [
  { id: "arms", name: "Arm Showdown", category: "Arms", exercises: ["Pushups", "Bicep Curls", "Dips"] },
  { id: "legs", name: "Legs Showdown", category: "Legs", exercises: ["Squats", "Lunges", "Calf Raises"] },
  { id: "core", name: "Core Showdown", category: "Core", exercises: ["Situps", "Plank", "Leg Raises"] },
  { id: "total", name: "Total Body Showdown", category: "Full Body", exercises: ["Burpees", "Mountain Climbers", "Jumping Jacks"] }
];

export default function Live({ user, userProfile }) {
  const [selectedShowdown, setSelectedShowdown] = useState(null);
  const [rivals, setRivals] = useState([]);
  const [score, setScore] = useState(0);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState("WAITING");
  const [activeLobbies, setActiveLobbies] = useState({});

  // Global listener for all showdown lobbies to show counts
  useEffect(() => {
    const unsubscribes = SHOWDOWNS.map(s => {
      const q = query(collection(db, "live_competitions", `live_${s.id}`, "participants"));
      return onSnapshot(q, (snapshot) => {
        setActiveLobbies(prev => ({
          ...prev,
          [s.id]: snapshot.size
        }));
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      const userRef = doc(db, "live_competitions", compId, "participants", user.uid);

      setDoc(userRef, {
        nickname: userProfile?.nickname || "Rival",
        avatar: userProfile?.avatar || "",
        score: 0,
        isEliminated: false,
        currentCardIndex: 0,
        joinedAt: serverTimestamp(),
        lastUpdate: serverTimestamp()
      }).catch(console.error);

      const q = query(
        collection(db, "live_competitions", compId, "participants"),
        orderBy("joinedAt", "asc"),
        limit(20)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const participants = [];
        snapshot.forEach((doc) => {
          participants.push({ id: doc.id, ...doc.data() });
        });
        
        const activeOnes = participants.filter(p => !p.isEliminated);
        setRivals(participants);
        setLobbyStatus(participants.length >= 2 ? "ACTIVE" : "WAITING");

        if (activeOnes.length > 0) {
          const currentActive = activeOnes[0];
          if (activePlayerId !== currentActive.id) {
            setIsFlipping(true);
            setTimeout(() => setIsFlipping(false), 600);
          }
          setActivePlayerId(currentActive.id);
          setCurrentCardIndex(currentActive.currentCardIndex || 0);
        } else {
          setActivePlayerId(null);
        }

        const me = participants.find(p => p.id === user.uid);
        if (me?.isEliminated) setIsEliminated(true);
        else setIsEliminated(false);
      });
    }

    return () => {
      unsubscribe();
      if (selectedShowdown && user) {
        const compId = `live_${selectedShowdown.id}`;
        deleteDoc(doc(db, "live_competitions", compId, "participants", user.uid)).catch(console.error);
      }
    };
  }, [selectedShowdown, user, userProfile]);

  const handleCardComplete = () => {
    if (activePlayerId !== user.uid || isEliminated || lobbyStatus !== "ACTIVE") return;
    const nextIndex = (currentCardIndex + 1) % selectedShowdown.exercises.length;
    const compId = `live_${selectedShowdown.id}`;
    updateDoc(doc(db, "live_competitions", compId, "participants", user.uid), {
      currentCardIndex: nextIndex,
      score: score + 10,
      lastUpdate: serverTimestamp(),
      joinedAt: serverTimestamp() 
    }).catch(console.error);
    setScore(s => s + 10);
  };

  const handleQuit = async () => {
    if (selectedShowdown && user) {
      const compId = `live_${selectedShowdown.id}`;
      try {
        await deleteDoc(doc(db, "live_competitions", compId, "participants", user.uid));
        setSelectedShowdown(null);
        setScore(0);
        setIsEliminated(false);
        setActivePlayerId(null);
      } catch (error) {
        console.error("Error quitting:", error);
        setSelectedShowdown(null);
      }
    }
  };

  if (!selectedShowdown) {
    return (
      <div className="live-selection" style={{ padding: "20px", textAlign: "center", minHeight: "calc(100vh - 64px)", background: "#000" }}>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#ff3050", marginBottom: "10px", fontSize: "24px" }}>SHOWDOWN BROWSER</h1>
        <p style={{ color: "white", marginBottom: "40px", fontFamily: "sans-serif" }}>Find an active session or start a new one</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", maxWidth: "600px", margin: "0 auto" }}>
          {SHOWDOWNS.map((s) => (
            <button 
              key={s.id} 
              onClick={() => setSelectedShowdown(s)} 
              style={{ 
                padding: "20px", 
                background: "black", 
                border: "2px solid #ff3050", 
                color: "white", 
                fontFamily: "'Press Start 2P', cursive", 
                cursor: "pointer", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                textAlign: "left"
              }}
            >
              <div>
                <div style={{ fontSize: "14px" }}>{s.name}</div>
                <div style={{ fontSize: "10px", color: "#666", marginTop: "5px" }}>{s.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: activeLobbies[s.id] > 0 ? "#0f0" : "#ff3050", fontSize: "12px" }}>
                  {activeLobbies[s.id] || 0} RIVALS
                </div>
                <div style={{ fontSize: "8px", color: "#444", marginTop: "5px" }}>
                  {activeLobbies[s.id] >= 2 ? "IN PROGRESS" : "WAITING"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isMyTurn = activePlayerId === user.uid;
  const currentExercise = selectedShowdown.exercises[currentCardIndex % selectedShowdown.exercises.length];

  return (
    <div className="live-arena" style={{ height: "calc(100vh - 64px)", background: "black", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "15px", borderBottom: "2px solid #ff3050", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px" }}>{selectedShowdown.name}</span>
          <span style={{ color: lobbyStatus === "ACTIVE" ? "#0f0" : "#ff0", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{lobbyStatus}</span>
        </div>
        <button onClick={handleQuit} style={{ background: "transparent", border: "1px solid #ff3050", color: "#ff3050", padding: "5px 10px", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", cursor: "pointer" }}>QUIT</button>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, borderRight: "2px solid #ff3050", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", perspective: "1000px" }}>
          {lobbyStatus === "WAITING" ? (
            <div style={{ textAlign: "center", color: "white" }}>
              <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "18px", marginBottom: "20px" }}>WAITING FOR RIVALS...</h2>
              <p style={{ color: "#666" }}>Waiting for at least 1 more rival to begin</p>
            </div>
          ) : isEliminated ? (
            <h2 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive" }}>ELIMINATED</h2>
          ) : (
            <div style={{ width: "280px", height: "400px", position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s", transform: isFlipping ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", background: "white", borderRadius: "15px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", boxShadow: "0 0 20px #ff3050", color: "black", border: "8px solid #000" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "20px" }}><span>{currentCardIndex + 1}</span><span style={{ color: "#ff3050" }}>♥</span></div>
                <div style={{ textAlign: "center" }}><h2 style={{ fontSize: "18px", margin: "10px 0" }}>{currentExercise}</h2><div style={{ fontSize: "40px" }}>{score}</div><p style={{ fontSize: "12px", color: "#666" }}>TOTAL REPS</p></div>
                {isMyTurn ? (<button onClick={handleCardComplete} style={{ width: "100%", padding: "10px", background: "#ff3050", color: "white", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", cursor: "pointer" }}>COMPLETE & FLIP</button>) : (<div style={{ fontSize: "10px", color: "#ff3050", fontWeight: "bold", fontFamily: "'Press Start 2P', cursive" }}>RIVAL'S TURN</div>)}
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "20px", transform: "rotate(180deg)" }}><span>{currentCardIndex + 1}</span><span style={{ color: "#ff3050" }}>♥</span></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ width: "280px", padding: "15px", background: "#0a0a0a" }}>
          <h3 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", marginBottom: "20px", textAlign: "center" }}>LOBBY</h3>
          {rivals.map((rival) => (
            <div key={rival.id} style={{ display: "flex", flexDirection: "column", padding: "10px", marginBottom: "8px", borderBottom: "1px solid #222", opacity: rival.isEliminated ? 0.3 : 1, background: rival.id === activePlayerId ? "rgba(255,48,80,0.1)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "white", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{rival.nickname}</span>
                <span style={{ color: "#ff3050", fontSize: "12px", fontFamily: "'Press Start 2P', cursive" }}>{rival.score}</span>
              </div>
              {rival.id === activePlayerId && !rival.isEliminated && (<span style={{ color: "#0f0", fontSize: "8px", marginTop: "5px", fontFamily: "'Press Start 2P', cursive" }}>[ CURRENTLY FLIPPING ]</span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
