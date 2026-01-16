export type BossState = 'IDLE' | 'WINDUP' | 'ATTACK_JAB' | 'ATTACK_HOOK' | 'HIT' | 'BLOCK';

// Placeholder URLs for assets - real ones are in implementation notes
const ASSETS = {
  IDLE: 'https://images.unsplash.com/photo-1517466787929-bc90951d64b8?w=400&h=400&fit=crop', // Boxer silhouette or similar as placeholder
  ATTACK: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=400&fit=crop', // Action shot
};

/* 
  In a real implementation with the provided assets:
  IDLE: @assets/generated_images/boss_idle.png
  JAB: @assets/generated_images/boss_jab.png
  ...
*/

export class Boss {
  public state: BossState = 'IDLE';
  public health: number = 100;
  public maxHealth: number = 100;
  
  private stateTimer: number = 0;
  private currentImage: HTMLImageElement | null = null;
  private images: Record<string, HTMLImageElement> = {};

  constructor() {
    this.loadAssets();
  }

  private loadAssets() {
    // Load images
    const idle = new Image();
    idle.src = ASSETS.IDLE; // Using unsplash for now as assets are not truly accessible in this generation env
    this.images['IDLE'] = idle;

    const attack = new Image();
    attack.src = ASSETS.ATTACK;
    this.images['ATTACK'] = attack;
    
    this.currentImage = idle;
  }

  public update(dt: number) {
    this.stateTimer -= dt;
    
    if (this.stateTimer <= 0) {
      if (this.state !== 'IDLE') {
        this.setState('IDLE');
      }
    }
  }

  public setState(newState: BossState) {
    this.state = newState;
    switch (newState) {
      case 'IDLE':
        this.currentImage = this.images['IDLE'];
        this.stateTimer = 0;
        break;
      case 'ATTACK_JAB':
        this.currentImage = this.images['ATTACK'];
        this.stateTimer = 500; // ms
        break;
      case 'HIT':
        this.stateTimer = 300;
        // Visual flash handled in renderer
        break;
    }
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    this.setState('HIT');
  }

  public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.currentImage) return;

    const scale = 0.8;
    const imgWidth = height * scale; // Keep aspect ratio roughly square for these sprites
    const imgHeight = height * scale;
    const x = (width - imgWidth) / 2;
    const y = (height - imgHeight) / 2 + 50;

    if (this.state === 'HIT') {
      ctx.globalCompositeOperation = 'luminosity'; // Flash effect
    }

    ctx.drawImage(this.currentImage, x, y, imgWidth, imgHeight);
    
    ctx.globalCompositeOperation = 'source-over';

    // Draw Health Bar
    const barWidth = 400;
    const barHeight = 20;
    const barX = (width - barWidth) / 2;
    const barY = 40;

    // Background
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#FF0033';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText("CYBER-TYSON", width / 2, barY - 10);
  }
}
