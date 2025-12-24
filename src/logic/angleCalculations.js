// Angle calculations for form analysis
export function calculateAngle(pointA, pointB, pointC) {
  // Calculate angle at pointB using vectors BA and BC
  const ba = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y
  };
  
  const bc = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };
  
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magnitude = Math.sqrt(ba.x * ba.x + ba.y * ba.y) * Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  
  if (magnitude === 0) return 0;
  
  const angle = Math.acos(dot / magnitude) * (180 / Math.PI);
  return Math.round(angle);
}

export function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isConfident(keypoint, minConfidence = 0.5) {
  return keypoint && keypoint.score && keypoint.score >= minConfidence;
}

// Form validation helpers
export function getFormIssues(keypoints) {
  const issues = [];
  
  // Get reliable keypoints (BlazePose indices)
  const nose = keypoints[0];
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftElbow = keypoints[13];
  const rightElbow = keypoints[14];
  const leftWrist = keypoints[15];
  const rightWrist = keypoints[16];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  const leftKnee = keypoints[25];
  const rightKnee = keypoints[26];
  
  if (!isConfident(leftHip) || !isConfident(rightHip)) return issues;
  
  // Check hip alignment
  const hipDifference = Math.abs(leftHip.y - rightHip.y);
  if (hipDifference > 0.08) {
    issues.push({
      type: 'uneven_hips',
      side: leftHip.y > rightHip.y ? 'right' : 'left',
      severity: hipDifference > 0.15 ? 'high' : 'medium'
    });
  }
  
  // Check shoulder alignment
  if (isConfident(leftShoulder) && isConfident(rightShoulder)) {
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDiff > 0.08) {
      issues.push({
        type: 'uneven_shoulders',
        severity: shoulderDiff > 0.15 ? 'high' : 'medium'
      });
    }
  }
  
  // Check elbow angles for push-ups
  if (isConfident(leftShoulder) && isConfident(leftElbow) && isConfident(leftWrist)) {
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    if (leftElbowAngle < 45 || leftElbowAngle > 160) {
      issues.push({
        type: 'elbow_angle',
        side: 'left',
        angle: leftElbowAngle
      });
    }
  }
  
  return issues;
}
