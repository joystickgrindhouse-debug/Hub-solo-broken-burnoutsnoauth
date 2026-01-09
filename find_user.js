const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findUser(email) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    let found = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
        console.log('FOUND_UID:' + doc.id);
        found = true;
      }
    });
    if (!found) {
      // Fallback: check if any user has a field that might be email
      snapshot.forEach(doc => {
        const data = doc.data();
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'string' && data[key].toLowerCase() === email.toLowerCase()) {
             console.log('FOUND_UID_FALLBACK:' + doc.id);
             found = true;
          }
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

findUser('socalturfexperts@gmail.com');
