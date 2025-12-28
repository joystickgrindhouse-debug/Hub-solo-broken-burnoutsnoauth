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
  const [debugLogs, setDebugLogs] = useState([]);

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

  const addDebugLog = (msg) => {
    console.log(msg);
    setDebugLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
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
      setDebugLogs([]);
      addDebugLog("🚀 Starting workout...");
      
      // Check if camera API is even available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addDebugLog("❌ Camera API not available in this browser/environment");
        setCameraError("❌ CAMERA API NOT AVAILABLE\n\nThis browser/environment does not support camera access. This is a security restriction.");
        return;
      }
      
      addDebugLog("✅ Camera API is available");
      
      // Initialize pose detection first
      addDebugLog("📍 Initializing pose detection...");
      await initializePoseLandmarker(canvasRef.current);
      addDebugLog("✅ Pose detection initialized");
      
      // Request camera access
      addDebugLog("📷 Requesting camera access with constraints...");
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addDebugLog("✅ Camera stream obtained!");
      const videoTracks = stream.getVideoTracks();
      addDebugLog(`📹 Video tracks: ${videoTracks.length} track(s)`);
      if (videoTracks.length > 0) {
        addDebugLog(`📹 Track state: ${videoTracks[0].state}, enabled: ${videoTracks[0].enabled}`);
      }
      
      if (!videoRef.current) {
        addDebugLog("❌ Video element ref is null!");
        return;
      }
      
      addDebugLog("📺 Assigning stream to video element...");
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready - don't rely on metadata event which may not fire
      addDebugLog("⏳ Waiting for video to load (3 seconds)...");
      await new Promise((resolve) => {
        setTimeout(() => {
          addDebugLog("✅ Wait complete");
          resolve();
        }, 3000);
      });
      
      addDebugLog(`📊 Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
      addDebugLog(`📊 Video readyState: ${videoRef.current.readyState}`);
      
      addDebugLog("▶️ Attempting to play video...");
      try {
        await videoRef.current.play();
        addDebugLog("✅ Video is playing!");
        addDebugLog(`📊 Video paused: ${videoRef.current.paused}`);
      } catch (playErr) {
        addDebugLog(`⚠️ Play returned promise rejection: ${playErr.message}`);
        addDebugLog("⚠️ But continuing anyway - video stream should still work");
      }
      
      addDebugLog("🎯 Starting rep counting...");
      setIsWorkoutActive(true);
      await drawCard();
      animationFrameRef.current = requestAnimationFrame(processFrame);
      addDebugLog("✅ Workout started successfully!");
    } catch (err) {
      addDebugLog(`❌ Error: ${err.message}`);
      addDebugLog(`Error type: ${err.name}`);
      
      let errorMsg = "Unable to start workout";
      
      if (err.name === 'NotAllowedError') {
        errorMsg = "❌ CAMERA PERMISSION DENIED\n\nPlease allow camera access when your browser asks, then click START WORKOUT again.";
        setCameraError(errorMsg);
      } else if (err.name === 'NotFoundError') {
        errorMsg = "❌ NO CAMERA DETECTED\n\nThis device does not have a camera.";
        setCameraError(errorMsg);
      } else if (err.name === 'NotReadableError') {
        errorMsg = "❌ CAMERA IS BUSY\n\nYour camera is being used by another app. Close other apps and try again.";
        setCameraError(errorMsg);
      } else if (err.message.includes("metadata")) {
        errorMsg = "❌ CAMERA STREAM FAILED\n\nThe video stream did not load. Check your camera and try again.";
        setCameraError(errorMsg);
      } else {
        errorMsg = `❌ ERROR: ${err.message}`;
        setCameraError(errorMsg);
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
            <h2>⚠️ STARTUP ERROR</h2>
            <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', marginBottom: '20px' }}>
              {cameraError}
            </p>
            
            {debugLogs.length > 0 && (
              <div style={{
                background: '#000',
                color: '#e63946',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '11px',
                fontFamily: 'monospace',
                border: '1px solid #e63946'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Debug Log:</div>
                {debugLogs.map((log, i) => (
                  <div key={i}>[{log.time}] {log.msg}</div>
                ))}
              </div>
            )}
            
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={() => {
                  setCameraError(null);
                  startWorkout();
                }}
              >
                RETRY
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
