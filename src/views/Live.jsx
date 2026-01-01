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

  useEffect(() => {
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
      });

      return () => {
        unsubscribe();
        deleteDoc(userRef).catch(console.error);
      };
    }
  }, [selectedShowdown, user, userProfile]);

  const handleCardComplete = () => {
    if (activePlayerId !== user.uid || isEliminated) return;
    
    const nextIndex = (currentCardIndex + 1) % selectedShowdown.exercises.length;
    const compId = `live_${selectedShowdown.id}`;
    
    // In this turn-based card mode, completing a card passes the turn to the next survivor
    // We update our state and the next person in line becomes active via the participant listener
    updateDoc(doc(db, "live_competitions", compId, "participants", user.uid), {
      currentCardIndex: nextIndex,
      score: score + 10, // Bonus for card completion
      lastUpdate: serverTimestamp(),
      // To pass turn, we move ourselves to the end of the "joinedAt" queue or use a turn flag
      // Simpler: Toggle a turn flag or just update a timestamp to rotate
      joinedAt: serverTimestamp() 
    }).catch(console.error);
    
    setScore(s => s + 10);
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

  if (!selectedShowdown) {
    return (
      <div className="live-selection" style={{ padding: "20px", textAlign: "center", minHeight: "calc(100vh - 64px)", background: "#000" }}>
        <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#ff3050", marginBottom: "30px", fontSize: "24px" }}>CARD SHOWDOWN</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", maxWidth: "500px", margin: "0 auto" }}>
          {SHOWDOWNS.map((s) => (
            <button key={s.id} onClick={() => setSelectedShowdown(s)} style={{ padding: "25px", background: "black", border: "2px solid #ff3050", color: "white", fontFamily: "'Press Start 2P', cursive", cursor: "pointer" }}>
              {s.name}
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
        <span style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "12px" }}>{selectedShowdown.name}</span>
        <button onClick={handleQuit} style={{ background: "transparent", border: "1px solid #ff3050", color: "#ff3050", padding: "5px 10px", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>
          {isEliminated ? "BACK" : "QUIT"}
        </button>
      </div>
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, borderRight: "2px solid #ff3050", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", perspective: "1000px" }}>
          {isEliminated ? (
            <h2 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive" }}>ELIMINATED</h2>
          ) : (
            <div style={{ 
              width: "280px", 
              height: "400px", 
              position: "relative", 
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: isFlipping ? "rotateY(180deg)" : "rotateY(0deg)"
            }}>
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                background: "white",
                borderRadius: "15px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 0 20px #ff3050",
                color: "black",
                border: "8px solid #000"
              }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "20px" }}>
                  <span>{currentCardIndex + 1}</span>
                  <span style={{ color: "#ff3050" }}>♥</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: "18px", margin: "10px 0" }}>{currentExercise}</h2>
                  <div style={{ fontSize: "40px" }}>{score}</div>
                  <p style={{ fontSize: "12px", color: "#666" }}>REPS COMPLETED</p>
                </div>
                {isMyTurn ? (
                  <button onClick={handleCardComplete} style={{ width: "100%", padding: "10px", background: "#ff3050", color: "white", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "10px" }}>
                    DONE & FLIP
                  </button>
                ) : (
                  <div style={{ fontSize: "10px", color: "#ff3050", fontWeight: "bold" }}>WAITING FOR RIVAL</div>
                )}
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "20px", transform: "rotate(180deg)" }}>
                  <span>{currentCardIndex + 1}</span>
                  <span style={{ color: "#ff3050" }}>♥</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "280px", padding: "15px", background: "#0a0a0a" }}>
          <h3 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", marginBottom: "20px", textAlign: "center" }}>SURVIVORS</h3>
          {rivals.map((rival) => (
            <div key={rival.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #222", opacity: rival.isEliminated ? 0.3 : 1, background: rival.id === activePlayerId ? "rgba(255,48,80,0.1)" : "transparent" }}>
              <span style={{ color: "white", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{rival.nickname}</span>
              <span style={{ color: "#ff3050", fontSize: "12px" }}>{rival.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
