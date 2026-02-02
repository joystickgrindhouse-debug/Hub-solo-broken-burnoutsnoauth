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
    currentExercise: null,
    totalReps: 0,
    movementState: 'IDLE',
    lastFeedback: 'Get Ready',
    startTime: null, 
    landmarks: null,
    referenceData: {},
    isSessionActive: false,
    timeLeft: 60,
    category: null,
};

const CATEGORIES = {
    'arms': ['push_up', 'pike_pushup', 'shoulder_tap'],
    'legs': ['squat', 'lunge', 'calf_raise', 'glute_bridge'],
    'core': ['crunch', 'leg_raise', 'russian_twist', 'plank'],
    'full': ['burpee', 'jumping_jack', 'mountain_climber', 'push_up', 'squat']
};

const EXERCISE_MAP = {
    'push_up': { name: 'Push-ups' },
    'squat': { name: 'Squats' },
    'plank': { name: 'Plank' },
    'jumping_jack': { name: 'Jumping Jacks' },
    'lunge': { name: 'Lunges' },
    'crunch': { name: 'Crunches' },
    'high_knee': { name: 'High Knees' },
    'burpee': { name: 'Burpees' },
    'shoulder_tap': { name: 'Shoulder Taps' },
    'calf_raise': { name: 'Calf Raises' },
    'russian_twist': { name: 'Russian Twists' },
    'glute_bridge': { name: 'Glute Bridges' },
    'leg_raise': { name: 'Leg Raises' },
    'mountain_climber': { name: 'Mountain Climbers' },
    'pike_pushup': { name: 'Pike Pushups' },
    'plank_up_down': { name: 'Plank Up-Downs' }
};

async function loadReferenceData() {
    const refs = Object.keys(EXERCISE_MAP);
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
const timerDisplay = document.getElementById('timer-display');
const loadingOverlay = document.getElementById('loading-overlay');
const cameraStatus = document.getElementById('camera-status');
const exerciseNameDisplay = document.getElementById('current-exercise-name');
const modeSelection = document.getElementById('mode-selection');
const workoutInfo = document.getElementById('workout-info');
const endBtn = document.getElementById('end-btn');

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
    if (repDisplay) repDisplay.innerText = Math.floor(STATE.totalReps);
    if (timerDisplay) timerDisplay.innerText = `${STATE.timeLeft}s`;
}

function updateFeedbackUI() {
    if (!stateDisplay || !messageDisplay) return;
    stateDisplay.innerText = STATE.movementState;
    messageDisplay.innerText = STATE.lastFeedback;
}

function selectNextExercise() {
    const possible = CATEGORIES[STATE.category];
    let next;
    do {
        next = possible[Math.floor(Math.random() * possible.length)];
    } while (next === STATE.currentExercise && possible.length > 1);
    
    STATE.currentExercise = next;
    exerciseNameDisplay.innerText = EXERCISE_MAP[next].name;
    engine.reset();
}

function startBurnout(category) {
    STATE.category = category;
    STATE.timeLeft = 60;
    STATE.totalReps = 0;
    STATE.isSessionActive = true;
    
    modeSelection.classList.add('hidden');
    workoutInfo.classList.remove('hidden');
    endBtn.classList.remove('hidden');
    
    selectNextExercise();
    updateUI();
    
    const timer = setInterval(() => {
        STATE.timeLeft--;
        updateUI();
        if (STATE.timeLeft <= 0) {
            clearInterval(timer);
            endSession();
        }
    }, 1000);
}

function endSession() {
    STATE.isSessionActive = false;
    STATE.lastFeedback = "Session Complete!";
    updateFeedbackUI();
    
    // Notify parent view with unified stats
    window.parent.postMessage({
        type: "SESSION_STATS",
        stats: { 
            reps: STATE.totalReps, 
            duration: 60,
            category: STATE.category,
            type: 'rep' // Burnouts are primarily rep-based
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
    const ref = STATE.referenceData[exerciseKey];
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
        const ref = STATE.referenceData[this.key];
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
                return { repIncrement: 1, state: this.state, feedback: 'Great Rep!' };
            }
            return { state: this.state, feedback: 'Hold...' };
        }
        return { state: this.state, feedback: `Reach ${nextState}` };
    }
}

class ExerciseEngine {
    constructor() {
        this.exercises = {};
        Object.keys(EXERCISE_MAP).forEach(key => {
            this.exercises[key] = new SmartExercise(key);
        });
    }
    process(landmarks) {
        if (!STATE.isSessionActive || STATE.timeLeft <= 0) return;
        const exercise = this.exercises[STATE.currentExercise];
        if (!exercise) return;
        const result = exercise.update(landmarks);
        if (result.repIncrement) {
            STATE.totalReps += result.repIncrement;
            updateUI();
            // In burnout mode, maybe switch exercise every 5-10 reps?
            if (STATE.totalReps % 10 === 0) {
                selectNextExercise();
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

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => startBurnout(btn.dataset.mode));
});

endBtn.addEventListener('click', endSession);

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