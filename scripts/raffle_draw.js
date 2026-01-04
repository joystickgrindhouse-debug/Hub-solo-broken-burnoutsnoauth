const { db } = require('./src/firebase_server'); // Need a server-side firebase entry
const { Timestamp } = require('firebase-admin/firestore');

async function runRaffle() {
  console.log("Starting Sunday Raffle Draw...");
  try {
    const leaderboardRef = db.collection('leaderboard');
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 7);
    
    const snapshot = await leaderboardRef
      .where('timestamp', '>=', windowStart)
      .get();
      
    if (snapshot.empty) {
      console.log("No entries for this week's raffle.");
      return;
    }
    
    let allTickets = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ticketRefs && Array.isArray(data.ticketRefs)) {
        data.ticketRefs.forEach(ref => {
          allTickets.push({
            ticket: ref,
            userId: data.userId,
            userName: data.userName
          });
        });
      }
    });
    
    if (allTickets.length === 0) {
      console.log("No valid tickets found.");
      return;
    }
    
    const winner = allTickets[Math.floor(Math.random() * allTickets.length)];
    console.log(`WINNER SELECTED: ${winner.userName} (${winner.userId}) with ticket ${winner.ticket}`);
    
    // Save winner to a new collection
    await db.collection('raffle_winners').add({
      ...winner,
      drawDate: Timestamp.now(),
      status: 'pending_fulfillment'
    });
    
  } catch (error) {
    console.error("Raffle draw failed:", error);
  }
}

// In production, this would be triggered by a Cron Job
// For now, it's a script that can be run manually or scheduled
if (require.main === module) {
  runRaffle();
}
