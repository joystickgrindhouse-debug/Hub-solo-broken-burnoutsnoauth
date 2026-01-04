const { db } = require('../src/firebase_server'); // Need server-side firebase setup
const { Timestamp } = require('firebase-admin/firestore');

async function runRaffle() {
  console.log("Starting Sunday Raffle Draw...");
  try {
    const leaderboardRef = db.collection('leaderboard');
    const now = new Date();
    // Get start of the current raffle window (last Sunday 8pm)
    const day = now.getDay();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - day);
    windowStart.setHours(20, 0, 0, 0);
    
    // If it's before Sunday 8pm, the window started the previous Sunday
    if (now < windowStart) {
      windowStart.setDate(windowStart.getDate() - 7);
    }
    
    const snapshot = await leaderboardRef
      .where('timestamp', '>=', windowStart)
      .get();
      
    if (snapshot.empty) {
      console.log("No entries for this raffle window.");
      return null;
    }
    
    let allTickets = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ticketRefs && Array.isArray(data.ticketRefs)) {
        data.ticketRefs.forEach(ref => {
          allTickets.push({
            ticket: ref,
            userId: data.userId,
            userName: data.userName,
            gameMode: data.gameMode
          });
        });
      }
    });
    
    if (allTickets.length === 0) {
      console.log("No valid tickets found.");
      return null;
    }
    
    // Select winner using secure random
    const winnerIndex = Math.floor(Math.random() * allTickets.length);
    const winner = allTickets[winnerIndex];
    
    console.log(`WINNER SELECTED: ${winner.userName} with ticket ${winner.ticket}`);
    
    const winnerRecord = {
      ...winner,
      drawDate: Timestamp.now(),
      status: 'pending_fulfillment',
      raffleWindowStart: Timestamp.fromDate(windowStart)
    };
    
    const docRef = await db.collection('raffle_winners').add(winnerRecord);
    
    return { id: docRef.id, ...winnerRecord };
  } catch (error) {
    console.error("Raffle automation logic failed:", error);
    throw error;
  }
}

module.exports = { runRaffle };
