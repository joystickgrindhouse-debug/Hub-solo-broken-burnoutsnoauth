import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, limit, orderBy, where } from "firebase/firestore";
import { LiveService } from "../services/liveService";
import { UserService } from "../services/userService";
import GlobalChat from "./GlobalChat";

const SHOWDOWNS = [
  { id: "arms", name: "Arms", category: "Arms", exercises: ["Pushups", "Bicep Curls", "Dips"] },
  { id: "legs", name: "Legs", category: "Legs", exercises: ["Squats", "Lunges", "Calf Raises"] },
  { id: "core", name: "Core", category: "Core", exercises: ["Situps", "Plank", "Leg Raises"] },
  { id: "total", name: "Total", category: "Full Body", exercises: ["Burpees", "Mountain Climbers", "Jumping Jacks"] }
];

export default function Live({ user, userProfile }) {
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

  // Online Status & Presence
  useEffect(() => {
    if (!user) return;
    
    // Heartbeat
    const heartbeat = setInterval(() => {
      UserService.updateHeartbeat(user.uid);
    }, 60000);
    UserService.updateHeartbeat(user.uid);

    // Online Users Subscription
    const unsubscribeOnline = UserService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users.filter(u => u.userId !== user.uid));
    });

    // Rooms Subscription
    const unsubscribeRooms = LiveService.subscribeToRooms((rooms) => {
      setActiveRooms(rooms);
    });

    return () => {
      clearInterval(heartbeat);
      unsubscribeOnline();
      unsubscribeRooms();
    };
  }, [user]);

  // Room Specific Logic
  useEffect(() => {
    if (!currentRoomId) return;

    const unsubscribeRoom = onSnapshot(doc(db, "liveRooms", currentRoomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomData(data);
        setRivals(data.players || []);
        
        if (data.status === "playing") {
          setLobbyStatus("ACTIVE");
          // Determine active player (simple turn-based for now)
          const readyPlayers = data.players.filter(p => p.ready);
          if (readyPlayers.length > 0) {
            setActivePlayerId(readyPlayers[0].userId); // Simplified logic
          }
        } else {
          setLobbyStatus("WAITING");
        }
      } else {
        // Room deleted
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
    const res = await LiveService.joinRoom(room.id, user.uid, userProfile?.nickname || "Rival");
    if (res.success) {
      setCurrentRoomId(room.id);
      // Find showdown by name or store ID in room
      const showdown = SHOWDOWNS.find(s => room.roomName.includes(s.name)) || SHOWDOWNS[0];
      setSelectedShowdown(showdown);
    }
  };

  const handleToggleReady = async () => {
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
    
    // Chance to trigger joker on completion
    if (Math.random() > 0.7 && roomData.currentJokerIndex < 3) {
      await LiveService.triggerJoker(currentRoomId);
    }

    const nextIndex = (currentCardIndex + 1) % selectedShowdown.exercises.length;
    let points = 10;

    // Apply joker effects
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
      <div className="live-selection" style={{ display: "flex", height: "calc(100vh - 64px)", background: "#000", overflow: "hidden" }}>
        {/* Left Side: Live Activity */}
        <div style={{ width: "400px", borderRight: "2px solid #ff3050", display: "flex", flexDirection: "column", padding: "20px", background: "#050505" }}>
          <h1 style={{ fontFamily: "'Press Start 2P', cursive", color: "#ff3050", marginBottom: "30px", fontSize: "16px" }}>LIVE HUB</h1>
          
          {/* Online Rivals */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ color: "#fff", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", marginBottom: "15px" }}>ONLINE RIVALS ({onlineUsers.length})</h3>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
              {onlineUsers.map(u => (
                <div key={u.userId} style={{ textAlign: "center", minWidth: "60px" }}>
                  <img src={u.avatarURL} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #0f0" }} />
                  <div style={{ color: "#fff", fontSize: "8px", marginTop: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.nickname}</div>
                </div>
              ))}
              {onlineUsers.length === 0 && <div style={{ color: "#444", fontSize: "10px" }}>No rivals online</div>}
            </div>
          </div>

          {/* Active Rooms */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ color: "#fff", fontSize: "10px", fontFamily: "'Press Start 2P', cursive", marginBottom: "15px" }}>ACTIVE ROOMS ({activeRooms.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto" }}>
              {SHOWDOWNS.map((s) => (
                <div key={s.id} style={{ padding: "15px", background: "rgba(255,48,80,0.05)", border: "1px solid #ff3050", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ color: "#fff", fontSize: "12px", fontFamily: "'Press Start 2P', cursive" }}>{s.name}</span>
                    <span style={{ color: "#ff3050", fontSize: "8px" }}>{s.category}</span>
                  </div>
                  <button 
                    onClick={() => handleCreateRoom(s)}
                    style={{ width: "100%", padding: "10px", background: "#ff3050", color: "#fff", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", cursor: "pointer" }}
                  >
                    CREATE ROOM
                  </button>
                </div>
              ))}

              {activeRooms.map(room => (
                <div key={room.id} style={{ padding: "15px", background: "rgba(15,255,0,0.05)", border: "1px solid #0f0", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{room.roomName}</div>
                      <div style={{ color: "#666", fontSize: "8px", marginTop: "5px" }}>Host: {room.hostName}</div>
                    </div>
                    <span style={{ color: "#0f0", fontSize: "10px" }}>{room.players?.length || 0}/4</span>
                  </div>
                  <button 
                    onClick={() => handleJoinRoom(room)}
                    style={{ width: "100%", padding: "10px", background: "#0f0", color: "#000", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", cursor: "pointer" }}
                  >
                    JOIN MATCH
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Integrated Chat */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", top: "15px", left: "20px", zIndex: 10 }}>
             <h2 style={{ fontFamily: "'Press Start 2P', cursive", color: "white", fontSize: "14px", margin: 0 }}>LOBBY CHAT</h2>
          </div>
          <GlobalChat user={user} userProfile={userProfile} hideNavbar={true} />
        </div>
      </div>
    );
  }

  const isMyTurn = activePlayerId === user.uid;
  const currentExercise = selectedShowdown.exercises[currentCardIndex % selectedShowdown.exercises.length];
  const myPlayerData = roomData?.players?.find(p => p.userId === user.uid);
  const activeJoker = roomData?.jokers && roomData.currentJokerIndex >= 0 ? roomData.jokers[roomData.currentJokerIndex] : null;
  const jokerActive = activeJoker && roomData.jokerActiveUntil?.toMillis() > Date.now();

  return (
    <div className="live-arena" style={{ height: "calc(100vh - 64px)", background: "black", display: "flex", flexDirection: "column" }}>
      {jokerActive && (
        <div style={{ background: activeJoker.type === "positive" ? "#0f0" : "#ff3050", color: "#000", padding: "10px", textAlign: "center", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", animation: "blink 1s infinite" }}>
          JOKER ACTIVE: {activeJoker.effect}
        </div>
      )}
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
              <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "18px", marginBottom: "20px" }}>{roomData?.roomName}</h2>
              <div style={{ marginBottom: "30px" }}>
                <button 
                  onClick={handleToggleReady}
                  style={{ padding: "15px 30px", background: myPlayerData?.ready ? "#0f0" : "#ff3050", color: myPlayerData?.ready ? "#000" : "#fff", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "12px", cursor: "pointer" }}
                >
                  {myPlayerData?.ready ? "I'M READY!" : "READY UP?"}
                </button>
              </div>
              {roomData?.hostId === user.uid && (
                <button 
                  onClick={handleStartMatch}
                  disabled={!roomData?.players?.every(p => p.ready) || roomData?.players?.length < 2}
                  style={{ padding: "10px 20px", background: "white", color: "black", border: "none", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", cursor: "pointer", opacity: (!roomData?.players?.every(p => p.ready) || roomData?.players?.length < 2) ? 0.3 : 1 }}
                >
                  START MATCH
                </button>
              )}
              <p style={{ color: "#666", marginTop: "20px", fontSize: "10px" }}>Wait for all rivals to ready up</p>
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
          <h3 style={{ color: "#ff3050", fontFamily: "'Press Start 2P', cursive", fontSize: "10px", marginBottom: "20px", textAlign: "center" }}>RIVALS</h3>
          {rivals.map((rival) => (
            <div key={rival.userId} style={{ display: "flex", flexDirection: "column", padding: "10px", marginBottom: "8px", borderBottom: "1px solid #222", opacity: rival.isEliminated ? 0.3 : 1, background: rival.userId === activePlayerId ? "rgba(255,48,80,0.1)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "white", fontSize: "10px", fontFamily: "'Press Start 2P', cursive" }}>{rival.userName}</span>
                <span style={{ color: rival.ready ? "#0f0" : "#ff3050", fontSize: "8px" }}>{rival.ready ? "READY" : "..."}</span>
              </div>
              {rival.userId === activePlayerId && lobbyStatus === "ACTIVE" && (<span style={{ color: "#0f0", fontSize: "8px", marginTop: "5px", fontFamily: "'Press Start 2P', cursive" }}>[ CURRENTLY FLIPPING ]</span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
