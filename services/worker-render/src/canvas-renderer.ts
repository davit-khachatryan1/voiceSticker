// Canvas-based renderer for generating frames
import { Viseme, Mood } from '@voicesticker/types';
import { EmotionCurve, getEmotionCurveForFrame } from '@voicesticker/types';
import * as fs from 'fs/promises';
import * as path from 'path';

interface RenderOptions {
  width: number;
  height: number;
  fps: number;
  styleId: string;
  mood: Mood;
}

export class CanvasRenderer {
  private width: number;
  private height: number;
  private fps: number;
  private styleId: string;
  private mood: Mood;

  constructor(options: RenderOptions) {
    this.width = options.width;
    this.height = options.height;
    this.fps = options.fps;
    this.styleId = options.styleId;
    this.mood = options.mood;
  }

  async renderFrame(
    frameNumber: number,
    viseme: Viseme | null,
    emotionCurve: EmotionCurve,
    outputPath: string
  ): Promise<void> {
    // In production, this would use canvas or headless browser to render Lottie
    // For now, create a placeholder frame with SVG
    
    const svg = this.generateSVGFrame(frameNumber, viseme, emotionCurve);
    const pngPath = outputPath.replace('.svg', '.png');
    
    // In production, convert SVG to PNG using canvas or imagemagick
    // For now, save SVG as placeholder
    await fs.writeFile(outputPath, svg, 'utf-8');
    
    // Note: In production, you would:
    // 1. Load Lottie animation file
    // 2. Apply viseme to mouth shape
    // 3. Apply emotion curve to head/eyebrows/scale
    // 4. Render frame using canvas or headless browser
    // 5. Save as PNG
  }

  private generateSVGFrame(
    frameNumber: number,
    viseme: Viseme | null,
    emotionCurve: EmotionCurve
  ): string {
    // Generate a simple SVG placeholder
    // In production, this would render the actual Lottie animation
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseRadius = 100;
    const scale = emotionCurve.scale;
    const radius = baseRadius * scale;
    
    // Head circle
    const headY = centerY + (emotionCurve.headPitch * 2);
    const headX = centerY + (emotionCurve.headYaw * 2);
    
    // Mouth shape based on viseme
    const mouthShape = this.getMouthShapeForViseme(viseme?.shape || 'A');
    
    return `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${this.width}" height="${this.height}" fill="#f0f0f0"/>
        
        <!-- Head -->
        <circle cx="${headX}" cy="${headY}" r="${radius}" fill="#ffdbac" stroke="#000" stroke-width="2"/>
        
        <!-- Eyes -->
        <circle cx="${headX - 30}" cy="${headY - 20}" r="8" fill="#000"/>
        <circle cx="${headX + 30}" cy="${headY - 20}" r="8" fill="#000"/>
        
        <!-- Eyebrows -->
        <line x1="${headX - 40}" y1="${headY - 35 - (emotionCurve.eyebrowRaise * 10)}" 
              x2="${headX - 20}" y2="${headY - 30 - (emotionCurve.eyebrowRaise * 10)}" 
              stroke="#000" stroke-width="3"/>
        <line x1="${headX + 20}" y1="${headY - 30 - (emotionCurve.eyebrowRaise * 10)}" 
              x2="${headX + 40}" y2="${headY - 35 - (emotionCurve.eyebrowRaise * 10)}" 
              stroke="#000" stroke-width="3"/>
        
        <!-- Mouth -->
        ${mouthShape}
        
        <!-- Style indicator -->
        <text x="10" y="20" font-size="12" fill="#666">${this.styleId}</text>
        <text x="10" y="35" font-size="12" fill="#666">${this.mood}</text>
        <text x="10" y="50" font-size="10" fill="#999">Frame ${frameNumber}</text>
      </svg>
    `.trim();
  }

  private getMouthShapeForViseme(shape: Viseme['shape']): string {
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 30;
    
    switch (shape) {
      case 'A':
        // Open mouth (ah)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="25" ry="15" fill="#000"/>`;
      case 'E':
        // Slight open (eh)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="20" ry="10" fill="#000"/>`;
      case 'I':
        // Small open (ih)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="15" ry="8" fill="#000"/>`;
      case 'O':
        // Round open (oh)
        return `<circle cx="${centerX}" cy="${centerY}" r="18" fill="#000"/>`;
      case 'U':
        // Pursed (uh)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="12" ry="18" fill="#000"/>`;
      case 'W':
        // Very pursed (w)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="10" ry="20" fill="#000"/>`;
      case 'L':
        // Tongue up (l)
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="18" ry="12" fill="#000"/>`;
      case 'M':
        // Closed (m)
        return `<line x1="${centerX - 15}" y1="${centerY}" x2="${centerX + 15}" y2="${centerY}" stroke="#000" stroke-width="3"/>`;
      default:
        return `<ellipse cx="${centerX}" cy="${centerY}" rx="20" ry="10" fill="#000"/>`;
    }
  }

  async renderFrames(
    visemes: Viseme[],
    durationMs: number,
    outputDir: string
  ): Promise<string[]> {
    const framePaths: string[] = [];
    const frameDuration = 1000 / this.fps;  // ms per frame
    const totalFrames = Math.ceil(durationMs / frameDuration);
    
    await fs.mkdir(outputDir, { recursive: true });
    
    for (let i = 0; i < totalFrames; i++) {
      const frameTime = i * frameDuration;
      const viseme = this.getVisemeAtTime(visemes, frameTime);
      const emotionCurve = getEmotionCurveForFrame(this.mood, frameTime / 1000, durationMs / 1000);
      
      const framePath = path.join(outputDir, `frame_${String(i).padStart(4, '0')}.svg`);
      await this.renderFrame(i, viseme, emotionCurve, framePath);
      framePaths.push(framePath);
    }
    
    return framePaths;
  }

  private getVisemeAtTime(visemes: Viseme[], time: number): Viseme | null {
    // Find the viseme that should be active at this time
    for (let i = 0; i < visemes.length; i++) {
      const viseme = visemes[i];
      const nextViseme = visemes[i + 1];
      
      if (time >= viseme.t && (!nextViseme || time < nextViseme.t)) {
        return viseme;
      }
    }
    
    return visemes[visemes.length - 1] || null;
  }
}

