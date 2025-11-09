// Inline types for standalone deployment
export type Mood = 'angry' | 'happy' | 'sad' | 'sarcastic' | 'neutral';

export interface Viseme {
  t: number; // time in milliseconds
  shape: 'A' | 'E' | 'I' | 'O' | 'U' | 'W' | 'L' | 'M';
}

export interface EmotionCurve {
  headYaw: number;
  headPitch: number;
  headRoll: number;
  eyebrowRaise: number;
  scale: number;
  shakeIntensity: number;
  colorSaturation: number;
  mouthIntensity: number;
}

export function getEmotionCurve(mood: Mood, intensity: number = 1.0): EmotionCurve {
  const presets: Record<Mood, EmotionCurve> = {
    neutral: {
      headYaw: 0,
      headPitch: 0,
      headRoll: 0,
      eyebrowRaise: 0.5,
      scale: 1.0,
      shakeIntensity: 0,
      colorSaturation: 1.0,
      mouthIntensity: 1.0,
    },
    happy: {
      headYaw: 5 * intensity,
      headPitch: -5 * intensity,
      headRoll: 0,
      eyebrowRaise: 0.6 + (0.2 * intensity),
      scale: 1.0 + (0.05 * intensity),
      shakeIntensity: 0.1 * intensity,
      colorSaturation: 1.1 + (0.1 * intensity),
      mouthIntensity: 1.1 + (0.1 * intensity),
    },
    angry: {
      headYaw: -10 * intensity,
      headPitch: 5 * intensity,
      headRoll: 2 * intensity,
      eyebrowRaise: 0.3 - (0.2 * intensity),
      scale: 1.0 + (0.03 * intensity),
      shakeIntensity: 0.3 * intensity,
      colorSaturation: 1.2 + (0.1 * intensity),
      mouthIntensity: 1.15 + (0.1 * intensity),
    },
    sad: {
      headYaw: 0,
      headPitch: 10 * intensity,
      headRoll: -3 * intensity,
      eyebrowRaise: 0.4 - (0.15 * intensity),
      scale: 0.95 - (0.05 * intensity),
      shakeIntensity: 0,
      colorSaturation: 0.85 - (0.1 * intensity),
      mouthIntensity: 0.9 - (0.1 * intensity),
    },
    sarcastic: {
      headYaw: 15 * intensity,
      headPitch: -3 * intensity,
      headRoll: 5 * intensity,
      eyebrowRaise: 0.55 + (0.1 * intensity),
      scale: 1.0,
      shakeIntensity: 0.05 * intensity,
      colorSaturation: 1.0,
      mouthIntensity: 0.95,
    },
  };

  return presets[mood];
}

function calculateIntensityAtTime(time: number, duration: number, mood: Mood): number {
  let intensity = 1.0;
  
  if (mood === 'angry') {
    const progress = time / duration;
    intensity = 0.8 + (0.4 * Math.sin(progress * Math.PI));
  } else if (mood === 'happy') {
    intensity = 0.9 + (0.2 * Math.sin(time * 3));
  } else if (mood === 'sad') {
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
  return getEmotionCurve(mood, intensity);
}

export function applyEmotionToVisemes(
  visemes: Viseme[],
  mood: Mood,
  durationMs: number
): Viseme[] {
  const durationSeconds = durationMs / 1000;
  
  return visemes.map((viseme) => {
    const time = viseme.t / 1000;
    const intensity = calculateIntensityAtTime(time, durationSeconds, mood);
    
    let shape = viseme.shape;
    
    if (mood === 'happy') {
      if (shape === 'A' || shape === 'O') {
        shape = shape === 'A' ? 'O' : 'A';
      }
    } else if (mood === 'angry') {
      if (shape === 'E' || shape === 'I') {
        shape = 'E';
      }
    } else if (mood === 'sad') {
      if (shape === 'O' || shape === 'A') {
        shape = 'E';
      }
    }
    
    return { ...viseme, shape };
  });
}

