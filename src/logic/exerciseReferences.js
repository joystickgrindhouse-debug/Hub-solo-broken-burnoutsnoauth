// Exercise reference data extracted from CSV files
// Maps exercises to their movement patterns and detection logic

import pushupCSV1 from '../../attached_assets/Push-up_media_pose_pose_1766553282744.csv?raw';
import plankCSV1 from '../../attached_assets/Plank_up_down_media_pose_pose_1766553282744.csv?raw';
import pikeCSV1 from '../../attached_assets/Pike_pushup_pose_1766553282743.csv?raw';
import shoulderCSV1 from '../../attached_assets/Shoulder_taps2_pose_1766553282744.csv?raw';

// Parse CSV string into array of pose frames
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  return lines.map(line => {
    const values = line.split(',').map(v => parseFloat(v));
    return values;
  });
}

// Extract keypoints from flattened array (33 keypoints * 3 values each)
function getKeypoints(frameData) {
  const keypoints = [];
  for (let i = 0; i < 33; i++) {
    keypoints.push({
      x: frameData[i * 3],
      y: frameData[i * 3 + 1],
      z: frameData[i * 3 + 2],
      name: getKeypointName(i)
    });
  }
  return keypoints;
}

// MediaPipe 33 keypoint names
function getKeypointName(index) {
  const names = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder',
    'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
    'left_index', 'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
    'left_foot_index', 'right_foot_index'
  ];
  return names[index] || `keypoint_${index}`;
}

// Analyze movement range from CSV to find motion peaks
function analyzeMovementRange(csvData) {
  const keypoints = csvData.map(frame => getKeypoints(frame));
  
  // For arm exercises, track elbow and wrist positions
  const elbowY = keypoints.map(kps => (kps[13].y + kps[14].y) / 2);
  const shoulderY = keypoints.map(kps => (kps[11].y + kps[12].y) / 2);
  
  const minElbowY = Math.min(...elbowY);
  const maxElbowY = Math.max(...elbowY);
  const midpoint = (minElbowY + maxElbowY) / 2;
  
  return { minElbowY, maxElbowY, midpoint, elbowY };
}

// Load and cache reference data
let referenceData = {};

function loadReferenceData() {
  if (Object.keys(referenceData).length > 0) return referenceData;
  
  try {
    referenceData['Push-up'] = {
      csv: parseCSV(pushupCSV1),
      analysis: null
    };
    referenceData['Plank Up-Downs'] = {
      csv: parseCSV(plankCSV1),
      analysis: null
    };
    referenceData['Pike Push-ups'] = {
      csv: parseCSV(pikeCSV1),
      analysis: null
    };
    referenceData['Shoulder Taps'] = {
      csv: parseCSV(shoulderCSV1),
      analysis: null
    };
    
    // Analyze each exercise
    Object.keys(referenceData).forEach(exercise => {
      referenceData[exercise].analysis = analyzeMovementRange(referenceData[exercise].csv);
    });
    
    console.log('Exercise reference data loaded:', Object.keys(referenceData));
  } catch (error) {
    console.error('Error loading exercise references:', error);
  }
  
  return referenceData;
}

export { loadReferenceData, analyzeMovementRange, parseCSV, getKeypoints };
