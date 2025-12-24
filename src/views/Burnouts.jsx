import React, { useState, useEffect, useRef } from "react";
import { initializePoseDetection, detectPose, SKELETON_CONNECTIONS, MIN_POSE_CONFIDENCE } from "../logic/poseDetection.js";
import { calculateAngle, isConfident, getFormIssues } from "../logic/angleCalculations.js";
import { speakFeedback, speakNumber, getCoachingMessage } from "../logic/audioFeedback.js";
import RepCounter from "../logic/repCounter.js";
import LandmarkSmoother from "../logic/smoothing.js";
import ExerciseAvatar from "../components/ExerciseAvatar.jsx";

export default function Burnouts({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");
  const [showDrawButton, setShowDrawButton] = useState(false);
  const [selectedBurnoutType, setSelectedBurnoutType] = useState(null);
  const [fps, setFps] = useState(0);
  const [formFeedback, setFormFeedback] = useState("");

  const repCounterRef = useRef(null);
  const smootherRef = useRef(new LandmarkSmoother(5));
  const lastRepCountRef = useRef(0);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });
  const wakeLockRef = useRef(null);
  const lastFeedbackRef = useRef({ time: 0, message: "" });

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
    setFormFeedback("");
    lastRepCountRef.current = 0;

    if (repCounterRef.current) {
      repCounterRef.current = new RepCounter(exercise);
    }

    setShowDrawButton(false);
    showToast(`New exercise: ${exercise}!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const processExerciseDetection = (keypoints) => {
    if (!currentExercise || !repCounterRef.current) return;

    const issues = getFormIssues(keypoints);
    if (issues.length > 0) {
      const mainIssue = issues[0];
      const message = getCoachingMessage(mainIssue);
      if (message && (Date.now() - lastFeedbackRef.current.time > 3000 || lastFeedbackRef.current.message !== message)) {
        setFormFeedback(message);
        speakFeedback(message);
        lastFeedbackRef.current = { time: Date.now(), message };
      }
    }

    // Exercise-specific detection
    const leftShoulder = keypoints[11];
    const rightShoulder = keypoints[12];
    const leftElbow = keypoints[13];
    const rightElbow = keypoints[14];
    const leftWrist = keypoints[15];
    const rightWrist = keypoints[16];
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const leftKnee = keypoints[25];
    const rightKnee = keypoints[26];

    let repCompleted = false;

    if (currentExercise === "Push-ups") {
      if (isConfident(leftShoulder) && isConfident(leftElbow) && isConfident(leftWrist)) {
        const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        if (isConfident(rightShoulder) && isConfident(rightElbow) && isConfident(rightWrist)) {
          const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
          const avgAngle = (leftAngle + rightAngle) / 2;
          repCompleted = repCounterRef.current.processElbowBased(avgAngle, 60, 160);
        }
      }
    } else if (currentExercise === "Squats") {
      if (isConfident(leftHip) && isConfident(leftKnee) && isConfident(rightHip) && isConfident(rightKnee)) {
        const kneeFlexion = Math.max(leftKnee.y - leftHip.y, rightKnee.y - rightHip.y);
        repCompleted = repCounterRef.current.processKneeBased(kneeFlexion, 0.15);
      }
    } else if (currentExercise === "Jumping Jacks") {
      if (isConfident(leftWrist) && isConfident(rightWrist) && isConfident(leftShoulder) && isConfident(rightShoulder)) {
        const avgWristY = (leftWrist.y + rightWrist.y) / 2;
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        repCompleted = repCounterRef.current.processArmsRaised(avgWristY, avgShoulderY);
      }
    } else if (currentExercise === "Plank") {
      if (isConfident(leftShoulder) && isConfident(leftHip) && isConfident(rightShoulder) && isConfident(rightHip)) {
        const alignment = Math.abs(leftShoulder.y - leftHip.y) + Math.abs(rightShoulder.y - rightHip.y) / 2 < 0.15;
        repCompleted = repCounterRef.current.processPlank(alignment, 3000);
      }
    } else if (currentExercise === "Crunches") {
      if (isConfident(leftShoulder) && isConfident(leftHip) && isConfident(rightShoulder) && isConfident(rightHip)) {
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const avgHipY = (leftHip.y + rightHip.y) / 2;
        const flexion = avgHipY - avgShoulderY;
        repCompleted = repCounterRef.current.processTorsoFlexion(flexion, 0.25);
      }
    } else {
      // Fallback to elbow-based for other arm exercises
      if (isConfident(leftShoulder) && isConfident(leftElbow) && isConfident(leftWrist)) {
        const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        repCompleted = repCounterRef.current.processElbowBased(leftAngle, 50, 170);
      }
    }

    if (repCompleted) {
      const newCount = repCounterRef.current.getCount();
      setCurrentReps(newCount);
      const newTotal = totalReps + 1;
      setTotalReps(newTotal);
      speakNumber(newCount);

      if (newCount >= repGoal) {
        showToast("Set complete! Draw next exercise.");
        setShowDrawButton(true);
      }

      if (newTotal % 30 === 0) {
        const newDice = dice + 1;
        setDice(newDice);
        showToast(`🎲 Dice earned! Total: ${newDice}`);
        speakFeedback(`Dice earned! Total: ${newDice}`);
      }
    }
  };

  const drawSkeleton = (keypoints, canvas) => {
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const width = 640;
    const height = 480;

    // Draw connections
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    SKELETON_CONNECTIONS.forEach(([i, j]) => {
      const start = keypoints[i];
      const end = keypoints[j];

      if (start && end && isConfident(start) && isConfident(end)) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });

    // Draw keypoints
    ctx.fillStyle = "#ff2e2e";
    keypoints.forEach((kp) => {
      if (kp && isConfident(kp)) {
        ctx.beginPath();
        ctx.arc(kp.x * width, kp.y * height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const processFrame = async () => {
    if (!videoRef.current || !detectorRef.current || !isWorkoutActive) {
      if (isWorkoutActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    try {
      const pose = await detectPose(videoRef.current);

      if (pose && pose.keypoints) {
        const smoothed = smootherRef.current.smooth(pose.keypoints);
        processExerciseDetection(smoothed);

        if (canvasRef.current) {
          canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          drawSkeleton(smoothed, canvasRef.current);
        }
      }

      // FPS counter
      fpsCounterRef.current.frames++;
      const now = Date.now();
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
    } catch (error) {
      console.error("Frame processing error:", error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startWorkout = async () => {
    if (!selectedBurnoutType) {
      alert("Please select a burnout type first!");
      return;
    }

    try {
      console.log("Starting workout...");
      detectorRef.current = await initializePoseDetection();
      console.log("Detector initialized");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      console.log("Camera stream obtained");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
        };
        
        videoRef.current.play().then(() => {
          console.log("Video playing");
        }).catch(err => {
          console.error("Play error:", err);
        });
      }

      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.log("Wake Lock not available");
        }
      }

      repCounterRef.current = new RepCounter(currentExercise);
      smootherRef.current = new LandmarkSmoother(5);
      setIsWorkoutActive(true);
      drawCard();
      
      // Start frame processing with a small delay to let video start
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }, 500);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        alert("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        alert("No camera found. Please connect a camera.");
      } else {
        alert("Camera error: " + err.message);
      }
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

    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.log("Wake lock release error");
      }
    }

    setIsWorkoutActive(false);

    // Save stats to Firebase
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

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext("2d");
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

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
      transition: "all 0.3s",
      ":hover": {
        backgroundColor: "#ff2e2e",
        transform: "scale(1.05)"
      }
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
    selectionDesc: {
      fontSize: "12px",
      color: "#aaa"
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
      maxWidth: "640px",
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    },
    videoContainer: {
      position: "relative",
      width: "100%",
      maxWidth: "640px",
      height: "480px",
      margin: "0 auto",
      backgroundColor: "#000",
      border: "2px solid #ff2e2e",
      borderRadius: "5px",
      overflow: "hidden"
    },
    video: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "5px",
      zIndex: 1
    },
    canvas: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "5px",
      zIndex: 2
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
        <h1 style={styles.title}>BURNOUTS MODE</h1>
        <div style={styles.diceCounter}>🎲 Dice: {dice}</div>
      </header>

      {!selectedBurnoutType && !isWorkoutActive && (
        <section style={styles.selectionScreen}>
          <h2 style={styles.selectionTitle}>Select Your Burnout Type</h2>
          <div style={styles.selectionGrid}>
            {["Arms", "Legs", "Core", "Full Body"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBurnoutType(type)}
                style={styles.selectionButton}
              >
                <div style={styles.selectionIcon}>
                  {type === "Arms" ? "💪" : type === "Legs" ? "🦵" : type === "Core" ? "🔥" : "⚡"}
                </div>
                <div style={styles.selectionName}>{type.toUpperCase()}</div>
                <div style={styles.selectionDesc}>
                  {type === "Arms" && "Push-ups, Dips"}
                  {type === "Legs" && "Squats, Lunges"}
                  {type === "Core" && "Crunches, Planks"}
                  {type === "Full Body" && "All exercises"}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedBurnoutType && (
        <section style={styles.cardArea}>
          <div style={styles.selectedTypeDisplay}>
            <span style={styles.selectedTypeText}>Selected: {selectedBurnoutType}</span>
            {!isWorkoutActive && (
              <button onClick={() => setSelectedBurnoutType(null)} style={styles.changeButton}>
                Change
              </button>
            )}
          </div>

          <div style={styles.playingCard}>
            <div style={styles.cardCorner}>
              <div style={styles.cardCornerValue}>{repGoal || "?"}</div>
              <div style={styles.cardCornerSuit}>
                {currentCategory === "Arms" && "💪"}
                {currentCategory === "Legs" && "🦵"}
                {currentCategory === "Core" && "🔥"}
                {currentCategory === "Cardio" && "⚡"}
                {!currentCategory && "♠"}
              </div>
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
                {currentExercise ? `${currentReps}/${repGoal}` : "Select a type to begin"}
              </div>
            </div>
          </div>

          {isWorkoutActive && (
            <>
              <div style={styles.workoutArea}>
                <div style={styles.videoContainer}>
                  <ExerciseAvatar exercise={currentExercise} animationKey={currentExercise} />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={styles.canvas}
                  />
                </div>

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

                {formFeedback && <div style={styles.formFeedback}>{formFeedback}</div>}

                <div style={styles.buttons}>
                  <button onClick={endSession} style={{ ...styles.button, ...styles.endButton }}>
                    End Session
                  </button>
                </div>
              </div>
            </>
          )}

          {!isWorkoutActive && selectedBurnoutType && (
            <div style={styles.buttons}>
              <button onClick={startWorkout} style={{ ...styles.button, ...styles.startButton }}>
                Start Workout
              </button>
              {showDrawButton && (
                <button onClick={drawCard} style={{ ...styles.button, ...styles.drawButton }}>
                  Next Exercise
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
