
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

let poseLandmarker;
let drawingUtils;

export async function initializePoseLandmarker(canvasElement) {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 1
  });
  
  const ctx = canvasElement.getContext("2d");
  drawingUtils = new DrawingUtils(ctx);
  
  return poseLandmarker;
}

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
    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4
    });
    drawingUtils.drawLandmarks(landmarks, {
      color: "#FF0000",
      lineWidth: 2
    });
  }
}
