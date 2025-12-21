import React, { useState, useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

export default function Solo({ user, userProfile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [totalReps, setTotalReps] = useState(0);
  const [repGoal, setRepGoal] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [dice, setDice] = useState(0);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentSuit, setCurrentSuit] = useState('');
  const [currentGroup, setCurrentGroup] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [toast, setToast] = useState('');
  const [showDrawButton, setShowDrawButton] = useState(false);
  const [isCorrectForm, setIsCorrectForm] = useState(false);
  
  const repInProgressRef = useRef(false);
  const audioQueueRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const wakeLockRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const calfBaselineRef = useRef(null);
  const calfFramesAccumRef = useRef([]);
  const calfStartTimeRef = useRef(null);

  const exercises = {
    Arms: ["Push-ups", "Plank Up-Downs", "Tricep Dips", "Shoulder Taps"],
    Legs: ["Squats", "Lunges", "Glute Bridges", "Calf Raises"],
    Core: ["Crunches", "Plank", "Russian Twists", "Leg Raises"],
    Cardio: ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"]
  };

  const descriptions = {
    "Push-ups": "Maintain a straight line from shoulders to heels.",
    "Plank Up-Downs": "Move from elbow to push-up position repeatedly.",
    "Tricep Dips": "Lower body until elbows reach 90° using a surface.",
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

  const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
    [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32]
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const speakRepCount = (repCount) => {
    if (audioQueueRef.current) clearTimeout(audioQueueRef.current);
    audioQueueRef.current = setTimeout(() => {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(repCount.toString());
          utterance.rate = 1.5;
          utterance.pitch = 1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.log('Audio speak error:', e);
        }
      }
    }, 100);
  };

  const drawCard = () => {
    const suits = ['♥', '♦', '♣', '♠'];
    const groups = ['Arms', 'Legs', 'Core', 'Cardio'];
    const randGroup = groups[Math.floor(Math.random() * groups.length)];
    const groupExercises = exercises[randGroup];
    const exercise = groupExercises[Math.floor(Math.random() * groupExercises.length)];
    const goal = Math.floor(Math.random() * 13) + 2;
    
    setCurrentSuit(suits[Math.floor(Math.random() * 4)]);
    setCurrentGroup(randGroup);
    setCurrentExercise(exercise);
    setRepGoal(goal);
    setCurrentReps(0);
    repInProgressRef.current = false;
    calfBaselineRef.current = null;
    calfFramesAccumRef.current = [];
    calfStartTimeRef.current = null;
    setShowDrawButton(false);
    
    showToast(`New card: ${exercise}!`);
  };

  const incrementRep = () => {
    const newCurrentReps = currentReps + 1;
    const newTotalReps = totalReps + 1;
    
    setCurrentReps(newCurrentReps);
    setTotalReps(newTotalReps);
    speakRepCount(newCurrentReps);
    
    if (newCurrentReps >= repGoal) {
      showToast('Card complete! Draw a new card.');
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
    
    ctx.strokeStyle = isCorrectForm ? '#00ff00' : '#ff2e2e';
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
    
    ctx.fillStyle = isCorrectForm ? '#00ff00' : '#ff2e2e';
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
      
      setIsCorrectForm(kneeFlexion > 0.08);
      
      if (kneeFlexion > 0.10 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (kneeFlexion < 0.02 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Push-ups') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const elbowFlexion = avgElbowY - avgShoulderY;
      
      if (elbowFlexion > 0.09 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (elbowFlexion < 0.01 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Jumping Jacks') {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      
      if (avgWristY < avgShoulderY - 0.03 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (avgWristY > avgShoulderY + 0.10 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'High Knees') {
      const maxKneeY = Math.max(leftKnee.y, rightKnee.y);
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeRaise = avgHipY - maxKneeY;
      
      if (kneeRaise > 0.12 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (kneeRaise < 0.02 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Crunches') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const crunchDistance = avgHipY - avgShoulderY;
      
      if (crunchDistance < 0.28 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (crunchDistance > 0.32 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Plank Up-Downs') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const elbowDown = avgElbowY > avgShoulderY - 0.02;
      
      if (elbowDown && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (!elbowDown && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Tricep Dips') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const dipDepth = avgElbowY - avgShoulderY;
      
      if (dipDepth > 0.06 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (dipDepth < 0.00 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Shoulder Taps') {
      const leftWristX = leftWrist.x;
      const rightWristX = rightWrist.x;
      const leftShoulderX = leftShoulder.x;
      const rightShoulderX = rightShoulder.x;
      const tapDetected = Math.abs(leftWristX - rightShoulderX) < 0.18 || Math.abs(rightWristX - leftShoulderX) < 0.18;
      
      if (tapDetected && !repInProgressRef.current) {
        repInProgressRef.current = true;
        incrementRep();
      } else if (!tapDetected) {
        repInProgressRef.current = false;
      }
    } else if (currentExercise === 'Lunges') {
      const kneeYDiff = Math.abs(leftKnee.y - rightKnee.y);
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const lowerKneeY = Math.max(leftKnee.y, rightKnee.y);
      const lungeDepth = lowerKneeY - avgHipY;
      
      if (lungeDepth > 0.15 && kneeYDiff > 0.12 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (lungeDepth < 0.08 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Glute Bridges') {
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipRaise = avgKneeY - avgHipY;
      
      if (hipRaise > 0.08 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (hipRaise < -0.08 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Calf Raises') {
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const ankleToHipDistance = avgAnkleY - avgHipY;
      
      if (calfBaselineRef.current === null) {
        if (calfStartTimeRef.current === null) {
          calfStartTimeRef.current = Date.now();
        }
        const elapsed = Date.now() - calfStartTimeRef.current;
        const minThreshold = elapsed > 3000 ? 0.25 : 0.35;
        const maxThreshold = elapsed > 3000 ? 0.55 : 0.48;
        
        if (!repInProgressRef.current && ankleToHipDistance > minThreshold && ankleToHipDistance < maxThreshold) {
          calfFramesAccumRef.current.push(ankleToHipDistance);
          if (calfFramesAccumRef.current.length > 20) {
            calfFramesAccumRef.current.shift();
          }
          if (calfFramesAccumRef.current.length >= 10) {
            const sorted = [...calfFramesAccumRef.current].sort((a, b) => a - b);
            calfBaselineRef.current = sorted[Math.floor(sorted.length / 2)];
          }
        }
      } else {
        const raised = ankleToHipDistance <= calfBaselineRef.current - 0.035;
        const lowered = ankleToHipDistance >= calfBaselineRef.current + 0.005;
        
        if (raised && !repInProgressRef.current) {
          repInProgressRef.current = true;
        } else if (lowered && repInProgressRef.current) {
          repInProgressRef.current = false;
          incrementRep();
        }
      }
    } else if (currentExercise === 'Plank') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const plankAlignment = Math.abs(avgShoulderY - avgHipY);
      
      if (plankAlignment < 0.18 && !repInProgressRef.current) {
        repInProgressRef.current = true;
        setTimeout(() => {
          if (repInProgressRef.current) {
            incrementRep();
            repInProgressRef.current = false;
          }
        }, 3000);
      } else if (plankAlignment >= 0.25 && repInProgressRef.current) {
        repInProgressRef.current = false;
      }
    } else if (currentExercise === 'Russian Twists') {
      const leftWristX = leftWrist.x;
      const rightWristX = rightWrist.x;
      const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const avgWristX = (leftWristX + rightWristX) / 2;
      const twistDistance = Math.abs(avgWristX - avgShoulderX);
      
      if (twistDistance > 0.15 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (twistDistance < 0.07 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Leg Raises') {
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const legRaise = avgHipY - avgAnkleY;
      
      if (legRaise < 0.35 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (legRaise > 0.45 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Burpees') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const isDown = avgShoulderY > 0.55;
      
      if (isDown && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (!isDown && avgShoulderY < 0.35 && repInProgressRef.current) {
        repInProgressRef.current = false;
        incrementRep();
      }
    } else if (currentExercise === 'Mountain Climbers') {
      const leftKneeY = leftKnee.y;
      const rightKneeY = rightKnee.y;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const minKneeY = Math.min(leftKneeY, rightKneeY);
      const kneeToShoulder = avgShoulderY - minKneeY;
      
      if (kneeToShoulder < -0.08 && !repInProgressRef.current) {
        repInProgressRef.current = true;
      } else if (kneeToShoulder > 0.03 && repInProgressRef.current) {
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
      
      if (!stream || !stream.active) {
        throw new Error('Camera stream not available');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
        });
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock not available:', err);
        }
      }

      // Initialize MediaPipe Pose
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

      // Start camera
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
      showToast('Workout started!');
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings to use Solo mode.');
      } else if (err.name === 'NotFoundError') {
        alert('No camera found. Please connect a camera to use Solo mode.');
      } else {
        alert('Camera error: ' + err.message + '. Please check your camera permissions and try again.');
      }
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
    alert(`Session complete!\nTotal Reps: ${totalReps}\nDice Earned: ${dice}`);
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
    <div className="hero-background">
      <div style={styles.root}>
        <header style={styles.header}>
          <h1 style={styles.title}>RIVALIS — SOLO MODE</h1>
          <div style={styles.diceCounter}>🎲 Dice: {dice}</div>
        </header>

      <section style={styles.cardArea}>
        <div style={styles.playingCard}>
          <div style={styles.cardCorner}>
            <div style={styles.cardCornerValue}>{repGoal || '?'}</div>
            <div style={styles.cardCornerSuit}>
              {currentSuit === '♠' && '♠'}
              {currentSuit === '♥' && '♥'}
              {currentSuit === '♦' && '♦'}
              {currentSuit === '♣' && '♣'}
              {!currentSuit && '♠'}
            </div>
          </div>
          <div style={styles.cardCenter}>
            <div style={styles.cardSuitLarge}>
              {currentSuit === '♠' && '♠'}
              {currentSuit === '♥' && '♥'}
              {currentSuit === '♦' && '♦'}
              {currentSuit === '♣' && '♣'}
              {!currentSuit && '♠'}
            </div>
            <div style={styles.cardExerciseName}>{currentExercise || 'READY'}</div>
            <div style={styles.cardProgressText}>
              {currentExercise ? `${currentReps} / ${repGoal}` : 'TAP START'}
            </div>
            {currentExercise && (
              <div style={styles.cardDescription}>
                {descriptions[currentExercise]}
              </div>
            )}
          </div>
          <div style={styles.cardCornerBottom}>
            <div style={styles.cardCornerValue}>{repGoal || '?'}</div>
            <div style={styles.cardCornerSuit}>
              {currentSuit === '♠' && '♠'}
              {currentSuit === '♥' && '♥'}
              {currentSuit === '♦' && '♦'}
              {currentSuit === '♣' && '♣'}
              {!currentSuit && '♠'}
            </div>
          </div>
        </div>
        <div style={styles.controls}>
          {!isWorkoutActive && (
            <button onClick={startWorkout} style={styles.button}>Start Workout</button>
          )}
          {isWorkoutActive && showDrawButton && (
            <button onClick={drawCard} style={styles.button}>Draw Card</button>
          )}
          {isWorkoutActive && (
            <button onClick={endSession} style={styles.button}>🔚 End Session</button>
          )}
        </div>
      </section>

      <section style={styles.cameraArea}>
        {userProfile?.avatarURL && (
          <img 
            src={userProfile.avatarURL} 
            alt="Your Avatar"
            style={styles.avatarBackground}
          />
        )}
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

        <footer style={styles.footer}>Contenders become Rivals. Rivals become Legends.</footer>
      </div>
    </div>
  );
}

const styles = {
  root: {
    margin: 0,
    padding: '8px',
    fontFamily: "'Courier New', monospace",
    color: '#ff2e2e',
    backgroundColor: 'transparent',
    minHeight: 'calc(100vh - 80px)',
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
  playingCard: {
    position: 'relative',
    background: '#ffffff',
    color: '#000',
    border: '3px solid #000',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 0 8px #ffffff',
    padding: '20px',
    marginBottom: '10px',
    aspectRatio: '2.5/3.5',
    maxWidth: '280px',
    margin: '0 auto 10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardCorner: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  cardCornerBottom: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    transform: 'rotate(180deg)',
  },
  cardCornerValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    lineHeight: 1,
    color: '#ff2e2e',
  },
  cardCornerSuit: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  cardCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flex: 1,
    paddingTop: '40px',
    paddingBottom: '40px',
  },
  cardSuitLarge: {
    fontSize: '4rem',
    lineHeight: 1,
  },
  cardExerciseName: {
    fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  cardProgressText: {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    fontWeight: 'bold',
    color: '#ff2e2e',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: '8px',
    lineHeight: 1.3,
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
    border: '3px solid #ff2e2e',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#1a1a1a',
    flexShrink: 1,
    boxShadow: '0 0 30px rgba(255, 46, 46, 0.6)',
  },
  avatarBackground: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    height: '60%',
    objectFit: 'contain',
    opacity: 0.4,
    filter: 'blur(2px)',
    zIndex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 1,
    visibility: 'visible',
    pointerEvents: 'none',
    zIndex: 1,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 2,
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
