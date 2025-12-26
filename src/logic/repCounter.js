import { calculateAngle } from './angleCalculations.js';

class RepCounter {
  constructor(exerciseName) {
    this.exerciseName = exerciseName;
    this.repCount = 0;
    this.history = [];
    this.currentStateIndex = 0;
    this.config = null;
    this.lastStateChangeTime = Date.now();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Mapping for display names to file names
      const nameMap = {
        'Push-ups': 'push_up',
        'Plank Up-Downs': 'plank_up_down',
        'Pike Push ups': 'pike_pushup',
        'Shoulder Taps': 'shoulder_tap',
        'Squats': 'squat',
        'Lunges': 'lunge',
        'Glute Bridges': 'glute_bridge',
        'Calf Raises': 'calf_raise',
        'Crunches': 'crunch',
        'Plank': 'plank',
        'Russian Twists': 'russian_twist',
        'Leg Raises': 'leg_raise',
        'Jumping Jacks': 'jumping_jack',
        'High Knees': 'high_knee',
        'Burpees': 'burpee',
        'Mountain Climbers': 'mountain_climber'
      };

      const fileName = nameMap[this.exerciseName] || this.exerciseName.toLowerCase().replace(/ /g, '_');
      const response = await fetch(`/src/logic/exercise_data/${fileName}.json`);
      if (!response.ok) throw new Error(`Failed to load config for ${this.exerciseName}`);
      this.config = await response.json();
      this.isInitialized = true;
      console.log(`Initialized ${this.exerciseName} with new schema`);
    } catch (error) {
      console.error('Failed to initialize rep counter:', error);
      // Fallback for safety
      this.isInitialized = false;
    }
  }

  reset() {
    this.currentStateIndex = 0;
    this.history = [];
    this.lastStateChangeTime = Date.now();
  }

  // Compatibility method for existing views
  detectRep(keypoints, exercise) {
    return this.process(keypoints);
  }

  process(landmarks) {
    if (!landmarks || landmarks.length < 33) return false;

    // Mediapipe landmarks: 11 (L Shoulder), 13 (L Elbow), 15 (L Wrist)
    const p1 = landmarks[11];
    const p2 = landmarks[13];
    const p3 = landmarks[15];

    if (!p1 || !p2 || !p3) return false;

    const angle = calculateAngle(p1, p2, p3);
    
    // Count 1 rep when the angle goes from >160 degrees to <30 degrees and back
    if (angle > 160) {
      if (this.stage === 'down') {
        this.repCount++;
        this.stage = 'up';
        return true;
      }
      this.stage = 'up';
    } else if (angle < 30) {
      this.stage = 'down';
    }
    return false;
  }

  checkStateMatch(keypoints, requirements) {
    if (!requirements) return true;

    for (const [joint, range] of Object.entries(requirements)) {
      const angle = this.getJointAngle(keypoints, joint);
      if (angle === null) return false;
      if (angle < range[0] || angle > range[1]) return false;
    }
    return true;
  }

  getJointAngle(keypoints, joint) {
    if (joint === 'torso_rotation') {
      const ls = keypoints[11];
      const rs = keypoints[12];
      const lh = keypoints[23];
      const rh = keypoints[24];
      if (!ls || !rs || !lh || !rh) return null;
      // Calculate shoulder-to-hip plane rotation relative to camera
      const shoulderMidZ = (ls.z + rs.z) / 2;
      const hipMidZ = (lh.z + rh.z) / 2;
      const rotation = (ls.z - rs.z) * 100; // Simplified rotation metric
      return rotation;
    }

    const mapping = {
      'left_elbow': [11, 13, 15],
      'right_elbow': [12, 14, 16],
      'left_hip': [11, 23, 25],
      'right_hip': [12, 24, 26],
      'hip': [11, 23, 25], // Default to left
      'shoulder': [13, 11, 23], // Elbow-Shoulder-Hip angle for abduction
      'left_knee': [23, 25, 27],
      'right_knee': [24, 26, 28],
      'left_ankle': [25, 27, 29],
      'right_ankle': [26, 28, 30],
      'ankle': [25, 27, 29], // Default to left
      'torso_rotation': [11, 12, 23, 24], // Special handling for rotation
      'front_knee': [23, 25, 27], // Default to left for logic
      'back_knee': [24, 26, 28]   // Default to right for logic
    };

    const indices = mapping[joint];
    if (!indices) return null;

    const p1 = keypoints[indices[0]];
    const p2 = keypoints[indices[1]];
    const p3 = keypoints[indices[2]];

    // Using confidence check
    const minConf = 0.5;
    if (!p1 || !p2 || !p3 || 
        (p1.score !== undefined && p1.score < minConf) || 
        (p2.score !== undefined && p2.score < minConf) || 
        (p3.score !== undefined && p3.score < minConf)) return null;

    return calculateAngle(p1, p2, p3);
  }

  resetRepProgress() {
    this.currentStateIndex = 0;
    this.history = [];
  }

  getCount() {
    return this.repCount;
  }

  getFormIssues() {
    if (!this.isInitialized || !this.config || !this.lastProcessedKeypoints) return [];
    
    const currentTargetState = this.config.rep_order[this.currentStateIndex];
    const stateAngles = this.config.angles[currentTargetState];
    if (!stateAngles) return [];

    const issues = [];
    for (const [joint, range] of Object.entries(stateAngles)) {
      const angle = this.getJointAngle(this.lastProcessedKeypoints, joint);
      if (angle !== null && (angle < range[0] || angle > range[1])) {
        // Map joint names to indices for visualization
        const mapping = {
          'left_elbow': [11, 13, 15],
          'right_elbow': [12, 14, 16],
          'left_hip': [11, 23, 25],
          'right_hip': [12, 24, 26],
          'left_knee': [23, 25, 27],
          'right_knee': [24, 26, 28],
          'left_ankle': [25, 27, 29],
          'right_ankle': [26, 28, 30]
        };
        const indices = mapping[joint] || [];
        issues.push(...indices);
      }
    }
    return [...new Set(issues)];
  }
}

export default RepCounter;