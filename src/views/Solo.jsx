import React, { useState, useEffect, useRef } from "react";
import { initializePoseDetection, detectPose, SKELETON_CONNECTIONS, MIN_POSE_CONFIDENCE } from "../logic/poseDetection.js";
import { speakFeedback, speakNumber } from "../logic/audioFeedback.js";
import { SmartRepCounter } from "../logic/smartRepCounter.js";
import { loadExerciseReference } from "../logic/csvRepReference.js";
import LandmarkSmoother from "../logic/smoothing.js";
import ExerciseAvatar from "../components/ExerciseAvatar.jsx";

export default function Solo({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState("");
  const [currentSuit, setCurrentSuit] = useState("");
  const [currentGroup, setCurrentGroup] = useState("");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState("");
  const [formQuality, setFormQuality] = useState("neutral");

  const repCounterRef = useRef(null);
  const smootherRef = useRef(new LandmarkSmoother(5));
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const wakeLockRef = useRef(null);
  const lastFeedbackRef = useRef({ time: 0, message: "" });

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

    // Load CSV reference and initialize smart rep counter
    const reference = await loadExerciseReference(exercise);
    const pattern = reference ? reference.getRepPattern() : null;
    repCounterRef.current = new SmartRepCounter(exercise, pattern);

    showToast(`New card: ${exercise}!`);
    speakFeedback(`${exercise}. ${goal} reps.`);
  };

  const analyzeFormQuality = (keypoints, exercise) => {
    if (!keypoints || keypoints.length < 33) return "neutral";

    const shoulders = [(keypoints[11]?.y || 0.5), (keypoints[12]?.y || 0.5)];
    const elbows = [(keypoints[13]?.y || 0.5), (keypoints[14]?.y || 0.5)];
    const hips = [(keypoints[23]?.y || 0.5), (keypoints[24]?.y || 0.5)];
    const knees = [(keypoints[25]?.y || 0.5), (keypoints[26]?.y || 0.5)];
    const wrists = [(keypoints[15]?.y || 0.5), (keypoints[16]?.y || 0.5)];

    let isGoodForm = false;

    switch(exercise) {
      case "Push-ups":
      case "Plank Up-Downs":
        // Good form: elbows bent, body straight, shoulders over wrists
        isGoodForm = elbows[0] > 0.3 && elbows[1] > 0.3 && 
                     Math.abs(shoulders[0] - shoulders[1]) < 0.15 &&
                     wrists[0] > 0.1 && wrists[1] > 0.1;
        break;

      case "Squats":
        // Good form: knees bent, hips below shoulders
        isGoodForm = knees[0] > 0.45 && knees[1] > 0.45 &&
                     hips[0] > shoulders[0] * 0.8 && hips[1] > shoulders[1] * 0.8;
        break;

      case "Plank":
        // Good form: shoulders above wrists, body straight
        isGoodForm = Math.abs(shoulders[0] - shoulders[1]) < 0.1 &&
                     elbows[0] > 0.25 && elbows[1] > 0.25;
        break;

      case "Glute Bridges":
        // Good form: hips raised high
        isGoodForm = hips[0] < 0.45 && hips[1] < 0.45;
        break;

      case "Jumping Jacks":
      case "High Knees":
        // Good form: arms extended, knees high
        isGoodForm = wrists[0] < 0.3 && wrists[1] < 0.3 && 
                     knees[0] < 0.5 && knees[1] < 0.5;
        break;

      default:
        isGoodForm = true; // Default to good if no specific rules
    }

    return isGoodForm ? "good" : "poor";
  };

  const drawSkeleton = (keypoints, canvas, quality = "neutral") => {
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) {
      console.warn("Canvas or context not available");
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Determine color based on form quality
    const skeletonColor = quality === "good" ? "#00ff00" : quality === "poor" ? "#ff0000" : "#00ff00";

    // Draw skeleton lines
    ctx.strokeStyle = skeletonColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    SKELETON_CONNECTIONS.forEach(([i, j]) => {
      const start = keypoints[i];
      const end = keypoints[j];

      if (start && end && (start.score >= MIN_POSE_CONFIDENCE || !start.score) && (end.score >= MIN_POSE_CONFIDENCE || !end.score)) {
        ctx.beginPath();
        ctx.moveTo(start.x * (start.x <= 1 ? width : 1), start.y * (start.y <= 1 ? height : 1));
        ctx.lineTo(end.x * (end.x <= 1 ? width : 1), end.y * (end.y <= 1 ? height : 1));
        ctx.stroke();
      }
    });

    // Draw keypoint circles
    ctx.fillStyle = skeletonColor;
    keypoints.forEach((kp) => {
      if (kp && (kp.score >= MIN_POSE_CONFIDENCE || !kp.score)) {
        ctx.beginPath();
        ctx.arc(kp.x * (kp.x <= 1 ? width : 1), kp.y * (kp.y <= 1 ? height : 1), 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw form feedback text
    ctx.fillStyle = skeletonColor;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      quality === "good" ? "✓ GOOD FORM" : quality === "poor" ? "✗ FIX FORM" : "DETECTING...",
      width / 2,
      40
    );
  };

  const processFrame = async () => {
    if (!videoRef.current || !detectorRef.current || !isWorkoutActive) {
      if (isWorkoutActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    try {
      if (videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      const pose = await detectPose(videoRef.current);

      // Draw detecting status even if no pose
      if (canvasRef.current && canvasCtxRef.current) {
        const ctx = canvasCtxRef.current;
        if (!pose || !pose.keypoints) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = "#ffff00";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("DETECTING...", canvasRef.current.width / 2, 40);
        }
      }

      if (pose && pose.keypoints) {
        const smoothed = smootherRef.current.smooth(pose.keypoints);
        
        // Analyze form quality
        const quality = currentExercise ? analyzeFormQuality(smoothed, currentExercise) : "neutral";
        setFormQuality(quality);
        
        // Draw skeleton with form feedback
        if (canvasRef.current && canvasCtxRef.current) {
          drawSkeleton(smoothed, canvasRef.current, quality);
        }

        // Detect rep only if exercise is selected
        if (currentExercise && repCounterRef.current) {
          const repDetected = repCounterRef.current.detectRep(smoothed, currentExercise);
          if (repDetected) {
            const newCount = repCounterRef.current.getCount();
            setCurrentReps(newCount);
            const newTotal = totalReps + 1;
            setTotalReps(newTotal);
            speakNumber(newCount);

            if (newCount >= repGoal) {
              showToast("Card complete! Draw a new card.");
            }

            if (newTotal % 30 === 0) {
              const newDice = dice + 1;
              setDice(newDice);
              showToast(`🎲 Dice earned! Total: ${newDice}`);
              speakFeedback(`Dice earned! Total: ${newDice}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Frame processing error:", error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startWorkout = async () => {
    try {
      console.log("Starting solo workout...");
      detectorRef.current = await initializePoseDetection();
      console.log("Detector initialized");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      console.log("Camera stream obtained", stream);

      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.log("Wake Lock not available");
        }
      }

      smootherRef.current = new LandmarkSmoother(5);
      setIsWorkoutActive(true);
      drawCard();

      // Set stream after DOM is ready (in next tick)
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          
          const playVideo = async () => {
            try {
              await videoRef.current.play();
              console.log("Video playing successfully, starting pose detection...");
              // Start frame processing after video is playing
              animationFrameRef.current = requestAnimationFrame(processFrame);
            } catch (err) {
              console.error("Video play error:", err);
            }
          };

          // Play when metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            playVideo();
          };

          // Try playing immediately
          if (videoRef.current.readyState >= 1) {
            playVideo();
          }
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera error: " + err.message);
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
      zIndex: 1,
      visibility: "visible",
      opacity: 1
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

        {isWorkoutActive && (
          <>
            <div style={styles.workoutArea}>
              <div style={styles.videoContainer}>
                <video ref={videoRef} style={styles.video} autoPlay playsInline muted />
                <canvas ref={canvasRef} width={640} height={480} style={styles.canvas} />
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

              <div style={styles.buttons}>
                <button onClick={endSession} style={{ ...styles.button, ...styles.endButton }}>
                  End Session
                </button>
              </div>
            </div>
          </>
        )}

        {!isWorkoutActive && (
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
