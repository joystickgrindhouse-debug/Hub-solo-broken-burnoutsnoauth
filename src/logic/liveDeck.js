const EXERCISES_MAP = {
  Arms: ["Pushups", "PlankUpDowns", "PikePushups", "ShoulderTaps"],
  Legs: ["Squats", "Lunges", "GluteBridges", "CalfRaises"],
  Core: ["Crunches", "Plank", "RussianTwists", "LegRaises"],
  "Full Body": ["JumpingJacks", "HighKnees", "Burpees", "MountainClimbers"],
};

const EXERCISE_DISPLAY = {
  Pushups: "Push-ups",
  PlankUpDowns: "Plank Up-Downs",
  PikePushups: "Pike Push-ups",
  ShoulderTaps: "Shoulder Taps",
  Squats: "Squats",
  Lunges: "Lunges",
  GluteBridges: "Glute Bridges",
  CalfRaises: "Calf Raises",
  Crunches: "Crunches",
  Plank: "Plank",
  RussianTwists: "Russian Twists",
  LegRaises: "Leg Raises",
  JumpingJacks: "Jumping Jacks",
  HighKnees: "High Knees",
  Burpees: "Burpees",
  MountainClimbers: "Mountain Climbers",
};

const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_COLORS = { "♠": "#fff", "♥": "#ff3050", "♦": "#ff3050", "♣": "#fff" };
const FACE_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function faceToReps(face) {
  const map = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14 };
  return map[face] || 5;
}

const JOKER_CARDS = [
  { id: "joker_double", name: "DOUBLE DOWN", icon: "🃏", effect: "double_points", description: "Double points for this card!", color: "#FFD700", type: "joker" },
  { id: "joker_steal", name: "POINT THIEF", icon: "🃏", effect: "steal_points", description: "Steal 10 points from the leader!", color: "#ff3050", type: "joker" },
  { id: "joker_shield", name: "REP SHIELD", icon: "🃏", effect: "half_reps", description: "Only do half the reps on your next card!", color: "#00ff88", type: "joker" },
  { id: "joker_freeze", name: "FREEZE TAG", icon: "🃏", effect: "freeze_others", description: "Other players score 0 on their next card!", color: "#00bfff", type: "joker" },
  { id: "joker_jackpot", name: "JACKPOT", icon: "🃏", effect: "bonus_50", description: "+50 bonus points instantly!", color: "#ff00ff", type: "joker" },
  { id: "joker_reverse", name: "UNO REVERSE", icon: "🃏", effect: "reverse_order", description: "Reverse the play order!", color: "#ff8800", type: "joker" },
];

const TRICK_CARDS = [
  { id: "trick_speed", name: "SPEED DEMON", icon: "⚡", effect: "speed_round", description: "Speed round! Smash 10 reps for 25 bonus points!", color: "#FFD700", type: "trick", bonusReps: 10, bonusPoints: 25 },
  { id: "trick_mystery", name: "MYSTERY MOVE", icon: "❓", effect: "random_exercise", description: "Mystery exercise! 6 reps for 20 bonus points!", color: "#9b59b6", type: "trick", bonusReps: 6, bonusPoints: 20 },
  { id: "trick_double_or_nothing", name: "DOUBLE OR NOTHING", icon: "🎲", effect: "double_or_nothing", description: "Flip a coin! Win 40 points... or get nothing! 50/50 gamble!", color: "#e74c3c", type: "trick", bonusReps: 0, bonusPoints: 40 },
  { id: "trick_mirror", name: "MIRROR MATCH", icon: "🪞", effect: "mirror", description: "Mirror round! 5 reps together for 20 bonus points!", color: "#3498db", type: "trick", bonusReps: 5, bonusPoints: 20 },
  { id: "trick_hot_potato", name: "HOT POTATO", icon: "🥔", effect: "hot_potato", description: "Hot potato! Push through 12 reps for 15 bonus points!", color: "#e67e22", type: "trick", bonusReps: 12, bonusPoints: 15 },
  { id: "trick_combo", name: "COMBO BREAKER", icon: "💥", effect: "combo", description: "Combo time! 8 reps back-to-back for 30 bonus points!", color: "#2ecc71", type: "trick", bonusReps: 8, bonusPoints: 30 },
  { id: "trick_challenge", name: "RIVAL CHALLENGE", icon: "⚔️", effect: "challenge", description: "Challenge round! 10 reps for 35 bonus points!", color: "#ff3050", type: "trick", bonusReps: 10, bonusPoints: 35 },
  { id: "trick_rest", name: "BREATHER", icon: "😮‍💨", effect: "rest", description: "Catch your breath! Take a break, earn 5 points free.", color: "#1abc9c", type: "trick", bonusReps: 0, bonusPoints: 5 },
];

const TRICK_MODES = [
  { id: "classic", name: "Classic", icon: "🃏", description: "Standard showdown. Pure skill.", jokerCount: 2, trickCount: 2 },
  { id: "chaos", name: "Chaos Mode", icon: "🌪️", description: "Maximum trick & joker cards. Expect the unexpected.", jokerCount: 4, trickCount: 6 },
  { id: "speed_demon", name: "Speed Demon", icon: "⚡", description: "Faster pace. Timed rounds. No mercy.", jokerCount: 2, trickCount: 3, timedRounds: true, roundTime: 20 },
  { id: "endurance", name: "Endurance", icon: "🏋️", description: "Larger deck. More reps. Last one standing wins.", jokerCount: 3, trickCount: 4, deckMultiplier: 1.5 },
  { id: "no_tricks", name: "Pure Grind", icon: "💀", description: "No tricks, no jokers. Just raw reps.", jokerCount: 0, trickCount: 0 },
];

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateLiveDeck(muscleGroup, trickMode = "classic") {
  const mode = TRICK_MODES.find((m) => m.id === trickMode) || TRICK_MODES[0];
  const exercises = EXERCISES_MAP[muscleGroup] || EXERCISES_MAP["Arms"];

  let deck = [];
  SUITS.forEach((suit, suitIndex) => {
    const exercise = exercises[suitIndex % exercises.length];
    FACE_VALUES.forEach((face) => {
      deck.push({
        type: "exercise",
        suit,
        suitColor: SUIT_COLORS[suit],
        face,
        reps: faceToReps(face),
        exercise,
        displayName: EXERCISE_DISPLAY[exercise] || exercise,
        category: muscleGroup,
      });
    });
  });

  if (mode.deckMultiplier && mode.deckMultiplier > 1) {
    const extraCards = Math.floor(deck.length * (mode.deckMultiplier - 1));
    const shuffled = fisherYatesShuffle(deck);
    deck = [...deck, ...shuffled.slice(0, extraCards)];
  }

  const jokers = fisherYatesShuffle([...JOKER_CARDS]).slice(0, mode.jokerCount);
  const tricks = fisherYatesShuffle([...TRICK_CARDS]).slice(0, mode.trickCount);

  const allExercises = exercises;
  const specialCards = [...jokers, ...tricks].map((card, i) => {
    const exercise = allExercises[i % allExercises.length];
    const reps = card.bonusReps || (4 + Math.floor(Math.random() * 8));
    return {
      ...card,
      exercise,
      displayName: EXERCISE_DISPLAY[exercise] || exercise,
      reps,
      category: muscleGroup,
      deckIndex: i,
    };
  });

  const allCards = [...deck, ...specialCards];
  return fisherYatesShuffle(allCards);
}

export function getCardPoints(card, activeEffects = []) {
  let basePoints = (card.reps || 0) * 2;
  const bonusPoints = card.bonusPoints || 0;

  const hasDouble = activeEffects.includes("double_points");
  const hasFrozen = activeEffects.includes("frozen");

  if (hasFrozen) return 0;
  if (hasDouble) basePoints *= 2;

  return basePoints + bonusPoints;
}

export function getCardReps(card, activeEffects = []) {
  if (!card.reps) return 0;
  const hasHalfReps = activeEffects.includes("half_reps");
  return hasHalfReps ? Math.ceil(card.reps / 2) : card.reps;
}

export { EXERCISES_MAP, EXERCISE_DISPLAY, SUITS, SUIT_COLORS, JOKER_CARDS, TRICK_CARDS, TRICK_MODES };
