# 🚀 Deploy to Vercel - Step by Step

## ⚠️ CRITICAL: Set Root Directory!

The most important step is setting the **Root Directory** in Vercel to the app folder, NOT the repo root.

---

## 📱 Deploy Telegram WebApp

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard** → New Project
2. **Import Git Repository**: Connect your GitHub repo
3. **Configure Project**:
   - **Root Directory**: `apps/telegram-webapp` ⚠️ **CRITICAL!**
   - Framework Preset: Next.js
   - Build Command: (leave empty, uses vercel.json)
   - Output Directory: `out`
   - Install Command: `npm install --legacy-peer-deps`
4. **Environment Variables**:
   - Add: `NEXT_PUBLIC_WORKER_URL` = `https://your-worker.workers.dev`
5. **Deploy**

### Option 2: Via Vercel CLI

```bash
cd apps/telegram-webapp
vercel --prod
```

**Then in Vercel Dashboard**, set Root Directory to `apps/telegram-webapp`

---

## 📱 Deploy WhatsApp PWA

Same steps, but use:
- **Root Directory**: `apps/whatsapp-pwa`
- Same environment variable: `NEXT_PUBLIC_WORKER_URL`

---

## ✅ Verification Checklist

After deployment:

- [ ] Build completes successfully (check Build Logs)
- [ ] Site loads at Vercel URL
- [ ] Environment variable `NEXT_PUBLIC_WORKER_URL` is set
- [ ] Root Directory is set to app folder (not repo root)
- [ ] Worker URL is accessible

---

## 🔧 If Build Still Fails

1. **Check Root Directory**: Must be `apps/telegram-webapp` or `apps/whatsapp-pwa`
2. **Check Build Logs**: Look for specific error messages
3. **Verify vercel.json**: Should be in the app directory
4. **Try Manual Build**:
   ```bash
   cd apps/telegram-webapp
   npm install
   npm run build
   ```

---

## 📝 Current Configuration

✅ `vercel.json` - Configured for standalone build
✅ `.vercelignore` - Ignores unnecessary files
✅ `next.config.js` - Static export enabled
✅ Types are inlined - No workspace dependencies
✅ All dependencies in package.json

**Everything is ready! Just set the Root Directory correctly!**

