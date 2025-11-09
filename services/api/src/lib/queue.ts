import { RenderJob } from '@voicesticker/types';

// Simple in-memory queue for MVP (replace with Redis/BullMQ later)
const queue: RenderJob[] = [];
const processing = new Set<string>();

export function enqueueJob(job: RenderJob): void {
  queue.push(job);
}

export function dequeueJob(): RenderJob | undefined {
  return queue.shift();
}

export function markProcessing(jobId: string): void {
  processing.add(jobId);
}

export function markComplete(jobId: string): void {
  processing.delete(jobId);
}

export function getQueueLength(): number {
  return queue.length;
}

export function getProcessingCount(): number {
  return processing.size;
}

