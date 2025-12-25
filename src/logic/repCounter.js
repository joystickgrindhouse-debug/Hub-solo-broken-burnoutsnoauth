// Rep counting state machine with exercise-specific logic

class RepCounter {
  constructor(exercise, referenceData = null) {
    this.exercise = exercise;
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
    this.repThreshold = 300; // Minimum ms between reps to prevent doubles
    this.referenceData = referenceData;
    
    // Calculate ranges from reference data if available
    if (referenceData && referenceData.analysis) {
      const { minElbowY, maxElbowY, midpoint } = referenceData.analysis;
      this.refMin = minElbowY;
      this.refMax = maxElbowY;
      this.refMid = midpoint;
      this.refRange = maxElbowY - minElbowY;
    }
  }

  reset() {
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
  }

  // Push-ups: elbow angle with reference-based detection
  processElbowBased(currentAngle, minAngle = 60, maxAngle = 160) {
    const now = Date.now();
    
    // If we have reference data, use position-based detection
    if (this.referenceData && this.refMin !== undefined && currentAngle !== undefined) {
      // currentAngle here is actually elbowY position (0-1)
      const elbowY = currentAngle; // Position in frame
      const midpoint = this.refMid;
      
      // Elbows bent (low Y = high position) = in motion
      if (elbowY < midpoint && !this.inProgress) {
        this.inProgress = true;
      }
      // Elbows extended (high Y = low position) = rep completed
      else if (elbowY > midpoint && this.inProgress && now - this.lastRepTime > this.repThreshold) {
        this.inProgress = false;
        this.repCount++;
        this.lastRepTime = now;
        return true;
      }
      return false;
    }
    
    // Fallback: angle-based detection
    // Elbows bent = in motion
    if (currentAngle < minAngle && !this.inProgress) {
      this.inProgress = true;
    }
    // Elbows extended = completed
    else if (currentAngle > maxAngle && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Squats/Lunges: knee flexion
  processKneeBased(kneeFlexion, threshold = 0.15) {
    const now = Date.now();
    
    if (kneeFlexion > threshold && !this.inProgress) {
      this.inProgress = true;
    } else if (kneeFlexion < threshold * 0.7 && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Jumping Jacks: arms raised
  processArmsRaised(wristY, shoulderY, threshold = 0.05) {
    const now = Date.now();
    const armsRaised = wristY < shoulderY - threshold;
    
    if (armsRaised && !this.inProgress) {
      this.inProgress = true;
    } else if (!armsRaised && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      this.repCount++;
      this.lastRepTime = now;
      return true;
    }
    
    return false;
  }

  // Planks: static hold for duration
  processPlank(isAligned, holdDuration = 3000) {
    const now = Date.now();
    
    if (isAligned && !this.inProgress) {
      this.inProgress = true;
      this.lastRepTime = now;
    } else if (isAligned && this.inProgress && now - this.lastRepTime > holdDuration) {
      this.repCount++;
      this.inProgress = false;
      return true;
    } else if (!isAligned && this.inProgress) {
      this.inProgress = false;
    }
    
    return false;
  }

  // Crunches: torso flexion
  processTorsoFlexion(flexionDistance, threshold = 0.25) {
    const now = Date.now();
    
    if (flexionDistance < threshold && !this.inProgress) {
      this.inProgress = true;
    } else if (flexionDistance > threshold + 0.1 && this.inProgress && now - this.lastRepTime > this.repThreshold) {
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
