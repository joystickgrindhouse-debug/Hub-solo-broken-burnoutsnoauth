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
  const [cameraError, setCameraError] = useState(null);

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
    if (!videoRef.current || !canvasRef.current || !isWorkoutActive) return;

    // Update canvas size to match video container
    const container = canvasRef.current.parentElement;
    if (container && (canvasRef.current.width !== container.offsetWidth || canvasRef.current.height !== container.offsetHeight)) {
      canvasRef.current.width = container.offsetWidth;
      canvasRef.current.height = container.offsetHeight;
    }

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
      setCameraError(null);
      console.log("🚀 Starting workout...");
      
      // Initialize pose detection first
      console.log("📍 Initializing pose detection...");
      await initializePoseLandmarker(canvasRef.current);
      console.log("✅ Pose detection initialized");
      
      // Request camera access
      console.log("📷 Requesting camera access...");
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Camera stream obtained:", stream.getTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("✅ Stream assigned to video element");
        
        // Make sure video is playing
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded, starting playback");
          videoRef.current.play().catch(err => {
            console.error("❌ Play error:", err);
          });
        };
        
        // Fallback: try playing immediately
        try {
          await videoRef.current.play();
          console.log("✅ Video playback started");
        } catch (err) {
          console.warn("⚠️ Initial play failed, will retry on metadata loaded:", err);
        }
      }
      
      console.log("🎯 Starting rep counting...");
      setIsWorkoutActive(true);
      await drawCard();
      animationFrameRef.current = requestAnimationFrame(processFrame);
      console.log("✅ Workout started successfully");
    } catch (err) {
      console.error('❌ Workout startup error:', err);
      let errorMsg = "Camera access denied";
      
      if (err.name === 'NotAllowedError') {
        errorMsg = "Please allow camera access in your browser settings";
        setCameraError("Camera permission was denied. Please check your browser settings and try again.");
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No camera device found";
        setCameraError("No camera device detected on this device.");
      } else if (err.name === 'NotReadableError') {
        errorMsg = "Camera is already in use";
        setCameraError("Camera is being used by another application. Please close other apps using the camera.");
      } else {
        setCameraError("Unable to access camera. Please try refreshing the page and checking your permissions.");
      }
      
      showToast(errorMsg);
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
            {!isWorkoutActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#e63946',
                fontSize: '14px',
                textAlign: 'center',
                padding: '20px',
                zIndex: 1
              }}>
                📷 Click START to begin
              </div>
            )}
            <video 
              ref={videoRef} 
              className="pose-video"
              autoPlay 
              playsInline 
              muted 
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
            <canvas 
              ref={canvasRef} 
              className="skeleton-overlay"
              style={{ display: 'block', width: '100%', height: '100%' }}
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

      {cameraError && (
        <div className="camera-error-modal">
          <div className="error-content">
            <h2>⚠️ CAMERA ACCESS REQUIRED</h2>
            <p>{cameraError}</p>
            <div className="error-steps">
              <p><strong>How to enable camera:</strong></p>
              <ol>
                <li>Look for a camera permission popup at the top of your browser</li>
                <li>Click "Allow" or "Allow Camera Access"</li>
                <li>If you don't see it, check your browser settings</li>
                <li>Click "Retry" below once you've granted permission</li>
              </ol>
            </div>
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={() => {
                  setCameraError(null);
                  startWorkout();
                }}
              >
                RETRY CAMERA ACCESS
              </button>
              <button 
                className="close-error-button"
                onClick={() => setCameraError(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      
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
