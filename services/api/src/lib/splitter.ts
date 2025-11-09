// Audio splitting for long recordings

import { RenderPart } from '@voicesticker/types';
import { estimateBitrate, shouldSplitAudio } from './bitrate';

export interface SplitPlan {
  parts: Array<{
    startMs: number;
    endMs: number;
    durationMs: number;
  }>;
  totalParts: number;
}

export function planSplit(
  durationMs: number,
  maxSizeMB: number = 100,
  maxDurationMs: number = 60 * 1000  // 60 seconds per part
): SplitPlan | null {
  if (!shouldSplitAudio(durationMs, maxSizeMB)) {
    return null;
  }
  
  const parts: SplitPlan['parts'] = [];
  let currentStart = 0;
  
  while (currentStart < durationMs) {
    const partDuration = Math.min(maxDurationMs, durationMs - currentStart);
    parts.push({
      startMs: currentStart,
      endMs: currentStart + partDuration,
      durationMs: partDuration,
    });
    currentStart += partDuration;
  }
  
  return {
    parts,
    totalParts: parts.length,
  };
}

export function createRenderParts(
  splitPlan: SplitPlan,
  baseUrl: string
): RenderPart[] {
  return splitPlan.parts.map((part, index) => ({
    idx: index + 1,
    startMs: part.startMs,
    endMs: part.endMs,
    url: `${baseUrl}/part-${index + 1}.mp4`,
    sizeBytes: 0,  // Will be filled after encoding
  }));
}

