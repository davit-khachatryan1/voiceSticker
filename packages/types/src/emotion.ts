import { Mood } from './index';

export interface EmotionCurve {
  // Head motion (in degrees)
  headYaw: number;    // -30 to +30 degrees
  headPitch: number;  // -20 to +20 degrees
  headRoll: number;   // -15 to +15 degrees
  
  // Eyebrow position (0-1, where 0.5 is neutral)
  eyebrowRaise: number;  // 0-1
  
  // Face scale (1.0 is normal)
  scale: number;  // 0.9-1.1
  
  // Shake intensity (0-1)
  shakeIntensity: number;  // 0-1
  
  // Color saturation multiplier
  colorSaturation: number;  // 0.8-1.2
  
  // Mouth opening intensity (multiplier for viseme shapes)
  mouthIntensity: number;  // 0.8-1.2
}

export interface EmotionPreset {
  mood: Mood;
  baseCurve: EmotionCurve;
  variationRange: {
    headYaw: [number, number];
    headPitch: [number, number];
    eyebrowRaise: [number, number];
    scale: [number, number];
    shakeIntensity: [number, number];
  };
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
      headPitch: -5 * intensity,  // Slight upward tilt
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
      eyebrowRaise: 0.3 - (0.2 * intensity),  // Lowered eyebrows
      scale: 1.0 + (0.03 * intensity),
      shakeIntensity: 0.3 * intensity,
      colorSaturation: 1.2 + (0.1 * intensity),
      mouthIntensity: 1.15 + (0.1 * intensity),
    },
    sad: {
      headYaw: 0,
      headPitch: 10 * intensity,  // Head down
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

export function applyEmotionVariation(
  baseCurve: EmotionCurve,
  time: number,  // Time in seconds
  variationRange: EmotionPreset['variationRange']
): EmotionCurve {
  // Add subtle time-based variation
  const variation = Math.sin(time * 2) * 0.1;  // Subtle oscillation
  
  return {
    ...baseCurve,
    headYaw: baseCurve.headYaw + (variation * (variationRange.headYaw[1] - variationRange.headYaw[0])),
    headPitch: baseCurve.headPitch + (variation * (variationRange.headPitch[1] - variationRange.headPitch[0])),
    eyebrowRaise: Math.max(0, Math.min(1, baseCurve.eyebrowRaise + (variation * (variationRange.eyebrowRaise[1] - variationRange.eyebrowRaise[0])))),
    scale: Math.max(0.9, Math.min(1.1, baseCurve.scale + (variation * (variationRange.scale[1] - variationRange.scale[0])))),
  };
}

