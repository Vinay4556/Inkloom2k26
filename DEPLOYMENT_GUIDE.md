# Inkloom Deployment Guide

## 🎯 Recommended: Vercel (Best for Next.js)

**Why Vercel is the best choice for Inkloom:**

✅ **Built for Next.js** - Created by the Next.js team  
✅ **Persistent filesystem** - File-store works without changes  
✅ **Edge functions** - Fast API responses globally  
✅ **Zero configuration** - Auto-detects Next.js settings  
✅ **Free tier generous** - Perfect for hackathons  
✅ **Instant deploys** - Push to deploy in seconds  
✅ **Preview deployments** - Every PR gets a URL  
✅ **Built-in analytics** - Performance monitoring included  

**What works immediately:**
- ✅ File-based JSON store (persistent)
- ✅ All API routes as serverless functions
- ✅ 3D graphics and static assets
- ✅ Review history with saved data
- ✅ Dashboard analytics with real data
- ✅ Everything just works!

---

## 🚀 Deploy to Vercel (5 minutes)

### Option 1: Deploy with GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Visit [vercel.com/new](https://vercel.com/new)**
   - Sign in with GitHub
   - Click "Import Project"
   - Select your `inkloom-fullstack` repository

3. **Configure project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Add environment variables**
   ```
   DEMO_MODE=true
   DEMO_ORG_ID=demo
   CONTENT_RETENTION_DAYS=7
   INKLOOM_RETAIN_CONTENT=false
   ```

5. **Click "Deploy"** ✨

Your site will be live at: `https://your-project.vercel.app`

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Accept detected settings
# - Deploy!

# For production deployment
vercel --prod
```

---

## ⚙️ Vercel Configuration

### vercel.json (Optional - Only if you need custom config)

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DEMO_MODE": "true",
    "DEMO_ORG_ID": "demo"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Note:** Most projects don't need this - Vercel auto-configures Next.js perfectly!

---

## 🔄 Continuous Deployment

Once connected to GitHub:

1. **Every push to `main`** → Automatic production deployment
2. **Every PR** → Preview deployment with unique URL
3. **Every commit** → Build logs and deployment status

**Workflow:**
```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Sends you a notification

# Your changes are live in ~2 minutes!
```

---

## 🗄️ Data Persistence on Vercel

### Current Setup (File Store) ✅

Your file-based JSON store **works perfectly** on Vercel:

**How it works:**
- Data stored in `backend/.data/inkloom.json`
- Vercel persists files during deployments
- Review history survives between requests
- Dashboard analytics show real data

**Important notes:**
- Data persists **within the same deployment**
- New deployment = fresh data file (by design)
- For multi-deployment persistence, upgrade to database (see below)

### Data Across Deployments

**Current behavior:**
```
Deploy v1 → Create reviews → Data saved
Deploy v2 → Data resets (expected)
```

**If you need persistence across deployments:**

#### Option A: Vercel KV (Redis) - Recommended for Demo
```bash
# Install Vercel KV
npm install @vercel/kv

# In Vercel dashboard:
# Storage → Create KV Database
# Environment variables auto-added
```

Simple adapter needed:
```typescript
// backend/src/store/vercel-kv-store.ts
import { kv } from '@vercel/kv';

export function createKVStore(): Store {
  // Store reviews in Redis
  // Fast, serverless, perfect for demos
}
```

#### Option B: Vercel Postgres - Production Ready
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# In Vercel dashboard:
# Storage → Create Postgres Database
# Your db/migrations/0000_init.sql is ready to use!
```

#### Option C: External Database
- **Neon** (https://neon.tech) - Serverless Postgres
- **Supabase** (https://supabase.com) - Postgres + realtime
- **PlanetScale** (https://planetscale.com) - Serverless MySQL

**For hackathon:** File store is perfect! No changes needed.

---

## 🌍 Alternative Platforms

### Option 2: Railway (Great for Persistent Storage)

**Pros:**
- ✅ Persistent disk storage included
- ✅ One-click database deployments
- ✅ Simple pricing ($5/month)
- ✅ GitHub integration

**Deployment:**
1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Deploy!

**Railway configuration:**
```json
// railway.json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "cd frontend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd frontend && npm start",
    "restartPolicyType": "on-failure"
  }
}
```

### Option 3: Render (Good Free Tier)

**Pros:**
- ✅ Free tier for static sites
- ✅ Persistent disks available
- ✅ Easy database setup

**Deployment:**
1. Visit [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Settings:
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`
   - Root Directory: `/`

### Option 4: DigitalOcean App Platform

**Pros:**
- ✅ $5/month includes everything
- ✅ Managed databases available
- ✅ Simple scaling

**Best for:** Production after hackathon

---

## 📊 Platform Comparison

| Feature | Vercel | Railway | Render | DigitalOcean |
|---------|--------|---------|--------|--------------|
| **Next.js optimized** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **File persistence** | ✅ (per deployment) | ✅ (disk) | ✅ (disk) | ✅ (disk) |
| **Free tier** | Generous | $5/mo | Good | None |
| **Setup time** | 5 min | 10 min | 15 min | 20 min |
| **Auto-deploy** | ✅ | ✅ | ✅ | ✅ |
| **Preview deploys** | ✅ | ✅ | ✅ | ❌ |
| **Edge functions** | ✅ | ❌ | ❌ | ❌ |
| **Analytics** | ✅ Built-in | Add-on | Add-on | Add-on |
| **Best for** | **Hackathons** | Startups | Side projects | Production |

---

## 🎯 Recommendation Summary

### For Hackathon (Now)
**→ Use Vercel**

Reasons:
1. Deploy in 5 minutes
2. File store works immediately
3. All features functional
4. Free tier perfect for demos
5. Automatic HTTPS + CDN
6. Built by Next.js creators

### For Production (Later)
**→ Vercel + Database**

Options:
1. Vercel + Vercel Postgres (easiest)
2. Vercel + Neon (serverless Postgres)
3. Railway (includes database)

---

## ✅ Post-Deployment Checklist

After deploying to Vercel:

- [ ] Visit your live URL (e.g., `https://inkloom.vercel.app`)
- [ ] Test landing page loads
- [ ] Test 3D typography animates
- [ ] Create a review (test content validation)
- [ ] Check dashboard shows analytics
- [ ] View review history (should show saved review)
- [ ] Test all 3 Morrow Goods samples
- [ ] Verify no console errors
- [ ] Test on mobile device
- [ ] Share URL with judges!

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Could not find package.json"
```bash
# Fix: Ensure root directory is set to "frontend"
# In Vercel: Settings → General → Root Directory → frontend
```

**Error:** "Module not found"
```bash
# Fix: Clear cache and redeploy
vercel --force
```

### Data Not Persisting

**Issue:** Reviews disappear after creating them

**Check:**
1. Environment variable `INKLOOM_DATA_FILE` not set (good - uses default)
2. File store initialization logs (check Vercel function logs)
3. Permissions (Vercel handles automatically)

**Solution:** File store persists within deployment. For cross-deployment persistence, add Vercel KV or Postgres.

### 3D Scene Not Loading

**Issue:** Black screen or fallback CSS

**Check:**
1. Browser console for WebGL errors
2. Network tab for failed asset loads
3. Vercel function logs for errors

**Solution:** Usually a client-side issue. Test in different browsers.

---

## 📞 Support Resources

**Vercel Documentation:**
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/environment-variables
- Deployments: https://vercel.com/docs/deployments/overview

**Vercel Community:**
- Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/next.js/discussions

**Inkloom-Specific:**
- See `HACKATHON_JUDGE_GUIDE.md` for testing workflow
- Check `README.md` for project overview

---

## 🎉 Ready to Deploy!

**Quick Start:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# Visit: https://vercel.com/new

# 3. Add environment variables (in Vercel UI)

# 4. Deploy!

# Your Inkloom site will be live in 2 minutes! 🚀
```

**Your URL will be:**
- Production: `https://your-project.vercel.app`
- Preview (PRs): `https://your-project-git-branch.vercel.app`
- Custom domain: `https://inkloom.com` (add in Vercel settings)

---

## 💡 Pro Tips

1. **Custom domain:** Add in Vercel → Settings → Domains
2. **Preview comments:** Collaborate on preview deployments
3. **Analytics:** Enable in Vercel dashboard for free
4. **Monitoring:** Set up Vercel monitoring for uptime alerts
5. **Team collaboration:** Invite teammates to Vercel project
6. **Rollback:** Instant rollback to previous deployment if needed

---

**Recommended:** Deploy to Vercel for the best Next.js experience with zero configuration! 🎯
