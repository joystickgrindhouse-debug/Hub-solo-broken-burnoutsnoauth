# Solo App Integration Guide

This document explains how the external Solo app (hosted at https://solorivalis.netlify.app) can integrate with Rivalis Hub to share authentication and leaderboard data.

## How It Works

When a user clicks on the Solo mode tile in Rivalis Hub, the app automatically passes authentication data via URL parameters.

### URL Parameters Passed

The Solo app will receive the following URL parameters:

- `token` - Firebase ID token for the authenticated user
- `userId` - User's unique ID
- `email` - User's email address
- `displayName` - User's display name

**Example URL:**
```
https://solorivalis.netlify.app?token=eyJhbGc...&userId=abc123...&email=user@example.com&displayName=John
```

## Solo App Implementation

### 1. Extract Authentication Data

In your Solo app, extract the URL parameters on page load:

```javascript
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const authData = {
  token: urlParams.get('token'),
  userId: urlParams.get('userId'),
  email: urlParams.get('email'),
  displayName: urlParams.get('displayName')
};

// Store in localStorage for session persistence
if (authData.token) {
  localStorage.setItem('rivalis_auth', JSON.stringify(authData));
}
```

### 2. Configure Firebase in Solo App

Use the same Firebase configuration in your Solo app:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB68ZwHdbSKc_KmYu_UBEPdde6_1giTvy4",
  authDomain: "rivalis-fitness-reimagined.firebaseapp.com",
  projectId: "rivalis-fitness-reimagined",
  storageBucket: "rivalis-fitness-reimagined.firebasestorage.app",
  messagingSenderId: "87398106759",
  appId: "1:87398106759:web:5048a04e7130f8a027da22",
  measurementId: "G-18CRL1DDT8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3. Use the Leaderboard Service

Copy the `leaderboardService.js` from Rivalis Hub to your Solo app, or use the same Firebase Firestore structure:

```javascript
import { LeaderboardService } from './leaderboardService.js';

// Submit a score after a game
async function submitGameScore(score) {
  const authData = JSON.parse(localStorage.getItem('rivalis_auth'));
  
  if (authData) {
    const result = await LeaderboardService.submitScore({
      userId: authData.userId,
      userName: authData.displayName,
      gameMode: 'solo',
      score: score,
      metadata: {
        // Add any game-specific data
        level: currentLevel,
        time: gameTime,
        // etc.
      }
    });
    
    if (result.success) {
      console.log('Score submitted to leaderboard!');
    }
  }
}

// Get top scores
async function displayLeaderboard() {
  const result = await LeaderboardService.getTopScores('solo', 10);
  
  if (result.success) {
    // Display scores in your UI
    result.scores.forEach((scoreEntry, index) => {
      console.log(`${index + 1}. ${scoreEntry.userName}: ${scoreEntry.score}`);
    });
  }
}
```

## Firestore Database Structure

### Leaderboard Collection

Collection: `leaderboard`

Document structure:
```javascript
{
  userId: "string",           // User's unique ID
  userName: "string",         // Display name
  gameMode: "string",         // 'solo', 'burnouts', 'live', 'run', 'gameboard'
  score: number,              // The score value (higher is better)
  metadata: {                 // Game-specific data
    level: number,
    time: number,
    // ... other game data
  },
  timestamp: Timestamp,       // Firestore timestamp
  createdAt: "string"        // ISO date string
}
```

## Security Rules

Make sure your Firebase Firestore rules allow authenticated users to write to the leaderboard:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leaderboard rules
    match /leaderboard/{scoreId} {
      // Anyone can read leaderboard
      allow read: if true;
      
      // Only authenticated users can create scores
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Users can only update/delete their own scores
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Testing the Integration

1. Log in to Rivalis Hub
2. Click on the Solo mode tile
3. Check the browser console in the Solo app to verify auth data is received
4. Play the game and submit a score
5. Return to Rivalis Hub and check the Leaderboard view to see if the score appears

## Notes

- The Firebase ID token is valid for 1 hour by default
- Consider refreshing the token if the Solo game session is longer than 1 hour
- Store auth data securely (avoid exposing tokens in console logs in production)
- Both apps share the same Firebase project, so data is automatically synchronized
