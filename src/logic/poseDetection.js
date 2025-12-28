import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

let detector = null;

export async function initializePoseLandmarker(canvasElement) {
  try {
    // Set canvas to reasonable initial size
    if (canvasElement && !canvasElement.width) {
      canvasElement.width = 640;
      canvasElement.height = 480;
    }

    // Use MoveNet which is faster and doesn't require WebGL
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      }
    );
    
    console.log("✅ Pose Detector initialized successfully");
    return detector;
  } catch (err) {
    console.error("❌ Failed to initialize Pose Detector:", err);
    throw err;
  }
}

export const SKELETON_CONNECTIONS = [
  // Nose to eyes
  [0, 1], [0, 2],
  // Eyes to ears
  [1, 3], [2, 4],
  // Shoulders
  [5, 6],
  // Arms
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  // Torso
  [5, 11], [6, 12],
  [11, 12],
  // Legs
  [11, 13], [13, 15],
  [12, 14], [14, 16]
];

export const MIN_POSE_CONFIDENCE = 0.5;

export async function detectPose(videoElement, timestamp) {
  if (!detector) return null;
  
  try {
    const poses = await detector.estimatePoses(videoElement);
    if (poses && poses.length > 0) {
      // Convert to MediaPipe format for compatibility
      return {
        landmarks: [poses[0].keypoints]
      };
    }
    return null;
  } catch (err) {
    console.warn("Pose detection error:", err);
    return null;
  }
}

export function drawResults(canvasElement, result) {
  if (!result || !result.landmarks || !result.landmarks[0]) {
    console.warn("No landmarks to draw");
    return;
  }
  
  const ctx = canvasElement.getContext("2d");
  if (!ctx) {
    console.warn("Cannot get 2D context");
    return;
  }
  
  const landmarks = result.landmarks[0];
  
  if (!canvasElement.width || !canvasElement.height) {
    console.warn("Canvas has no dimensions");
    return;
  }
  
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  let connectionCount = 0;
  let keypointCount = 0;
  
  // Draw connections (skeleton)
  for (const [start, end] of SKELETON_CONNECTIONS) {
    if (landmarks[start] && landmarks[end]) {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];
      
      const startScore = startLandmark.score || 0;
      const endScore = endLandmark.score || 0;
      
      if (startScore > MIN_POSE_CONFIDENCE && endScore > MIN_POSE_CONFIDENCE) {
        ctx.beginPath();
        ctx.moveTo(startLandmark.x * canvasElement.width, startLandmark.y * canvasElement.height);
        ctx.lineTo(endLandmark.x * canvasElement.width, endLandmark.y * canvasElement.height);
        ctx.strokeStyle = "#e63946";
        ctx.lineWidth = 4;
        ctx.stroke();
        connectionCount++;
      }
    }
  }
  
  // Draw keypoints (joints)
  for (let i = 0; i < landmarks.length; i++) {
    const landmark = landmarks[i];
    const score = landmark.score || 0;
    
    if (score > MIN_POSE_CONFIDENCE) {
      const x = landmark.x * canvasElement.width;
      const y = landmark.y * canvasElement.height;
      
      // Draw circle for joint
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.strokeStyle = "#e63946";
      ctx.lineWidth = 2;
      ctx.stroke();
      keypointCount++;
    }
  }
  
  if (connectionCount > 0 || keypointCount > 0) {
    console.log(`Drew ${connectionCount} connections and ${keypointCount} keypoints`);
  }
}
