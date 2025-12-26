import React, { useState, useEffect, useRef } from "react";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import ExerciseAvatar from "../components/ExerciseAvatar.jsx";

export default function Solo({ user, userProfile }) {
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentSuit, setCurrentSuit] = useState("");
  const [currentGroup, setCurrentGroup] = useState("");
  const [toast, setToast] = useState("");

  const exercises = {
    Arms: ["Push-ups", "Plank Up-Downs", "Pike Push ups", "Shoulder Taps"],
    Legs: ["Squats", "Lunges", "Glute Bridges", "Calf Raises"],
    Core: ["Crunches", "Plank", "Russian Twists", "Leg Raises"],
    Cardio: ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"]
  };

  const descriptions = {
    "Push-ups": "Maintain a straight line from shoulders to heels.",
    "Plank Up-Downs": "Move from elbow to push-up position repeatedly.",
    "Pike Push ups": "Lower body until elbows reach 90° using a surface.",
    "Shoulder Taps": "Tap alternate shoulders keeping core tight.",
    "Squats": "Keep chest up and push hips back.",
    "Lunges": "Step forward and lower knee near floor.",
    "Glute Bridges": "Lift hips high, squeeze glutes.",
    "Calf Raises": "Lift heels and squeeze calves.",
    "Crunches": "Lift shoulders toward ceiling.",
    "Plank": "Hold still; engage abs.",
    "Russian Twists": "Twist torso side to side.",
    "Leg Raises": "Lift legs slowly, keep core tight.",
    "Jumping Jacks": "Full arm extension and rhythm.",
    "High Knees": "Bring knees to waist level quickly.",
    "Burpees": "Drop, push-up, and jump explosively.",
    "Mountain Climbers": "Alternate knees toward chest quickly."
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const drawCard = () => {
    const suits = ["♥", "♦", "♣", "♠"];
    const groups = ["Arms", "Legs", "Core", "Cardio"];
    const randGroup = groups[Math.floor(Math.random() * groups.length)];
    const groupExercises = exercises[randGroup];
    const exercise = groupExercises[Math.floor(Math.random() * groupExercises.length)];
    const goal = Math.floor(Math.random() * 13) + 2;

    setCurrentSuit(suits[Math.floor(Math.random() * 4)]);
    setCurrentGroup(randGroup);
    setCurrentExercise(exercise);
    setRepGoal(goal);
    setCurrentReps(0);

    showToast(`New card: ${exercise}!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const addRep = () => {
    const newReps = currentReps + 1;
    setCurrentReps(newReps);
    const newTotal = totalReps + 1;
    setTotalReps(newTotal);
    speakNumber(newReps);

    if (newReps >= repGoal) {
      showToast("Card complete! Draw a new card.");
    }

    if (newTotal % 30 === 0) {
      const newDice = dice + 1;
      setDice(newDice);
      showToast(`🎲 Dice earned! Total: ${newDice}`);
      speakFeedback(`Dice earned! Total: ${newDice}`);
    }
  };

  const startWorkout = () => {
    drawCard();
  };

  const endSession = async () => {
    if (user && user.uid) {
      try {
        const { db } = await import("../firebase.js");
        const { doc, updateDoc, getDoc, setDoc, increment } = await import("firebase/firestore");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            totalReps: increment(totalReps),
            diceBalance: increment(dice)
          });
        } else {
          await setDoc(userRef, {
            userId: user.uid,
            totalReps: totalReps,
            diceBalance: dice
          });
        }
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }

    alert(`Session complete!\nTotal Reps: ${totalReps}\nDice Earned: ${dice}`);
  };

  const styles = {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      minHeight: "100vh",
      backgroundColor: "#0a0a0a",
      color: "#fff"
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      width: "100%"
    },
    title: {
      fontSize: "48px",
      fontWeight: "bold",
      margin: "0 0 10px 0",
      textShadow: "0 0 20px rgba(255, 46, 46, 0.8)"
    },
    diceCounter: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#ffd700"
    },
    cardArea: {
      width: "100%",
      maxWidth: "600px",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    playingCard: {
      backgroundColor: "#1a1a1a",
      border: "3px solid #ff2e2e",
      borderRadius: "10px",
      padding: "30px",
      textAlign: "center",
      position: "relative",
      minHeight: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    },
    cardCorner: {
      position: "absolute",
      top: "10px",
      left: "10px",
      textAlign: "center",
      fontSize: "14px"
    },
    cardCornerValue: {
      fontSize: "24px",
      fontWeight: "bold"
    },
    cardCornerSuit: {
      fontSize: "20px"
    },
    cardCenter: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px"
    },
    cardSuitLarge: {
      fontSize: "80px"
    },
    cardExerciseName: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#ffd700"
    },
    cardProgressText: {
      fontSize: "18px",
      color: "#aaa"
    },
    cardDescription: {
      fontSize: "14px",
      color: "#aaa",
      fontStyle: "italic"
    },
    workoutArea: {
      width: "100%",
      maxWidth: "640px",
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },
    stats: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px"
    },
    statBox: {
      backgroundColor: "#1a1a1a",
      padding: "15px",
      borderRadius: "5px",
      border: "1px solid #ff2e2e",
      textAlign: "center"
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#ffd700"
    },
    statLabel: {
      fontSize: "12px",
      color: "#aaa",
      marginTop: "5px"
    },
    formFeedback: {
      padding: "15px",
      backgroundColor: "#ff2e2e",
      color: "#fff",
      borderRadius: "5px",
      textAlign: "center",
      fontSize: "16px",
      fontWeight: "bold",
      minHeight: "30px"
    },
    buttons: {
      display: "flex",
      gap: "10px",
      justifyContent: "center"
    },
    button: {
      padding: "12px 30px",
      fontSize: "16px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "all 0.3s"
    },
    startButton: {
      backgroundColor: "#00ff00",
      color: "#000"
    },
    endButton: {
      backgroundColor: "#ff2e2e",
      color: "#fff"
    },
    drawButton: {
      backgroundColor: "#ffd700",
      color: "#000"
    },
    toast: {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#ff2e2e",
      color: "#fff",
      padding: "15px 25px",
      borderRadius: "5px",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
    }
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.title}>SOLO MODE</h1>
        <div style={styles.diceCounter}>🎲 Dice: {dice}</div>
      </header>

      <section style={styles.cardArea}>
        <div style={styles.playingCard}>
          <div style={styles.cardCorner}>
            <div style={styles.cardCornerValue}>{repGoal || "?"}</div>
            <div style={styles.cardCornerSuit}>{currentSuit || "♠"}</div>
          </div>
          <div style={styles.cardCenter}>
            <div style={styles.cardSuitLarge}>
              {currentGroup === "Arms" && "💪"}
              {currentGroup === "Legs" && "🦵"}
              {currentGroup === "Core" && "🔥"}
              {currentGroup === "Cardio" && "⚡"}
              {!currentGroup && "♠"}
            </div>
            <div style={styles.cardExerciseName}>{currentExercise || "READY"}</div>
            <div style={styles.cardProgressText}>
              {currentExercise ? `${currentReps}/${repGoal}` : "Start to begin"}
            </div>
            {currentExercise && (
              <div style={styles.cardDescription}>{descriptions[currentExercise]}</div>
            )}
          </div>
        </div>

        {currentExercise && (
          <div style={styles.workoutArea}>
            <div style={styles.stats}>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{currentReps}</div>
                <div style={styles.statLabel}>Set Reps</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{totalReps}</div>
                <div style={styles.statLabel}>Total Reps</div>
              </div>
            </div>

            <div style={styles.buttons}>
              <button onClick={addRep} style={{ ...styles.button, ...styles.startButton }}>
                +1 Rep
              </button>
              <button onClick={drawCard} style={{ ...styles.button, ...styles.drawButton }}>
                Draw Card
              </button>
              <button onClick={endSession} style={{ ...styles.button, ...styles.endButton }}>
                End Session
              </button>
            </div>
          </div>
        )}

        {!currentExercise && (
          <div style={styles.buttons}>
            <button onClick={startWorkout} style={{ ...styles.button, ...styles.startButton }}>
              Start Workout
            </button>
          </div>
        )}
      </section>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
