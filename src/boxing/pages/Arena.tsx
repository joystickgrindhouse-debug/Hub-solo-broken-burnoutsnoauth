import { useEffect, useRef, useState } from "react";
import { PoseTracker } from "../game/pose";
import { SkeletonRenderer } from "../game/skeletonRenderer";
import { CombatEngine } from "../game/combatEngine";
import { HUD } from "../components/game/HUD";
import { useNavigate } from "react-router-dom";

const HubButton = ({ onClick, children, variant, size }: any) => (
  <button 
    onClick={onClick}
    style={{
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontFamily: "'Press Start 2P', cursive",
      fontSize: "0.7rem"
    }}
  >
    {children}
  </button>
);

export default function Arena() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine] = useState(() => new CombatEngine());
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState(engine.state);
  
  const tracker = useRef(new PoseTracker());
  const renderer = useRef(new SkeletonRenderer());
  const requestRef = useRef<number>();
  const createMatch = { mutate: (data: any) => console.log('Match saved:', data) }; 

  useEffect(() => {
    const init = async () => {
      if (videoRef.current && canvasRef.current) {
        await tracker.current.start(videoRef.current);
        setLoading(false);
      }
    };
    init();

    const loop = (time: number) => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Update State for React UI
      if (engine.state.gameOver && gameState.result === 'NONE') {
         // Save match only once
         engine.state.result = engine.state.playerHealth > 0 ? 'WIN' : 'LOSS';
         setGameState({...engine.state});
         
         createMatch.mutate({
           opponentName: "CYBER-TYSON",
           result: engine.state.result.toLowerCase(),
           score: engine.state.score,
           durationSeconds: 60, // Mock
           punchesThrown: 0, // Would be tracked in engine
           punchesLanded: 0,
           dodges: 0,
           accuracy: 0,
         });
      } else {
         setGameState({...engine.state}); // Sync for HUD
      }

      // Render Loop is mostly handled by Pose callback for landmarks, 
      // but Boss rendering needs its own tick or shared tick.
      // Since Pose is async, we can put the game logic inside onResults or here.
      // Putting it in onResults ensures we have latest pose.
      // However, we need to clear canvas once per frame.
    };

    requestRef.current = requestAnimationFrame(loop);

    tracker.current.onResults((results) => {
      if (!canvasRef.current || !videoRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      // 1. Draw Background (Webcam) - dim it for atmosphere
      ctx.save();
      ctx.filter = 'brightness(50%) contrast(120%)';
      ctx.drawImage(results.image, 0, 0, width, height);
      ctx.restore();

      // 2. Scanlines Effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for(let i=0; i<height; i+=4) {
        ctx.fillRect(0, i, width, 1);
      }

      // 3. Game Logic Update
      if (results.poseLandmarks) {
        engine.update(performance.now(), results.poseLandmarks);
        
        // 4. Draw Player Skeleton
        renderer.current.draw(ctx, results.poseLandmarks);
      }

      // 5. Draw Boss
      engine.boss.draw(ctx, width, height);
    });

    return () => {
      tracker.current.stop();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Video element hidden, used for tracking */}
      <video ref={videoRef} className="hidden" playsInline />
      
      {/* Main Game Canvas */}
      <canvas 
        ref={canvasRef} 
        width={1280} 
        height={720} 
        className="w-full h-full object-cover"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#ff3050] border-t-transparent"></div>
            <h2 className="text-2xl font-display text-white">INITIALIZING NEURAL LINK...</h2>
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      {!loading && <HUD state={gameState} />}
      
      {/* Back Button (only when game over or strictly needed) */}
      <div className="absolute top-4 right-4 z-40">
        <HubButton onClick={() => navigate("/dashboard")}>
          EXIT ARENA
        </HubButton>
      </div>
    </div>
  );
}
