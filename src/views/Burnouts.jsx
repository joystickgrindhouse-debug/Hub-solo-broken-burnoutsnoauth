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
  const [dice, setDice] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedBurnoutType, setSelectedBurnoutType] = useState(null);

  const repCounterRef = useRef(new RepCounter("Push-ups"));
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

  const startWorkout = async () => {
    try {
      await initializePoseLandmarker(canvasRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsWorkoutActive(true);
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error(err);
    }
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
    selectionScreen: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      marginTop: "50px"
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

  return (
    <div style={styles.root}>
      <h1 style={{ color: "#ff00ff", textShadow: "0 0 10px #ff00ff" }}>BURNOUT NEURAL OVERLOAD</h1>
      
      {!selectedBurnoutType ? (
        <div style={styles.selectionScreen}>
          <button style={styles.button} onClick={() => setSelectedBurnoutType("FULL BODY")}>INITIATE FULL BODY</button>
          <button style={styles.button} onClick={() => setSelectedBurnoutType("UPPER")}>INITIATE UPPER BODY</button>
          <button style={styles.button} onClick={() => setSelectedBurnoutType("LOWER")}>INITIATE LOWER BODY</button>
        </div>
      ) : (
        <>
          <div style={styles.cyberCounter}>{currentReps}</div>
          <div style={styles.container}>
            <video ref={videoRef} style={styles.video} autoPlay playsInline muted />
            <canvas ref={canvasRef} width={640} height={480} style={styles.canvas} />
          </div>
          {!isWorkoutActive && (
            <button onClick={startWorkout} style={{...styles.button, marginTop: "20px"}}>START OVERRIDE</button>
          )}
        </>
      )}

      {toast && <div style={{...styles.button, position: "fixed", top: "50%", color: "#ff00ff"}}>{toast}</div>}
    </div>
  );
}
