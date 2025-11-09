// API client for WhatsApp PWA
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
