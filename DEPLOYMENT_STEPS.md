# 🚀 Complete Deployment Steps

Follow these steps in order to deploy VoiceSticker.

---

## 📋 Prerequisites

- [ ] GitHub account with repository access
- [ ] Cloudflare account (free)
- [ ] Vercel account (free)
- [ ] Telegram Bot Token from @BotFather

---

## Step 1: Deploy Cloudflare Worker ⚙️

### 1.1 Get Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow instructions
3. Copy your bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Configure Worker

```bash
cd worker
```

Edit `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
ALLOWED_ORIGINS = "https://yourdomain.com,https://yourdomain.vercel.app"
```

**Note**: Update `ALLOWED_ORIGINS` after deploying frontends (Step 3 & 4).

### 1.3 Create R2 Bucket

```bash
# Login to Cloudflare
wrangler login

# Create R2 bucket (if not exists)
wrangler r2 bucket create voicesticker-media
```

### 1.4 Deploy Worker

```bash
# Install dependencies
npm install

# Deploy
wrangler deploy
```

### 1.5 Save Worker URL

After deployment, you'll see:
```
✨  Deployed to https://voicesticker-worker.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL** - you'll need it for the frontends!

---

## Step 2: Deploy Telegram WebApp 📱

### 2.1 Prepare Environment

```bash
cd apps/telegram-webapp
```

Create `.env.local`:

```bash
NEXT_PUBLIC_WORKER_URL=https://voicesticker-worker.YOUR_SUBDOMAIN.workers.dev
```

Replace `YOUR_SUBDOMAIN` with your actual subdomain.

### 2.2 Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repository
4. **Configure Project**:
   - **Root Directory**: Click "Edit" → Set to `apps/telegram-webapp`
   - **Framework Preset**: Select **"Other"** ⚠️ (NOT "Next.js")
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `out` (auto-filled)
   - **Install Command**: `npm install --legacy-peer-deps`
5. **Environment Variables**:
   - Add: `NEXT_PUBLIC_WORKER_URL` = Your Worker URL
6. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted:
- Set root directory: `apps/telegram-webapp`
- Override settings: Yes
- Framework: Other
- Build command: `npm run build`
- Output directory: `out`

### 2.3 Save Telegram WebApp URL

After deployment, copy your Vercel URL:
```
https://voicesticker-telegram.vercel.app
```

---

## Step 3: Deploy WhatsApp PWA 📱

### 3.1 Prepare Environment

```bash
cd apps/whatsapp-pwa
```

Create `.env.local`:

```bash
NEXT_PUBLIC_WORKER_URL=https://voicesticker-worker.YOUR_SUBDOMAIN.workers.dev
```

Use the **same Worker URL** as Telegram.

### 3.2 Deploy to Vercel

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **Add New Project** (separate project!)
3. Import the same GitHub repository
4. **Configure Project**:
   - **Root Directory**: `apps/whatsapp-pwa`
   - **Framework Preset**: **"Other"** ⚠️
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
   - **Install Command**: `npm install --legacy-peer-deps`
5. **Environment Variables**:
   - Add: `NEXT_PUBLIC_WORKER_URL` = Your Worker URL
6. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
cd apps/whatsapp-pwa
vercel --prod
```

### 3.3 Save WhatsApp PWA URL

After deployment, copy your Vercel URL:
```
https://voicesticker-whatsapp.vercel.app
```

---

## Step 4: Update Worker CORS 🔒

### 4.1 Update wrangler.toml

```bash
cd worker
```

Edit `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

Replace with your actual Vercel URLs.

### 4.2 Redeploy Worker

```bash
wrangler deploy
```

---

## Step 5: Configure Telegram Bot 🤖

### 5.1 Set WebApp Domain

Open Telegram and message `@BotFather`:

```
/setdomain
```

Select your bot, then enter:
```
https://voicesticker-telegram.vercel.app
```

### 5.2 (Optional) Set Bot Commands

Message `@BotFather`:

```
/setcommands
```

Select your bot, then enter:
```
start - Start VoiceSticker
record - Record a voice sticker
```

---

## Step 6: Test Everything ✅

### 6.1 Test Telegram WebApp

1. Open any Telegram chat
2. Type `@YourBotName`
3. Tap "Record VoiceSticker" or "Open WebApp"
4. Select style & mood
5. Hold to record → release
6. Video should appear in chat

### 6.2 Test WhatsApp PWA

1. Open WhatsApp PWA URL in browser
2. Select style & mood
3. Hold to record → release
4. Share sheet should open
5. Select WhatsApp → choose chat → send

---

## 📝 Quick Reference

### URLs to Save

- **Worker URL**: `https://voicesticker-worker.xxx.workers.dev`
- **Telegram WebApp**: `https://voicesticker-telegram.vercel.app`
- **WhatsApp PWA**: `https://voicesticker-whatsapp.vercel.app`

### Environment Variables

**Worker (`wrangler.toml`):**
- `TELEGRAM_BOT_TOKEN`
- `ALLOWED_ORIGINS`

**Frontends (`.env.local` or Vercel Dashboard):**
- `NEXT_PUBLIC_WORKER_URL`

---

## ⚠️ Common Issues & Fixes

### Issue: Build fails with routes-manifest.json error
**Fix**: Make sure Framework Preset is set to **"Other"** in Vercel Dashboard

### Issue: CORS errors
**Fix**: Update `ALLOWED_ORIGINS` in worker `wrangler.toml` with your Vercel URLs

### Issue: Telegram WebApp not opening
**Fix**: 
- Check domain is set in @BotFather
- Verify HTTPS (required)
- Check Worker CORS settings

### Issue: Upload fails
**Fix**:
- Check R2 bucket exists
- Verify Worker has R2 binding
- Check file size limits

---

## ✅ Deployment Checklist

- [ ] Worker deployed and URL saved
- [ ] R2 bucket created
- [ ] Telegram WebApp deployed
- [ ] WhatsApp PWA deployed
- [ ] Worker CORS updated with Vercel URLs
- [ ] Telegram bot domain configured
- [ ] Environment variables set in Vercel
- [ ] Tested Telegram flow
- [ ] Tested WhatsApp flow

---

## 🎉 You're Done!

Your VoiceSticker app should now be live and working!

**Need help?** Check the troubleshooting section or review the error logs in Vercel/Cloudflare dashboards.

