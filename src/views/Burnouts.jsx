import React, { useState, useRef } from "react";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import ExerciseAvatar from "../components/ExerciseAvatar.jsx";

export default function Burnouts({ user, userProfile }) {
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [toast, setToast] = useState("");
  const [selectedBurnoutType, setSelectedBurnoutType] = useState(null);

  const exercises = {
    Arms: ["Push-ups", "Plank Up-Downs", "Pike Push ups", "Shoulder Taps"],
    Legs: ["Squats", "Lunges", "Glute Bridges", "Calf Raises"],
    Core: ["Crunches", "Plank", "Russian Twists", "Leg Raises"],
    Cardio: ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"]
  };

  const descriptions = {
    "Push-ups": "Lower your chest to the ground. Keep your body straight.",
    "Plank Up-Downs": "Move from elbow plank to push-up position.",
    "Pike Push ups": "Lower your body using a chair or bench.",
    "Shoulder Taps": "Tap opposite shoulders while in plank.",
    "Squats": "Lower your hips, keep chest up.",
    "Lunges": "Step forward and lower back knee.",
    "Glute Bridges": "Lift hips high, squeeze glutes.",
    "Calf Raises": "Raise up on your toes.",
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
    let categoriesToUse = [];

    if (selectedBurnoutType === "Full Body") {
      categoriesToUse = ["Arms", "Legs", "Core", "Cardio"];
    } else if (selectedBurnoutType === "Arms") {
      categoriesToUse = ["Arms"];
    } else if (selectedBurnoutType === "Legs") {
      categoriesToUse = ["Legs"];
    } else if (selectedBurnoutType === "Core") {
      categoriesToUse = ["Core"];
    } else {
      categoriesToUse = ["Arms", "Legs", "Core", "Cardio"];
    }

    const randCategory = categoriesToUse[Math.floor(Math.random() * categoriesToUse.length)];
    const categoryExercises = exercises[randCategory];
    const exercise = categoryExercises[Math.floor(Math.random() * categoryExercises.length)];
    const goal = Math.floor(Math.random() * 13) + 2;

    setCurrentCategory(randCategory);
    setCurrentExercise(exercise);
    setRepGoal(goal);
    setCurrentReps(0);

    showToast(`New exercise: ${exercise}!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const addRep = () => {
    const newReps = currentReps + 1;
    setCurrentReps(newReps);
    const newTotal = totalReps + 1;
    setTotalReps(newTotal);
    speakNumber(newReps);

    if (newReps >= repGoal) {
      showToast("Set complete! Draw next exercise.");
    }

    if (newTotal % 30 === 0) {
      const newDice = dice + 1;
      setDice(newDice);
      showToast(`🎲 Dice earned! Total: ${newDice}`);
      speakFeedback(`Dice earned! Total: ${newDice}`);
    }
  };

  const startWorkout = () => {
    if (!selectedBurnoutType) {
      alert("Please select a burnout type first!");
      return;
    }
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

    alert(`Burnout complete!\nTotal Reps: ${totalReps}\nDice Earned: ${dice}`);
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
    selectionScreen: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "30px"
    },
    selectionTitle: {
      fontSize: "32px",
      marginBottom: "20px"
    },
    selectionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      width: "100%",
      maxWidth: "800px"
    },
    selectionButton: {
      padding: "20px",
      backgroundColor: "#1a1a1a",
      border: "2px solid #ff2e2e",
      borderRadius: "10px",
      cursor: "pointer",
      color: "#fff",
      fontSize: "16px",
      transition: "all 0.3s"
    },
    selectionIcon: {
      fontSize: "48px",
      marginBottom: "10px"
    },
    selectionName: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "5px"
    },
    cardArea: {
      width: "100%",
      maxWidth: "600px",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    selectedTypeDisplay: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      backgroundColor: "#1a1a1a",
      borderRadius: "5px"
    },
    selectedTypeText: {
      fontSize: "16px"
    },
    changeButton: {
      padding: "8px 15px",
      backgroundColor: "#ff2e2e",
      border: "none",
      borderRadius: "5px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "14px"
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
    workoutArea: {
      width: "100%",
      maxWidth: "600px",
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
    buttons: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      flexWrap: "wrap"
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
        <h1 style={styles.title}>BURNOUTS</h1>
        <div style={styles.diceCounter}>🎲 Dice: {dice}</div>
      </header>

      {!selectedBurnoutType && (
        <section style={styles.selectionScreen}>
          <h2 style={styles.selectionTitle}>Select Burnout Type</h2>
          <div style={styles.selectionGrid}>
            {["Arms", "Legs", "Core", "Full Body"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBurnoutType(type)}
                style={styles.selectionButton}
                onMouseOver={(e) => e.target.style.backgroundColor = "#ff2e2e"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              >
                <div style={styles.selectionIcon}>
                  {type === "Arms" && "💪"}
                  {type === "Legs" && "🦵"}
                  {type === "Core" && "🔥"}
                  {type === "Full Body" && "⚡"}
                </div>
                <div style={styles.selectionName}>{type}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedBurnoutType && (
        <section style={styles.cardArea}>
          <div style={styles.selectedTypeDisplay}>
            <span style={styles.selectedTypeText}>Type: {selectedBurnoutType}</span>
            <button onClick={() => setSelectedBurnoutType(null)} style={styles.changeButton}>
              Change
            </button>
          </div>

          <div style={styles.playingCard}>
            <div style={styles.cardCorner}>
              <div style={styles.cardCornerValue}>{repGoal || "?"}</div>
            </div>
            <div style={styles.cardCenter}>
              <div style={styles.cardSuitLarge}>
                {currentCategory === "Arms" && "💪"}
                {currentCategory === "Legs" && "🦵"}
                {currentCategory === "Core" && "🔥"}
                {currentCategory === "Cardio" && "⚡"}
                {!currentCategory && "♠"}
              </div>
              <div style={styles.cardExerciseName}>{currentExercise || "READY"}</div>
              <div style={styles.cardProgressText}>
                {currentExercise ? `${currentReps}/${repGoal}` : "Start to begin"}
              </div>
              {currentExercise && (
                <div style={{ fontSize: "14px", color: "#aaa" }}>{descriptions[currentExercise]}</div>
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
                  Next Exercise
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
                Start Burnout
              </button>
            </div>
          )}
        </section>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
