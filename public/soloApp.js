import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const CONFIG = {
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    modelComplexity: 1, 
    visibilityThreshold: 0.2, 
};

const STATE = {
    isCameraRunning: false,
    currentExercise: 'pushup',
    repsRemaining: 0,
    movementState: 'IDLE',
    lastFeedback: 'Get Ready',
    startTime: null, 
    landmarks: null,
    referenceData: {},
    isSessionActive: false,
};

const EXERCISES = {
    'pushup': { ref: 'push_up', name: 'Push-ups', suit: '♠' },
    'squats': { ref: 'squat', name: 'Squats', suit: '♥' },
    'jumpingjacks': { ref: 'jumping_jack', name: 'Jumping Jacks', suit: '♦' },
    'lunge': { ref: 'lunge', name: 'Lunges', suit: '♣' },
    'crunches': { ref: 'crunch', name: 'Crunches', suit: '♠' },
    'highknees': { ref: 'high_knee', name: 'High Knees', suit: '♥' },
    'burpees': { ref: 'burpee', name: 'Burpees', suit: '♦' },
    'calfraise': { ref: 'calf_raise', name: 'Calf Raises', suit: '♣' }
};

async function loadReferenceData() {
    const refs = [...new Set(Object.values(EXERCISES).map(e => e.ref))];
    for (const ref of refs) {
        try {
            const response = await fetch(`/reference_data/${ref}.json`);
            if (response.ok) {
                STATE.referenceData[ref] = await response.json();
            }
        } catch (e) {
            console.error(`Failed to load data for ${ref}`, e);
        }
    }
}

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const repDisplay = document.getElementById('rep-count');
const stateDisplay = document.getElementById('feedback-state');
const messageDisplay = document.getElementById('feedback-message');
const flipBtn = document.getElementById('flip-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const cameraStatus = document.getElementById('camera-status');
const exerciseNameDisplay = document.getElementById('current-exercise-name');
const cardValueDisplays = document.querySelectorAll('.card-value');
const cardSuitDisplays = document.querySelectorAll('.card-suit');
const centerSuitDisplay = document.querySelector('.suit-icon');

function calculateAngle(a, b, c) {
    if (!a || !b || !c) return -1;
    if (a.visibility < CONFIG.visibilityThreshold || 
        b.visibility < CONFIG.visibilityThreshold || 
        c.visibility < CONFIG.visibilityThreshold) {
        return -1; 
    }
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

function updateUI() {
    if (repDisplay) repDisplay.innerText = Math.max(0, Math.floor(STATE.repsRemaining));
}

function updateFeedbackUI() {
    if (!stateDisplay || !messageDisplay) return;
    stateDisplay.innerText = STATE.movementState;
    messageDisplay.innerText = STATE.lastFeedback;
}

function flipCard() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'full';
    
    // Exercise filtering for live mode categories
    const categoryMap = {
        'arms': ['push_up', 'pike_pushup', 'shoulder_tap', 'crunches'], // simplified for solo keys
        'legs': ['squats', 'lunge', 'calfraise'],
        'core': ['crunches', 'plank'],
        'full': Object.keys(EXERCISES)
    };
    
    // Convert ref names to exercise keys for soloApp
    const refToKey = {
        'push_up': 'pushup',
        'squat': 'squats',
        'jumping_jack': 'jumpingjacks',
        'lunge': 'lunge',
        'crunch': 'crunches',
        'high_knee': 'highknees',
        'burpee': 'burpees',
        'calf_raise': 'calfraise'
    };

    let keys = Object.keys(EXERCISES);
    if (category !== 'full') {
        const allowedRefs = categoryMap[category] || [];
        keys = keys.filter(k => {
            const ref = EXERCISES[k].ref;
            return allowedRefs.includes(ref);
        });
        if (keys.length === 0) keys = Object.keys(EXERCISES); // Fallback
    }

    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const exercise = EXERCISES[randomKey];
    const value = Math.floor(Math.random() * 10) + 5; // 5 to 15 reps

    STATE.currentExercise = randomKey;
    STATE.repsRemaining = value;
    STATE.initialReps = value; // Store for submission
    STATE.isSessionActive = true;
    
    exerciseNameDisplay.innerText = exercise.name;
    centerSuitDisplay.innerText = exercise.suit;
    cardValueDisplays.forEach(el => el.innerText = value);
    cardSuitDisplays.forEach(el => el.innerText = exercise.suit);
    
    engine.reset();
    updateUI();
    STATE.lastFeedback = "Exercise Loaded!";
    updateFeedbackUI();
}

function submitSoloScore() {
    const refKey = EXERCISES[STATE.currentExercise]?.ref;
    window.parent.postMessage({
        type: "SESSION_STATS",
        stats: { 
            reps: STATE.initialReps, 
            exercise: refKey,
            type: refKey === 'plank' ? 'timed' : 'rep'
        }
    }, "*");
}

function getJointAngle(landmarks, joint) {
    const map = {
        'left_elbow': [11, 13, 15],
        'right_elbow': [12, 14, 16],
        'left_hip': [11, 23, 25],
        'right_hip': [12, 24, 26],
        'left_knee': [23, 25, 27],
        'right_knee': [24, 26, 28],
    };
    const indices = map[joint];
    if (!indices) return 0;
    return calculateAngle(landmarks[indices[0]], landmarks[indices[1]], landmarks[indices[2]]);
}

function drawMotionOverlay(landmarks, exerciseKey) {
    const refKey = EXERCISES[exerciseKey]?.ref;
    const ref = STATE.referenceData[refKey];
    if (!ref || !ref.angles) return;

    const currentState = ref.states.find(s => {
        const angles = ref.angles[s];
        return Object.entries(angles).every(([joint, range]) => {
            const val = getJointAngle(landmarks, joint);
            return val >= range[0] && val <= range[1];
        });
    }) || ref.states[0];

    const targetAngles = ref.angles[currentState];
    canvasCtx.save();
    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    canvasCtx.font = '14px "Inter"';
    canvasCtx.fillStyle = '#ff4444';
    let y = 30;
    Object.entries(targetAngles).forEach(([joint, range]) => {
        const current = getJointAngle(landmarks, joint);
        const isOk = current >= range[0] && current <= range[1];
        canvasCtx.fillStyle = isOk ? '#00ff88' : '#ff4444';
        canvasCtx.fillText(`${joint}: ${Math.round(current)}°`, 10, y);
        y += 20;
    });
    canvasCtx.restore();
}

class BaseExercise {
    constructor() {
        this.state = 'UP';
        this.reset();
    }
    reset() {
        this.state = 'UP';
    }
}

class SmartExercise extends BaseExercise {
    constructor(key) {
        super();
        this.key = key;
    }
    update(landmarks) {
        const refKey = EXERCISES[this.key]?.ref;
        const ref = STATE.referenceData[refKey];
        if (!ref) return { feedback: 'Wait...' };

        const currentAngles = {};
        Object.keys(ref.angles[ref.states[0]]).forEach(joint => {
            currentAngles[joint] = getJointAngle(landmarks, joint);
        });

        const nextStateIndex = (ref.rep_order.indexOf(this.state) + 1) % ref.rep_order.length;
        const nextState = ref.rep_order[nextStateIndex];
        const targetRange = ref.angles[nextState];

        const reached = Object.entries(targetRange).every(([joint, range]) => {
            const val = currentAngles[joint];
            return val >= range[0] && val <= range[1];
        });

        if (reached) {
            const oldState = this.state;
            this.state = nextState;
            if (this.state === ref.rep_order[0] && oldState !== this.state) {
                return { repDecrement: 1, state: this.state, feedback: 'Great Rep!' };
            }
            return { state: this.state, feedback: 'Hold...' };
        }
        return { state: this.state, feedback: `Reach ${nextState}` };
    }
}

class ExerciseEngine {
    constructor() {
        this.exercises = {};
        Object.keys(EXERCISES).forEach(key => {
            this.exercises[key] = new SmartExercise(key);
        });
    }
    process(landmarks) {
        if (!STATE.isSessionActive || STATE.repsRemaining <= 0) return;
        const exercise = this.exercises[STATE.currentExercise];
        if (!exercise) return;
        const result = exercise.update(landmarks);
        if (result.repDecrement) {
            STATE.repsRemaining -= result.repDecrement;
            updateUI();
            if (STATE.repsRemaining <= 0) {
                STATE.isSessionActive = false;
                STATE.lastFeedback = "Card Complete!";
                updateFeedbackUI();
                submitSoloScore();
                return;
            }
        }
        STATE.movementState = result.state || STATE.movementState;
        STATE.lastFeedback = result.feedback || STATE.lastFeedback;
        updateFeedbackUI();
        drawMotionOverlay(landmarks, STATE.currentExercise);
    }
    reset() {
        Object.values(this.exercises).forEach(ex => ex.reset());
    }
}

const engine = new ExerciseEngine();
const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});

pose.setOptions({
    modelComplexity: CONFIG.modelComplexity,
    smoothLandmarks: true,
    minDetectionConfidence: CONFIG.minDetectionConfidence,
    minTrackingConfidence: CONFIG.minTrackingConfidence
});

pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        if (STATE.isCameraRunning) {
            await pose.send({image: videoElement});
        }
    },
    width: 640,
    height: 480
});

flipBtn.addEventListener('click', flipCard);

async function startCamera() {
    loadingOverlay.classList.remove('hidden');
    await loadReferenceData();
    camera.start().then(() => {
        STATE.isCameraRunning = true;
        loadingOverlay.classList.add('hidden');
    }).catch(err => {
        console.error(err);
        loadingOverlay.innerHTML = "<p>Camera Error</p>";
    });
}

function onResults(results) {
    if (!results.image) return; 
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.poseLandmarks) {
        engine.process(results.poseLandmarks);
    }
    canvasCtx.restore();
}

window.addEventListener('load', startCamera);