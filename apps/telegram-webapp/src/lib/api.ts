// API client for Cloudflare Worker
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://your-worker.workers.dev';

export async function uploadToWorker(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, 'voicesticker.webm');

  const response = await fetch(`${WORKER_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload');
  }

  const data = await response.json();
  return data.url;
}

export async function answerTelegramQuery(params: {
  queryId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number;
}): Promise<void> {
  const response = await fetch(`${WORKER_URL}/tg/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to answer query' }));
    throw new Error(error.error || 'Failed to answer Telegram query');
  }
}
