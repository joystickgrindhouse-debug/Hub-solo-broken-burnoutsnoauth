// Landmark smoothing to reduce jitter
class LandmarkSmoother {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.history = {};
  }

  smooth(keypoints) {
    if (!keypoints || keypoints.length === 0) return keypoints;
    
    const smoothed = keypoints.map((kp, idx) => {
      if (!kp) return null;
      
      if (!this.history[idx]) {
        this.history[idx] = [];
      }
      
      this.history[idx].push({
        x: kp.x,
        y: kp.y,
        z: kp.z || 0,
        score: kp.score
      });
      
      // Keep only recent frames
      if (this.history[idx].length > this.windowSize) {
        this.history[idx].shift();
      }
      
      // Calculate average
      const avgX = this.history[idx].reduce((sum, p) => sum + p.x, 0) / this.history[idx].length;
      const avgY = this.history[idx].reduce((sum, p) => sum + p.y, 0) / this.history[idx].length;
      const avgZ = this.history[idx].reduce((sum, p) => sum + p.z, 0) / this.history[idx].length;
      
      return {
        x: avgX,
        y: avgY,
        z: avgZ,
        score: kp.score
      };
    });
    
    return smoothed;
  }

  reset() {
    this.history = {};
  }
}

export default LandmarkSmoother;
