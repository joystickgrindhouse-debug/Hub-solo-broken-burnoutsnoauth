import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";

const EXERCISE_FILE_MAP = {
  "Pushups": "pushups",
  "PlankUpDowns": "plank_updowns",
  "PikePushups": "pike_pushups",
  "ShoulderTaps": "shoulder_taps",
  "Squats": "squats",
  "Lunges": "lunges",
  "GluteBridges": "glute_bridges",
  "CalfRaises": "calf_raises",
  "Crunches": "crunches",
  "Plank": "plank",
  "RussianTwists": "russian_twists",
  "LegRaises": "leg_raises",
  "JumpingJacks": "jumping_jacks",
  "HighKnees": "high_knees",
  "Burpees": "burpees",
  "MountainClimbers": "mountain_climbers"
};

const EXERCISES_MAP = {
  Arms: ["Pushups", "PlankUpDowns", "PikePushups", "ShoulderTaps"],
  Legs: ["Squats", "Lunges", "GluteBridges", "CalfRaises"],
  Core: ["Crunches", "Plank", "RussianTwists", "LegRaises"],
  "Full Body": ["JumpingJacks", "HighKnees", "Burpees", "MountainClimbers"],
};

const EXERCISE_CATEGORY_MAP = {};
Object.entries(EXERCISES_MAP).forEach(([cat, exercises]) => {
  exercises.forEach(ex => { EXERCISE_CATEGORY_MAP[ex] = cat; });
});

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function faceToReps(face) {
  return typeof face === "number" ? face :
    face === "J" ? 11 :
    face === "Q" ? 12 :
    face === "K" ? 13 : 14;
}

export function shuffleDeck(muscleGroup) {
  const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
  const faceValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
  let deck = [];

  const exerciseList = EXERCISES_MAP[muscleGroup] || EXERCISES_MAP["Arms"];

  suits.forEach((suit, suitIndex) => {
    const exercise = exerciseList[suitIndex % exerciseList.length];

    faceValues.forEach((face) => {
      deck.push({
        suit,
        face,
        reps: faceToReps(face),
        exercise,
        exerciseId: EXERCISE_FILE_MAP[exercise] || exercise.toLowerCase(),
        category: muscleGroup
      });
    });
  });

  return fisherYatesShuffle(deck);
}

export function shuffleSoloDeck() {
  const allExercises = Object.values(EXERCISES_MAP).flat();
  const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
  const faceValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
  const totalCards = suits.length * faceValues.length;

  let exerciseAssignments = [];
  const perExercise = Math.floor(totalCards / allExercises.length);
  const remainder = totalCards % allExercises.length;

  allExercises.forEach((exercise, idx) => {
    const count = perExercise + (idx < remainder ? 1 : 0);
    for (let i = 0; i < count; i++) {
      exerciseAssignments.push(exercise);
    }
  });

  fisherYatesShuffle(exerciseAssignments);

  let deck = [];
  let cardIdx = 0;
  suits.forEach((suit) => {
    faceValues.forEach((face) => {
      const exercise = exerciseAssignments[cardIdx];
      deck.push({
        suit,
        face,
        reps: faceToReps(face),
        exercise,
        exerciseId: EXERCISE_FILE_MAP[exercise] || exercise.toLowerCase(),
        category: EXERCISE_CATEGORY_MAP[exercise] || "Full Body"
      });
      cardIdx++;
    });
  });

  return fisherYatesShuffle(deck);
}

export async function updateUserStats(userId, totalReps, ticketsEarned, muscleGroup) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  const stats = {
    totalReps,
    ticketBalance: ticketsEarned,
    [`leaderboard.${muscleGroup}`]: arrayUnion(totalReps),
    lastUpdated: new Date().toISOString()
  };

  if (userSnap.exists()) {
    await updateDoc(userRef, stats);
  } else {
    await setDoc(userRef, {
      ...stats,
      leaderboard: { [muscleGroup]: [totalReps] },
    });
  }
}

export async function finalizeSession(userId, totalReps, ticketsEarned, muscleGroup) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, {
      [`leaderboard.${muscleGroup}`]: arrayUnion(totalReps),
    });
  }
}
