import React, { useState, useEffect, useRef } from "react";
import CardDeck from "../components/CardDeck";
import { initializePoseLandmarker, detectPose, drawResults } from "../logic/poseDetection.js";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import RepCounter from "../logic/repCounter.js";
import "./Solo.css";

export default function Solo({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const repCounterRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(10);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSuit, setCurrentSuit] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [dice, setDice] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");
  const [sessionStats, setSessionStats] = useState(null);

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
            showToast("TARGET REACHED! 💪");
            setTimeout(() => {
              drawCard();
            }, 1500);
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const drawCard = async () => {
    const groups = ["Arms", "Legs", "Core", "Cardio"];
    const suitMap = {
      Arms: "♥",
      Legs: "♠",
      Core: "♣",
      Cardio: "♦"
    };
    
    const randGroup = groups[Math.floor(Math.random() * groups.length)];
    const groupExercises = exercises[randGroup];
    const exercise = groupExercises[Math.floor(Math.random() * groupExercises.length)];
    const goal = Math.floor(Math.random() * 13) + 2;
    const value = goal > 10 ? (goal === 11 ? "J" : goal === 12 ? "Q" : "K") : goal;

    setCurrentSuit(suitMap[randGroup]);
    setCurrentGroup(randGroup);
    setCurrentExercise(exercise);
    setCurrentValue(value);
    setRepGoal(goal);
    setCurrentReps(0);

    const counter = new RepCounter(exercise);
    await counter.initialize();
    repCounterRef.current = counter;

    showToast(`🎴 ${exercise}! Get ${goal} reps!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const startWorkout = async () => {
    try {
      await initializePoseLandmarker(canvasRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsWorkoutActive(true);
      await drawCard();
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error(err);
      showToast("Camera access denied");
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

    const earnedDice = Math.floor(totalReps / 30);

    if (user && user.uid) {
      try {
        const { db } = await import("../firebase.js");
        const { doc, updateDoc, getDoc, setDoc, increment } = await import("firebase/firestore");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

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

    setSessionStats({
      totalReps,
      diceEarned: earnedDice
    });

    setDice(prev => prev + earnedDice);
    setCurrentExercise(null);
    setCurrentSuit(null);
    setCurrentGroup(null);
    setCurrentValue(null);
    setTotalReps(0);
    setCurrentReps(0);
  };

  return (
    <div className="solo-container">
      <div className="solo-header">
        <h1>RIVAL SOLO</h1>
        <div className="header-stats">
          <div className="stat-box">
            <span className="stat-label">TOTAL REPS</span>
            <span className="stat-value">{totalReps}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">🎲 DICE</span>
            <span className="stat-value">{dice}</span>
          </div>
        </div>
      </div>

      <div className="solo-content">
        <div className="video-section">
          <div className="video-container">
            <video 
              ref={videoRef} 
              className="pose-video"
              autoPlay 
              playsInline 
              muted 
            />
            <canvas 
              ref={canvasRef} 
              className="skeleton-overlay"
              width={640} 
              height={480} 
            />
          </div>
          
          <div className="controls">
            {!isWorkoutActive ? (
              <button 
                onClick={startWorkout} 
                className="start-button"
              >
                START WORKOUT
              </button>
            ) : (
              <button 
                onClick={endSession} 
                className="end-button"
              >
                END SESSION
              </button>
            )}
          </div>
        </div>

        <div className="deck-section">
          <CardDeck 
            currentExercise={currentExercise}
            currentSuit={currentSuit}
            currentValue={currentValue}
            currentGroup={currentGroup}
            currentReps={currentReps}
            repGoal={repGoal}
            onDrawCard={drawCard}
          />
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
      
      {sessionStats && (
        <div className="session-complete-modal">
          <div className="modal-content">
            <h2>SESSION COMPLETE!</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="label">Total Reps</span>
                <span className="value">{sessionStats.totalReps}</span>
              </div>
              <div className="stat-item">
                <span className="label">Dice Earned</span>
                <span className="value">🎲 {sessionStats.diceEarned}</span>
              </div>
            </div>
            <button 
              className="close-modal-button"
              onClick={() => setSessionStats(null)}
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
