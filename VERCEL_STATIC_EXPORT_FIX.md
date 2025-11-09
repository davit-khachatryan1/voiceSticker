# 🔧 Fix: routes-manifest.json Error

## Problem
Vercel is looking for `routes-manifest.json` which isn't generated for static exports (`output: 'export'`).

## Solution
Updated configuration to deploy as a **static site** instead of a Next.js app.

---

## ✅ Changes Made

### 1. Updated `vercel.json`
- Removed `framework: "nextjs"` (causes Next.js-specific checks)
- Added static site rewrites
- Kept build command and output directory

### 2. Updated `next.config.js`
- Set `generateBuildId: undefined` to avoid build ID issues

---

## 🚀 Deploy Steps

### In Vercel Dashboard:

1. **Project Settings → General**
   - Root Directory: `apps/telegram-webapp` (or `apps/whatsapp-pwa`)
   - Framework Preset: **Other** (not Next.js!)

2. **Project Settings → Build & Development Settings**
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install --legacy-peer-deps`

3. **Environment Variables**
   - `NEXT_PUBLIC_WORKER_URL` = Your Worker URL

4. **Deploy**

---

## ⚠️ Important

**Framework Preset must be "Other"** - NOT "Next.js"!

When you set it to "Next.js", Vercel expects Next.js server features and looks for `routes-manifest.json`. Since we're using static export, we need to deploy as a static site.

---

## ✅ Verification

After deployment:
- ✅ Build completes without routes-manifest.json error
- ✅ Site loads correctly
- ✅ Static files are served from `/out` directory

---

## 📝 Alternative: Use Vercel CLI

```bash
cd apps/telegram-webapp
vercel --prod
```

Then in Dashboard, change Framework Preset to "Other".

