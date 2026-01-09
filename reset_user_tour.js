const admin = require('firebase-admin');
const fs = require('fs');

async function run() {
  const secrets = JSON.parse(fs.readFileSync('/home/runner/workspace/.replit_secrets.json', 'utf8'));
  // Note: This is a hacky way to get firebase-admin working without the json file, 
  // but better to just use the environment variables if we can't find the file.
  // However, since I'm in Build mode/Fast mode, I'll use a simpler approach:
  // I'll check if the firebase-adminsdk.json exists first.
  
  if (!fs.existsSync('./firebase-adminsdk.json')) {
     console.error('CRITICAL: firebase-adminsdk.json not found. Cannot reset via admin SDK.');
     process.exit(1);
  }

  const serviceAccount = require('./firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const email = 'socalturfexperts@gmail.com';

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      // Try finding by nickname or checking all users if email isn't indexed
      const allUsers = await usersRef.get();
      let found = false;
      for (const doc of allUsers.docs) {
        const data = doc.data();
        if (data.email?.toLowerCase() === email.toLowerCase()) {
          await doc.ref.update({ tourCompleted: false });
          console.log('Tour reset for UID:', doc.id);
          found = true;
          break;
        }
      }
      if (!found) console.log('User not found.');
    } else {
      for (const doc of snapshot.docs) {
        await doc.ref.update({ tourCompleted: false });
        console.log('Tour reset for UID:', doc.id);
      }
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
