import React, { useState, useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

export default function Burnouts({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState('');
  const [showDrawButton, setShowDrawButton] = useState(false);
  
  const repInProgressRef = useRef(false);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const wakeLockRef = useRef(null);
  const canvasCtxRef = useRef(null);

  const exercises = {
    Arms: ["Push-ups"],
    Legs: ["Squats"],
    Core: ["Crunches"],
    Cardio: ["Jumping Jacks", "High Knees"]
  };

  const descriptions = {
    "Push-ups": "Maintain a straight line from shoulders to heels.",
    "Squats": "Keep chest up and push hips back.",
    "Crunches": "Lift shoulders toward ceiling.",
    "Jumping Jacks": "Full arm extension and rhythm.",
    "High Knees": "Bring knees to waist level quickly."
  };

  const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
    [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32]
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const drawCard = () => {
    const categories = ['Arms', 'Legs', 'Core', 'Cardio'];
    const randCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryExercises = exercises[randCategory];
    const exercise = categoryExercises[Math.floor(Math.random() * categoryExercises.length)];
    const goal = Math.floor(Math.random() * 13) + 2;
    
    setCurrentCategory(randCategory);
    setCurrentExercise(exercise);
    setRepGoal(goal);
    setCurrentReps(0);
    repInProgressRef.current = false;
    setShowDrawButton(false);
    
    showToast(`New exercise: ${exercise}!`);
  };

  const incrementRep = () => {
    const newCurrentReps = currentReps + 1;
    const newTotalReps = totalReps + 1;
    
    setCurrentReps(newCurrentReps);
    setTotalReps(newTotalReps);
    
    if (newCurrentReps >= repGoal) {
      showToast('Set complete! Draw next exercise.');
      setShowDrawButton(true);
    }
    
    if (newTotalReps % 30 === 0) {
      const newDice = dice + 1;
      setDice(newDice);
      showToast(`🎲 Dice earned! Total: ${newDice}`);
    }
  };

  const drawSkeleton = (landmarks) => {
    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    POSE_CONNECTIONS.forEach(([i, j]) => {
      const start = landmarks[i];
      const end = landmarks[j];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });
    
    ctx.fillStyle = '#ff2e2e';
    landmarks.forEach(landmark => {
      if (landmark) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const detectRep = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (currentExercise === 'Squats') {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeFlexion = avgKneeY - avgHipY;
      
      if (kneeFlexion > 0.15 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (kneeFlexion < 0.05 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Push-ups') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const elbowFlexion = avgElbowY - avgShoulderY;
      
      if (elbowFlexion > 0.12 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (elbowFlexion < 0.03 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Jumping Jacks') {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      
      if (avgWristY < avgShoulderY - 0.05 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (avgWristY > avgShoulderY + 0.15 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'High Knees') {
      const maxKneeY = Math.max(leftKnee.y, rightKnee.y);
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeRaise = avgHipY - maxKneeY;
      
      if (kneeRaise > 0.15 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (kneeRaise < 0.05 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Crunches') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const crunchDistance = avgHipY - avgShoulderY;
      
      if (crunchDistance < 0.25 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (crunchDistance > 0.35 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    }
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    
    if (results.poseLandmarks) {
      drawSkeleton(results.poseLandmarks);
      detectRep(results.poseLandmarks);
    }
    
    ctx.restore();
  };

  const startWorkout = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock not available:', err);
        }
      }

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      pose.onResults(onResults);
      poseRef.current = pose;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraRef.current = camera;
      }

      setIsWorkoutActive(true);
      drawCard();
      showToast('Burnout started!');
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera permission denied. Please allow camera access to use Burnouts mode.');
    }
  };

  const endSession = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }

    setIsWorkoutActive(false);
    alert(`Burnout complete!\nTotal Reps: ${totalReps}\nDice Earned: ${dice}`);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.title}>BURNOUTS MODE</h1>
        <div style={styles.diceCounter}>🎲 Dice: {dice}</div>
      </header>

      <section style={styles.cardArea}>
        <div style={styles.card}>
          <div style={styles.cardCategory}>💪 {currentCategory}</div>
          <div style={styles.cardExercise}>{currentExercise || 'Ready to start'}</div>
          <div style={styles.cardReps}>Reps: {repGoal}</div>
          <div style={styles.cardProgress}>Progress: {currentReps} / {repGoal}</div>
          <div style={styles.cardDesc}>{currentExercise ? descriptions[currentExercise] : 'Click Start Burnout to begin'}</div>
        </div>
        <div style={styles.controls}>
          {!isWorkoutActive && (
            <button onClick={startWorkout} style={styles.button}>Start Burnout</button>
          )}
          {isWorkoutActive && showDrawButton && (
            <button onClick={drawCard} style={styles.button}>Next Exercise</button>
          )}
          {isWorkoutActive && (
            <button onClick={endSession} style={styles.button}>🔚 End Session</button>
          )}
        </div>
      </section>

      <section style={styles.cameraArea}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={styles.video}
        />
        <canvas 
          ref={canvasRef} 
          width="640" 
          height="480"
          style={styles.canvas}
        />
      </section>

      {toast && <div style={styles.toast}>{toast}</div>}

      <footer style={styles.footer}>Push yourself to the limit. Break through barriers.</footer>
    </div>
  );
}

const styles = {
  root: {
    margin: 0,
    padding: '8px',
    fontFamily: "'Courier New', monospace",
    color: '#ff2e2e',
    backgroundColor: '#000',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '640px',
    flexShrink: 0,
  },
  title: {
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    margin: 0,
  },
  diceCounter: {
    fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
  },
  cardArea: {
    width: '100%',
    maxWidth: '640px',
    flexShrink: 0,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#000',
    border: '2px solid #ff2e2e',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(255, 46, 46, 0.5)',
    padding: '12px',
    marginBottom: '10px',
  },
  cardCategory: {
    color: '#ff2e2e',
    fontWeight: 'bold',
    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
    margin: '2px 0',
  },
  cardExercise: {
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    fontWeight: 'bold',
    margin: '4px 0',
  },
  cardReps: {
    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
    margin: '2px 0',
    color: '#333',
  },
  cardProgress: {
    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
    margin: '2px 0',
    color: '#333',
  },
  cardDesc: {
    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
    margin: '4px 0',
    color: '#555',
    fontStyle: 'italic',
  },
  controls: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    background: 'transparent',
    border: '2px solid #ff2e2e',
    color: '#ff2e2e',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.3s',
    fontFamily: 'inherit',
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
  },
  cameraArea: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '50vh',
    aspectRatio: '4/3',
    border: '2px solid #ff2e2e',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#000',
    flexShrink: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'none',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff2e2e',
    color: '#000',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    zIndex: 1000,
  },
  footer: {
    fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
    color: '#ff2e2e',
    marginTop: '10px',
  },
};
