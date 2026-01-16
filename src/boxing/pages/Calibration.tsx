import { useState, useRef, useEffect } from "react";
import { PoseTracker } from "@/game/pose";
import { SkeletonRenderer } from "@/game/skeletonRenderer";
import { Button } from "@/components/ui/button";
import { useSaveCalibration } from "@/hooks/use-calibration";
import { useLocation } from "wouter";
import { Loader2, CheckCircle } from "lucide-react";

type CalibrationStep = 'INIT' | 'NEUTRAL' | 'PUNCH' | 'DONE';

export default function Calibration() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<CalibrationStep>('INIT');
  const [message, setMessage] = useState("Stand back and show your full body");
  const [progress, setProgress] = useState(0);
  
  const tracker = useRef(new PoseTracker());
  const renderer = useRef(new SkeletonRenderer());
  
  const saveCalibration = useSaveCalibration();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    
    tracker.current.onResults((results) => {
      if (!ctx || !canvasRef.current) return;
      
      // Clear
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw camera frame
      ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        renderer.current.draw(ctx, results.poseLandmarks);
        
        // Calibration Logic
        if (step === 'NEUTRAL') {
          // Check if user is in frame (simplified)
          if (results.poseLandmarks.length > 0) {
            setProgress(prev => Math.min(100, prev + 2));
            if (progress >= 100) {
              setStep('PUNCH');
              setMessage("Throw 3 Punches!");
              setProgress(0);
            }
          }
        } else if (step === 'PUNCH') {
          // Detect simple movement
          // This is a dummy check for the UI flow, real logic would measure velocity
           setProgress(prev => Math.min(100, prev + 1));
           if (progress >= 100) {
             finishCalibration();
           }
        }
      }
    });

    tracker.current.start(videoRef.current);

    return () => {
      tracker.current.stop();
    };
  }, [step, progress]); // Re-bind if step changes to update logic context

  const startCalibration = () => {
    setStep('NEUTRAL');
    setMessage("Hold Neutral Stance");
    setProgress(0);
  };

  const finishCalibration = async () => {
    setStep('DONE');
    try {
      await saveCalibration.mutateAsync({
        wristVelocity: 1.5, // Mock calculated values
        elbowAngle: 90,
        shoulderRotation: 45,
        headVerticalDisplacement: 0.1,
        hipDisplacement: 0.1,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-display mb-4 text-primary">SYSTEM CALIBRATION</h1>
      <p className="mb-8 text-xl text-center max-w-lg">{message}</p>

      <div className="relative w-[640px] h-[480px] bg-gray-900 rounded-xl overflow-hidden border-2 border-primary/50 shadow-[0_0_30px_rgba(255,0,85,0.2)]">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-50" playsInline />
        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full" />
        
        {step !== 'INIT' && step !== 'DONE' && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
            <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        )}

        {step === 'DONE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-display">COMPLETE</h2>
              <Button className="mt-4" onClick={() => setLocation("/dashboard")}>CONTINUE</Button>
            </div>
          </div>
        )}
      </div>

      {step === 'INIT' && (
        <Button size="lg" className="mt-8 text-xl px-12" onClick={startCalibration}>
          BEGIN SCAN
        </Button>
      )}
      
      {step === 'PUNCH' && (
         <div className="mt-4 text-gray-400 animate-pulse">Detecting motion...</div>
      )}
    </div>
  );
}
