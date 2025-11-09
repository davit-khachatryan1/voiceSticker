// Client-side lip-sync using Web Speech API or simple phoneme estimation
import { Viseme, Mood, applyEmotionToVisemes } from '@/types';

export async function estimatePhonemesFromAudio(
  audioBlob: Blob,
  durationMs: number
): Promise<Viseme[]> {
  const durationSeconds = durationMs / 1000;
  const fps = 15;
  const frameCount = Math.ceil(durationSeconds * fps);
  const frameDuration = durationMs / frameCount;

  const visemes: Viseme[] = [];
  const patterns: Viseme['shape'][] = ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'W'];
  
  for (let i = 0; i < frameCount; i++) {
    const time = i * frameDuration;
    const patternIndex = Math.floor((i / 10) % patterns.length);
    visemes.push({
      t: time,
      shape: patterns[patternIndex],
    });
  }

  return visemes;
}

export async function processClientLipSync(
  audioBlob: Blob,
  mood: Mood,
  durationMs: number
): Promise<Viseme[]> {
  let visemes = await estimatePhonemesFromAudio(audioBlob, durationMs);
  visemes = applyEmotionToVisemes(visemes, mood, durationMs);
  return visemes;
}
