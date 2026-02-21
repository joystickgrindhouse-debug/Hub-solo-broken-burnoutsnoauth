import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const CONFIG = {
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    modelComplexity: 1, 
    visibilityThreshold: 0.2, // Extremely low threshold to maintain tracking
};

const STATE = {
    isCameraRunning: false,
    currentExercise: 'pushup',
    reps: 0,
    movementState: 'IDLE',
    lastFeedback: 'Get Ready',
    startTime: null, 
    landmarks: null,
};

// Initialize elements with a helper to ensure they exist or wait for them
function getElements() {
    return {
        videoElement: document.querySelector('.input_video'),
        canvasElement: document.querySelector('.output_canvas'),
        repDisplay: document.getElementById('rep-count'),
        stateDisplay: document.getElementById('feedback-state'),
        messageDisplay: document.getElementById('feedback-message'),
        exerciseSelector: document.getElementById('exercise-selector'),
        startBtn: document.getElementById('start-btn'),
        flipBtn: document.getElementById('flip-btn'),
        loadingOverlay: document.getElementById('loading-overlay'),
        cameraStatus: document.getElementById('camera-status')
    };
}

let elements = getElements();
let canvasCtx = elements.canvasElement ? elements.canvasElement.getContext('2d') : null;

// Force hide loading overlay if it gets stuck
setTimeout(() => {
    if (elements.loadingOverlay && !elements.loadingOverlay.classList.contains('hidden')) {
        console.log("Forcing hide of stuck loading overlay");
        elements.loadingOverlay.classList.add('hidden');
    }
}, 5000);

function updateUI() {
    if (elements.repDisplay) elements.repDisplay.innerText = Math.floor(STATE.reps);
}

function updateFeedbackUI() {
    if (!elements.stateDisplay || !elements.messageDisplay) return;
    elements.stateDisplay.innerText = STATE.movementState;
    elements.messageDisplay.innerText = STATE.lastFeedback;
    const colorMap = {
        'UP': '#00ff88', 'STAND': '#00ff88', 'OPEN': '#00ff88',
        'DOWN': '#ff4444', 'PLANK': '#ff4444', 'CLOSED': '#ff4444'
    };
    elements.stateDisplay.style.color = colorMap[STATE.movementState] || '#ffffff';
}

// ... existing code ...
// --- Exercise engine (lightweight copy of burnouts engine) ---
function calculateAngle(a, b, c) {
    if (!a || !b || !c) return -1;
    if (a.visibility < CONFIG.visibilityThreshold || b.visibility < CONFIG.visibilityThreshold || c.visibility < CONFIG.visibilityThreshold) return -1;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
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
    constructor() { this.state = 'UP'; this.reset(); }
    reset() { this.state = 'UP'; }
}

class SmartExercise extends BaseExercise {
    constructor(key, ref) { super(); this.key = key; this.ref = ref || { rep_order: ['UP','DOWN'], angles: {} }; }
    update(landmarks) {
        const ref = this.ref;
        if (!ref || !ref.angles) return { feedback: 'Wait...' };
        const currentAngles = {};
        const firstState = ref.states ? ref.states[0] : Object.keys(ref.angles)[0];
        Object.keys(ref.angles[firstState] || {}).forEach(joint => { currentAngles[joint] = getJointAngle(landmarks, joint); });
        const nextStateIndex = (ref.rep_order.indexOf(this.state) + 1) % (ref.rep_order.length || 2);
        const nextState = ref.rep_order[nextStateIndex] || 'DOWN';
        const targetRange = (ref.angles[nextState] || {});
        const reached = Object.entries(targetRange).every(([joint, range]) => {
            const val = currentAngles[joint] || 0;
            return val >= range[0] && val <= range[1];
        });
        if (reached) {
            const old = this.state;
            this.state = nextState;
            if (this.state === ref.rep_order[0] && old !== this.state) return { repIncrement: 1, state: this.state, feedback: 'Nice!' };
            return { state: this.state, feedback: 'Hold' };
        }
        return { state: this.state, feedback: `Move to ${nextState}` };
    }
}

class ExerciseEngine {
    constructor() { this.exercises = {}; this.refData = {}; }
    setReferenceData(data) { this.refData = data || {}; Object.keys(this.refData).forEach(k => { this.exercises[k] = new SmartExercise(k, this.refData[k]); }); }
    process(landmarks) {
        const exerciseKey = STATE.currentExercise || 'pushup';
        const ex = this.exercises[exerciseKey];
        if (!ex) return;
        const result = ex.update(landmarks);
        if (result.repIncrement) {
            STATE.reps += result.repIncrement;
            updateUI();
        }
        STATE.movementState = result.state || STATE.movementState;
        STATE.lastFeedback = result.feedback || STATE.lastFeedback;
        updateFeedbackUI();
    }
    reset() { Object.values(this.exercises).forEach(e => e.reset()); }
}

const engine = new ExerciseEngine();

// Attempt to load minimal reference data if available
async function loadLocalReference() {
    try {
        const resp = await fetch('/reference_data/push_up.json');
        if (resp.ok) {
            const data = await resp.json();
            engine.setReferenceData({ 'pushup': data });
        }
    } catch (e) {
        // ignore
    }
}

// Instantiate Mediapipe Pose and wire results
const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
pose.setOptions({ modelComplexity: CONFIG.modelComplexity, smoothLandmarks: true, minDetectionConfidence: CONFIG.minDetectionConfidence, minTrackingConfidence: CONFIG.minTrackingConfidence });
pose.onResults(onResults);

loadLocalReference().catch(()=>{});

const camera = new Camera(elements.videoElement || document.createElement('video'), {
    onFrame: async () => {
        if (STATE.isCameraRunning && elements.videoElement) {
            await pose.send({image: elements.videoElement});
        }
    },
    width: 640,
    height: 480
});

if (elements.startBtn) {
    elements.startBtn.addEventListener('click', () => {
        if (!STATE.isCameraRunning) startCamera();
        else stopCamera();
    });
}

if (elements.flipBtn) {
    elements.flipBtn.addEventListener('click', () => {
        // Just as a safeguard, hide overlay on interaction
        if (elements.loadingOverlay) elements.loadingOverlay.classList.add('hidden');
        // Add flip logic here if needed
    });
}

if (elements.exerciseSelector) {
    elements.exerciseSelector.addEventListener('change', (e) => {
        STATE.currentExercise = e.target.value;
        engine.reset();
        updateUI();
    });
}

function startCamera() {
    if (elements.loadingOverlay) elements.loadingOverlay.classList.remove('hidden');
    camera.start().then(() => {
        STATE.isCameraRunning = true;
        if (elements.loadingOverlay) elements.loadingOverlay.classList.add('hidden');
        if (elements.cameraStatus) {
            elements.cameraStatus.innerText = "📷 LIVE";
            elements.cameraStatus.classList.add('active');
        }
        if (elements.startBtn) elements.startBtn.innerText = "STOP SESSION";
    }).catch(err => {
        console.error("Camera Error:", err);
        if (elements.loadingOverlay) {
            elements.loadingOverlay.innerHTML = "<p>Camera Error: " + err.message + "</p><button onclick='location.reload()'>Retry</button>";
        }
    });
}

function stopCamera() {
    STATE.isCameraRunning = false;
    if (elements.cameraStatus) {
        elements.cameraStatus.innerText = "📷 OFF";
        elements.cameraStatus.classList.remove('active');
    }
    if (elements.startBtn) elements.startBtn.innerText = "RUN SESSION";
    engine.reset();
}

function onResults(results) {
    // Hide overlay once we get first results
    if (elements.loadingOverlay) elements.loadingOverlay.classList.add('hidden');

    if (!results.image || !elements.canvasElement || !canvasCtx) return; 
    
    elements.canvasElement.width = (elements.videoElement && elements.videoElement.videoWidth) || 640;
    elements.canvasElement.height = (elements.videoElement && elements.videoElement.videoHeight) || 480;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, elements.canvasElement.width, elements.canvasElement.height);
    canvasCtx.translate(elements.canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    
    canvasCtx.drawImage(results.image, 0, 0, elements.canvasElement.width, elements.canvasElement.height);
    
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
                canvasCtx.moveTo(p1.x * elements.canvasElement.width, p1.y * elements.canvasElement.height);
                canvasCtx.lineTo(p2.x * elements.canvasElement.width, p2.y * elements.canvasElement.height);
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

// Ensure the AI Core initialization finishes even if background processes take time
console.log("AI Rep Counter Pro Ready");
setTimeout(() => {
    if (elements.loadingOverlay) elements.loadingOverlay.classList.add('hidden');
}, 3000);


