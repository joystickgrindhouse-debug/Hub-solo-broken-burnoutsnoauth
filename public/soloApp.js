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
    reps: 0,
    movementState: 'IDLE',
    lastFeedback: 'Get Ready',
    startTime: null, 
    landmarks: null,
    referenceData: {},
};

async function loadReferenceData() {
    const exercises = [
        'push_up', 'squat', 'plank', 'jumping_jack', 'lunge', 'crunch', 
        'high_knee', 'burpee', 'shoulder_tap', 'calf_raise', 'russian_twist',
        'glute_bridge', 'leg_raise', 'mountain_climber', 'pike_pushup', 'plank_up_down'
    ];
    for (const ex of exercises) {
        try {
            const response = await fetch(`/reference_data/${ex}.json`);
            if (response.ok) {
                STATE.referenceData[ex] = await response.json();
            }
        } catch (e) {
            console.error(`Failed to load data for ${ex}`, e);
        }
    }
}

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const repDisplay = document.getElementById('rep-count');
const stateDisplay = document.getElementById('feedback-state');
const messageDisplay = document.getElementById('feedback-message');
const exerciseSelector = document.getElementById('exercise-selector');
const startBtn = document.getElementById('start-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const cameraStatus = document.getElementById('camera-status');

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

function calculateDistance(a, b) {
    if (!a || !b) return 0;
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function updateUI() {
    if (repDisplay) repDisplay.innerText = Math.floor(STATE.reps);
}

function updateFeedbackUI() {
    if (!stateDisplay || !messageDisplay) return;
    stateDisplay.innerText = STATE.movementState;
    messageDisplay.innerText = STATE.lastFeedback;
    const colorMap = {
        'UP': '#00ff88', 'STAND': '#00ff88', 'OPEN': '#00ff88',
        'DOWN': '#ff4444', 'PLANK': '#ff4444', 'CLOSED': '#ff4444'
    };
    stateDisplay.style.color = colorMap[STATE.movementState] || '#ffffff';
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
    canvasCtx.font = '16px "Press Start 2P"';
    canvasCtx.fillStyle = '#ff4444';
    let y = 30;
    Object.entries(targetAngles).forEach(([joint, range]) => {
        const current = getJointAngle(landmarks, joint);
        const isOk = current >= range[0] && current <= range[1];
        canvasCtx.fillStyle = isOk ? '#00ff88' : '#ff4444';
        canvasCtx.fillText(`${joint}: ${Math.round(current)}° (Target: ${range[0]}-${range[1]}°)`, 10, y);
        y += 25;
    });
    canvasCtx.restore();
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

class BaseExercise {
    constructor() {
        this.state = 'UP';
        this.reset();
    }
    reset() {
        this.state = 'UP';
        this.counter = 0;
    }
    get(landmarks, index) {
        return landmarks[index];
    }
}

class SmartExercise extends BaseExercise {
    constructor(key) {
        super();
        this.key = key;
    }
    update(landmarks) {
        const ref = STATE.referenceData[this.key];
        if (!ref) return { feedback: 'Loading reference...' };

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
                return { repIncrement: 1, state: this.state, feedback: 'Perfect Form!' };
            }
            return { state: this.state, feedback: 'Match!' };
        }

        return { state: this.state, feedback: `Moving to ${nextState}` };
    }
}

class ExerciseEngine {
    constructor() {
        this.exercises = {};
        const mapping = {
            'pushup': 'push_up',
            'squats': 'squat',
            'plank': 'plank',
            'jumpingjacks': 'jumping_jack',
            'lunge': 'lunge',
            'crunches': 'crunch',
            'highknees': 'high_knee',
            'burpees': 'burpee',
            'shouldertap': 'shoulder_tap',
            'calfraise': 'calf_raise',
            'russiantwists': 'russian_twist',
            'glutebridge': 'glute_bridge',
            'legraises': 'leg_raise',
            'mountainclimbers': 'mountain_climber',
            'pikepushup': 'pike_pushup',
            'plankupdown': 'plank_up_down'
        };
        Object.entries(mapping).forEach(([key, refKey]) => {
            this.exercises[key] = new SmartExercise(refKey);
        });
    }
    process(landmarks) {
        const exercise = this.exercises[STATE.currentExercise];
        if (!exercise) return;
        const result = exercise.update(landmarks);
        if (result.repIncrement) {
            STATE.reps += result.repIncrement;
            updateUI();
        }
        STATE.movementState = result.state || STATE.movementState;
        STATE.lastFeedback = result.feedback || STATE.lastFeedback;
        updateFeedbackUI();
        drawMotionOverlay(landmarks, exercise.key);
    }
    reset() {
        STATE.reps = 0;
        STATE.movementState = 'IDLE';
        STATE.lastFeedback = 'Get Ready';
        updateUI();
        updateFeedbackUI();
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

startBtn.addEventListener('click', () => {
    if (!STATE.isCameraRunning) startCamera();
    else stopCamera();
});

exerciseSelector.addEventListener('change', (e) => {
    STATE.currentExercise = e.target.value;
    engine.reset();
    updateUI();
});

async function startCamera() {
    loadingOverlay.classList.remove('hidden');
    await loadReferenceData();
    camera.start().then(() => {
        STATE.isCameraRunning = true;
        loadingOverlay.classList.add('hidden');
        cameraStatus.innerText = "📷 LIVE";
        cameraStatus.classList.add('active');
        startBtn.innerText = "STOP SESSION";
    }).catch(err => {
        console.error(err);
        loadingOverlay.innerHTML = "<p>Camera Error</p>";
    });
}

function stopCamera() {
    STATE.isCameraRunning = false;
    cameraStatus.innerText = "📷 OFF";
    cameraStatus.classList.remove('active');
    startBtn.innerText = "RUN SESSION";
    engine.reset();
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
        const connections = [
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], 
            [11, 23], [12, 24], [23, 24], 
            [23, 25], [25, 27], [24, 26], [26, 28], 
            [27, 31], [28, 32], [27, 29], [28, 30] 
        ];

        canvasCtx.strokeStyle = '#00FF88';
        canvasCtx.lineWidth = 4;
        canvasCtx.lineCap = 'round';
        canvasCtx.lineJoin = 'round';
        
        connections.forEach(([i, j]) => {
            const p1 = results.poseLandmarks[i];
            const p2 = results.poseLandmarks[j];
            if (p1 && p2 && p1.visibility > 0.1 && p2.visibility > 0.1) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(p1.x * canvasElement.width, p1.y * canvasElement.height);
                canvasCtx.lineTo(p2.x * canvasElement.width, p2.y * canvasElement.height);
                canvasCtx.stroke();
            }
        });
        
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF4444', 
            lineWidth: 1,
            radius: 3
        });

        engine.process(results.poseLandmarks);
    }
    
    canvasCtx.restore();
}

loadingOverlay.classList.add('hidden');
console.log("AI Rep Counter Pro Ready");