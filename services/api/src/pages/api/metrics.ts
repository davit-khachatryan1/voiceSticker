import type { NextApiRequest, NextApiResponse } from 'next';
import { getMetricsSummary, getJobMetrics } from '@/lib/metrics';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobId } = req.query;

    if (jobId && typeof jobId === 'string') {
      // Get metrics for specific job
      const metrics = getJobMetrics(jobId);
      return res.status(200).json({ jobId, metrics });
    }

    // Get summary metrics
    const summary = getMetricsSummary();
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error getting metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

