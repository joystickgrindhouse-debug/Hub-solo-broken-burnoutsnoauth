const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin with service account:", error);
    // Fallback for safety, though it may fail if not in a Google environment
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'rivalis-fitness-reimagined'
    });
  }
}

const db = admin.firestore();
module.exports = { db, admin };
