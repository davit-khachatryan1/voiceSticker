// Client-side canvas + mic recording using MediaRecorder
import { Viseme, Mood } from '@voicesticker/types';
import { getEmotionCurveForFrame } from '@voicesticker/types';

export interface RecordingOptions {
  canvas: HTMLCanvasElement;
  fps?: number;
  styleId: string;
  mood: Mood;
}

export class CanvasRecorder {
  private canvas: HTMLCanvasElement;
  private fps: number;
  private styleId: string;
  private mood: Mood;
  private animationFrameId: number | null = null;
  private visemes: Viseme[] = [];
  private startTime: number = 0;
  private isRecording: boolean = false;

  constructor(options: RecordingOptions) {
    this.canvas = options.canvas;
    this.fps = options.fps || 15;
    this.styleId = options.styleId;
    this.mood = options.mood;
  }

  async startRecording(visemes: Viseme[]): Promise<void> {
    this.visemes = visemes;
    this.startTime = Date.now();
    this.isRecording = true;
    this.startAnimation();
  }

  stopRecording(): void {
    this.isRecording = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private startAnimation(): void {
    const drawFrame = () => {
      if (!this.isRecording) return;

      const elapsed = Date.now() - this.startTime;
      const timeSeconds = elapsed / 1000;
      
      // Get current viseme
      const viseme = this.getVisemeAtTime(this.visemes, elapsed);
      
      // Get emotion curve for this frame
      const emotionCurve = getEmotionCurveForFrame(
        this.mood,
        timeSeconds,
        (this.visemes[this.visemes.length - 1]?.t || 0) / 1000
      );
      
      // Draw frame
      this.drawFrame(viseme, emotionCurve, timeSeconds);
      
      this.animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }

  private getVisemeAtTime(visemes: Viseme[], time: number): Viseme | null {
    for (let i = 0; i < visemes.length; i++) {
      const viseme = visemes[i];
      const nextViseme = visemes[i + 1];
      
      if (time >= viseme.t && (!nextViseme || time < nextViseme.t)) {
        return viseme;
      }
    }
    
    return visemes[visemes.length - 1] || null;
  }

  private drawFrame(viseme: Viseme | null, emotionCurve: any, time: number): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Apply emotion transformations
    ctx.save();
    
    // Head position based on emotion
    const headX = centerX + (emotionCurve.headYaw * 2);
    const headY = centerY + (emotionCurve.headPitch * 2);
    const scale = emotionCurve.scale;
    
    // Draw character (simplified - replace with your animation)
    this.drawCharacter(ctx, headX, headY, scale, viseme, emotionCurve, time);
    
    ctx.restore();
  }

  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    viseme: Viseme | null,
    emotionCurve: any,
    time: number
  ): void {
    const baseRadius = 100 * scale;
    
    // Head circle
    ctx.fillStyle = '#ffdbac';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 30, y - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 30, y - 20, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (affected by emotion)
    const eyebrowY = y - 35 - (emotionCurve.eyebrowRaise * 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 40, eyebrowY);
    ctx.lineTo(x - 20, eyebrowY - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 20, eyebrowY - 5);
    ctx.lineTo(x + 40, eyebrowY);
    ctx.stroke();

    // Mouth (based on viseme)
    this.drawMouth(ctx, x, y + 30, viseme?.shape || 'A', emotionCurve.mouthIntensity);

    // Style indicator
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.fillText(this.styleId, 10, 20);
    ctx.fillText(this.mood, 10, 35);
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    shape: Viseme['shape'],
    intensity: number
  ): void {
    ctx.fillStyle = '#000';
    
    switch (shape) {
      case 'A':
        // Open mouth (ah)
        ctx.beginPath();
        ctx.ellipse(x, y, 25 * intensity, 15 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'E':
        // Slight open (eh)
        ctx.beginPath();
        ctx.ellipse(x, y, 20 * intensity, 10 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'I':
        // Small open (ih)
        ctx.beginPath();
        ctx.ellipse(x, y, 15 * intensity, 8 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'O':
        // Round open (oh)
        ctx.beginPath();
        ctx.arc(x, y, 18 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'U':
        // Pursed (uh)
        ctx.beginPath();
        ctx.ellipse(x, y, 12 * intensity, 18 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'W':
        // Very pursed (w)
        ctx.beginPath();
        ctx.ellipse(x, y, 10 * intensity, 20 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'L':
        // Tongue up (l)
        ctx.beginPath();
        ctx.ellipse(x, y, 18 * intensity, 12 * intensity, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'M':
        // Closed (m)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x + 15, y);
        ctx.stroke();
        break;
    }
  }
}

