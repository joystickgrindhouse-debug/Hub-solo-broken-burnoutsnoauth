import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  where,
  Timestamp,
  getDocs
} from "firebase/firestore";

export const LiveService = {
  // Room Management
  async createRoom(hostId, hostName, roomName) {
    try {
      const roomData = {
        hostId,
        hostName,
        roomName,
        status: "waiting", // waiting, playing
        players: [{ userId: hostId, userName: hostName, ready: true }],
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, "liveRooms"), roomData);
      return { success: true, roomId: docRef.id };
    } catch (error) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message };
    }
  },

  subscribeToRooms(callback) {
    const roomsRef = collection(db, "liveRooms");
    const q = query(roomsRef, where("status", "==", "waiting"));
    
    return onSnapshot(q, (snapshot) => {
      const rooms = [];
      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() });
      });
      callback(rooms);
    });
  },

  async joinRoom(roomId, userId, userName) {
    try {
      const roomRef = doc(db, "liveRooms", roomId);
      const roomSnap = await getDocs(query(collection(db, "liveRooms"), where("__name__", "==", roomId)));
      if (roomSnap.empty) return { success: false, error: "Room not found" };
      
      const roomData = roomSnap.docs[0].data();
      const players = roomData.players || [];
      
      if (players.find(p => p.userId === userId)) return { success: true };
      
      await updateDoc(roomRef, {
        players: [...players, { userId, userName, ready: false }],
        lastActivity: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async leaveRoom(roomId, userId) {
    try {
      const roomRef = doc(db, "liveRooms", roomId);
      const roomSnap = await getDocs(query(collection(db, "liveRooms"), where("__name__", "==", roomId)));
      if (roomSnap.empty) return { success: true };
      
      const roomData = roomSnap.docs[0].data();
      const players = (roomData.players || []).filter(p => p.userId !== userId);
      
      if (players.length === 0) {
        await deleteDoc(roomRef);
      } else {
        await updateDoc(roomRef, {
          players,
          hostId: roomData.hostId === userId ? players[0].userId : roomData.hostId,
          hostName: roomData.hostId === userId ? players[0].userName : roomData.hostName,
          lastActivity: Timestamp.now()
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async toggleReady(roomId, userId, ready) {
    try {
      const roomRef = doc(db, "liveRooms", roomId);
      const roomSnap = await getDocs(query(collection(db, "liveRooms"), where("__name__", "==", roomId)));
      const roomData = roomSnap.docs[0].data();
      const players = roomData.players.map(p => 
        p.userId === userId ? { ...p, ready } : p
      );
      await updateDoc(roomRef, { players, lastActivity: Timestamp.now() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async startMatch(roomId) {
    try {
      const roomRef = doc(db, "liveRooms", roomId);
      const jokers = [
        { id: "j1", type: "positive", effect: "Double Points (Next 30s)", value: 2 },
        { id: "j2", type: "positive", effect: "Skip Next Exercise", value: 0 },
        { id: "j3", type: "negative", effect: "Half Points (Next 30s)", value: 0.5 },
        { id: "j4", type: "negative", effect: "Extra 10 Reps", value: 10 }
      ].sort(() => Math.random() - 0.5);

      await updateDoc(roomRef, { 
        status: "playing",
        startTime: Timestamp.now(),
        jokers: jokers,
        currentJokerIndex: -1
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async triggerJoker(roomId) {
    try {
      const roomRef = doc(db, "liveRooms", roomId);
      const roomSnap = await getDocs(query(collection(db, "liveRooms"), where("__name__", "==", roomId)));
      const roomData = roomSnap.docs[0].data();
      const nextIndex = (roomData.currentJokerIndex || -1) + 1;
      
      if (nextIndex < roomData.jokers.length) {
        await updateDoc(roomRef, {
          currentJokerIndex: nextIndex,
          jokerActiveUntil: Timestamp.fromMillis(Date.now() + 30000)
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
