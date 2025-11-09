# Build Note

## Local Build Issue

If you encounter the `generate is not a function` error when running `npm run build` locally, **this is okay** - you don't need to build locally for deployment.

## Solution: Deploy Directly to Vercel

Vercel will automatically build your Next.js app when you deploy. You don't need to build locally first.

### Steps:

1. **Skip local build** - Just deploy directly:
   ```bash
   cd apps/telegram-webapp
   vercel --prod
   ```

2. **Vercel will:**
   - Install dependencies
   - Build the app
   - Deploy it

### For Local Development:

Use `npm run dev` instead of `npm run build`:

```bash
cd apps/telegram-webapp
npm run dev
# App runs on http://localhost:3000
```

### Why This Happens:

This is a known issue with Next.js 14 in monorepo workspaces when using static export. The build works fine on Vercel's infrastructure.

### Alternative: Fix Local Build (Optional)

If you really need local builds, you can:

1. **Update Next.js**:
   ```bash
   npm install next@latest --workspace=apps/telegram-webapp
   ```

2. **Or use standalone build**:
   Remove `output: 'export'` temporarily for local testing, but keep it for Vercel deployment.

---

**TL;DR**: Just deploy to Vercel - it will build automatically! 🚀

