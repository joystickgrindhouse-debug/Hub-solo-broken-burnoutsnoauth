import { db } from "../firebase.js";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

export const BuddyService = {
  // Friend Requests
  async sendFriendRequest(fromUserId, toUserId) {
    try {
      const requestRef = collection(db, "friendRequests");
      await addDoc(requestRef, {
        from: fromUserId,
        to: toUserId,
        status: "pending",
        timestamp: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPendingRequests(userId) {
    const q = query(collection(db, "friendRequests"), where("to", "==", userId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async respondToRequest(requestId, status) {
    const requestRef = doc(db, "friendRequests", requestId);
    const requestDoc = await getDoc(requestRef);
    const data = requestDoc.data();

    if (status === "accepted") {
      // Create friendship
      await addDoc(collection(db, "friendships"), {
        users: [data.from, data.to],
        timestamp: Timestamp.now()
      });
    }
    await deleteDoc(requestRef);
    return { success: true };
  },

  // Friends List
  async getFriends(userId) {
    const q = query(collection(db, "friendships"), where("users", "array-contains", userId));
    const snapshot = await getDocs(q);
    const friendIds = snapshot.docs.map(doc => {
      const data = doc.data();
      return data.users.find(id => id !== userId);
    });
    return friendIds;
  },

  // Shared Challenges
  async createChallenge(creatorId, buddyId, type, goal) {
    const challengeRef = collection(db, "challenges");
    await addDoc(challengeRef, {
      participants: [creatorId, buddyId],
      type, // 'reps', 'miles'
      goal,
      scores: { [creatorId]: 0, [buddyId]: 0 },
      status: "active",
      timestamp: Timestamp.now()
    });
    return { success: true };
  },

  async getActiveChallenges(userId) {
    const q = query(collection(db, "challenges"), where("participants", "array-contains", userId), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
