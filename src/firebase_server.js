const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'rivalis-fitness-reimagined'
  });
}

const db = admin.firestore();
module.exports = { db, admin };
