# VoiceSticker - Ultra-Lean Deployment (Client-Side Only)

## 🎯 Architecture

**Zero Server Costs:**
- ✅ Client-side canvas rendering
- ✅ Browser MediaRecorder (no FFmpeg)
- ✅ Cloudflare Worker (free tier)
- ✅ R2 storage (10GB free)
- ✅ Static hosting (Vercel free)

## 📦 What's Included

### Frontend Apps (Static)
- **Telegram WebApp** (`apps/telegram-webapp`) - Canvas + MediaRecorder
- **WhatsApp PWA** (`apps/whatsapp-pwa`) - Same + Web Share API

### Backend (Cloudflare Worker)
- **Worker** (`worker/`) - Upload to R2 + Telegram API

### Shared
- **Types** (`packages/types`) - TypeScript types

## 🚀 Quick Deploy

### 1. Cloudflare Worker

```bash
cd worker
npm install

# Edit wrangler.toml with your bot token
npm run deploy
```

### 2. Frontend (Vercel)

```bash
# Telegram WebApp
cd apps/telegram-webapp
echo "NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev" > .env.local
vercel --prod

# WhatsApp PWA  
cd apps/whatsapp-pwa
echo "NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev" > .env.local
vercel --prod
```

### 3. Telegram Bot Setup

```
/newbot → get token
/setinline → enable inline mode
/setdomain https://yourdomain.com → set domain
```

## 💰 Cost: ~$0/month

- Cloudflare Worker: 100k requests/day free
- R2: 10GB free
- Vercel: 100GB bandwidth/month free

## 📝 Key Features

✅ **Client-Side Rendering**
- Canvas animation in browser
- MediaRecorder combines canvas + mic
- No server-side processing

✅ **Simple Lip-Sync**
- Basic viseme estimation
- Emotion curves applied
- Can upgrade to Web Speech API later

✅ **Zero Infrastructure**
- No databases
- No queues
- No workers (except upload)

## 🔧 How It Works

1. **User records** → Canvas animates + mic records
2. **MediaRecorder** → Combines into WebM video
3. **Upload** → Cloudflare Worker → R2 storage
4. **Telegram** → Worker calls `answerWebAppQuery`
5. **WhatsApp** → Web Share API → user selects chat

## 📚 Documentation

See `DEPLOYMENT.md` for detailed setup instructions.

