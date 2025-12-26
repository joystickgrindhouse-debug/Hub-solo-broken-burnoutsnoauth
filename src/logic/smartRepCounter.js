// Smart rep counter using CSV reference patterns
export class SmartRepCounter {
  constructor(exercise, repPattern) {
    this.exercise = exercise;
    this.repPattern = repPattern || this.getDefaultPattern();
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
    this.repThreshold = 300; // Minimum ms between reps
    this.frameBuffer = [];
    this.bufferSize = 10; // Smoothing buffer
  }

  getDefaultPattern() {
    return {
      elbowRange: { min: 0.2, max: 0.8, mid: 0.5 },
      kneeRange: { min: 0.3, max: 0.85, mid: 0.6 },
      hipRange: { min: 0.3, max: 0.8, mid: 0.55 },
      wristRange: { min: 0.1, max: 0.9, mid: 0.5 },
      shoulderRange: { min: 0.1, max: 0.7, mid: 0.4 }
    };
  }

  // Detect rep based on exercise type and keypoints
  detectRep(keypoints, exerciseType) {
    const now = Date.now();

    // Calculate metrics
    const metrics = this.calculateMetrics(keypoints);
    
    // Add to buffer for smoothing
    this.frameBuffer.push(metrics);
    if (this.frameBuffer.length > this.bufferSize) {
      this.frameBuffer.shift();
    }

    // Get averaged metrics
    const avgMetrics = this.averageMetrics();

    let repDetected = false;

    // Route to exercise-specific detection
    switch(exerciseType) {
      case 'Push-ups':
      case 'Plank Up-Downs':
      case 'Pike Push ups':
      case 'Shoulder Taps':
        repDetected = this.detectElbowBased(avgMetrics, now);
        break;

      case 'Squats':
      case 'Lunges':
      case 'Calf Raises':
        repDetected = this.detectKneeBased(avgMetrics, now);
        break;

      case 'Glute Bridges':
      case 'Leg Raises':
        repDetected = this.detectHipBased(avgMetrics, now);
        break;

      case 'Jumping Jacks':
      case 'High Knees':
        repDetected = this.detectWristBased(avgMetrics, now);
        break;

      case 'Burpees':
      case 'Mountain Climbers':
        repDetected = this.detectElbowBased(avgMetrics, now);
        break;

      case 'Plank':
      case 'Russian Twists':
      case 'Crunches':
        repDetected = this.detectHipBased(avgMetrics, now);
        break;

      default:
        repDetected = this.detectElbowBased(avgMetrics, now);
    }

    if (repDetected) {
      this.repCount++;
      this.lastRepTime = now;
    }

    return repDetected;
  }

  calculateMetrics(keypoints) {
    return {
      avgElbowY: (keypoints[13]?.y + keypoints[14]?.y) / 2 || 0.5,
      avgKneeY: (keypoints[25]?.y + keypoints[26]?.y) / 2 || 0.5,
      avgHipY: (keypoints[23]?.y + keypoints[24]?.y) / 2 || 0.5,
      avgWristY: (keypoints[15]?.y + keypoints[16]?.y) / 2 || 0.5,
      avgShoulderY: (keypoints[11]?.y + keypoints[12]?.y) / 2 || 0.5
    };
  }

  averageMetrics() {
    if (this.frameBuffer.length === 0) return this.calculateMetrics([]);

    const avg = {
      avgElbowY: 0,
      avgKneeY: 0,
      avgHipY: 0,
      avgWristY: 0,
      avgShoulderY: 0
    };

    this.frameBuffer.forEach(metrics => {
      avg.avgElbowY += metrics.avgElbowY;
      avg.avgKneeY += metrics.avgKneeY;
      avg.avgHipY += metrics.avgHipY;
      avg.avgWristY += metrics.avgWristY;
      avg.avgShoulderY += metrics.avgShoulderY;
    });

    const count = this.frameBuffer.length;
    Object.keys(avg).forEach(key => {
      avg[key] /= count;
    });

    return avg;
  }

  detectElbowBased(metrics, now) {
    const mid = this.repPattern.elbowRange.mid;
    const range = this.repPattern.elbowRange.max - this.repPattern.elbowRange.min;
    const threshold = range * 0.2;

    if (metrics.avgElbowY < mid - threshold && !this.inProgress) {
      this.inProgress = true;
      return false;
    }

    if (metrics.avgElbowY > mid + threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      return true;
    }

    return false;
  }

  detectKneeBased(metrics, now) {
    const mid = this.repPattern.kneeRange.mid;
    const range = this.repPattern.kneeRange.max - this.repPattern.kneeRange.min;
    const threshold = range * 0.15;

    if (metrics.avgKneeY > mid + threshold && !this.inProgress) {
      this.inProgress = true;
      return false;
    }

    if (metrics.avgKneeY < mid - threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      return true;
    }

    return false;
  }

  detectHipBased(metrics, now) {
    const mid = this.repPattern.hipRange.mid;
    const range = this.repPattern.hipRange.max - this.repPattern.hipRange.min;
    const threshold = range * 0.1;

    if (metrics.avgHipY > mid + threshold && !this.inProgress) {
      this.inProgress = true;
      return false;
    }

    if (metrics.avgHipY < mid - threshold && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      return true;
    }

    return false;
  }

  detectWristBased(metrics, now) {
    const isRaised = metrics.avgWristY < metrics.avgShoulderY - 0.05;

    if (isRaised && !this.inProgress) {
      this.inProgress = true;
      return false;
    }

    if (!isRaised && this.inProgress && now - this.lastRepTime > this.repThreshold) {
      this.inProgress = false;
      return true;
    }

    return false;
  }

  getCount() {
    return this.repCount;
  }

  reset() {
    this.repCount = 0;
    this.inProgress = false;
    this.lastRepTime = 0;
    this.frameBuffer = [];
  }
}
