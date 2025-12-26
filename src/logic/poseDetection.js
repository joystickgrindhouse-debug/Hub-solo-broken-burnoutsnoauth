// Pose Detection using TensorFlow.js - BlazePose
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

let detector = null;

export async function initializePoseDetection() {
  if (!detector) {
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      {
        runtime: 'tfjs',
        modelType: 'lite'
      }
    );
  }
  return detector;
}

export async function detectPose(videoElement) {
  if (!detector) return null;
  
  try {
    if (!videoElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }

    const poses = await detector.estimatePoses(videoElement, {
      flipHorizontal: false
    });
    
    if (poses && poses.length > 0 && poses[0].keypoints) {
      console.log('Pose detected with', poses[0].keypoints.length, 'keypoints');
      return {
        keypoints: poses[0].keypoints,
        score: poses[0].score || 0.9
      };
    }
  } catch (error) {
    console.error('Pose detection error:', error);
  }
  
  return null;
}

// BlazePose keypoint indices (33 points)
export const KEYPOINT_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear',
  'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky',
  'left_index', 'right_index',
  'left_thumb', 'right_thumb',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
  'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
];

// Skeleton connections for visualization
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
