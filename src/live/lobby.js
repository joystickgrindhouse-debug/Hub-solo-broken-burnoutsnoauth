import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase.js";

// Firestore structure:
//
// lobbies/{lobbyId}
//   hostUid, status, maxPlayers, minPlayers, createdAt, startedAt
//
// lobbies/{lobbyId}/players/{uid}
//   uid, displayName, ready, joinedAt

export async function createLobby(hostUid, displayName) {
  const lobbyRef = await addDoc(collection(db, "lobbies"), {
    hostUid,
    status: "waiting",
    maxPlayers: 6,
    minPlayers: 2,
    createdAt: serverTimestamp(),
    startedAt: null
  });

  await setDoc(doc(db, "lobbies", lobbyRef.id, "players", hostUid), {
    uid: hostUid,
    displayName,
    ready: false,
    joinedAt: serverTimestamp()
  });

  return lobbyRef.id;
}

export async function joinLobby(lobbyId, uid, displayName) {
  const lobbyRef = doc(db, "lobbies", lobbyId);
  const lobbySnap = await getDoc(lobbyRef);
  if (!lobbySnap.exists()) throw new Error("Lobby not found");

  const lobby = lobbySnap.data();
  if (lobby.status !== "waiting") throw new Error("Lobby already started");

  const playersSnap = await getDocs(collection(db, "lobbies", lobbyId, "players"));
  if (playersSnap.size >= lobby.maxPlayers) throw new Error("Lobby full");

  await setDoc(doc(db, "lobbies", lobbyId, "players", uid), {
    uid,
    displayName,
    ready: false,
    joinedAt: serverTimestamp()
  });
}

export async function leaveLobby(lobbyId, uid) {
  await deleteDoc(doc(db, "lobbies", lobbyId, "players", uid));
}

export async function setReady(lobbyId, uid, ready) {
  await updateDoc(doc(db, "lobbies", lobbyId, "players", uid), { ready });
}

export async function startLobby(lobbyId, uid) {
  const lobbyRef = doc(db, "lobbies", lobbyId);
  const lobbySnap = await getDoc(lobbyRef);
  if (!lobbySnap.exists()) throw new Error("Lobby not found");

  const lobby = lobbySnap.data();
  if (lobby.hostUid !== uid) throw new Error("Only host can start");

  const playersSnap = await getDocs(collection(db, "lobbies", lobbyId, "players"));
  if (playersSnap.size < lobby.minPlayers) throw new Error("Need at least 2 players");

  let allReady = true;
  playersSnap.forEach((p) => {
    const data = p.data();
    if (!data.ready) allReady = false;
  });

  if (!allReady) throw new Error("All players must be ready");

  await updateDoc(lobbyRef, {
    status: "started",
    startedAt: serverTimestamp()
  });
}

export function listenLobby(lobbyId, cb) {
  return onSnapshot(doc(db, "lobbies", lobbyId), (snap) => cb(snap.data()));
}

export function listenPlayers(lobbyId, cb) {
  return onSnapshot(collection(db, "lobbies", lobbyId, "players"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
