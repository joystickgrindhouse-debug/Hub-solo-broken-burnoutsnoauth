// Parse and analyze CSV pose data to create rep reference patterns
export class CSVRepReference {
  constructor(exercise) {
    this.exercise = exercise;
    this.frames = [];
    this.repPattern = null;
  }

  // Parse CSV raw data (comma-separated string)
  parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    this.frames = lines.map(line => {
      const values = line.split(',').map(v => parseFloat(v));
      return this.valuesToKeypoints(values);
    });
    
    // Analyze frames to find rep pattern
    this.analyzeRepPattern();
    return this.frames;
  }

  // Convert 99 values to 33 keypoints with x, y, z
  valuesToKeypoints(values) {
    const keypoints = [];
    for (let i = 0; i < 33; i++) {
      keypoints.push({
        x: values[i * 3] || 0,
        y: values[i * 3 + 1] || 0,
        z: values[i * 3 + 2] || 0,
        name: this.getKeypointName(i)
      });
    }
    return keypoints;
  }

  getKeypointName(index) {
    const names = [
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
    return names[index] || `keypoint_${index}`;
  }

  analyzeRepPattern() {
    if (this.frames.length < 2) return;

    // Calculate key metrics throughout the exercise sequence
    const metrics = this.frames.map(frame => ({
      avgElbowY: (frame[13].y + frame[14].y) / 2, // elbows
      avgKneeY: (frame[25].y + frame[26].y) / 2, // knees
      avgHipY: (frame[23].y + frame[24].y) / 2, // hips
      avgWristY: (frame[15].y + frame[16].y) / 2, // wrists
      avgShoulderY: (frame[11].y + frame[12].y) / 2, // shoulders
      bodyHeight: Math.max(...frame.map(k => k.y)) - Math.min(...frame.map(k => k.y))
    }));

    // Find min/max for each metric to establish ranges
    this.repPattern = {
      elbowRange: {
        min: Math.min(...metrics.map(m => m.avgElbowY)),
        max: Math.max(...metrics.map(m => m.avgElbowY)),
        mid: (Math.min(...metrics.map(m => m.avgElbowY)) + Math.max(...metrics.map(m => m.avgElbowY))) / 2
      },
      kneeRange: {
        min: Math.min(...metrics.map(m => m.avgKneeY)),
        max: Math.max(...metrics.map(m => m.avgKneeY)),
        mid: (Math.min(...metrics.map(m => m.avgKneeY)) + Math.max(...metrics.map(m => m.avgKneeY))) / 2
      },
      hipRange: {
        min: Math.min(...metrics.map(m => m.avgHipY)),
        max: Math.max(...metrics.map(m => m.avgHipY)),
        mid: (Math.min(...metrics.map(m => m.avgHipY)) + Math.max(...metrics.map(m => m.avgHipY))) / 2
      },
      wristRange: {
        min: Math.min(...metrics.map(m => m.avgWristY)),
        max: Math.max(...metrics.map(m => m.avgWristY)),
        mid: (Math.min(...metrics.map(m => m.avgWristY)) + Math.max(...metrics.map(m => m.avgWristY))) / 2
      },
      shoulderRange: {
        min: Math.min(...metrics.map(m => m.avgShoulderY)),
        max: Math.max(...metrics.map(m => m.avgShoulderY)),
        mid: (Math.min(...metrics.map(m => m.avgShoulderY)) + Math.max(...metrics.map(m => m.avgShoulderY))) / 2
      },
      avgBodyHeight: metrics.reduce((a, b) => a + b.bodyHeight, 0) / metrics.length,
      repEstimate: Math.max(1, Math.round(this.frames.length / 40)) // Rough estimate: ~40 frames per rep
    };
  }

  // Load CSV file and parse it
  async loadCSVFile(filePath) {
    try {
      const response = await fetch(filePath);
      const csvText = await response.text();
      return this.parseCSVData(csvText);
    } catch (error) {
      console.error(`Failed to load CSV: ${filePath}`, error);
      return [];
    }
  }

  getRepPattern() {
    return this.repPattern;
  }

  getFrameCount() {
    return this.frames.length;
  }
}

// Mapping of exercise names to CSV files
export const CSV_EXERCISE_MAP = {
  'Push-ups': 'Push-up_media_pose_pose_1766553282744.csv',
  'Plank Up-Downs': 'Plank_up_down_media_pose_pose_1766553282744.csv',
  'Pike Push ups': 'Pike_pushup_pose_1766553282743.csv',
  'Shoulder Taps': 'Shoulder_taps2_pose_1766553282744.csv',
  'Squats': 'Squat_pose_1766670463888.csv',
  'Lunges': 'Lunge_pose_1766670463888.csv',
  'Glute Bridges': 'GluteBridges_pose_1766670463888.csv',
  'Calf Raises': 'CalfRaises_pose_1766670463888.csv',
  'Crunches': 'Crunches_pose_1766670463888.csv',
  'Plank': 'Plank_pose_1766670463888.csv',
  'Russian Twists': 'RussianTwists_pose_1766670463887.csv',
  'Leg Raises': 'LegRaises_pose_1766670463888.csv',
  'Jumping Jacks': 'Jumping_jacks_pose_1766670463888.csv',
  'High Knees': 'HighKnees_pose_1766670463888.csv',
  'Burpees': 'Burpees_pose_1766670463888.csv',
  'Mountain Climbers': 'MountainClimbers_pose_1766670463888.csv'
};

export async function loadExerciseReference(exercise) {
  const csvFile = CSV_EXERCISE_MAP[exercise];
  if (!csvFile) {
    console.warn(`No CSV reference found for exercise: ${exercise}`);
    return null;
  }

  const reference = new CSVRepReference(exercise);
  await reference.loadCSVFile(`/attached_assets/${csvFile}`);
  return reference;
}
