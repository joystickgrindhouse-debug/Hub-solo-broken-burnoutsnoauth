
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

let poseLandmarker;
let drawingUtils;

export async function initializePoseLandmarker(canvasElement) {
  try {
    // Set canvas to reasonable initial size
    if (canvasElement && !canvasElement.width) {
      canvasElement.width = 640;
      canvasElement.height = 480;
    }

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numPoses: 1
    });
    
    const ctx = canvasElement.getContext("2d");
    drawingUtils = new DrawingUtils(ctx);
    console.log("✅ Pose Landmarker initialized successfully");
    
    return poseLandmarker;
  } catch (err) {
    console.error("❌ Failed to initialize Pose Landmarker:", err);
    throw err;
  }
}

export const SKELETON_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [9, 10],
  // Torso
  [11, 12],
  [11, 23], [12, 24], [23, 24],
  // Arms
  [11, 13], [13, 15], [15, 17], [17, 19], [19, 21],
  [12, 14], [14, 16], [16, 18], [18, 20], [20, 22],
  // Legs
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32]
];

export const MIN_POSE_CONFIDENCE = 0.5;

export async function detectPose(videoElement, timestamp) {
  if (!poseLandmarker) return null;
  
  const result = poseLandmarker.detectForVideo(videoElement, timestamp);
  return result;
}

export function drawResults(canvasElement, result) {
  if (!drawingUtils || !result.landmarks) return;
  
  const ctx = canvasElement.getContext("2d");
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  for (const landmarks of result.landmarks) {
    // Draw skeleton connections in red
    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
      color: "#e63946",
      lineWidth: 5
    });
    // Draw landmarks (joints) in black
    drawingUtils.drawLandmarks(landmarks, {
      color: "#000000",
      lineWidth: 3
    });
  }
}
