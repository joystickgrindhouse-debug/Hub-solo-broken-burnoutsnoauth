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

  process(keypoints) {
    if (!this.isInitialized || !this.config || !keypoints) return false;

    const currentTargetState = this.config.rep_order[this.currentStateIndex];
    const stateAngles = this.config.angles[currentTargetState];
    
    if (this.checkStateMatch(keypoints, stateAngles)) {
      const now = Date.now();
      
      // Advance state
      this.currentStateIndex++;
      this.lastStateChangeTime = now;

      // Check if rep complete
      if (this.currentStateIndex >= this.config.rep_order.length) {
        const repDuration = (now - (this.history[0]?.time || now)) / 1000;
        
        if (repDuration >= (this.config.constraints?.min_rep_time || 0.5)) {
          this.repCount++;
          this.resetRepProgress();
          return true;
        } else {
          this.resetRepProgress();
        }
      } else if (this.currentStateIndex === 1) {
        // Started new rep
        this.history = [{ state: currentTargetState, time: now }];
      }
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
    const mapping = {
      'left_elbow': [11, 13, 15],
      'right_elbow': [12, 14, 16],
      'left_hip': [11, 23, 25],
      'right_hip': [12, 24, 26],
      'left_knee': [23, 25, 27],
      'right_knee': [24, 26, 28],
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
}

export default RepCounter;