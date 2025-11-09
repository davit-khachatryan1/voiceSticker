import type { NextApiRequest, NextApiResponse } from 'next';
import { getJob } from '@/lib/jobs';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Job ID required' });
  }

  const job = getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Calculate progress
  const progress = calculateProgress(job.status);

  const response = {
    status: job.status,
    progress,
    outputMp4Url: job.outputMp4Url,
    outputWebmUrl: job.outputWebmUrl,
    parts: job.parts,
    error: job.error,
  };

  return res.status(200).json(response);
}

function calculateProgress(status: string): number {
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
    default:
      return 0;
  }
}

