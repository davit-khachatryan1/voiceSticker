# VoiceSticker - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Cloudflare Worker (2 min)

```bash
# 1. Sign up: https://dash.cloudflare.com/sign-up
# 2. Create R2 bucket: "voicesticker-media" (make it public)
# 3. Install Wrangler
npm install -g wrangler

# 4. Login
wrangler login

# 5. Deploy Worker
cd worker
npm install
# Edit wrangler.toml - add your bot token later
wrangler deploy
```

**Save Worker URL** (e.g., `https://voicesticker-worker.xxx.workers.dev`)

### Step 2: Deploy Frontend (2 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Telegram WebApp
cd apps/telegram-webapp
echo "NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL" > .env.local
vercel --prod

# Deploy WhatsApp PWA
cd ../whatsapp-pwa
echo "NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL" > .env.local
vercel --prod
```

**Save URLs** (e.g., `https://voicesticker-telegram.vercel.app`)

### Step 3: Telegram Bot (1 min)

1. Message `@BotFather` on Telegram
2. `/newbot` → follow instructions → **save token**
3. `/setinline` → enable inline mode
4. `/setdomain https://YOUR_TELEGRAM_URL` → set your Telegram WebApp URL

### Step 4: Update Worker

Edit `worker/wrangler.toml`:
```toml
TELEGRAM_BOT_TOKEN = "YOUR_TOKEN_FROM_BOTFATHER"
ALLOWED_ORIGINS = "https://YOUR_TELEGRAM_URL,https://YOUR_WHATSAPP_URL"
```

Redeploy:
```bash
cd worker
wrangler deploy
```

### Step 5: Test!

**Telegram:**
- Type `@YourBot` in any chat
- Tap result → record → done!

**WhatsApp:**
- Pin link: `https://YOUR_WHATSAPP_URL` in chat
- Tap link → record → share!

---

## 📱 Usage

### Telegram
1. Type `@YourBot` → tap result
2. Select style & mood
3. Hold record → speak → release
4. Video appears in chat!

### WhatsApp
1. Tap pinned link
2. Select style & mood
3. Hold record → speak → release
4. Share sheet opens → choose WhatsApp → send!

---

## 💰 Cost: $0/month

- Cloudflare Worker: Free (100k requests/day)
- R2 Storage: Free (10GB)
- Vercel: Free (100GB/month)
- Telegram/WhatsApp: Free

---

## 🆘 Troubleshooting

**Worker not working?**
- Check R2 bucket is public
- Verify CORS origins

**Telegram not opening?**
- Check domain set in BotFather
- Must use HTTPS

**WhatsApp share fails?**
- Use HTTPS
- Fallback: download works

---

**Full guide**: See `COMPLETE_SETUP_GUIDE.md`

