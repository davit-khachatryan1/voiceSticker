# 🔧 Vercel Deployment Fix

## Problem
Vercel is detecting the monorepo structure and trying to build with workspace dependencies, causing build failures.

## Solution: Deploy as Standalone Projects

### Step 1: Configure Vercel Project Settings

When creating/updating your Vercel project:

1. **Root Directory**: Set to `apps/telegram-webapp` (or `apps/whatsapp-pwa`)
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build` (already set in vercel.json)
4. **Output Directory**: `out` (already set in vercel.json)
5. **Install Command**: `npm install --legacy-peer-deps` (already set in vercel.json)

### Step 2: Environment Variables

Add in Vercel Dashboard:
- `NEXT_PUBLIC_WORKER_URL` = `https://your-worker.workers.dev`

### Step 3: Deploy

```bash
# Option A: Via Vercel CLI
cd apps/telegram-webapp
vercel --prod

# Option B: Via GitHub (recommended)
# Push to GitHub, connect repo in Vercel, set root directory
```

---

## ⚠️ Important Vercel Settings

### In Vercel Dashboard → Project Settings:

1. **General → Root Directory**: 
   - For Telegram: `apps/telegram-webapp`
   - For WhatsApp: `apps/whatsapp-pwa`

2. **Build & Development Settings**:
   - Framework: Next.js
   - Build Command: `npm run build` (or leave empty, uses vercel.json)
   - Output Directory: `out`
   - Install Command: `npm install --legacy-peer-deps`

3. **Environment Variables**:
   - `NEXT_PUBLIC_WORKER_URL` = Your Cloudflare Worker URL

---

## 🔍 Troubleshooting

### If build still fails:

1. **Check Root Directory**: Must be `apps/telegram-webapp` (not repo root)
2. **Check Build Logs**: Look for workspace-related errors
3. **Try Manual Build**: 
   ```bash
   cd apps/telegram-webapp
   npm install
   npm run build
   ```

### Common Errors:

**Error: "Cannot find module '@voicesticker/types'"**
- ✅ Fixed: Apps now use local types (`src/types/index.ts`)

**Error: "Lifecycle script build failed"**
- Check that root directory is set correctly in Vercel
- Ensure `vercel.json` is in the app directory

**Error: "npm install failed"**
- Try `npm install --legacy-peer-deps` (already configured)

---

## ✅ Verification

After deployment, check:
1. ✅ Build completes successfully
2. ✅ Site loads at Vercel URL
3. ✅ Environment variables are set
4. ✅ Worker URL is accessible

---

## 📝 Quick Deploy Commands

```bash
# Telegram WebApp
cd apps/telegram-webapp
vercel --prod

# WhatsApp PWA  
cd apps/whatsapp-pwa
vercel --prod
```

Make sure to set the **Root Directory** in Vercel Dashboard to the app folder!

