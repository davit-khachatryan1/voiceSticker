import { Viseme, Mood } from '@voicesticker/types';
import { getEmotionCurve, applyEmotionVariation, EmotionCurve } from '@voicesticker/types';

export function applyEmotionToVisemes(
  visemes: Viseme[],
  mood: Mood,
  durationMs: number
): Viseme[] {
  const durationSeconds = durationMs / 1000;
  const baseCurve = getEmotionCurve(mood, 1.0);
  
  // Apply emotion curves to visemes
  return visemes.map((viseme, index) => {
    const time = viseme.t / 1000; // Convert to seconds
    const intensity = calculateIntensityAtTime(time, durationSeconds, mood);
    const curve = getEmotionCurve(mood, intensity);
    
    // Modify viseme shape based on emotion
    let shape = viseme.shape;
    
    // Happy: wider mouth shapes
    if (mood === 'happy') {
      if (shape === 'A' || shape === 'O') {
        // Make vowels more open
        shape = shape === 'A' ? 'O' : 'A';
      }
    }
    
    // Angry: tighter, more intense shapes
    if (mood === 'angry') {
      if (shape === 'E' || shape === 'I') {
        // Make consonants more pronounced
        shape = 'E';
      }
    }
    
    // Sad: smaller, less expressive shapes
    if (mood === 'sad') {
      if (shape === 'O' || shape === 'A') {
        // Reduce vowel openness
        shape = 'E';
      }
    }
    
    return {
      ...viseme,
      shape,
      // Store emotion curve data for renderer
      emotionIntensity: intensity,
    } as Viseme & { emotionIntensity: number };
  });
}

function calculateIntensityAtTime(time: number, duration: number, mood: Mood): number {
  // Base intensity
  let intensity = 1.0;
  
  // Vary intensity over time based on mood
  if (mood === 'angry') {
    // Angry starts strong, peaks in middle
    const progress = time / duration;
    intensity = 0.8 + (0.4 * Math.sin(progress * Math.PI));
  } else if (mood === 'happy') {
    // Happy is consistent but slightly varying
    intensity = 0.9 + (0.2 * Math.sin(time * 3));
  } else if (mood === 'sad') {
    // Sad starts low, stays low
    intensity = 0.7 + (0.1 * Math.sin(time * 2));
  }
  
  return Math.max(0.5, Math.min(1.5, intensity));
}

export function getEmotionCurveForFrame(
  mood: Mood,
  time: number,
  duration: number
): EmotionCurve {
  const intensity = calculateIntensityAtTime(time, duration, mood);
  const baseCurve = getEmotionCurve(mood, intensity);
  
  // Add time-based variation
  const variationRange = {
    headYaw: [-5, 5] as [number, number],
    headPitch: [-3, 3] as [number, number],
    eyebrowRaise: [0.4, 0.6] as [number, number],
    scale: [0.98, 1.02] as [number, number],
    shakeIntensity: [0, 0.1] as [number, number],
  };
  
  return applyEmotionVariation(baseCurve, time, { mood, baseCurve, variationRange });
}

