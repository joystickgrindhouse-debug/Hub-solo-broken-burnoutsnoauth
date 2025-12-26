export const RunLogic = {
  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @returns {number} distance in miles
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Cheat detection: Check if speed is realistic
   * @param {number} distance miles
   * @param {number} timeSeconds 
   * @returns {boolean} true if speed is realistic (< 15 mph)
   */
  isRealisticSpeed: (distance, timeSeconds) => {
    if (timeSeconds <= 0) return true;
    const speedMph = (distance / timeSeconds) * 3600;
    return speedMph < 15;
  },

  /**
   * Calculate dice earned based on distance
   * @param {number} totalDistance miles
   * @returns {number} dice count
   */
  calculateDice: (totalDistance) => {
    return Math.floor(totalDistance / 0.5);
  },

  /**
   * Check if a run qualifies for a streak
   * @param {number} distance miles
   * @returns {boolean}
   */
  isQualifyingRun: (distance) => {
    return distance >= 0.5;
  }
};
