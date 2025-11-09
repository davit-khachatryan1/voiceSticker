import type { NextApiRequest, NextApiResponse } from 'next';
import { CreateJobInput, RenderJob } from '@voicesticker/types';
import { createJob, getJob } from '@/lib/jobs';
import { enqueueJob } from '@/lib/queue';
import { checkUserRateLimit, checkChatRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const input: CreateJobInput = req.body;

      // Validate input
      if (!input.styleId || !input.mood || !input.audioUrl || !input.durationMs || !input.platform) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Rate limiting
      if (input.userId) {
        const userLimit = checkUserRateLimit(input.userId);
        if (!userLimit.allowed) {
          res.setHeader('X-RateLimit-Limit', '30');
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(userLimit.resetTime).toISOString());
          return res.status(429).json({ 
            error: 'Rate limit exceeded',
            resetTime: userLimit.resetTime,
          });
        }
        // Set rate limit headers
        Object.entries(getRateLimitHeaders(userLimit)).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      // Create job
      const job = createJob(input);
      
      // Enqueue for processing
      enqueueJob(job);

      return res.status(201).json({ jobId: job.id });
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    const { id } = req.query;

    if (id && typeof id === 'string') {
      const job = getJob(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Return job status
      const response = {
        status: job.status,
        progress: calculateProgress(job.status),
        outputMp4Url: job.outputMp4Url,
        outputWebmUrl: job.outputWebmUrl,
        parts: job.parts,
        error: job.error,
      };

      return res.status(200).json(response);
    }

    return res.status(400).json({ error: 'Job ID required' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function calculateProgress(status: RenderJob['status']): number {
  switch (status) {
    case 'queued':
      return 0;
    case 'lipsync':
      return 25;
    case 'render':
      return 50;
    case 'encode':
      return 75;
    case 'done':
      return 100;
    case 'error':
      return 0;
  }
}

