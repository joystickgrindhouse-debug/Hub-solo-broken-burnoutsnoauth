const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    if (serviceAccountVar && serviceAccountVar !== "undefined" && serviceAccountVar.trim() !== "") {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_JSON is missing or undefined");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin with service account:", error.message);
    // Fallback for safety, though it may fail if not in a Google environment
    try {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'rivalis-fitness-reimagined'
      });
    } catch (initError) {
      console.error("Firebase Admin fallback initialization failed:", initError.message);
    }
  }
}

const db = admin.firestore();
module.exports = { db, admin };
