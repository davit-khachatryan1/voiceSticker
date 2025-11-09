# VoiceSticker 🎤

VoiceSticker is a platform that lets users send animated "sticker-looking" clips with their own voice in Telegram and WhatsApp chats. The video is generated client-side using canvas animation + MediaRecorder - **zero server costs, zero GPU needed**.

## 🚀 Quick Start

**5-minute setup:**
1. Deploy Cloudflare Worker (free)
2. Deploy frontend to Vercel (free)
3. Setup Telegram bot
4. Start creating voice stickers!

👉 **See [QUICK_START.md](./QUICK_START.md) for fast setup**  
👉 **See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for detailed instructions**

## 💰 Cost: $0/month

- Cloudflare Worker: 100k requests/day (free)
- R2 Storage: 10GB (free)
- Vercel: 100GB bandwidth/month (free)
- **Total: ~$0/month for MVP**

## Project Structure

This is a monorepo managed with Turborepo and npm workspaces:

```
voicesticker/
  apps/
    telegram-webapp/       # Next.js WebApp for Telegram
    whatsapp-pwa/          # Next.js PWA for WhatsApp (future)
  services/
    api/                   # Next.js API (REST + WebSocket)
    worker-lipsync/        # ASR → phoneme → viseme worker
    worker-render/         # Lottie rendering + FFmpeg encoding worker
  packages/
    ui/                    # Shared React components
    types/                 # Shared TypeScript types
    ffmpeg-presets/        # FFmpeg encoding scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FFmpeg (for rendering workers)

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run development servers
npm run dev
```

### Development

The monorepo uses Turborepo for task orchestration:

- `npm run dev` - Start all dev servers
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run typecheck` - Type check all packages

### Individual Services

#### API Service (Port 3001)
```bash
cd services/api
npm run dev
```

#### Telegram WebApp (Port 3000)
```bash
cd apps/telegram-webapp
npm run dev
```

#### Workers
```bash
cd services/worker-lipsync
npm run dev

cd services/worker-render
npm run dev
```

## Environment Variables

Create `.env.local` files in each service:

### services/api/.env.local
```
TELEGRAM_BOT_TOKEN=your_bot_token
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/voicesticker
```

### apps/telegram-webapp/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Architecture

1. **User records audio** in Telegram WebApp or WhatsApp PWA
2. **Audio uploaded** to temporary storage
3. **Render job created** via API
4. **LipSync worker** processes audio → extracts phonemes → converts to visemes
5. **Render worker** generates frames from Lottie animation using visemes
6. **FFmpeg encodes** frames + audio → MP4/WebM
7. **Video uploaded** to CDN
8. **Result sent** back to chat (Telegram via `answerWebAppQuery`, WhatsApp via Web Share)

## Sprint 1 Status

✅ Monorepo setup
✅ Shared types package
✅ Render API with `/jobs` endpoints
✅ WebSocket support for real-time progress
✅ LipSync worker (ASR stub + viseme mapper)
✅ Render worker (Lottie stub + FFmpeg presets)
✅ FFmpeg presets (clip/story/cast/webm)
✅ Telegram WebApp UI (record button, progress)
✅ Telegram integration (HMAC validation, answerWebAppQuery)

## Next Steps (Sprint 2)

- [ ] Emotion curves implementation
- [ ] Bitrate estimator + preset ladder
- [ ] Auto-splitter for long audio
- [ ] WhatsApp PWA
- [ ] Rate limiting
- [ ] Retry & caching

## License

MIT
