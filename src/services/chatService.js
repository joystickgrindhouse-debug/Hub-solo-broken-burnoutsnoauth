import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  Timestamp,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

export const ChatService = {
  async clearAllGlobalMessages() {
    try {
      const q = query(collection(db, "globalChat"));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "globalChat", d.id)));
      await Promise.all(deletePromises);
      console.log("Global chat cleared successfully.");
      return { success: true };
    } catch (error) {
      console.error("Error clearing global chat:", error);
      return { success: false, error: error.message };
    }
  },

  async cleanupOldGlobalMessages() {
    try {
      const q = query(
        collection(db, "globalChat"),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      const allMessages = [];
      snapshot.forEach((doc) => {
        allMessages.push({ id: doc.id, ...doc.data() });
      });
      
      if (allMessages.length > 50) {
        const messagesToDelete = allMessages.slice(50);
        const deletePromises = messagesToDelete.map(msg => 
          deleteDoc(doc(db, "globalChat", msg.id))
        );
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${messagesToDelete.length} old messages`);
      }
    } catch (error) {
      console.error("Error cleaning up old messages:", error);
    }
  },

  async sendGlobalMessage({ userId, nickname, avatarURL, text }) {
    try {
      const messageData = {
        userId,
        nickname,
        avatarURL,
        text,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "globalChat"), messageData);
      
      // Cleanup old messages after sending (keeps only last 50)
      this.cleanupOldGlobalMessages();
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error sending global message:", error);
      return { success: false, error: error.message };
    }
  },

  subscribeToGlobalMessages(callback, messageLimit = 50) {
    const q = query(
      collection(db, "globalChat"),
      orderBy("timestamp", "desc"),
      limit(messageLimit)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      messages.reverse();
      callback(messages);
    });
  },

  async sendDirectMessage({ fromUserId, fromNickname, fromAvatarURL, toUserId, toNickname, text }) {
    try {
      const messageData = {
        fromUserId,
        fromNickname,
        fromAvatarURL,
        toUserId,
        toNickname,
        text,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "directMessages"), messageData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error sending direct message:", error);
      return { success: false, error: error.message };
    }
  },

  subscribeToDirectMessages(userId, callback, messageLimit = 50) {
    const q = query(
      collection(db, "directMessages"),
      where("fromUserId", "in", [userId]),
      orderBy("timestamp", "desc"),
      limit(messageLimit)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      messages.reverse();
      callback(messages);
    });
  },

  subscribeToConversation(userId1, userId2, callback, messageLimit = 50) {
    const q = query(
      collection(db, "directMessages"),
      orderBy("timestamp", "desc"),
      limit(messageLimit * 2)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.fromUserId === userId1 && data.toUserId === userId2) ||
          (data.fromUserId === userId2 && data.toUserId === userId1)
        ) {
          messages.push({
            id: doc.id,
            ...data
          });
        }
      });
      messages.reverse();
      const limitedMessages = messages.slice(-messageLimit);
      callback(limitedMessages);
    });
  }
};
