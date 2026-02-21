import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function readRuntimeConfig() {
  try {
    if (typeof window !== 'undefined') {
      if (window.__FIREBASE_DEFAULTS__ && window.__FIREBASE_DEFAULTS__.config) {
        return window.__FIREBASE_DEFAULTS__.config;
      }
      const raw = localStorage.getItem('FIREBASE_CONFIG');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read runtime firebase config:', e.message || e);
  }
  return null;
}

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const runtimeConfig = readRuntimeConfig();

// Merge runtime config (if present) over build-time env config
const firebaseConfig = Object.assign({}, envConfig, runtimeConfig || {});

// DEFAULT FALLBACK: use provided project config so the app can initialize
// without requiring the browser debug injection. This is a client-side
// config (not a service account) and is safe for browser use, but you
// can remove it later if you prefer to keep configs out of source.
const defaultFallbackConfig = {
  apiKey: "AIzaSyB68ZwHdbSKc_KmYu_UBEPdde6_1giTvy4",
  authDomain: "rivalis-fitness-reimagined.firebaseapp.com",
  projectId: "rivalis-fitness-reimagined",
  storageBucket: "rivalis-fitness-reimagined.firebasestorage.app",
  messagingSenderId: "87398106759",
  appId: "1:87398106759:web:5048a04e7130f8a027da22",
  measurementId: "G-18CRL1DDT8"
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  Object.assign(firebaseConfig, defaultFallbackConfig);
}

let app = null;
let auth = null;
let db = null;
let storage = null;
let firebaseInitialized = false;

function makeAuthStub() {
  return {
    // minimal onAuthStateChanged stub to keep app from crashing when firebase isn't configured
    onAuthStateChanged: (cb) => {
      try { setTimeout(() => cb(null), 0); } catch (e) {}
      return () => {};
    }
  };
}

try {
  const hasKey = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId;
  if (!hasKey) {
    console.warn('Firebase config missing - app will run in unauthenticated debug mode. Provide config via window.__FIREBASE_DEFAULTS__ or localStorage(FIREBASE_CONFIG).');
    auth = makeAuthStub();
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    firebaseInitialized = true;
  }
} catch (e) {
  console.error('Firebase initialization failed:', e && e.message ? e.message : e);
  auth = makeAuthStub();
}

export { auth, db, storage, firebaseInitialized };

export const authReady = (async () => {
  if (!auth || !firebaseInitialized) return;
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.error('Failed to set auth persistence:', err);
  }
})();
