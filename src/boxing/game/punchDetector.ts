import { type NormalizedLandmark, POSE_LANDMARKS } from "@mediapipe/pose";

export type PunchType = 'JAB' | 'CROSS' | 'HOOK' | 'UPPERCUT' | 'NONE';

interface PunchResult {
  type: PunchType;
  velocity: number;
  timestamp: number;
}

export class PunchDetector {
  private lastLeftWrist: NormalizedLandmark | null = null;
  private lastRightWrist: NormalizedLandmark | null = null;
  private lastTimestamp: number = 0;
  
  // Velocity threshold to consider a movement a punch
  private readonly VELOCITY_THRESHOLD = 0.05; 
  private readonly RETRACTION_THRESHOLD = 0.02;

  // Simple state to prevent spamming
  private leftPunchState: 'IDLE' | 'EXTENDING' | 'RETRACTING' = 'IDLE';
  private rightPunchState: 'IDLE' | 'EXTENDING' | 'RETRACTING' = 'IDLE';
  
  // Cooldown in ms
  private lastPunchTime = 0;
  private readonly COOLDOWN = 300; 

  public detect(landmarks: NormalizedLandmark[], timestamp: number): PunchResult | null {
    if (timestamp - this.lastPunchTime < this.COOLDOWN) return null;

    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const nose = landmarks[POSE_LANDMARKS.NOSE];

    if (!this.lastLeftWrist || !this.lastRightWrist) {
      this.lastLeftWrist = leftWrist;
      this.lastRightWrist = rightWrist;
      this.lastTimestamp = timestamp;
      return null;
    }

    const dt = timestamp - this.lastTimestamp;
    if (dt === 0) return null;

    // Calculate velocities (screenspace distance per ms implies speed)
    const leftVel = (leftWrist.z - this.lastLeftWrist.z) / dt; // Z is depth, negative is closer to camera
    const rightVel = (rightWrist.z - this.lastRightWrist.z) / dt; 

    // Determine handedness assuming typical stance (Left is jab for orthodox)
    // For simplicity, we detect rapid forward Z movement
    
    let detectedPunch: PunchResult | null = null;

    // Detect Left Punch (Jab/Hook)
    if (this.leftPunchState === 'IDLE' && leftWrist.z < leftShoulder.z - 0.2) {
       // Wrist extended significantly past shoulder
       this.leftPunchState = 'EXTENDING';
       detectedPunch = { type: 'JAB', velocity: Math.abs(leftVel) * 1000, timestamp };
    } else if (this.leftPunchState === 'EXTENDING' && leftWrist.z > this.lastLeftWrist.z) {
       this.leftPunchState = 'IDLE'; // Retracting
    }

    // Detect Right Punch (Cross/Uppercut)
    if (this.rightPunchState === 'IDLE' && rightWrist.z < rightShoulder.z - 0.2) {
       this.rightPunchState = 'EXTENDING';
       detectedPunch = { type: 'CROSS', velocity: Math.abs(rightVel) * 1000, timestamp };
    } else if (this.rightPunchState === 'EXTENDING' && rightWrist.z > this.lastRightWrist.z) {
       this.rightPunchState = 'IDLE';
    }

    this.lastLeftWrist = leftWrist;
    this.lastRightWrist = rightWrist;
    this.lastTimestamp = timestamp;

    if (detectedPunch) {
      this.lastPunchTime = timestamp;
    }

    return detectedPunch;
  }
}
