# VoiceSticker - Complete Setup, Deployment & Usage Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Cloudflare Worker Deployment](#cloudflare-worker-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Telegram Bot Setup](#telegram-bot-setup)
6. [WhatsApp Setup](#whatsapp-setup)
7. [Testing & Usage](#testing--usage)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (you have this)
- ✅ Cloudflare account (free) - [Sign up](https://dash.cloudflare.com/sign-up)
- ✅ Vercel account (free) - [Sign up](https://vercel.com/signup)
- ✅ Telegram account (for bot setup)

### Required Tools
- Node.js 18+ installed
- npm or yarn
- Git
- A domain name (optional, can use Vercel's free domain)

---

## Step 1: Local Development Setup

### 1.1 Clone & Install

```bash
# Clone your repository
git clone https://github.com/davit-khachatryan1/voiceSticker.git
cd voiceSticker

# Install dependencies
npm install

# Build shared packages
npm run build
```

### 1.2 Test Locally

```bash
# Start Telegram WebApp (port 3000)
cd apps/telegram-webapp
npm run dev

# In another terminal - Start WhatsApp PWA (port 3002)
cd apps/whatsapp-pwa
npm run dev
```

**Note:** For local testing, you'll need the Worker deployed first (see Step 2).

---

## Step 2: Cloudflare Worker Deployment

### 2.1 Create Cloudflare Account & R2 Bucket

1. **Sign up/Login**: Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)

2. **Create R2 Bucket**:
   - Navigate to **R2** in sidebar
   - Click **Create bucket**
   - Name: `voicesticker-media`
   - Click **Create bucket**
   - **Important**: Make it public (Settings → Public Access → Enable)

3. **Get Account ID**:
   - Go to **Workers & Pages** → **Overview**
   - Copy your **Account ID** (you'll need this)

### 2.2 Configure Worker

```bash
cd worker

# Install dependencies
npm install

# Install Wrangler CLI globally (if not installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2.3 Edit Worker Configuration

Edit `worker/wrangler.toml`:

```toml
name = "voicesticker-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "voicesticker-media"

[env.production.vars]
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # We'll get this in Step 4
ALLOWED_ORIGINS = "https://yourdomain.vercel.app,https://yourdomain.com"
```

**For now**, leave `TELEGRAM_BOT_TOKEN` as placeholder - we'll update it after bot setup.

### 2.4 Deploy Worker

```bash
# Deploy to production
npm run deploy
# or
wrangler deploy

# Note the Worker URL (e.g., https://voicesticker-worker.your-subdomain.workers.dev)
```

**Save your Worker URL** - you'll need it for frontend configuration!

### 2.5 Verify Worker

Test the upload endpoint:

```bash
# Create a test file
echo "test" > test.txt

# Test upload (replace YOUR_WORKER_URL)
curl -X POST https://YOUR_WORKER_URL/upload \
  -F "file=@test.txt"
```

You should get a JSON response with a URL.

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Deploy Telegram WebApp

```bash
cd apps/telegram-webapp

# Create .env.local
echo "NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL" > .env.local
# Replace YOUR_WORKER_URL with your actual Worker URL from Step 2.4

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? voicesticker-telegram (or your choice)
# - Directory? ./
# - Override settings? No
```

**Save your deployment URL** (e.g., `https://voicesticker-telegram.vercel.app`)

### 3.3 Deploy WhatsApp PWA

```bash
cd ../whatsapp-pwa

# Create .env.local
echo "NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL" > .env.local
# Use the same Worker URL

# Deploy
vercel --prod

# Follow same prompts, name it: voicesticker-whatsapp
```

**Save your WhatsApp deployment URL** (e.g., `https://voicesticker-whatsapp.vercel.app`)

### 3.4 Update Worker CORS

Edit `worker/wrangler.toml` and update `ALLOWED_ORIGINS`:

```toml
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

Redeploy the worker:

```bash
cd worker
wrangler deploy
```

---

## Step 4: Telegram Bot Setup

### 4.1 Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`

2. **Start conversation** and send:
   ```
   /newbot
   ```

3. **Follow prompts**:
   - Bot name: `VoiceSticker Bot` (or your choice)
   - Bot username: `YourVoiceStickerBot` (must end with 'bot')

4. **Save the token** - BotFather will give you a token like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### 4.2 Configure Bot

Send these commands to BotFather:

```
/setinline
```
- Choose your bot
- Set inline placeholder: `Record a voice sticker...`

```
/setdomain
```
- Choose your bot
- Enter domain: `https://voicesticker-telegram.vercel.app`
  (Use your actual Telegram WebApp URL)

### 4.3 Update Worker with Bot Token

Edit `worker/wrangler.toml`:

```toml
TELEGRAM_BOT_TOKEN = "YOUR_ACTUAL_BOT_TOKEN_FROM_BOTFATHER"
```

Redeploy:

```bash
cd worker
wrangler deploy
```

### 4.4 Test Telegram Bot

1. Open any Telegram chat (DM or group)
2. Type `@YourVoiceStickerBot` (your bot username)
3. You should see inline results
4. Tap on the result to open the WebApp

---

## Step 5: WhatsApp Setup

### 5.1 Pin Link in WhatsApp

1. **In WhatsApp**, go to any chat (DM or group)
2. **Tap the group/channel name** (top bar)
3. **Add description** or **Pin a message** with:
   ```
   🎤 Create Voice Stickers: https://voicesticker-whatsapp.vercel.app
   ```

**Alternative**: Send the link as a message and pin it.

### 5.2 Test WhatsApp PWA

1. Open the link in WhatsApp
2. Tap **Open in Browser** or **Add to Home Screen**
3. The PWA should open
4. Test recording and sharing

---

## Step 6: Testing & Usage

### 6.1 Telegram Usage

**Flow:**
1. Open any Telegram chat (DM or group)
2. Type `@YourVoiceStickerBot`
3. Tap **"Record VoiceSticker"** or similar
4. **Select style** (Bear 🐻 or Cat 🐱)
5. **Select mood** (neutral, happy, angry, sad, sarcastic)
6. **Hold the record button** (microphone icon)
7. **Speak** while holding
8. **Release** to stop recording
9. Wait for processing (few seconds)
10. **Video appears** in the chat automatically!

**What happens:**
- Canvas animates based on your voice
- Audio is recorded simultaneously
- Combined into WebM video
- Uploaded to R2
- Sent to Telegram chat via `answerWebAppQuery`

### 6.2 WhatsApp Usage

**Flow:**
1. **Tap the pinned link** in WhatsApp chat
2. PWA opens in browser
3. **Select style** and **mood**
4. **Hold record button** and speak
5. **Release** to stop
6. **Share sheet opens** automatically
7. **Choose WhatsApp** from share options
8. **Select the chat** (it's in Recents)
9. **Tap Send**

**Fallback:**
- If share doesn't work, video downloads automatically
- User can attach it manually in WhatsApp

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Add your domain (e.g., `voicesticker.com`)
5. Follow DNS instructions

### 7.2 Update Bot Domain

```
/setdomain
```
- Choose your bot
- Enter: `https://voicesticker.com/tg`

### 7.3 Update Worker CORS

Update `ALLOWED_ORIGINS` in `wrangler.toml` and redeploy.

---

## Troubleshooting

### Issue: Worker upload fails

**Check:**
- R2 bucket exists and is public
- Worker has R2 binding in `wrangler.toml`
- File size < 100MB

**Fix:**
```bash
# Verify R2 bucket
wrangler r2 bucket list

# Check bucket binding
wrangler deploy --dry-run
```

### Issue: Telegram WebApp doesn't open

**Check:**
- Domain is set in BotFather (`/setdomain`)
- Using HTTPS (required)
- CORS headers in Worker

**Fix:**
```
/setdomain https://your-actual-domain.vercel.app
```

### Issue: WhatsApp share doesn't work

**Check:**
- Using HTTPS
- Web Share API supported (modern browsers)
- File size reasonable

**Fallback:** Download works on all browsers

### Issue: Canvas not animating

**Check:**
- Browser supports `canvas.captureStream()`
- MediaRecorder supports WebM
- No console errors

**Fix:** Use Chrome/Edge for best compatibility

### Issue: CORS errors

**Check:**
- `ALLOWED_ORIGINS` in Worker includes your frontend URL
- No trailing slashes in URLs

**Fix:**
```toml
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

---

## Quick Reference

### Important URLs

- **GitHub Repo**: https://github.com/davit-khachatryan1/voiceSticker
- **Telegram WebApp**: `https://voicesticker-telegram.vercel.app`
- **WhatsApp PWA**: `https://voicesticker-whatsapp.vercel.app`
- **Cloudflare Worker**: `https://voicesticker-worker.your-subdomain.workers.dev`
- **R2 Bucket**: `voicesticker-media`

### Key Commands

```bash
# Deploy Worker
cd worker && wrangler deploy

# Deploy Telegram WebApp
cd apps/telegram-webapp && vercel --prod

# Deploy WhatsApp PWA
cd apps/whatsapp-pwa && vercel --prod

# Local development
npm run dev
```

### Environment Variables

**Worker (`wrangler.toml`):**
- `TELEGRAM_BOT_TOKEN` - From BotFather
- `ALLOWED_ORIGINS` - Comma-separated frontend URLs

**Frontend (`.env.local`):**
- `NEXT_PUBLIC_WORKER_URL` - Your Worker URL

---

## Cost Breakdown

**Free Tier Limits:**
- ✅ Cloudflare Worker: 100,000 requests/day
- ✅ R2 Storage: 10GB free
- ✅ Vercel: 100GB bandwidth/month
- ✅ Telegram Bot: Free
- ✅ WhatsApp: Free (no Business API needed)

**Estimated Cost: $0/month for MVP** 🎉

---

## Next Steps

1. ✅ Deploy Worker
2. ✅ Deploy Frontends
3. ✅ Setup Telegram Bot
4. ✅ Test both platforms
5. ⏳ Add more character styles
6. ⏳ Improve lip-sync accuracy
7. ⏳ Add Lottie animations
8. ⏳ Custom domain (optional)

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Vercel Docs**: https://vercel.com/docs
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **GitHub Issues**: https://github.com/davit-khachatryan1/voiceSticker/issues

---

**🎉 You're all set! Start creating voice stickers!**

