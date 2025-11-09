# VoiceSticker - Ultra-Lean Deployment Guide

## Architecture Overview

**Client-Side Only Rendering:**
- Canvas animation + MediaRecorder (no server-side FFmpeg)
- All processing happens in the browser
- Zero GPU/server costs

**Backend:**
- Cloudflare Worker (free tier) for uploads and Telegram API
- R2 storage (cheap/free tier) for video files
- No database needed for MVP

**Frontend:**
- Static pages hosted on Vercel/Netlify (free tier)
- Telegram WebApp: `/tg`
- WhatsApp PWA: `/wa`

## Deployment Steps

### 1. Setup Cloudflare Worker

```bash
cd worker
npm install
```

**Configure `wrangler.toml`:**
```toml
[env.production.vars]
TELEGRAM_BOT_TOKEN = "your_bot_token_here"
ALLOWED_ORIGINS = "https://yourdomain.com,https://yourdomain.vercel.app"
```

**Create R2 Bucket:**
```bash
# In Cloudflare Dashboard:
# 1. Go to R2
# 2. Create bucket: "voicesticker-media"
# 3. Make it public (or use custom domain)
```

**Deploy Worker:**
```bash
npm run deploy
```

### 2. Setup Telegram Bot

1. **Get Bot Token:**
   - Message @BotFather on Telegram
   - `/newbot` → follow instructions
   - Copy bot token

2. **Enable Inline Mode:**
   ```
   /setinline
   ```

3. **Set WebApp Domain:**
   ```
   /setdomain https://yourdomain.com
   ```

4. **Update Worker:**
   - Add bot token to `wrangler.toml`
   - Redeploy worker

### 3. Deploy Frontend (Vercel)

**Telegram WebApp:**
```bash
cd apps/telegram-webapp

# Create .env.local
echo "NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev" > .env.local

# Deploy
vercel --prod
```

**WhatsApp PWA:**
```bash
cd apps/whatsapp-pwa

# Create .env.local
echo "NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev" > .env.local

# Deploy
vercel --prod
```

### 4. Configure Domains

**Telegram:**
- Set domain in BotFather: `/setdomain https://yourdomain.com`
- WebApp URL: `https://yourdomain.com/tg`

**WhatsApp:**
- Pin link in chat descriptions: `https://yourdomain.com/wa`
- Or send as bookmark message

### 5. Test Flow

**Telegram:**
1. Open any chat
2. Type `@YourBot`
3. Tap "Record VoiceSticker"
4. Hold to record → release
5. Video appears as your message

**WhatsApp:**
1. Tap pinned link
2. Select style & mood
3. Hold to record → release
4. Share sheet opens → choose WhatsApp → select chat → send

## File Structure

```
voicesticker/
├── apps/
│   ├── telegram-webapp/     # Static Next.js → Vercel
│   └── whatsapp-pwa/        # Static Next.js → Vercel
├── worker/                  # Cloudflare Worker
│   ├── src/index.ts         # Worker code
│   └── wrangler.toml        # Worker config
└── packages/
    └── types/               # Shared types
```

## Environment Variables

**Worker (wrangler.toml):**
- `TELEGRAM_BOT_TOKEN` - Bot token from BotFather
- `ALLOWED_ORIGINS` - Comma-separated allowed origins

**Frontend (.env.local):**
- `NEXT_PUBLIC_WORKER_URL` - Cloudflare Worker URL

## Cost Breakdown

**Free Tier Limits:**
- Cloudflare Worker: 100,000 requests/day (free)
- R2 Storage: 10GB free, $0.015/GB after
- Vercel: 100GB bandwidth/month (free)
- **Total: ~$0/month for MVP**

## Key Differences from Server-Side Version

1. **No FFmpeg** - Browser MediaRecorder handles encoding
2. **No Workers** - No lip-sync/render workers needed
3. **No Database** - R2 only for file storage
4. **Client-Side Canvas** - Animation rendered in browser
5. **Simple Lip-Sync** - Basic estimation (can upgrade later)

## Production Optimizations

1. **R2 Custom Domain** - Use your own domain for R2 URLs
2. **CDN** - Cloudflare CDN for R2 (automatic)
3. **Compression** - Browser handles WebM compression
4. **Caching** - Static assets cached by Vercel/Cloudflare

## Troubleshooting

**Telegram WebApp not opening:**
- Check domain is set in BotFather
- Verify HTTPS (required)
- Check CORS headers in Worker

**Upload fails:**
- Check R2 bucket exists and is public
- Verify Worker has R2 binding
- Check file size limits (100MB)

**WhatsApp share not working:**
- Check Web Share API support
- Fallback to download works on all browsers
- iOS requires HTTPS

## Next Steps

1. ✅ Deploy Worker
2. ✅ Deploy Frontend
3. ✅ Configure Bot
4. ✅ Test Telegram flow
5. ✅ Test WhatsApp flow
6. ⏳ Add more character styles
7. ⏳ Improve lip-sync accuracy
8. ⏳ Add Lottie animations

## Support

- Worker logs: `wrangler tail`
- Vercel logs: Dashboard → Deployments → Logs
- Telegram: Check BotFather commands

