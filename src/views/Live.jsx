import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, limit, orderBy, where } from "firebase/firestore";
import { LiveService } from "../services/liveService";
import { UserService } from "../services/userService";
import GlobalChat from "./GlobalChat";
import { useTheme } from "../context/ThemeContext.jsx";

const SHOWDOWNS = [
  { id: "arms", name: "Arms", category: "Arms", exercises: ["Pushups", "Bicep Curls", "Dips"] },
  { id: "legs", name: "Legs", category: "Legs", exercises: ["Squats", "Lunges", "Calf Raises"] },
  { id: "core", name: "Core", category: "Core", exercises: ["Situps", "Plank", "Leg Raises"] },
  { id: "total", name: "Total", category: "Full Body", exercises: ["Burpees", "Mountain Climbers", "Jumping Jacks"] }
];

export default function Live({ user, userProfile }) {
  const t = useTheme();
  const [selectedShowdown, setSelectedShowdown] = useState(null);
  const [rivals, setRivals] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [score, setScore] = useState(0);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState("WAITING");
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const heartbeat = setInterval(() => {
      UserService.updateHeartbeat(user.uid);
    }, 60000);
    UserService.updateHeartbeat(user.uid);

    const unsubscribeOnline = UserService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users.filter(u => u.userId !== user.uid));
    });

    const unsubscribeRooms = LiveService.subscribeToRooms((rooms) => {
      setActiveRooms(rooms);
    });

    return () => {
      clearInterval(heartbeat);
      unsubscribeOnline();
      unsubscribeRooms();
    };
  }, [user]);

  useEffect(() => {
    if (!currentRoomId) return;

    const unsubscribeRoom = onSnapshot(doc(db, "liveRooms", currentRoomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomData(data);
        setRivals(data.players || []);
        
        if (data.status === "playing") {
          setLobbyStatus("ACTIVE");
          const readyPlayers = data.players.filter(p => p.ready);
          if (readyPlayers.length > 0) {
            setActivePlayerId(readyPlayers[0].userId);
          }
        } else {
          setLobbyStatus("WAITING");
        }
      } else {
        handleQuit();
      }
    });

    return () => unsubscribeRoom();
  }, [currentRoomId]);

  const handleCreateRoom = async (showdown) => {
    const res = await LiveService.createRoom(user.uid, userProfile?.nickname || "Rival", `${showdown.name} Arena`);
    if (res.success) {
      setCurrentRoomId(res.roomId);
      setSelectedShowdown(showdown);
    }
  };

  const handleJoinRoom = async (room) => {
    if (room.players?.length >= 4) {
      alert("This arena is full! Choose another showdown.");
      return;
    }
    const res = await LiveService.joinRoom(room.id, user.uid, userProfile?.nickname || "Rival");
    if (res.success) {
      setCurrentRoomId(room.id);
      const showdown = SHOWDOWNS.find(s => room.roomName.includes(s.name)) || SHOWDOWNS[0];
      setSelectedShowdown(showdown);
    } else {
      alert("Failed to join: " + res.error);
    }
  };

  const handleToggleReady = async () => {
    if (lobbyStatus === "ACTIVE") return;
    const isReady = !roomData?.players?.find(p => p.userId === user.uid)?.ready;
    await LiveService.toggleReady(currentRoomId, user.uid, isReady);
  };

  const handleStartMatch = async () => {
    if (roomData?.hostId === user.uid) {
      await LiveService.startMatch(currentRoomId);
    }
  };

  const handleCardComplete = async () => {
    if (activePlayerId !== user.uid || isEliminated || lobbyStatus !== "ACTIVE") return;
    
    if (Math.random() > 0.7 && roomData.currentJokerIndex < 3) {
      await LiveService.triggerJoker(currentRoomId);
    }

    const nextIndex = (currentCardIndex + 1) % selectedShowdown.exercises.length;
    let points = 10;

    if (roomData.currentJokerIndex >= 0) {
      const activeJoker = roomData.jokers[roomData.currentJokerIndex];
      const jokerActive = roomData.jokerActiveUntil?.toMillis() > Date.now();
      
      if (jokerActive) {
        if (activeJoker.effect.includes("Double")) points *= 2;
        if (activeJoker.effect.includes("Half")) points *= 0.5;
      }
    }
    
    setScore(s => s + points);
    setCurrentCardIndex(nextIndex);
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 600);
  };

  const handleQuit = async () => {
    if (currentRoomId) {
      await LiveService.leaveRoom(currentRoomId, user.uid);
    }
    setCurrentRoomId(null);
    setRoomData(null);
    setSelectedShowdown(null);
    setScore(0);
    setIsEliminated(false);
    setActivePlayerId(null);
    setLobbyStatus("WAITING");
  };

  if (!selectedShowdown) {
    return (
      <div className="live-hub-container" style={{ 
        display: "flex", 
        height: "calc(100vh - 64px)", 
        background: "linear-gradient(135deg, #050505 0%, #0a0a0a 100%)", 
        overflow: "hidden",
        color: "#fff"
      }}>
        <div style={{ 
          width: "380px", 
          background: "rgba(10, 10, 10, 0.8)", 
          backdropFilter: "blur(10px)",
          borderRight: `1px solid ${t.shadowXs}`, 
          display: "flex", 
          flexDirection: "column", 
          padding: "24px",
          boxShadow: "10px 0 30px rgba(0,0,0,0.5)"
        }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ 
              fontFamily: "'Press Start 2P', cursive", 
              color: t.accent, 
              fontSize: "18px",
              letterSpacing: "2px",
              marginBottom: "10px",
              textShadow: `0 0 15px ${t.shadowSm}`
            }}>LIVE HUB</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>ELITE ARENA</p>
          </div>
          
          <div style={{ marginBottom: "32px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: "#fff", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", margin: 0 }}>RIVALS ONLINE</h3>
              <span style={{ color: "#0f0", fontSize: "10px", fontWeight: "bold" }}>● {onlineUsers.length}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
              {onlineUsers.map(u => (
                <div key={u.userId} style={{ textAlign: "center", position: "relative" }}>
                  <img src={u.avatarURL} alt="" style={{ width: "48px", height: "48px", borderRadius: "12px", border: `2px solid ${t.shadowSm}`, padding: "2px", background: "#000" }} />
                  <div style={{ position: "absolute", bottom: "4px", right: "4px", width: "10px", height: "10px", background: "#0f0", borderRadius: "50%", border: "2px solid #000" }} />
                </div>
              ))}
              {onlineUsers.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", fontFamily: "'Press Start 2P', cursive", padding: "10px 0" }}>NO RIVALS ACTIVE</div>}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", marginBottom: "20px" }}>ARENA LOBBIES</h3>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "4px" }}>
              {activeRooms.length === 0 && (
                <div style={{ padding: "30px", textAlign: "center", border: "2px dashed rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                   <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", fontFamily: "'Press Start 2P', cursive", lineHeight: "1.6" }}>NO ACTIVE MATCHES.<br/>CREATE ONE BELOW.</p>
                </div>
              )}
              {activeRooms.map(room => (
                <div key={room.id} style={{ 
                  padding: "20px", 
                  background: "rgba(15,255,0,0.03)", 
                  border: "1px solid rgba(15,255,0,0.2)", 
                  borderRadius: "12px",
                  transition: "transform 0.2s",
                  cursor: "pointer"
                }} onClick={() => handleJoinRoom(room)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: "12px", fontFamily: "'Press Start 2P', cursive", marginBottom: "4px" }}>{room.roomName}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>HOST: {room.hostName}</div>
                    </div>
                    <div style={{ background: "rgba(15,255,0,0.1)", color: "#0f0", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
                      {room.players?.length || 0}/4
                    </div>
                  </div>
                  <button style={{ width: "100%", padding: "12px", background: "#0f0", color: "#000", border: "none", borderRadius: "8px", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}>JOIN ARENA</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px", position: "relative" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontSize: "24px", marginBottom: "16px" }}>START A SHOWDOWN</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Challenge the community in real-time. Winner takes the tickets.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {SHOWDOWNS.map((s) => (
                <div key={s.id} style={{ 
                  padding: "32px", 
                  background: t.shadowXxs, 
                  border: `1px solid ${t.shadowXs}`, 
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }} className="showdown-card">
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "80px", color: t.shadowXxs, fontWeight: "bold" }}>{s.name[0]}</div>
                  <div style={{ zIndex: 1 }}>
                    <div style={{ color: t.accent, fontSize: "10px", fontFamily: "'Press Start 2P', cursive", marginBottom: "12px" }}>{s.category}</div>
                    <h3 style={{ color: "#fff", fontSize: "18px", fontFamily: "'Press Start 2P', cursive", marginBottom: "20px" }}>{s.name}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
                      {s.exercises.slice(0, 3).map(ex => (
                        <span key={ex} style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{ex}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCreateRoom(s)}
                    style={{ 
                      width: "100%", 
                      padding: "16px", 
                      background: "transparent", 
                      color: t.accent, 
                      border: `2px solid ${t.accent}`, 
                      borderRadius: "12px",
                      fontFamily: "'Press Start 2P', cursive", 
                      fontSize: "12px", 
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.accent; }}
                  >
                    CREATE MATCH
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            marginTop: "auto", 
            height: "300px", 
            background: "rgba(0,0,0,0.4)", 
            borderRadius: "20px", 
            border: `1px solid ${t.shadowXs}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
             <div style={{ padding: "16px 24px", background: t.shadowXxs, borderBottom: `1px solid ${t.shadowXs}`, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "8px", height: "8px", background: t.accent, borderRadius: "50%", boxShadow: `0 0 10px ${t.accent}` }} />
                <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontSize: "10px" }}>LOBBY COMMS</span>
             </div>
             <div style={{ flex: 1 }}>
               <GlobalChat user={user} userProfile={userProfile} hideNavbar={true} roomId={currentRoomId || "live-lobby"} />
             </div>
          </div>
        </div>

        <style>{`
          .showdown-card:hover {
            transform: translateY(-8px);
            background: ${t.shadowXxs};
            border-color: ${t.shadowSm};
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const isMyTurn = activePlayerId === user.uid;
  const currentExercise = selectedShowdown.exercises[currentCardIndex % selectedShowdown.exercises.length];
  const myPlayerData = roomData?.players?.find(p => p.userId === user.uid);
  const activeJoker = roomData?.jokers && roomData.currentJokerIndex >= 0 ? roomData.jokers[roomData.currentJokerIndex] : null;
  const jokerActive = activeJoker && roomData.jokerActiveUntil?.toMillis() > Date.now();

  return (
    <div className="live-arena" style={{ 
      height: "calc(100vh - 64px)", 
      background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)", 
      display: "flex", 
      flexDirection: "column",
      color: "#fff"
    }}>
      {jokerActive && (
        <div style={{ 
          background: activeJoker.type === "positive" ? "rgba(15, 255, 0, 0.9)" : t.shadow, 
          color: "#000", 
          padding: "12px", 
          textAlign: "center", 
          fontFamily: "'Press Start 2P', cursive", 
          fontSize: "12px", 
          animation: "blink 1s infinite",
          boxShadow: `0 0 20px ${activeJoker.type === "positive" ? "#0f0" : t.accent}`,
          zIndex: 100
        }}>
          ⚠️ {activeJoker.effect.toUpperCase()} ⚠️
        </div>
      )}
      
      <div style={{ 
        padding: "20px 30px", 
        background: "rgba(0,0,0,0.8)", 
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${t.shadowSm}`, 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: t.accent, color: "#fff", padding: "8px 16px", borderRadius: "4px", fontFamily: "'Press Start 2P', cursive", fontSize: "12px" }}>
            {selectedShowdown.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: lobbyStatus === "ACTIVE" ? "#0f0" : "#ff0", boxShadow: `0 0 10px ${lobbyStatus === "ACTIVE" ? "#0f0" : "#ff0"}` }} />
            <span style={{ fontSize: "10px", fontFamily: "'Press Start 2P', cursive", color: lobbyStatus === "ACTIVE" ? "#0f0" : "#ff0" }}>{lobbyStatus}</span>
          </div>
        </div>
        <button 
          onClick={handleQuit} 
          style={{ 
            background: t.shadowXs, 
            border: `1px solid ${t.accent}`, 
            color: t.accent, 
            padding: "10px 20px", 
            borderRadius: "8px",
            fontSize: "10px", 
            fontFamily: "'Press Start 2P', cursive", 
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = t.accent}
          onMouseOut={(e) => e.currentTarget.style.background = t.shadowXs}
        >EXIT ARENA</button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          perspective: "2000px",
          position: "relative",
          padding: "40px"
        }}>
          {lobbyStatus === "WAITING" ? (
            <div style={{ 
              textAlign: "center", 
              background: "rgba(255,255,255,0.03)", 
              padding: "60px", 
              borderRadius: "30px", 
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
              <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "24px", marginBottom: "16px", color: "#fff" }}>{roomData?.roomName}</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "40px", fontSize: "12px" }}>WAITING FOR ALL CONTENDERS TO INITIALIZE</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                <button 
                  onClick={handleToggleReady}
                  style={{ 
                    padding: "24px 48px", 
                    background: myPlayerData?.ready ? "linear-gradient(135deg, #0f0 0%, #0a0 100%)" : t.accent, 
                    color: myPlayerData?.ready ? "#000" : "#fff", 
                    border: "none", 
                    borderRadius: "16px",
                    fontFamily: "'Press Start 2P', cursive", 
                    fontSize: "14px", 
                    cursor: "pointer",
                    boxShadow: myPlayerData?.ready ? "0 0 30px rgba(0,255,0,0.3)" : `0 0 30px ${t.shadowSm}`,
                    transition: "all 0.3s transform"
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                  onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {myPlayerData?.ready ? "✓ READY TO FIGHT" : "PREPARE FOR BATTLE"}
                </button>

                {roomData?.hostId === user.uid && (
                  <button 
                    onClick={handleStartMatch}
                    disabled={!roomData?.players?.every(p => p.ready) || roomData?.players?.length < 2}
                    style={{ 
                      padding: "16px 32px", 
                      background: "#fff", 
                      color: "#000", 
                      border: "none", 
                      borderRadius: "12px",
                      fontFamily: "'Press Start 2P', cursive", 
                      fontSize: "12px", 
                      cursor: "pointer", 
                      opacity: (!roomData?.players?.every(p => p.ready) || roomData?.players?.length < 2) ? 0.3 : 1,
                      marginTop: "20px"
                    }}
                  >
                    START MATCH
                  </button>
                )}
              </div>
            </div>
          ) : isEliminated ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: t.accent, fontFamily: "'Press Start 2P', cursive", fontSize: "40px", textShadow: `0 0 30px ${t.accent}` }}>WAVED OFF</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "20px" }}>BETTER LUCK NEXT TIME, RIVAL.</p>
            </div>
          ) : (
            <div style={{ 
              width: "320px", 
              height: "460px", 
              position: "relative", 
              transformStyle: "preserve-3d", 
              transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)", 
              transform: isFlipping ? "rotateY(180deg)" : "rotateY(0deg)" 
            }}>
              <div style={{ 
                position: "absolute", 
                width: "100%", 
                height: "100%", 
                backfaceVisibility: "hidden", 
                background: "#fff", 
                borderRadius: "20px", 
                padding: "30px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "space-between", 
                boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 40px ${t.shadowXs}`, 
                color: "black", 
                border: "12px solid #1a1a1a" 
              }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "24px", fontFamily: "'Press Start 2P', cursive" }}>
                  <span>{currentCardIndex + 1}</span>
                  <span style={{ color: t.accent }}>♦</span>
                </div>
                
                <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h2 style={{ fontSize: "20px", margin: "0 0 10px 0", fontFamily: "'Press Start 2P', cursive", lineHeight: "1.4" }}>{currentExercise.toUpperCase()}</h2>
                  <div style={{ fontSize: "64px", fontWeight: "bold", color: "#1a1a1a", margin: "20px 0" }}>{score}</div>
                  <p style={{ fontSize: "10px", color: "#888", fontFamily: "'Press Start 2P', cursive", letterSpacing: "1px" }}>TOTAL REPS</p>
                </div>

                {isMyTurn ? (
                  <button 
                    onClick={handleCardComplete} 
                    style={{ 
                      width: "100%", 
                      padding: "20px", 
                      background: t.accent, 
                      color: "white", 
                      border: "none", 
                      borderRadius: "12px",
                      fontFamily: "'Press Start 2P', cursive", 
                      fontSize: "12px", 
                      cursor: "pointer",
                      boxShadow: `0 10px 20px ${t.shadowSm}`
                    }}
                  >NEXT REP</button>
                ) : (
                  <div style={{ 
                    padding: "15px", 
                    background: "#f0f0f0", 
                    borderRadius: "10px", 
                    width: "100%", 
                    textAlign: "center",
                    fontSize: "10px", 
                    color: t.accent, 
                    fontWeight: "bold", 
                    fontFamily: "'Press Start 2P', cursive" 
                  }}>RIVAL'S TURN</div>
                )}

                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "24px", transform: "rotate(180deg)", fontFamily: "'Press Start 2P', cursive" }}>
                  <span>{currentCardIndex + 1}</span>
                  <span style={{ color: t.accent }}>♦</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          width: "320px", 
          padding: "30px", 
          background: "rgba(0,0,0,0.5)", 
          backdropFilter: "blur(5px)",
          borderLeft: `1px solid ${t.shadowXs}`,
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ 
            color: t.accent, 
            fontFamily: "'Press Start 2P', cursive", 
            fontSize: "12px", 
            marginBottom: "30px", 
            textAlign: "center",
            letterSpacing: "2px"
          }}>CONTENDERS</h3>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            {rivals.map((rival) => (
              <div key={rival.userId} style={{ 
                display: "flex", 
                alignItems: "center",
                gap: "12px",
                padding: "16px", 
                borderRadius: "12px",
                background: rival.userId === activePlayerId ? t.shadowXs : "rgba(255,255,255,0.03)", 
                border: `1px solid ${rival.userId === activePlayerId ? t.accent : "rgba(255,255,255,0.05)"}`,
                opacity: rival.isEliminated ? 0.3 : 1,
                position: "relative",
                transition: "all 0.3s"
              }}>
                <div style={{ position: "relative" }}>
                   <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#222", border: `2px solid ${rival.userId === activePlayerId ? t.accent : "#444"}` }} />
                   {rival.ready && <div style={{ position: "absolute", top: "-5px", right: "-5px", background: "#0f0", color: "#000", fontSize: "8px", padding: "2px", borderRadius: "2px", fontWeight: "bold" }}>RDY</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", marginBottom: "4px" }}>{rival.userName}</div>
                  {rival.userId === activePlayerId && lobbyStatus === "ACTIVE" && (
                    <div style={{ color: "#0f0", fontSize: "8px", fontFamily: "'Press Start 2P', cursive", animation: "blink 1s infinite" }}>IN ACTION</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: "auto", padding: "20px", background: t.shadowXxs, borderRadius: "12px", border: `1px solid ${t.shadowXs}` }}>
             <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", lineHeight: "1.6", textAlign: "center" }}>ELIMINATION ROUNDS.<br/>KEEP PUSHING.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
