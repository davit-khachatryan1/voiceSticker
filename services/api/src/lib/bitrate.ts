// Bitrate estimation and preset selection

export interface BitrateEstimate {
  videoBitrate: number;  // kbps
  audioBitrate: number;  // kbps
  fps: number;
  preset: 'clip' | 'story' | 'cast';
  estimatedSizeMB: number;
}

export function estimateBitrate(
  durationMs: number,
  targetSizeMB: number = 1.5
): BitrateEstimate {
  const durationSeconds = durationMs / 1000;
  
  // Target total bitrate (video + audio) in kbps
  const targetTotalBitrate = (targetSizeMB * 8 * 1024) / durationSeconds;
  
  // Determine preset based on duration
  let preset: 'clip' | 'story' | 'cast';
  let fps: number;
  let videoBitrate: number;
  let audioBitrate: number;
  
  if (durationSeconds <= 6) {
    preset = 'clip';
    fps = 15;
    videoBitrate = Math.min(800, Math.max(400, targetTotalBitrate * 0.9));
    audioBitrate = 64;
  } else if (durationSeconds <= 60) {
    preset = 'story';
    fps = 15;
    videoBitrate = Math.min(550, Math.max(300, targetTotalBitrate * 0.9));
    audioBitrate = 56;
  } else {
    preset = 'cast';
    fps = 12;
    videoBitrate = Math.min(400, Math.max(200, targetTotalBitrate * 0.9));
    audioBitrate = 56;
  }
  
  // Calculate estimated size
  const totalBitrate = videoBitrate + audioBitrate;
  const estimatedSizeMB = (totalBitrate * durationSeconds) / (8 * 1024);
  
  return {
    videoBitrate,
    audioBitrate,
    fps,
    preset,
    estimatedSizeMB,
  };
}

export function selectPresetForSize(
  durationMs: number,
  maxSizeMB: number
): 'clip' | 'story' | 'cast' {
  const durationSeconds = durationMs / 1000;
  
  // Try clip preset
  const clipEstimate = estimateBitrate(durationMs, maxSizeMB);
  if (clipEstimate.preset === 'clip' && clipEstimate.estimatedSizeMB <= maxSizeMB) {
    return 'clip';
  }
  
  // Try story preset
  const storyEstimate = estimateBitrate(durationMs, maxSizeMB);
  if (storyEstimate.preset === 'story' && storyEstimate.estimatedSizeMB <= maxSizeMB) {
    return 'story';
  }
  
  // Default to cast (lowest bitrate)
  return 'cast';
}

export function shouldSplitAudio(durationMs: number, maxSizeMB: number = 100): boolean {
  const durationSeconds = durationMs / 1000;
  const estimate = estimateBitrate(durationMs, maxSizeMB);
  
  // If estimated size exceeds max, or duration > 5 minutes, split
  return estimate.estimatedSizeMB > maxSizeMB || durationSeconds > 300;
}

