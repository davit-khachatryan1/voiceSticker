import type { NextApiRequest } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';
import { Server } from 'socket.io';
import { getJob, updateJob } from '@/lib/jobs';
import { JobProgress, RenderJob } from '@voicesticker/types';

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO;
}

let io: IOServer | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('*First use, starting Socket.IO');

    io = new Server(res.socket.server, {
      path: '/api/ws',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe', (jobId: string) => {
        console.log('Subscribing to job:', jobId);
        socket.join(`job:${jobId}`);

        // Send current status immediately
        const job = getJob(jobId);
        if (job) {
          const progress: JobProgress = {
            jobId: job.id,
            status: job.status,
            progress: calculateProgress(job.status),
            event: job.status === 'done' ? 'done' : job.status === 'error' ? 'error' : 'progress',
            urls: {
              mp4: job.outputMp4Url,
              webm: job.outputWebmUrl,
            },
            error: job.error,
          };
          socket.emit('progress', progress);
        }
      });

      socket.on('unsubscribe', (jobId: string) => {
        console.log('Unsubscribing from job:', jobId);
        socket.leave(`job:${jobId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO already running');
  }
  res.end();
}

export function broadcastJobProgress(jobId: string, progress: JobProgress) {
  if (io) {
    io.to(`job:${jobId}`).emit('progress', progress);
  }
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

