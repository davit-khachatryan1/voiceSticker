import { v4 as uuidv4 } from 'uuid';
import { RenderJob, CreateJobInput } from '@voicesticker/types';
import { logJobCreated, logJobStatusChange } from './metrics';

// In-memory store for MVP (replace with Postgres later)
const jobs = new Map<string, RenderJob>();

export function createJob(input: CreateJobInput): RenderJob {
  const job: RenderJob = {
    id: uuidv4(),
    status: 'queued',
    styleId: input.styleId,
    mood: input.mood,
    durationMs: input.durationMs,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(job.id, job);
  logJobCreated(job);
  return job;
}

export function getJob(jobId: string): RenderJob | undefined {
  return jobs.get(jobId);
}

export function updateJob(jobId: string, updates: Partial<RenderJob>): RenderJob | undefined {
  const job = jobs.get(jobId);
  if (!job) return undefined;

  const oldStatus = job.status;
  const updated = {
    ...job,
    ...updates,
    updatedAt: new Date(),
  };

  jobs.set(jobId, updated);

  // Log status changes for metrics
  if (updates.status && updates.status !== oldStatus) {
    logJobStatusChange(jobId, oldStatus, updates.status, {
      outputMp4Url: updated.outputMp4Url,
      outputWebmUrl: updated.outputWebmUrl,
      sizeBytes: updated.sizeBytes,
      error: updated.error,
    });
  }

  return updated;
}

export function getAllJobs(): RenderJob[] {
  return Array.from(jobs.values());
}

