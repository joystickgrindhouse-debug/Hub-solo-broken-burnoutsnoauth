// Rep counting state machine with exercise-specific logic

class RepCounter {
  constructor(exercise) {
    this.exercise = exercise;
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
    this.repThreshold = 300; // Minimum ms between reps to prevent doubles
  }

  reset() {
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
  }

  // Push-ups: elbow angle
  processElbowBased(currentAngle, minAngle = 60, maxAngle = 160) {
    const now = Date.now();
    
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
