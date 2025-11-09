// Basic metrics and logging for job lifecycle
import { RenderJob } from '@voicesticker/types';

export interface JobMetrics {
  jobId: string;
  event: 'created' | 'lipsync_done' | 'render_done' | 'encode_done' | 'sent' | 'error';
  timestamp: Date;
  duration?: number; // milliseconds
  metadata?: Record<string, unknown>;
}

const metrics: JobMetrics[] = [];

export function logJobEvent(
  jobId: string,
  event: JobMetrics['event'],
  metadata?: Record<string, unknown>
): void {
  const metric: JobMetrics = {
    jobId,
    event,
    timestamp: new Date(),
    metadata,
  };

  metrics.push(metric);
  console.log(`[METRICS] ${event}:`, JSON.stringify(metric));
}

export function logJobCreated(job: RenderJob): void {
  logJobEvent(job.id, 'created', {
    styleId: job.styleId,
    mood: job.mood,
    durationMs: job.durationMs,
    platform: job.platform,
  });
}

export function logJobStatusChange(
  jobId: string,
  oldStatus: RenderJob['status'],
  newStatus: RenderJob['status'],
  metadata?: Record<string, unknown>
): void {
  const eventMap: Record<RenderJob['status'], JobMetrics['event'] | null> = {
    queued: null,
    lipsync: null,
    render: null,
    encode: null,
    done: 'encode_done',
    error: 'error',
  };

  if (newStatus === 'lipsync' && oldStatus === 'queued') {
    logJobEvent(jobId, 'lipsync_done', metadata);
  } else if (newStatus === 'render' && oldStatus === 'lipsync') {
    logJobEvent(jobId, 'render_done', metadata);
  } else if (newStatus === 'encode' && oldStatus === 'render') {
    logJobEvent(jobId, 'encode_done', metadata);
  } else if (newStatus === 'done') {
    logJobEvent(jobId, 'sent', metadata);
  } else if (newStatus === 'error') {
    logJobEvent(jobId, 'error', metadata);
  }
}

export function getJobMetrics(jobId: string): JobMetrics[] {
  return metrics.filter((m) => m.jobId === jobId);
}

export function getAllMetrics(): JobMetrics[] {
  return [...metrics];
}

export function getMetricsSummary(): {
  total: number;
  byEvent: Record<string, number>;
  recentErrors: JobMetrics[];
} {
  const byEvent: Record<string, number> = {};
  const recentErrors: JobMetrics[] = [];

  metrics.forEach((metric) => {
    byEvent[metric.event] = (byEvent[metric.event] || 0) + 1;
    if (metric.event === 'error') {
      recentErrors.push(metric);
    }
  });

  // Get last 10 errors
  recentErrors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  recentErrors.splice(10);

  return {
    total: metrics.length,
    byEvent,
    recentErrors,
  };
}

