# 📁 Environment Files Created

## ✅ Files Created

### Frontend Apps

1. **`apps/telegram-webapp/.env.local`** ✅
   ```bash
   NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL.workers.dev
   ```

2. **`apps/telegram-webapp/.env.example`** ✅
   - Template file (committed to git)

3. **`apps/whatsapp-pwa/.env.local`** ✅
   ```bash
   NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL.workers.dev
   ```

4. **`apps/whatsapp-pwa/.env.example`** ✅
   - Template file (committed to git)

### Worker

5. **`worker/.env.example`** ✅
   - Template file (committed to git)
   - Note: Worker uses `wrangler.toml` for production

6. **`worker/wrangler.toml`** ✅
   - Contains environment variables
   - Update: `TELEGRAM_BOT_TOKEN` and `ALLOWED_ORIGINS`

---

## 🔧 How to Fill Them

### Step 1: Get Worker URL

```bash
cd worker
wrangler deploy
# Copy the URL from output (e.g., https://voicesticker-worker.xxx.workers.dev)
```

### Step 2: Update Frontend .env Files

**Telegram WebApp:**
```bash
cd apps/telegram-webapp
# Edit .env.local - replace YOUR_WORKER_URL with actual URL
```

**WhatsApp PWA:**
```bash
cd apps/whatsapp-pwa
# Edit .env.local - replace YOUR_WORKER_URL with actual URL
```

### Step 3: Update Worker Config

Edit `worker/wrangler.toml`:

```toml
[vars]
TELEGRAM_BOT_TOKEN = "your_actual_token_from_botfather"
ALLOWED_ORIGINS = "https://voicesticker-telegram.vercel.app,https://voicesticker-whatsapp.vercel.app"
```

---

## 🚀 Quick Setup Script

Run the setup script:

```bash
./setup-env.sh
```

It will prompt you for the Worker URL and create all `.env.local` files automatically.

---

## 📝 File Locations

```
voicesticker/
├── apps/
│   ├── telegram-webapp/
│   │   ├── .env.local          ✅ Created (fill in Worker URL)
│   │   └── .env.example        ✅ Template
│   └── whatsapp-pwa/
│       ├── .env.local          ✅ Created (fill in Worker URL)
│       └── .env.example        ✅ Template
├── worker/
│   ├── wrangler.toml          ✅ Update with bot token & CORS
│   └── .env.example           ✅ Template
└── setup-env.sh               ✅ Setup script
```

---

## ⚠️ Important Notes

1. **`.env.local` files are gitignored** - They won't be committed (this is correct!)
2. **`.env.example` files are committed** - These are templates
3. **Worker uses `wrangler.toml`** - Not `.env` file for production
4. **Update Worker CORS** - After deploying frontends, update `ALLOWED_ORIGINS`

---

## ✅ Next Steps

1. Fill in Worker URL in both `.env.local` files
2. Update `worker/wrangler.toml` with bot token
3. Deploy frontends
4. Update Worker CORS with Vercel URLs
5. Redeploy worker

**All environment files are ready!** 🎉

