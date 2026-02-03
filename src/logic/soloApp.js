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


