import { Boss } from "./boss/Boss";
import { PunchDetector, type PunchResult } from "./punchDetector";

export interface GameState {
  playerHealth: number;
  playerStamina: number;
  score: number;
  combo: number;
  gameOver: boolean;
  result: 'WIN' | 'LOSS' | 'NONE';
}

export class CombatEngine {
  public boss: Boss;
  public state: GameState;
  
  private punchDetector: PunchDetector;
  private lastUpdate: number = 0;

  constructor() {
    this.boss = new Boss();
    this.punchDetector = new PunchDetector();
    this.state = {
      playerHealth: 100,
      playerStamina: 100,
      score: 0,
      combo: 0,
      gameOver: false,
      result: 'NONE',
    };
  }

  public update(timestamp: number, landmarks: any[]) {
    if (this.state.gameOver) return;

    if (this.lastUpdate === 0) {
      this.lastUpdate = timestamp;
      return;
    }
    const dt = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;

    // Update Boss AI (Simplified)
    this.boss.update(dt);
    
    // Random Boss Attack
    if (this.boss.state === 'IDLE' && Math.random() < 0.01) {
      this.boss.setState('ATTACK_JAB');
      // If player doesn't dodge, take damage (simplified logic)
      // In a real engine, we'd check player position vs punch hitbox after a delay
      setTimeout(() => {
        if (!this.state.gameOver && this.boss.state === 'ATTACK_JAB') {
           this.state.playerHealth -= 10;
           this.state.combo = 0;
           if (this.state.playerHealth <= 0) {
             this.state.gameOver = true;
             this.state.result = 'LOSS';
           }
        }
      }, 300);
    }

    // Detect Player Punches
    const punch = this.punchDetector.detect(landmarks, timestamp);
    if (punch) {
      this.handlePlayerPunch(punch);
    }

    // Regen Stamina
    this.state.playerStamina = Math.min(100, this.state.playerStamina + dt * 0.01);
  }

  private handlePlayerPunch(punch: PunchResult) {
    if (this.state.playerStamina < 10) return; // Too tired

    this.state.playerStamina -= 15;
    
    // Hit logic
    if (this.boss.state !== 'BLOCK') {
      const damage = 5 + (punch.velocity * 0.01);
      this.boss.takeDamage(damage);
      this.state.score += Math.floor(damage * 10);
      this.state.combo += 1;

      if (this.boss.health <= 0) {
        this.state.gameOver = true;
        this.state.result = 'WIN';
      }
    } else {
      this.state.combo = 0;
    }
  }
}
