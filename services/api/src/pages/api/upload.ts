import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'tmp', 'uploads'),
      keepExtensions: true,
    });

    // Ensure upload directory exists
    await fs.mkdir(path.join(process.cwd(), 'tmp', 'uploads'), { recursive: true });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Validate file type
    const allowedMimeTypes = [
      'audio/webm',
      'audio/opus',
      'audio/wav',
      'audio/mp4',
      'audio/mpeg',
      'video/webm', // Some browsers record as video/webm
    ];

    const fileMimeType = file.mimetype || '';
    if (!allowedMimeTypes.some((type) => fileMimeType.includes(type))) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only audio files are allowed.',
        receivedType: fileMimeType,
      });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 100MB.',
        size: file.size,
      });
    }

    // In production, upload to S3/GCS and return CDN URL
    // For now, return a temporary URL
    const fileUrl = `/tmp/uploads/${path.basename(file.filepath)}`;
    
    console.log(`[UPLOAD] File uploaded: ${file.originalFilename}, size: ${file.size}, type: ${fileMimeType}`);

    return res.status(200).json({
      url: fileUrl,
      filename: file.originalFilename || 'recording.webm',
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}

