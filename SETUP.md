# VoiceSticker Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Shared Packages

```bash
npm run build
```

This builds the `@voicesticker/types` package which is required by other packages.

### 3. Configure Environment Variables

#### API Service (`services/api/.env.local`)
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

#### Telegram WebApp (`apps/telegram-webapp/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Development Servers

In separate terminals:

```bash
# Terminal 1: API Service (Port 3001)
cd services/api
npm run dev

# Terminal 2: Telegram WebApp (Port 3000)
cd apps/telegram-webapp
npm run dev
```

Or use Turborepo to run both:

```bash
npm run dev
```

## Project Structure

```
voicesticker/
├── apps/
│   └── telegram-webapp/     # Telegram WebApp (Next.js)
├── services/
│   ├── api/                  # Render API (Next.js)
│   ├── worker-lipsync/      # LipSync worker (Node/TS)
│   └── worker-render/        # Render worker (Node/TS)
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── ui/                   # Shared React components
│   └── ffmpeg-presets/       # FFmpeg encoding scripts
└── infra/                    # Infrastructure (future)
```

## Development Workflow

1. **Make changes** to any package
2. **Build** if needed: `npm run build`
3. **Test** locally: `npm run dev`
4. **Type check**: `npm run typecheck`
5. **Lint**: `npm run lint`

## Key Features Implemented (Sprint 1)

✅ **Monorepo Setup**
- Turborepo configuration
- npm workspaces
- Shared packages

✅ **API Service**
- `POST /api/jobs` - Create render job
- `GET /api/jobs/:id` - Get job status
- `WS /api/ws` - WebSocket for real-time progress
- `POST /api/tg/init` - Validate Telegram initData
- `POST /api/tg/answer` - Answer Telegram WebApp query
- `POST /api/upload` - Upload audio files

✅ **Telegram WebApp**
- Record button (hold-to-record)
- Style picker (Bear, Cat)
- Mood selector (neutral, happy, angry, sad, sarcastic)
- Progress tracking
- WebSocket integration for real-time updates

✅ **Workers**
- LipSync worker (ASR stub + viseme mapper)
- Render worker (Lottie stub + FFmpeg integration)

✅ **FFmpeg Presets**
- `clip-512.sh` - Short clips (0-6s)
- `story-512.sh` - Story clips (7-60s)
- `cast-512.sh` - Long form (60s+)
- `webm-512.sh` - WebM for Telegram

## Next Steps (Sprint 2)

- [ ] Implement real ASR service integration
- [ ] Implement Lottie animation rendering
- [ ] Add emotion curves
- [ ] Implement auto-split for long audio
- [ ] Add WhatsApp PWA
- [ ] Add rate limiting
- [ ] Add retry & caching

## Testing

### Manual Testing

1. Start both services
2. Open Telegram WebApp (requires Telegram bot setup)
3. Select style and mood
4. Hold record button
5. Release to send
6. Monitor progress via WebSocket

### API Testing

```bash
# Create a job
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "styleId": "bear",
    "mood": "happy",
    "audioUrl": "http://example.com/audio.webm",
    "durationMs": 5000,
    "platform": "telegram"
  }'

# Get job status
curl http://localhost:3001/api/jobs/{jobId}
```

## Troubleshooting

### Port Already in Use
Change ports in `package.json` scripts or use environment variables.

### Type Errors
Run `npm run build` in the root to build shared packages first.

### WebSocket Connection Issues
Ensure Socket.IO server is running on the API service.

### FFmpeg Not Found
Install FFmpeg:
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt install ffmpeg`
- Windows: Download from https://ffmpeg.org/

## Production Deployment

1. Set up environment variables
2. Configure CDN (S3/GCS)
3. Set up Redis for queues
4. Set up Postgres for job storage
5. Deploy workers (Docker/K8s)
6. Deploy API service
7. Deploy WebApp (Vercel/Netlify)

