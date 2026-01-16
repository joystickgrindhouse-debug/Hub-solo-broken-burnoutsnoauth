import { Pose, type Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

export class PoseTracker {
  private pose: Pose;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;

  constructor() {
    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  public onResults(callback: (results: Results) => void) {
    this.pose.onResults(callback);
  }

  public async start(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.videoElement) {
          await this.pose.send({ image: this.videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    await this.camera.start();
  }

  public async stop() {
    if (this.camera) {
      await this.camera.stop();
      this.camera = null;
    }
    this.videoElement = null;
  }
}
