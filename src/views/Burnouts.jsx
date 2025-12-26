import React, { useState, useEffect, useRef } from "react";
import { initializePoseLandmarker, detectPose, drawResults } from "../logic/poseDetection.js";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import RepCounter from "../logic/repCounter.js";
import LandmarkSmoother from "../logic/smoothing.js";

export default function Burnouts({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(10);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(userProfile?.diceBalance || 0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedBurnoutType, setSelectedBurnoutType] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const repCounterRef = useRef(null);

  const exercises = {
    Arms: ["Push-ups", "Plank Up-Downs", "Pike Push ups", "Shoulder Taps"],
    Legs: ["Squats", "Lunges", "Glute Bridges", "Calf Raises"],
    Core: ["Crunches", "Plank", "Russian Twists", "Leg Raises"],
    Cardio: ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"]
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const processFrame = async () => {
    if (!videoRef.current || !isWorkoutActive) return;

    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const startTimeMs = performance.now();
      const results = await detectPose(videoRef.current, startTimeMs);

      if (results && results.landmarks) {
        drawResults(canvasRef.current, results);
        
        const repDetected = repCounterRef.current.process(results.landmarks[0]);
        if (repDetected) {
          const newCount = repCounterRef.current.getCount();
          setCurrentReps(newCount);
          setTotalReps(prev => prev + 1);
          speakNumber(newCount);

          if (newCount >= repGoal) {
            speakFeedback("Protocol complete!");
            setToast("PROTOCOL COMPLETE! ⚡");
            setTimeout(() => setToast(""), 3000);
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const drawCard = async () => {
    let categoriesToUse = [];
    if (selectedBurnoutType === "FULL BODY") {
      categoriesToUse = ["Arms", "Legs", "Core", "Cardio"];
    } else if (selectedBurnoutType === "UPPER") {
      categoriesToUse = ["Arms"];
    } else if (selectedBurnoutType === "LOWER") {
      categoriesToUse = ["Legs"];
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

    const counter = new RepCounter(exercise);
    await counter.initialize();
    repCounterRef.current = counter;

    showToast(`New exercise: ${exercise}!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const startWorkout = async () => {
    try {
      await initializePoseLandmarker(canvasRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsWorkoutActive(true);
      drawCard();
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error(err);
    }
  };

  const endSession = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsWorkoutActive(false);

    if (user && user.uid) {
      try {
        const { db } = await import("../firebase.js");
        const { doc, updateDoc, getDoc, setDoc, increment } = await import("firebase/firestore");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const earnedDice = Math.floor(totalReps / 30);

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            totalReps: increment(totalReps),
            diceBalance: increment(earnedDice)
          });
        } else {
          await setDoc(userRef, {
            userId: user.uid,
            totalReps: totalReps,
            diceBalance: earnedDice
          });
        }
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }

    alert(`Burnout complete!\nTotal Reps: ${totalReps}\nDice Earned: ${Math.floor(totalReps / 30)}`);
  };

  const styles = {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#0a0a0a",
      color: "#ffffff",
      fontFamily: "'Arial', sans-serif",
      padding: "20px"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: "1200px",
      marginBottom: "40px",
      padding: "20px 0"
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#ff1493",
      letterSpacing: "2px",
      textShadow: "0 0 10px rgba(255, 20, 147, 0.5)"
    },
    userSection: {
      display: "flex",
      alignItems: "center",
      gap: "20px"
    },
    diceDisplay: {
      fontSize: "20px",
      color: "#ffd700"
    },
    menuButton: {
      padding: "10px 20px",
      fontSize: "16px",
      backgroundColor: "transparent",
      border: "2px solid #ff1493",
      color: "#ff1493",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderRadius: "4px"
    },
    subtitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: "15px"
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "30px",
      marginTop: "40px",
      maxWidth: "900px"
    },
    card: {
      padding: "30px",
      border: "3px solid #ff4500",
      borderRadius: "8px",
      backgroundColor: "#1a1a1a",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px",
      minHeight: "250px",
      justifyContent: "center"
    },
    cardHover: {
      boxShadow: "0 0 20px rgba(255, 69, 0, 0.6)",
      transform: "scale(1.05)"
    },
    cardEmoji: {
      fontSize: "80px"
    },
    cardTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: "5px"
    },
    cardDescription: {
      fontSize: "14px",
      color: "#cccccc"
    },
    cyberCounter: {
      fontSize: "80px",
      fontWeight: "bold",
      textShadow: "0 0 20px #00fff2, 0 0 40px #00fff2",
      margin: "20px 0",
      color: "#00fff2"
    },
    container: {
      position: "relative",
      width: "640px",
      height: "480px",
      border: "4px solid #ff00ff",
      boxShadow: "0 0 30px #ff00ff",
      backgroundColor: "#000"
    },
    video: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.3
    },
    canvas: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 10
    },
    button: {
      padding: "15px 40px",
      fontSize: "20px",
      backgroundColor: "transparent",
      border: "2px solid #00fff2",
      color: "#00fff2",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "2px",
      boxShadow: "0 0 10px #00fff2"
    }
  };

  const burnoutTypes = [
    { name: "ARMS", emoji: "💪", description: "Push-ups, Dips" },
    { name: "LEGS", emoji: "🦵", description: "Squats, Lunges" },
    { name: "CORE", emoji: "🔥", description: "Crunches, Planks" },
    { name: "FULL BODY", emoji: "⚡", description: "All exercises" }
  ];

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>RIVALIS HUB</h1>
        <div style={styles.userSection}>
          <div style={styles.diceDisplay}>🎲 Dice: {dice}</div>
          <button style={styles.menuButton}>Menu</button>
        </div>
      </div>
      
      {!selectedBurnoutType ? (
        <>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#ffffff", marginBottom: "10px" }}>BURNOUTS MODE</h2>
          <div style={styles.subtitle}>Select Your Burnout Type</div>
          
          <div style={styles.cardGrid}>
            {burnoutTypes.map((type) => (
              <div
                key={type.name}
                style={styles.card}
                onClick={() => setSelectedBurnoutType(type.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 69, 0, 0.6)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={styles.cardEmoji}>{type.emoji}</div>
                <div style={styles.cardTitle}>{type.name}</div>
                <div style={styles.cardDescription}>{type.description}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={styles.cyberCounter}>{currentReps}</div>
          <div style={styles.container}>
            <video ref={videoRef} style={styles.video} autoPlay playsInline muted />
            <canvas ref={canvasRef} width={640} height={480} style={styles.canvas} />
          </div>
          <div style={{marginTop: '20px', color: '#ffd700', fontSize: '24px'}}>
            {currentExercise && `BURNOUT: ${currentExercise} (${currentReps}/${repGoal})`}
          </div>
          {!isWorkoutActive ? (
            <button onClick={startWorkout} style={{...styles.button, marginTop: "20px"}}>START OVERRIDE</button>
          ) : (
            <button onClick={endSession} style={{...styles.button, marginTop: "20px", borderColor: '#ff00ff', color: '#ff00ff'}}>TERMINATE BURNOUT</button>
          )}
        </>
      )}

      {toast && <div style={{...styles.button, position: "fixed", top: "50%", color: "#ff00ff"}}>{toast}</div>}
    </div>
  );
}
