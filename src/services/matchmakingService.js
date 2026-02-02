import { db } from "../firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot,
  Timestamp,
  deleteDoc,
  setDoc
} from "firebase/firestore";

const BOT_NAMES = ["IronWill", "ShadowFlex", "NeonRunner", "TitanGrip", "CyberCore", "ZenMaster", "VoltViper", "PixelPulse"];

export const MatchmakingService = {
  async joinQueue(userId, userName, category = 'full') {
    const queueRef = collection(db, "matchmaking_queue");
    // Check for existing users in queue with same category
    const q = query(
      queueRef, 
      where("userId", "!=", userId), 
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Found an opponent
      const opponent = querySnapshot.docs[0].data();
      const opponentDocId = querySnapshot.docs[0].id;
      
      // Create match
      const matchId = `match_${Date.now()}`;
      await setDoc(doc(db, "matches", matchId), {
        player1: opponent.userId,
        player1Name: opponent.userName,
        player2: userId,
        player2Name: userName,
        currentTurn: opponent.userId,
        status: "active",
        category,
        deck1Count: 0,
        deck2Count: 0,
        lastAction: Timestamp.now(),
        history: []
      });
      
      // Remove opponent from queue
      await deleteDoc(doc(db, "matchmaking_queue", opponentDocId));
      return { matchId, role: "player2" };
    } else {
      // No opponent, join queue
      const docRef = await addDoc(queueRef, {
        userId,
        userName,
        category,
        joinedAt: Timestamp.now()
      });
      
      // Start a timeout for bot matchmaking
      return new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          // Check if still in queue
          const snap = await getDocs(query(queueRef, where("userId", "==", userId)));
          if (!snap.empty) {
            await deleteDoc(doc(db, "matchmaking_queue", docRef.id));
            const botMatch = await this.createBotMatch(userId, userName, category);
            resolve(botMatch);
          }
        }, 5000); // 5 seconds wait for real user
      });
    }
  },

  async createBotMatch(userId, userName, category = 'full') {
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const matchId = `match_bot_${Date.now()}`;
    const matchData = {
      player1: userId,
      player1Name: userName,
      player2: "BOT_ID",
      player2Name: botName,
      currentTurn: userId,
      status: "active",
      category,
      deck1Count: 0,
      deck2Count: 0,
      lastAction: Timestamp.now(),
      history: [],
      isBotMatch: true
    };
    await setDoc(doc(db, "matches", matchId), matchData);
    return { matchId, role: "player1" };
  },

  listenToMatch(matchId, callback) {
    return onSnapshot(doc(db, "matches", matchId), (doc) => {
      callback(doc.data());
    });
  },

  async submitTurn(matchId, userId, stats, currentMatch) {
    const matchRef = doc(db, "matches", matchId);
    const isPlayer1 = currentMatch.player1 === userId;
    const nextTurn = isPlayer1 ? currentMatch.player2 : currentMatch.player1;
    
    const update = {
      currentTurn: nextTurn,
      lastAction: Timestamp.now(),
      history: [...(currentMatch.history || []), { userId, stats, timestamp: Date.now() }]
    };

    if (isPlayer1) {
      update.deck1Count = (currentMatch.deck1Count || 0) + 1;
    } else {
      update.deck2Count = (currentMatch.deck2Count || 0) + 1;
    }

    // Win condition: 2 full standard decks (52 cards each) completed
    if (update.deck1Count >= 52 && update.deck2Count >= 52) {
      update.status = "completed";
    }

    await updateDoc(matchRef, update);

    // If next turn is BOT, trigger bot action
    if (nextTurn === "BOT_ID" && update.status !== "completed") {
      setTimeout(() => this.executeBotTurn(matchId, update.history), 3000);
    }
  },

  async executeBotTurn(matchId, history) {
    const matchRef = doc(db, "matches", matchId);
    const snap = await getDocs(query(collection(db, "matches"), where("__name__", "==", matchId)));
    if (snap.empty) return;
    const matchData = snap.docs[0].data();
    
    await this.submitTurn(matchId, "BOT_ID", { reps: Math.floor(Math.random() * 10) + 5 }, matchData);
  }
};
