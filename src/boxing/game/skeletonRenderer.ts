import { type NormalizedLandmarkList, POSE_LANDMARKS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// Define connections for the upper body boxing skeleton
const BOXING_CONNECTIONS = [
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
];

export class SkeletonRenderer {
  public draw(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmarkList) {
    ctx.save();
    
    // Draw connections (bones)
    drawConnectors(ctx, landmarks, BOXING_CONNECTIONS, {
      color: '#00FF00', // Green neon for valid skeleton
      lineWidth: 4,
    });

    // Draw landmarks (joints)
    drawLandmarks(ctx, landmarks, {
      color: '#FF0033', // Red neon for joints
      lineWidth: 2,
      radius: 4,
    });

    // Highlight fists specially
    this.drawFist(ctx, landmarks[POSE_LANDMARKS.LEFT_WRIST]);
    this.drawFist(ctx, landmarks[POSE_LANDMARKS.RIGHT_WRIST]);

    ctx.restore();
  }

  private drawFist(ctx: CanvasRenderingContext2D, landmark: { x: number, y: number }) {
    if (!landmark) return;
    const x = landmark.x * ctx.canvas.width;
    const y = landmark.y * ctx.canvas.height;
    
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 51, 0.8)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
}
