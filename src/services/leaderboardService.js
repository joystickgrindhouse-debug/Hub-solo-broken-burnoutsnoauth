import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  Timestamp 
} from "firebase/firestore";

/**
 * Shared Leaderboard Service
 * This service can be used by both Rivalis Hub and external Solo app
 * to read and write leaderboard scores
 */

export const LeaderboardService = {
  /**
   * Submit a score to the leaderboard
   * @param {Object} scoreData - Score data to submit
   */
  async submitScore({ userId, userName, gameMode, score, duration = 0, metadata = {} }) {
    try {
      const scoreEntry = {
        userId,
        userName,
        gameMode,
        score,
        duration,
        metadata,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "leaderboard"), scoreEntry);
      console.log("Score submitted successfully:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error submitting score:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get top scores for a specific game mode
   * @param {string} gameMode - Game mode to filter by
   * @param {number} limitCount - Number of top scores to retrieve (default: 10)
   */
  async getTopScores(gameMode, limitCount = 10) {
    try {
      const q = query(
        collection(db, "leaderboard"),
        where("gameMode", "==", gameMode),
        orderBy("score", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const scores = [];
      
      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, scores };
    } catch (error) {
      console.error("Error fetching top scores:", error);
      return { success: false, error: error.message, scores: [] };
    }
  },

  /**
   * Get all top scores across all game modes
   * @param {number} limitCount - Number of top scores to retrieve (default: 10)
   */
  async getAllTopScores(limitCount = 10) {
    try {
      const q = query(
        collection(db, "leaderboard"),
        orderBy("score", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const scores = [];
      
      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, scores };
    } catch (error) {
      console.error("Error fetching all top scores:", error);
      return { success: false, error: error.message, scores: [] };
    }
  },

  /**
   * Get user's personal best scores
   * @param {string} userId - User ID to filter by
   * @param {string} gameMode - Optional game mode filter
   */
  async getUserScores(userId, gameMode = null) {
    try {
      let q;
      
      if (gameMode) {
        q = query(
          collection(db, "leaderboard"),
          where("userId", "==", userId),
          where("gameMode", "==", gameMode),
          orderBy("score", "desc"),
          limit(10)
        );
      } else {
        q = query(
          collection(db, "leaderboard"),
          where("userId", "==", userId),
          orderBy("score", "desc"),
          limit(10)
        );
      }

      const querySnapshot = await getDocs(q);
      const scores = [];
      
      querySnapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, scores };
    } catch (error) {
      console.error("Error fetching user scores:", error);
      return { success: false, error: error.message, scores: [] };
    }
  }
};
