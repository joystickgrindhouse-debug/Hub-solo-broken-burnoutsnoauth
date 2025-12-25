// Rep counting state machine with exercise-specific logic
import { getExerciseReference } from './exerciseReferences.js';

class RepCounter {
  constructor(exercise) {
    this.exercise = exercise;
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
    this.repThreshold = 300; // Minimum ms between reps to prevent doubles
    
    // Default ranges for fallback detection
    this.elbowRange = { min: 0.2, max: 0.8, mid: 0.5 };
    this.kneeRange = { min: 0.3, max: 0.85, mid: 0.6 };
    this.hipRange = { min: 0.3, max: 0.8, mid: 0.55 };
    this.wristRange = { min: 0.1, max: 0.9, mid: 0.5 };
    
    // Load reference data asynchronously
    this.initializeReferences(exercise);
  }
  
  async initializeReferences(exercise) {
    try {
      const reference = await getExerciseReference(exercise);
      if (reference && reference.analysis) {
        const { elbowRange, kneeRange, hipRange, wristRange } = reference.analysis;
        if (elbowRange) this.elbowRange = elbowRange;
        if (kneeRange) this.kneeRange = kneeRange;
        if (hipRange) this.hipRange = hipRange;
        if (wristRange) this.wristRange = wristRange;
      }
    } catch (error) {
      console.log(`Using default ranges for ${exercise}`);
    }
  }

  reset() {
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
  }

  // Arm exercises: elbow Y position detection
  processElbowBased(currentElbowY) {
    const now = Date.now();
    if (!currentElbowY || !this.elbowRange) return false;
    
    const mid = this.elbowRange.mid;
    const range = this.elbowRange.max - this.elbowRange.min;
    const threshold = range * 0.2; // 20% of range for threshold
    
    // Up position (low Y = elbows bent)
    if (currentElbowY < mid - threshold && !this.inProgress) {
      this.inProgress = true;
    }
    // Down position (high Y = elbows extended) = rep complete
    else if (currentElbowY > mid + threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Leg exercises: knee Y position detection  
  processKneeBased(currentKneeY) {
    const now = Date.now();
    if (!currentKneeY || !this.kneeRange) return false;
    
    const mid = this.kneeRange.mid;
    const range = this.kneeRange.max - this.kneeRange.min;
    const threshold = range * 0.15;
    
    // Up (knees extended)
    if (currentKneeY > mid + threshold && !this.inProgress) {
      this.inProgress = true;
    }
    // Down (knees bent) = rep complete
    else if (currentKneeY < mid - threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Wrist-based (shoulder taps, jumping jacks)
  processWristBased(currentWristY, shoulderY) {
    const now = Date.now();
    if (!currentWristY || !shoulderY) return false;
    
    const isRaised = currentWristY < shoulderY - 0.05;
    
    if (isRaised && !this.inProgress) {
      this.inProgress = true;
    } else if (!isRaised && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Hip-based (glute bridges, leg raises)
  processHipBased(currentHipY) {
    const now = Date.now();
    if (!currentHipY || !this.hipRange) return false;
    
    const mid = this.hipRange.mid;
    const range = this.hipRange.max - this.hipRange.min;
    const threshold = range * 0.1;
    
    // Hips down
    if (currentHipY > mid + threshold && !this.inProgress) {
      this.inProgress = true;
    }
    // Hips raised = rep complete
    else if (currentHipY < mid - threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  getCount() {
    return this.repCount;
  }
}

export default RepCounter;
