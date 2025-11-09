import { exec } from 'child_process';
import { promisify } from 'util';
import { Viseme, Mood } from '@voicesticker/types';
import { getEmotionCurveForFrame } from '@voicesticker/types';
import * as path from 'path';
import * as fs from 'fs/promises';
import { CanvasRenderer } from './canvas-renderer';

const execAsync = promisify(exec);

// Render frames using canvas renderer
async function renderFrames(
  styleId: string,
  visemes: Viseme[],
  mood: Mood,
  durationMs: number,
  outputDir: string,
  fps: number = 15
): Promise<string> {
  console.log(`[Render] Rendering frames for style: ${styleId}, mood: ${mood}, duration: ${durationMs}ms`);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Use canvas renderer
  const renderer = new CanvasRenderer({
    width: 512,
    height: 512,
    fps,
    styleId,
    mood,
  });

  // Render all frames
  await renderer.renderFrames(visemes, durationMs, outputDir);
  
  console.log(`[Render] Frames rendered to: ${outputDir}`);

  return outputDir;
}

// Encode video using FFmpeg preset
async function encodeVideo(
  framesDir: string,
  audioFile: string,
  outputFile: string,
  preset: 'clip' | 'story' | 'cast' | 'webm'
): Promise<string> {
  console.log(`[Encode] Encoding video with preset: ${preset}`);

  const presetScript = path.join(
    process.cwd(),
    '..',
    '..',
    'packages',
    'ffmpeg-presets',
    `${preset}-512.sh`
  );

  try {
    // Execute FFmpeg preset script
    const { stdout, stderr } = await execAsync(
      `bash "${presetScript}" "${framesDir}" "${audioFile}" "${outputFile}"`
    );
    
    if (stderr) {
      console.log('[Encode] FFmpeg output:', stderr);
    }

    // Verify output file exists
    await fs.access(outputFile);
    console.log(`[Encode] Video encoded successfully: ${outputFile}`);

    return outputFile;
  } catch (error) {
    console.error('[Encode] FFmpeg error:', error);
    throw new Error(`Failed to encode video: ${error}`);
  }
}

// Determine preset based on duration
function getPreset(durationMs: number): 'clip' | 'story' | 'cast' {
  const durationSeconds = durationMs / 1000;
  
  if (durationSeconds <= 6) {
    return 'clip';
  } else if (durationSeconds <= 60) {
    return 'story';
  } else {
    return 'cast';
  }
}

// Main rendering function
export async function processRender(
  styleId: string,
  visemes: Viseme[],
  mood: Mood,
  durationMs: number,
  audioFile: string,
  outputDir: string
): Promise<{ mp4Path: string; webmPath?: string }> {
  console.log(`[Render] Starting render: style=${styleId}, mood=${mood}, duration=${durationMs}ms`);

  // Step 1: Determine preset and FPS
  const preset = getPreset(durationMs);
  const fps = preset === 'cast' ? 12 : 15;
  console.log(`[Render] Using preset: ${preset}, FPS: ${fps}`);

  // Step 2: Render frames
  const framesDir = await renderFrames(styleId, visemes, mood, durationMs, outputDir, fps);
  console.log(`[Render] Frames rendered to: ${framesDir}`);

  // Step 3: Encode MP4
  const mp4Path = path.join(outputDir, 'output.mp4');
  await encodeVideo(framesDir, audioFile, mp4Path, preset);
  console.log(`[Render] MP4 encoded: ${mp4Path}`);

  // Step 4: Optionally encode WebM (for Telegram)
  let webmPath: string | undefined;
  try {
    webmPath = path.join(outputDir, 'output.webm');
    await encodeVideo(framesDir, audioFile, webmPath, 'webm');
    console.log(`[Render] WebM encoded: ${webmPath}`);
  } catch (error) {
    console.warn('[Render] WebM encoding failed, continuing with MP4 only:', error);
  }

  return { mp4Path, webmPath };
}

// Worker entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[Render Worker] Starting...');
  
  // In production, this would:
  // 1. Connect to Redis queue
  // 2. Listen for jobs after lipsync stage
  // 3. Process each job
  // 4. Upload to object storage (S3/GCS)
  // 5. Update job status with CDN URLs
  
  console.log('[Render Worker] Ready (stub mode)');
}

