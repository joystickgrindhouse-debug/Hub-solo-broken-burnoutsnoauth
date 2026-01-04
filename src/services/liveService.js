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
      await updateDoc(roomRef, { 
        status: "playing",
        startTime: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
