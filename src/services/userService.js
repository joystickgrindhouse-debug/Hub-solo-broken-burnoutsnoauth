import { db } from "../firebase.js";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

export const UserService = {
  async getUserProfile(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { success: true, profile: userDoc.data() };
      } else {
        return { success: false, profile: null };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, error: error.message, profile: null };
    }
  },

  async searchUsersByNickname(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return { success: true, users: [] };
      }

      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("nickname", ">=", searchTerm),
        where("nickname", "<=", searchTerm + '\uf8ff'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });

      return { success: true, users };
    } catch (error) {
      console.error("Error searching users:", error);
      return { success: false, error: error.message, users: [] };
    }
  },

  async getAllUsers(limitCount = 50) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, limit(limitCount));

      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });

      return { success: true, users };
    } catch (error) {
      console.error("Error fetching all users:", error);
      return { success: false, error: error.message, users: [] };
    }
  },

  async createUserProfile(userId, profileData) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userData = {
        userId,
        nickname: profileData.nickname,
        avatarURL: profileData.avatarURL || "",
        hasCompletedSetup: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(userDocRef, userData);
      return { success: true, profile: userData };
    } catch (error) {
      console.error("Error creating user profile:", error);
      return { success: false, error: error.message };
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      const userDocRef = doc(db, "users", userId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(userDocRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }
  },

  async updateHeartbeat(userId, currentActivity = "idle") {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        lastSeen: Timestamp.now(),
        isOnline: true,
        currentActivity
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  subscribeToOnlineUsers(callback) {
    const usersRef = collection(db, "users");
    // Only show users active in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const q = query(
      usersRef,
      where("lastSeen", ">=", Timestamp.fromDate(twoMinutesAgo)),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      callback(users);
    });
  },

  async completeUserSetup(userId, nickname, avatarURL) {
    try {
      const userDocRef = doc(db, "users", userId);
      
      const existingDoc = await getDoc(userDocRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};
      
      const userData = {
        userId,
        nickname,
        avatarURL,
        role: (userId === "v3h9WiCKKoTPH5Cyi5dVr0Pb2f03" || profileData.email === "Socalturfexperts@gmail.com") ? "admin" : "user",
        hasCompletedSetup: true,
        createdAt: existingData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(userDocRef, userData);
      console.log("User setup completed and saved to Firebase:", userData);
      return { success: true, profile: userData };
    } catch (error) {
      console.error("Error completing user setup:", error);
      return { success: false, error: error.message };
    }
  }
};
