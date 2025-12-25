// Exercise reference data loaded asynchronously from CSV files
// Maps all exercises to their movement ranges and detection logic

// CSV file paths
const CSV_PATHS = {
  "Push-ups": "/attached_assets/Push-up_media_pose_pose_1766553282744.csv",
  "Plank Up-Downs": "/attached_assets/Plank_up_down_media_pose_pose_1766553282744.csv",
  "Pike Push-ups": "/attached_assets/Pike_pushup_pose_1766553282743.csv",
  "Shoulder Taps": "/attached_assets/Shoulder_taps2_pose_1766553282744.csv",
  "Squats": "/attached_assets/Squat_pose_1766670463888.csv",
  "Lunges": "/attached_assets/Lunge_pose_1766670463888.csv",
  "Glute Bridges": "/attached_assets/GluteBridges_pose_1766670463888.csv",
  "Calf Raises": "/attached_assets/CalfRaises_pose_1766670463888.csv",
  "Crunches": "/attached_assets/Crunches_pose_1766670463888.csv",
  "Plank": "/attached_assets/Plank_pose_1766670463888.csv",
  "Russian Twists": "/attached_assets/RussianTwists_pose_1766670463887.csv",
  "Leg Raises": "/attached_assets/LegRaises_pose_1766670463888.csv",
  "Jumping Jacks": "/attached_assets/Jumping_jacks_pose_1766670463888.csv",
  "High Knees": "/attached_assets/HighKnees_pose_1766670463888.csv",
  "Burpees": "/attached_assets/Burpees_pose_1766670463888.csv",
  "Mountain Climbers": "/attached_assets/MountainClimbers_pose_1766670463888.csv"
};

// Parse CSV string into pose data
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  return lines.map(line => {
    const values = line.split(',').map(v => parseFloat(v));
    return values.length === 99 ? values : null;
  }).filter(v => v !== null);
}

// Analyze movement ranges from pose data
function analyzeExerciseRange(csvData) {
  if (!csvData || csvData.length === 0) return {};
  
  // Extract Y positions for key joints (3 values per joint: x, y, z)
  // Indices: 11,12=shoulders, 13,14=elbows, 15,16=wrists, 23,24=hips, 25,26=knees
  const elbowY = csvData.map(frame => (frame[13*3+1] + frame[14*3+1]) / 2).filter(v => !isNaN(v));
  const kneeY = csvData.map(frame => (frame[25*3+1] + frame[26*3+1]) / 2).filter(v => !isNaN(v));
  const hipY = csvData.map(frame => (frame[23*3+1] + frame[24*3+1]) / 2).filter(v => !isNaN(v));
  const wristY = csvData.map(frame => (frame[15*3+1] + frame[16*3+1]) / 2).filter(v => !isNaN(v));
  
  return {
    elbowRange: elbowY.length > 0 ? { min: Math.min(...elbowY), max: Math.max(...elbowY), mid: (Math.min(...elbowY) + Math.max(...elbowY)) / 2 } : null,
    kneeRange: kneeY.length > 0 ? { min: Math.min(...kneeY), max: Math.max(...kneeY), mid: (Math.min(...kneeY) + Math.max(...kneeY)) / 2 } : null,
    hipRange: hipY.length > 0 ? { min: Math.min(...hipY), max: Math.max(...hipY), mid: (Math.min(...hipY) + Math.max(...hipY)) / 2 } : null,
    wristRange: wristY.length > 0 ? { min: Math.min(...wristY), max: Math.max(...wristY), mid: (Math.min(...wristY) + Math.max(...wristY)) / 2 } : null,
  };
}

// Cache for loaded reference data
let referenceCache = {};
let loadingPromises = {};

// Load CSV file
async function loadCSV(exerciseName) {
  if (referenceCache[exerciseName]) return referenceCache[exerciseName];
  if (loadingPromises[exerciseName]) return loadingPromises[exerciseName];
  
  const path = CSV_PATHS[exerciseName];
  if (!path) return null;
  
  loadingPromises[exerciseName] = (async () => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`Failed to load CSV for ${exerciseName}`);
        return null;
      }
      const text = await response.text();
      const data = parseCSV(text);
      const reference = {
        data,
        analysis: analyzeExerciseRange(data)
      };
      referenceCache[exerciseName] = reference;
      return reference;
    } catch (error) {
      console.error(`Error loading ${exerciseName} CSV:`, error);
      return null;
    }
  })();
  
  return loadingPromises[exerciseName];
}

export async function getExerciseReference(exerciseName) {
  return await loadCSV(exerciseName);
}
