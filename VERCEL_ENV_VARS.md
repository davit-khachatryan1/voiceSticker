# 🔧 Vercel Environment Variables Setup

## 📋 What to Set in Vercel Dashboard

You need to set **ONE environment variable** in **BOTH** Vercel projects.

---

## ✅ Environment Variable

### Variable Name:
```
NEXT_PUBLIC_WORKER_URL
```

### Variable Value:
```
https://voicesticker-worker.voicesticker.workers.dev
```

---

## 📱 Step-by-Step: Telegram WebApp

1. Go to https://vercel.com/dashboard
2. Click on **voice-sticker-telegram-webapp** project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New**
6. Enter:
   - **Key**: `NEXT_PUBLIC_WORKER_URL`
   - **Value**: `https://voicesticker-worker.voicesticker.workers.dev`
   - **Environment**: Select all (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** the project (Deployments → Redeploy)

---

## 📱 Step-by-Step: WhatsApp PWA

1. Go to https://vercel.com/dashboard
2. Click on **voice-sticker-whatsapp-pwa** project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New**
6. Enter:
   - **Key**: `NEXT_PUBLIC_WORKER_URL`
   - **Value**: `https://voicesticker-worker.voicesticker.workers.dev`
   - **Environment**: Select all (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** the project (Deployments → Redeploy)

---

## ✅ Quick Copy-Paste

**Variable Name:**
```
NEXT_PUBLIC_WORKER_URL
```

**Variable Value:**
```
https://voicesticker-worker.voicesticker.workers.dev
```

---

## 📝 Summary Table

| Project | Variable Name | Variable Value | Status |
|---------|--------------|----------------|--------|
| Telegram WebApp | `NEXT_PUBLIC_WORKER_URL` | `https://voicesticker-worker.voicesticker.workers.dev` | ⚠️ Set this |
| WhatsApp PWA | `NEXT_PUBLIC_WORKER_URL` | `https://voicesticker-worker.voicesticker.workers.dev` | ⚠️ Set this |

---

## ⚠️ Important Notes

1. **Same Value for Both**: Both projects use the same Worker URL
2. **Redeploy Required**: After adding environment variables, you must redeploy
3. **Environment Selection**: Select all environments (Production, Preview, Development)
4. **Case Sensitive**: Variable name is case-sensitive (`NEXT_PUBLIC_WORKER_URL`)

---

## 🧪 How to Verify

After setting and redeploying:

1. Open your Telegram WebApp: https://voice-sticker-telegram-webapp-65fp.vercel.app
2. Open browser console (F12)
3. Type: `console.log(process.env.NEXT_PUBLIC_WORKER_URL)`
4. Should show: `https://voicesticker-worker.voicesticker.workers.dev`

---

## ✅ Checklist

- [ ] Set `NEXT_PUBLIC_WORKER_URL` in Telegram WebApp project
- [ ] Set `NEXT_PUBLIC_WORKER_URL` in WhatsApp PWA project
- [ ] Redeployed Telegram WebApp
- [ ] Redeployed WhatsApp PWA
- [ ] Verified in browser console

---

**That's it! Just ONE variable in BOTH projects.** 🎉

