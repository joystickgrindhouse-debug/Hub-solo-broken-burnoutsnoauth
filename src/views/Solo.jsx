import React, { useState, useEffect, useRef } from "react";
import { initializePoseLandmarker, detectPose, drawResults } from "../logic/poseDetection.js";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import RepCounter from "../logic/repCounter.js";
import LandmarkSmoother from "../logic/smoothing.js";

export default function Solo({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(10);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");

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
            speakFeedback("Target reached!");
            setToast("TARGET REACHED! ⚡");
            setTimeout(() => setToast(""), 3000);
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const drawCard = async () => {
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

    const counter = new RepCounter(exercise);
    await counter.initialize();
    repCounterRef.current = counter;

    showToast(`New card: ${exercise}!`);
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

    alert(`Session complete!\nTotal Reps: ${totalReps}\nDice Earned: ${Math.floor(totalReps / 30)}`);
  };

  const styles = {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#050505",
      color: "#00fff2",
      fontFamily: "'Courier New', Courier, monospace",
      padding: "20px"
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
    controls: {
      marginTop: "30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px"
    },
    input: {
      backgroundColor: "#111",
      border: "1px solid #00fff2",
      color: "#00fff2",
      padding: "10px",
      fontSize: "18px",
      textAlign: "center",
      width: "100px"
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
    },
    toast: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "60px",
      fontWeight: "bold",
      color: "#ff00ff",
      textShadow: "0 0 30px #ff00ff",
      zIndex: 100
    }
  };

  return (
    <div style={styles.root}>
      <h1 style={{ color: "#ff00ff", textShadow: "0 0 10px #ff00ff" }}>NEURAL WORKOUT INTERFACE</h1>
      
      <div style={styles.cyberCounter}>{currentReps}</div>
      
      <div style={styles.container}>
        <video ref={videoRef} style={styles.video} autoPlay playsInline muted />
        <canvas ref={canvasRef} width={640} height={480} style={styles.canvas} />
      </div>

      <div style={{marginTop: '20px', color: '#ffd700', fontSize: '24px'}}>
        {currentExercise && `ACTIVE PROTOCOL: ${currentExercise} (${currentReps}/${repGoal})`}
      </div>

      <div style={styles.controls}>
        <div>
          <label>TARGET REPS: </label>
          <input 
            type="number" 
            value={repGoal} 
            onChange={(e) => setRepGoal(parseInt(e.target.value))} 
            style={styles.input}
          />
        </div>
        {!isWorkoutActive ? (
          <button onClick={startWorkout} style={styles.button}>INITIALIZE PROTOCOL</button>
        ) : (
          <button onClick={endSession} style={{...styles.button, borderColor: '#ff00ff', color: '#ff00ff'}}>TERMINATE SESSION</button>
        )}
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
