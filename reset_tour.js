const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetTour(email) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No matching user found for email:', email);
      // Try case-insensitive or common variations if needed, but let's start exact
      process.exit(1);
    }

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        tourCompleted: false,
        rivalis_tour_completed: admin.firestore.FieldValue.delete() // Also clear common variations
      });
      console.log('Tour reset successfully for user:', doc.id);
    });
  } catch (error) {
    console.error('Error resetting tour:', error);
    process.exit(1);
  }
}

resetTour('socalturfexperts@gmail.com');
