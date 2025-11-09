// Client-side lip-sync using Web Speech API or simple phoneme estimation
import { Viseme, Mood } from '@voicesticker/types';
import { applyEmotionToVisemes } from '@voicesticker/types';

// Simple phoneme estimation based on audio analysis
// In production, you could use Web Speech API or send to a lightweight ASR service
export async function estimatePhonemesFromAudio(
  audioBlob: Blob,
  durationMs: number
): Promise<Viseme[]> {
  // For MVP: Generate simple viseme sequence based on duration
  // In production: Use Web Speech API or send to Cloudflare Worker for ASR
  
  const durationSeconds = durationMs / 1000;
  const fps = 15;
  const frameCount = Math.ceil(durationSeconds * fps);
  const frameDuration = durationMs / frameCount;

  // Generate a simple viseme sequence (alternating patterns)
  const visemes: Viseme[] = [];
  const patterns: Viseme['shape'][] = ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'W'];
  
  for (let i = 0; i < frameCount; i++) {
    const time = i * frameDuration;
    // Simple pattern - in production, use actual phoneme detection
    const patternIndex = Math.floor((i / 10) % patterns.length);
    visemes.push({
      t: time,
      shape: patterns[patternIndex],
    });
  }

  return visemes;
}

// Alternative: Use Web Speech API (if available)
export async function useWebSpeechAPI(
  audioBlob: Blob
): Promise<Viseme[]> {
  return new Promise((resolve) => {
    // Note: Web Speech API requires user interaction and may not be available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback to estimation
      resolve([]);
      return;
    }

    // This is a placeholder - Web Speech API works with live audio, not blobs
    // For production, you'd need to play the audio and capture recognition
    resolve([]);
  });
}

export async function processClientLipSync(
  audioBlob: Blob,
  mood: Mood,
  durationMs: number
): Promise<Viseme[]> {
  // Step 1: Estimate phonemes (simple version)
  let visemes = await estimatePhonemesFromAudio(audioBlob, durationMs);
  
  // Step 2: Apply emotion curves
  visemes = applyEmotionToVisemes(visemes, mood, durationMs);
  
  return visemes;
}

