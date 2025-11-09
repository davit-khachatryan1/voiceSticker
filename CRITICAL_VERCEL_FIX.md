# ⚠️ CRITICAL: Fix routes-manifest.json Error

## The Problem
Vercel is **auto-detecting** your project as a Next.js app and looking for `routes-manifest.json`, which doesn't exist in static exports.

## ✅ THE FIX: Change Framework Preset in Vercel Dashboard

**You MUST do this manually in Vercel Dashboard - it cannot be done via code!**

---

## 🔧 Step-by-Step Fix

### 1. Go to Vercel Dashboard
- Open https://vercel.com/dashboard
- Select your project (telegram-webapp or whatsapp-pwa)

### 2. Open Project Settings
- Click **Settings** tab
- Click **General** in the left sidebar

### 3. Change Framework Preset ⚠️ CRITICAL!
- Scroll to **Framework Preset** section
- Currently it says: **"Next.js"** ❌
- Change it to: **"Other"** ✅
- Click **Save**

### 4. Verify Build Settings
While you're in Settings, verify:
- **Root Directory**: `apps/telegram-webapp` (or `apps/whatsapp-pwa`)
- **Build Command**: `npm run build`
- **Output Directory**: `out`
- **Install Command**: `npm install --legacy-peer-deps`

### 5. Redeploy
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Or push a new commit to trigger a new deployment

---

## ✅ Why This Works

- **"Next.js" preset**: Vercel expects Next.js server features and looks for `routes-manifest.json`
- **"Other" preset**: Vercel treats it as a static site and serves files from `/out` directory

---

## 🚨 If You Still Get the Error

1. **Double-check Framework Preset** is set to "Other" (not "Next.js")
2. **Clear Vercel cache**: Settings → General → Clear Build Cache
3. **Redeploy** after clearing cache
4. **Check Root Directory** is set correctly

---

## 📝 Quick Checklist

- [ ] Framework Preset = **"Other"** (NOT "Next.js")
- [ ] Root Directory = `apps/telegram-webapp` (or `apps/whatsapp-pwa`)
- [ ] Output Directory = `out`
- [ ] Build Command = `npm run build`
- [ ] Environment Variable `NEXT_PUBLIC_WORKER_URL` is set
- [ ] Redeployed after changes

---

**This MUST be done in Vercel Dashboard - the code changes alone won't fix it!**

