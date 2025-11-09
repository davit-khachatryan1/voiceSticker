export type Mood = 'angry' | 'happy' | 'sad' | 'sarcastic' | 'neutral';

export interface CreateJobInput {
  styleId: string;
  mood: Mood;
  audioUrl: string;      // uploaded temp blob
  durationMs: number;
  userId?: string;       // optional anonymous
  platform: 'telegram' | 'whatsapp';
}

export interface RenderJob {
  id: string;
  status: 'queued' | 'lipsync' | 'render' | 'encode' | 'done' | 'error';
  styleId: string;
  mood: Mood;
  durationMs: number;
  visemes?: Viseme[];
  outputMp4Url?: string;
  outputWebmUrl?: string; // for TG if needed
  sizeBytes?: number;
  parts?: RenderPart[];   // for long audio split
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Viseme {
  t: number; // time in milliseconds
  shape: 'A' | 'E' | 'I' | 'O' | 'U' | 'W' | 'L' | 'M';
}

export interface RenderPart {
  idx: number;
  startMs: number;
  endMs: number;
  url: string;
  sizeBytes: number;
}

export interface JobProgress {
  jobId: string;
  status: RenderJob['status'];
  progress: number; // 0-100
  event: 'progress' | 'done' | 'error';
  urls?: {
    mp4?: string;
    webm?: string;
  };
  error?: string;
}

export interface CachedRender {
  jobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  styleId: string;
  mood: Mood;
  durationMs: number;
}

// Re-export emotion types
export * from './emotion';

