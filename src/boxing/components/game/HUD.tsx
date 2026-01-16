import { type GameState } from "@/game/combatEngine";
import { motion } from "framer-motion";

interface HUDProps {
  state: GameState;
}

export function HUD({ state }: HUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Bar - Player Health & Score */}
      <div className="flex justify-between items-start w-full">
        <div className="w-1/3">
          <div className="text-primary font-display text-xl mb-1">PLAYER</div>
          <div className="h-6 w-full bg-black/50 border border-primary skew-x-[-15deg]">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${state.playerHealth}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground font-body">
            STAMINA
            <div className="h-2 w-2/3 bg-gray-800 rounded-full mt-1">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${state.playerStamina}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-display text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {state.score.toString().padStart(6, '0')}
          </div>
          {state.combo > 1 && (
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1.2, opacity: 1 }}
               className="text-2xl font-bold text-yellow-400 font-display italic"
             >
               {state.combo} HIT COMBO!
             </motion.div>
          )}
        </div>
        
        {/* Right side is boss health, drawn on canvas for now, or could be here */}
        <div className="w-1/3"></div>
      </div>
      
      {/* Game Over Screen */}
      {state.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="text-center">
            <h1 className="text-8xl font-display text-primary mb-4 animate-pulse">
              {state.result === 'WIN' ? 'VICTORY' : 'KNOCKOUT'}
            </h1>
            <p className="text-2xl font-body text-white mb-8">
              FINAL SCORE: {state.score}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-primary text-black font-bold font-display text-xl hover:scale-105 transition-transform"
            >
              FIGHT AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
