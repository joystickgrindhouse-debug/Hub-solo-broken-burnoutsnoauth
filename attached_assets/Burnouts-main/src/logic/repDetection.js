export class RepDetector {
  constructor() {
    this.repInProgress = false;
    this.currentReps = 0;
    this.currentExercise = '';
  }

  reset() {
    this.repInProgress = false;
    this.currentReps = 0;
  }

  setExercise(exercise) {
    this.currentExercise = exercise;
    this.reset();
  }

  detectRep(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    let repDetected = false;

    if (this.currentExercise === 'Squats') {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeFlexion = avgKneeY - avgHipY;
      
      if (kneeFlexion > 0.15 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (kneeFlexion < 0.05 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Lunges') {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeFlexion = avgKneeY - avgHipY;
      
      if (kneeFlexion > 0.18 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (kneeFlexion < 0.08 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Push-Ups' || this.currentExercise === 'Push-ups') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const elbowFlexion = avgElbowY - avgShoulderY;
      
      if (elbowFlexion > 0.12 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (elbowFlexion < 0.03 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Jumping Jacks') {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      
      if (avgWristY < avgShoulderY - 0.05 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (avgWristY > avgShoulderY + 0.15 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'High Knees') {
      const maxKneeY = Math.max(leftKnee.y, rightKnee.y);
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeRaise = avgHipY - maxKneeY;
      
      if (kneeRaise > 0.15 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (kneeRaise < 0.05 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Crunches') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const crunchDistance = avgHipY - avgShoulderY;
      
      if (crunchDistance < 0.25 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (crunchDistance > 0.35 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Glute Bridges') {
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipLift = avgShoulderY - avgHipY;
      
      if (hipLift < -0.1 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (hipLift > 0.05 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Russian Twists') {
      const leftShoulderX = leftShoulder.x;
      const rightShoulderX = rightShoulder.x;
      const shoulderRotation = Math.abs(leftShoulderX - rightShoulderX);
      
      if (shoulderRotation < 0.15 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (shoulderRotation > 0.25 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Mountain Climbers' || this.currentExercise === 'Burpees') {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const kneeToHip = avgHipY - avgKneeY;
      
      if (kneeToHip < 0.1 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (kneeToHip > 0.25 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Plank Hold' || this.currentExercise === 'Plank') {
      return null;
    } else if (this.currentExercise === 'Tricep Dips') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const elbowFlexion = avgElbowY - avgShoulderY;
      
      if (elbowFlexion > 0.15 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (elbowFlexion < 0.05 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Shoulder Taps') {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const armMovement = avgShoulderY - avgWristY;
      
      if (armMovement < -0.08 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (armMovement > 0.08 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Calf Raises') {
      const avgAnkleY = (landmarks[27].y + landmarks[28].y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const heelRaise = avgHipY - avgAnkleY;
      
      if (heelRaise > 0.52 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (heelRaise < 0.48 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Leg Raises') {
      const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      const legRaise = avgHipY - avgKneeY;
      
      if (legRaise > 0.2 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (legRaise < 0.05 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else if (this.currentExercise === 'Plank Up-Downs') {
      const avgElbowY = (leftElbow.y + rightElbow.y) / 2;
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const armPosition = Math.abs(avgElbowY - avgWristY);
      
      if (armPosition < 0.05 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (armPosition > 0.15 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    } else {
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const armMovement = avgShoulderY - avgWristY;
      
      if (armMovement < -0.1 && !this.repInProgress) {
        this.repInProgress = true;
      } else if (armMovement > 0.1 && this.repInProgress) {
        this.repInProgress = false;
        repDetected = true;
      }
    }

    if (repDetected) {
      this.currentReps++;
      return {
        repDetected: true,
        totalReps: this.currentReps
      };
    }

    return {
      repDetected: false,
      totalReps: this.currentReps
    };
  }
}
