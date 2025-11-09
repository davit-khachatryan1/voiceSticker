# Environment Variables Setup Guide

## 📋 Where to Set Environment Variables

### 1. Telegram WebApp (`apps/telegram-webapp/.env.local`)

```bash
NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL.workers.dev
```

**How to get Worker URL:**
1. Deploy worker: `cd worker && wrangler deploy`
2. Copy the URL from output (e.g., `https://voicesticker-worker.xxx.workers.dev`)

---

### 2. WhatsApp PWA (`apps/whatsapp-pwa/.env.local`)

```bash
NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL.workers.dev
```

**Use the same Worker URL as Telegram**

---

### 3. Cloudflare Worker (`worker/wrangler.toml`)

Edit `worker/wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
TELEGRAM_BOT_TOKEN = "your_bot_token_from_botfather"
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

**After deploying frontends, update ALLOWED_ORIGINS with your actual Vercel URLs**

---

## 🔧 Setup Steps

### Step 1: Deploy Worker First

```bash
cd worker
# Edit wrangler.toml with your bot token
wrangler deploy
# Save the Worker URL
```

### Step 2: Update Frontend .env Files

**Telegram WebApp:**
```bash
cd apps/telegram-webapp
# Edit .env.local - replace YOUR_WORKER_URL
```

**WhatsApp PWA:**
```bash
cd apps/whatsapp-pwa
# Edit .env.local - replace YOUR_WORKER_URL
```

### Step 3: Deploy Frontends

```bash
# Telegram
cd apps/telegram-webapp
vercel --prod

# WhatsApp
cd apps/whatsapp-pwa
vercel --prod
```

### Step 4: Update Worker CORS

After both frontends are deployed, update `worker/wrangler.toml`:

```toml
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

Redeploy worker:
```bash
cd worker
wrangler deploy
```

---

## 📝 Environment Variables Summary

| Location | Variable | Value | Notes |
|----------|----------|-------|-------|
| `apps/telegram-webapp/.env.local` | `NEXT_PUBLIC_WORKER_URL` | Worker URL | Get after deploying worker |
| `apps/whatsapp-pwa/.env.local` | `NEXT_PUBLIC_WORKER_URL` | Worker URL | Same as Telegram |
| `worker/wrangler.toml` | `TELEGRAM_BOT_TOKEN` | Bot token | From @BotFather |
| `worker/wrangler.toml` | `ALLOWED_ORIGINS` | Vercel URLs | Update after frontend deployment |

---

## ✅ Checklist

- [ ] Worker deployed → Get Worker URL
- [ ] Telegram `.env.local` updated with Worker URL
- [ ] WhatsApp `.env.local` updated with Worker URL
- [ ] Telegram deployed to Vercel → Get URL
- [ ] WhatsApp deployed to Vercel → Get URL
- [ ] Worker `ALLOWED_ORIGINS` updated with Vercel URLs
- [ ] Worker redeployed
- [ ] Telegram bot domain configured

---

**All .env files are created with placeholders - just replace the values!**

