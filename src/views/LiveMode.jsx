import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase.js";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  listenLobby,
  listenPlayers,
  setReady,
  startLobby
} from "../live/lobby.js";

export default function LiveMode({ user, userProfile }) {
  // Prefer the user passed in from App (your ProtectedRoute guarantees it)
  const me = user || auth.currentUser;

  const displayName = useMemo(() => {
    return (
      userProfile?.displayName ||
      userProfile?.username ||
      me?.displayName ||
      me?.email ||
      "Player"
    );
  }, [userProfile, me]);

  const [joinInput, setJoinInput] = useState("");
  const [activeLobbyId, setActiveLobbyId] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLobbyId) return;

    const unsubLobby = listenLobby(activeLobbyId, setLobby);
    const unsubPlayers = listenPlayers(activeLobbyId, setPlayers);

    return () => {
      unsubLobby();
      unsubPlayers();
    };
  }, [activeLobbyId]);

  if (!me) {
    // Shouldn't happen because /live is protected, but safe fallback
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        <h2>Live Mode</h2>
        <p>Please log in first.</p>
      </div>
    );
  }

  const uid = me.uid;
  const isHost = lobby?.hostUid === uid;
  const myPlayer = players.find((p) => p.uid === uid);
  const myReady = !!myPlayer?.ready;

  async function handleCreate() {
    setError("");
    try {
      const id = await createLobby(uid, displayName);
      setActiveLobbyId(id);
    } catch (e) {
      setError(e?.message || "Failed to create lobby");
    }
  }

  async function handleJoin() {
    setError("");
    const id = joinInput.trim();
    if (!id) return setError("Enter a lobby ID");
    try {
      await joinLobby(id, uid, displayName);
      setActiveLobbyId(id);
    } catch (e) {
      setError(e?.message || "Failed to join lobby");
    }
  }

  async function handleLeave() {
    setError("");
    try {
      await leaveLobby(activeLobbyId, uid);
      setActiveLobbyId(null);
      setLobby(null);
      setPlayers([]);
    } catch (e) {
      setError(e?.message || "Failed to leave lobby");
    }
  }

  async function handleToggleReady() {
    setError("");
    try {
      await setReady(activeLobbyId, uid, !myReady);
    } catch (e) {
      setError(e?.message || "Failed to toggle ready");
    }
  }

  async function handleStart() {
    setError("");
    try {
      await startLobby(activeLobbyId, uid);
    } catch (e) {
      setError(e?.message || "Failed to start lobby");
    }
  }

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2 style={{ marginBottom: 8 }}>Live Mode</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Firebase-only lobby (runs inside Hub)
      </p>

      {error && (
        <div
          style={{
            background: "rgba(255,48,80,0.12)",
            border: "1px solid rgba(255,48,80,0.5)",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16
          }}
        >
          {error}
        </div>
      )}

      {!activeLobbyId ? (
        <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <button
            onClick={handleCreate}
            style={btnPrimary}
          >
            Create Lobby
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              placeholder="Enter Lobby ID"
              style={inputStyle}
            />
            <button onClick={handleJoin} style={btnSecondary}>
              Join
            </button>
          </div>

          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Tip: Create a lobby, copy the Lobby ID, send it to friends.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>Lobby ID</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{activeLobbyId}</div>
              </div>
              <div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>Status</div>
                <div style={{ fontWeight: 700 }}>
                  {lobby?.status || "loading..."}
                </div>
              </div>
              <div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>Players</div>
                <div style={{ fontWeight: 700 }}>{players.length}/6</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Players</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {players.map((p) => (
                <div
                  key={p.uid}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {p.displayName || "Player"}
                      {p.uid === lobby?.hostUid ? " (Host)" : ""}
                      {p.uid === uid ? " (You)" : ""}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {p.ready ? "✅ Ready" : "❌ Not ready"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button onClick={handleToggleReady} style={btnSecondary}>
                {myReady ? "Unready" : "Ready Up"}
              </button>

              {isHost && (
                <button onClick={handleStart} style={btnPrimary}>
                  Start Game
                </button>
              )}

              <button onClick={handleLeave} style={btnDanger}>
                Leave Lobby
              </button>
            </div>
          </div>

          {lobby?.status === "started" && (
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Game Started</h3>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>
                Next step: this is where you transition everyone into your Live workout session.
                (We can wire your “trick cards / joker cards / burnouts type” logic here next.)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none"
};

const btnPrimary = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(45deg, #ff3050 0%, #ff6b6b 100%)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const btnSecondary = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const btnDanger = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,48,80,0.6)",
  background: "rgba(255,48,80,0.12)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const card = {
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
};
