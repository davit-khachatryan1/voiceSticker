# 📍 Where URLs Need to Be Configured

## ✅ Already Configured

### 1. Worker CORS (`worker/wrangler.toml`) ✅
```toml
ALLOWED_ORIGINS = "https://voice-sticker-telegram-webapp-65fp.vercel.app,https://voice-sticker-whatsapp-pwa.vercel.app"
```
**Status**: ✅ Done - This is the ONLY place in code where frontend URLs are needed.

---

## ⚠️ Need to Configure in Vercel Dashboard

### 2. Frontend Environment Variables (Vercel Dashboard)

**Telegram WebApp Project:**
- Go to: Vercel Dashboard → voice-sticker-telegram-webapp → Settings → Environment Variables
- Add: `NEXT_PUBLIC_WORKER_URL` = `https://your-worker.workers.dev`
- **Value**: Your Cloudflare Worker URL (NOT the frontend URL)

**WhatsApp PWA Project:**
- Go to: Vercel Dashboard → voice-sticker-whatsapp-pwa → Settings → Environment Variables  
- Add: `NEXT_PUBLIC_WORKER_URL` = `https://your-worker.workers.dev`
- **Value**: Same Worker URL as Telegram

**Note**: These are set in Vercel Dashboard, NOT in code files.

---

## ⚠️ Need to Configure via @BotFather

### 3. Telegram Bot Domain (via @BotFather)

Message @BotFather:
```
/setdomain
```

Select your bot (`@fun1Time1Bot`), then enter:
```
https://voice-sticker-telegram-webapp-65fp.vercel.app
```

**Note**: This is NOT in code - it's configured via Telegram's BotFather.

---

## 📋 Summary

| Location | What to Configure | Where | Status |
|----------|------------------|-------|--------|
| `worker/wrangler.toml` | `ALLOWED_ORIGINS` | Code file | ✅ Done |
| Vercel Dashboard (Telegram) | `NEXT_PUBLIC_WORKER_URL` | Vercel UI | ⚠️ Check |
| Vercel Dashboard (WhatsApp) | `NEXT_PUBLIC_WORKER_URL` | Vercel UI | ⚠️ Check |
| @BotFather | Bot domain | Telegram | ⚠️ Do this |

---

## ✅ Quick Checklist

- [x] Worker CORS updated with Vercel URLs
- [ ] Worker URL set in Vercel Dashboard (Telegram project)
- [ ] Worker URL set in Vercel Dashboard (WhatsApp project)
- [ ] Bot domain set via @BotFather

---

## 🔍 How to Check Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project (telegram-webapp or whatsapp-pwa)
3. Click **Settings** → **Environment Variables**
4. Check if `NEXT_PUBLIC_WORKER_URL` exists
5. If missing, add it with your Worker URL

---

**The frontend URLs only need to be in ONE place: `worker/wrangler.toml` ✅**

