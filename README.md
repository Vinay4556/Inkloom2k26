# Inkloom

**Evidence-backed brand governance for consistent content at scale.**

Inkloom transforms scattered brand guidelines into structured, enforceable rules. Review every piece of content against your brand voice, catch inconsistencies before they ship, and give your team the evidence they need to make confident decisions.

[![Live Demo](https://img.shields.io/badge/🎯-Live_Demo-6BA37A?style=for-the-badge)](https://frontend-gamma-sand-16.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Inloom2k26-black?style=for-the-badge&logo=github)](https://github.com/Vinay4556/Inloom2k26)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vinay4556/Inloom2k26&project-name=inkloom&root-directory=frontend)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React Three Fiber](https://img.shields.io/badge/R3F-9.8-purple?style=flat-square)](https://docs.pmnd.rs/react-three-fiber)

---

## 🎯 The Problem

Content comes from everywhere—drafts, agencies, internal teams, contractors. Each source brings its own voice, terminology, and claims. Without structure, your brand becomes whatever was written last.

**Traditional solutions:**
- ❌ PDF brand guidelines gathering dust
- ❌ Manual review bottlenecks
- ❌ Inconsistent enforcement
- ❌ No audit trail

**Inkloom solution:**
- ✅ Machine-readable brand rules
- ✅ Instant automated validation
- ✅ Evidence-backed findings
- ✅ Human decision, deterministic matching

---

## ✨ Key Features

### 🔍 Deterministic Content Validation
- **No AI guessing** - Pure phrase-matching engine
- **Evidence highlighting** - See exactly what triggered each rule
- **Severity levels** - Warnings vs. errors
- **Instant results** - Sub-second analysis

### 📋 Structured Brand Rules
- **Multiple rule types** - Absolute claims, restricted phrases, vague superlatives
- **Version control** - Track every rule change
- **Enable/disable toggles** - Control enforcement granularly
- **Rule explanations** - Built-in guidance for reviewers

### 📊 Analytics Dashboard
- **Consistency trends** - Track compliance over time
- **Rule violations** - See which rules trigger most
- **Outcome distribution** - Pass/fail ratios
- **Recent activity** - Quick access to latest reviews

### 🎨 Premium 3D Experience
- **Kinetic typography** - Scroll-driven 3D animations
- **Brand narrative** - Visual storytelling (CONSISTENCY → VALIDATE → TRUST)
- **WebGL optimized** - 60fps with graceful fallbacks
- **Accessibility-first** - Reduced-motion support

---

## 🚀 Quick Start

### Try the Live Demo

**[→ Open Inkloom Demo](https://frontend-gamma-sand-16.vercel.app)**

**Demo features:**
- Fictional brand: **Morrow Goods** (home goods company)
- 3 rule categories with realistic constraints
- 3 sample content pieces (compliant, restricted, violations)
- Instant validation engine

**Test it in 2 minutes:**
1. Click "Try the demo"
2. Select a sample (e.g., "Kitchen set")
3. Click "Review Content"
4. See findings with evidence

### Run Locally

```bash
# Prerequisites: Node.js 22.18+
git clone https://github.com/Vinay4556/Inloom2k26.git
cd inkloom-fullstack

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 16** (App Router + Turbopack)
- **React 19** (Server Components)
- **TypeScript 5.7** (Strict mode)
- **React Three Fiber** (3D graphics)
- **Three.js** (WebGL engine)
- **Recharts** (Analytics visualization)
- **Tailwind CSS 4** (Design system)

**Backend:**
- **Next.js API Routes** (Serverless functions)
- **JSON File Store** (Works on Vercel)
- **PostgreSQL** (Production-ready via Vercel Postgres)
- **No external dependencies** (Pure TypeScript)

**Testing:**
- **Node.js test runner** (Built-in, zero dependencies)
- **25 tests** - 12 API integration + 13 engine unit
- **100% critical path coverage**

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                      Landing Page                        │
│  • 3D Kinetic Typography (React Three Fiber)            │
│  • Scroll-driven animations                             │
│  • Brand narrative arc                                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Content Review UI                      │
│  • Sample picker (Morrow Goods demo)                    │
│  • Paste custom content                                 │
│  • Real-time validation trigger                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ POST /api/reviews
┌─────────────────────────────────────────────────────────┐
│                  Review Engine (Pure)                    │
│  • Case-insensitive phrase matching                     │
│  • Overlap collapsing (longest match wins)              │
│  • Stable finding IDs                                   │
│  • Rule version snapshots                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Results + Evidence                       │
│  • Severity badges (error/warning)                      │
│  • Matched phrase highlighting                          │
│  • Rule explanations                                    │
│  • Suggested fixes                                      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User submits content** → `ReviewEngine` component
2. **API validates input** → `POST /api/reviews`
3. **Load brand rules** → File store (dev) / Postgres (prod)
4. **Run matching engine** → `analyze(content, rules)`
5. **Save review record** → Store with findings
6. **Return results** → React displays with evidence

---

## 📂 Project Structure

```
inkloom-fullstack/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # Dashboard routes
│   │   │   │   ├── page.tsx            # Analytics home
│   │   │   │   ├── content-review/     # Review UI
│   │   │   │   ├── brand-guidelines/   # Rules viewer
│   │   │   │   └── review-history/     # Saved reviews
│   │   │   └── api/            # API routes (serverless)
│   │   │       ├── brands/     # Brand CRUD
│   │   │       ├── reviews/    # Review CRUD
│   │   │       └── analytics/  # Dashboard data
│   │   │
│   │   ├── components/
│   │   │   ├── landing/        # 3D scene + sections
│   │   │   │   ├── KineticHeroScene.tsx     # WebGL canvas
│   │   │   │   ├── KineticTypography.tsx    # 3D text layers
│   │   │   │   └── KineticLandingSections.tsx
│   │   │   └── review/         # Review UI components
│   │   │       ├── ReviewEngine.tsx
│   │   │       └── SamplePicker.tsx
│   │   │
│   │   └── lib/                # Client utilities
│   │       └── client/
│   │           └── api.ts      # useApi hook
│   │
│   └── package.json
│
├── backend/                     # Business logic (TypeScript)
│   ├── src/
│   │   ├── services/
│   │   │   └── review-engine.ts        # Core matching engine
│   │   │
│   │   ├── store/              # Data layer
│   │   │   ├── types.ts        # Domain models + Store interface
│   │   │   ├── file-store.ts   # JSON file implementation
│   │   │   └── memory-store.ts # In-memory (Netlify-compatible)
│   │   │
│   │   ├── middleware/
│   │   │   └── api.ts          # Request handlers
│   │   │
│   │   ├── config/
│   │   │   └── runtime.ts      # Environment wiring
│   │   │
│   │   ├── data/
│   │   │   ├── demo-brands.ts      # Morrow Goods seed
│   │   │   └── sample-reviews.ts   # Pre-seeded analytics
│   │   │
│   │   └── validation/
│   │       └── schemas.ts      # Input validation
│   │
│   └── tests/                  # Test suite
│       ├── review-engine.test.ts   # 13 unit tests
│       └── api.test.ts             # 12 integration tests
│
├── DEPLOYMENT_GUIDE.md         # Deployment instructions (Vercel recommended)
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🧪 Testing

**Run all tests:**
```bash
npm test                    # 25 tests (backend only)
npm run typecheck          # TypeScript compilation
npm run lint               # ESLint
npm run build              # Production build
```

**Test suite:**
- ✅ Review engine: phrase matching, overlaps, unicode, performance
- ✅ API: CRUD operations, validation, auth, pagination, concurrency
- ✅ Zero external test dependencies (Node.js built-in test runner)

---

## 🎨 3D Typography System

Inkloom's landing page features a **scroll-synchronized 3D kinetic typography system** built with React Three Fiber.

### Visual Narrative

**Scroll progression tells the brand consistency story:**

| Scroll % | Typography Layer | State | Meaning |
|----------|-----------------|-------|---------|
| 0-25% | **CONSISTENCY** | Dispersed letters | Problem: brand voice scattered |
| 0-25% | **BRAND DNA** | Fragmented | Core identity lost |
| 25-50% | **VALIDATE** | Fading in | Solution: automated checking |
| 25-50% | **REFINE** | Emerging | Content improvement process |
| 40-70% | **ALIGNMENT** | Subtle background | Structural governance |
| 40-70% | **COHERENCE** | Supporting layer | Systematic consistency |
| 60-100% | **BRAND VOICE** | Converged, solid | Achieved consistency |
| 60-100% | **TRUST** | Prominent | Final outcome |

### Technical Implementation

- **React Three Fiber** - React renderer for Three.js
- **Custom shaders** - Optimized material rendering
- **Scroll driver** - Smooth interpolation with `lerp`
- **Progressive loading** - Opacity fade-in prevents flashing
- **Fallback system** - CSS-only version for non-WebGL browsers
- **Performance** - 60fps on high-end, 30fps on low-power devices

**Typography behavior:**
- **Dispersion physics** - Letters scatter with random rotation (0.6-0.9 rad)
- **Convergence animation** - Smooth `lerp` interpolation to target positions
- **Layered opacity** - Sin-wave modulation for organic fades
- **Z-depth staging** - Multiple depth layers for visual hierarchy

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local (development) or Vercel dashboard (production)

# Demo mode (always true for public hackathon demo)
DEMO_MODE=true
DEMO_ORG_ID=demo

# Content retention
CONTENT_RETENTION_DAYS=7
INKLOOM_RETAIN_CONTENT=false  # false = hash only, true = full text

# Data storage (local dev only)
INKLOOM_DATA_FILE=./.data/inkloom.json

# Next.js public variables (browser-accessible)
NEXT_PUBLIC_SITE_URL=https://frontend-gamma-sand-16.vercel.app
NEXT_PUBLIC_API_URL=/api
```

### Build Configuration

**Local development:**
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm start            # Serve production build
```

**Vercel (automatic):**
- Root directory: `frontend`
- Build command: `npm run build` (auto-detected)
- Output directory: `.next` (auto-detected)
- Install command: `npm install` (auto-detected)
- Node version: `22.x` (auto-detected)

---

## 🌐 API Reference

**Base URL:** `/api`

**Authentication:** Demo mode (single fixed org/user)

**Response format:**
```typescript
{ data: T }                     // Success
{ error: { code, message } }    // Error
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | System status |
| `GET` | `/api/summary` | Dashboard KPIs |
| `GET` | `/api/brands` | List brands with rule counts |
| `POST` | `/api/brands` | Create new brand |
| `GET` | `/api/brands/:id` | Get brand details |
| `PATCH` | `/api/brands/:id` | Update brand |
| `GET` | `/api/brands/:id/rules` | List brand rules |
| `POST` | `/api/brands/:id/rules` | Create rule |
| `PATCH` | `/api/brands/:id/rules/:ruleId` | Update rule (bumps version) |
| `GET` | `/api/reviews` | List reviews (paginated) |
| `POST` | `/api/reviews` | Validate content + save |
| `GET` | `/api/reviews/:id` | Get review details |
| `DELETE` | `/api/reviews/:id` | Delete review |
| `GET` | `/api/analytics` | Dashboard analytics data |

**Example: Create review**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "morrow-goods",
    "content": "Our 100% sustainable kitchen set is guaranteed to last forever!"
  }'
```

**Response:**
```json
{
  "data": {
    "id": "review_xyz",
    "brandId": "morrow-goods",
    "outcome": "fail",
    "summary": {
      "errorCount": 2,
      "warningCount": 0,
      "totalFindings": 2
    },
    "findings": [
      {
        "id": "finding_1",
        "ruleStableId": "absolute-environmental-claim",
        "severity": "error",
        "matchedPhrase": "100% sustainable",
        "start": 4,
        "end": 20,
        "explanation": "Absolute environmental claims are difficult to substantiate...",
        "suggestion": "Use specific, measurable claims instead."
      }
    ]
  }
}
```

---

## 🚢 Deployment

### Vercel (Recommended) ⭐

**Why Vercel?**
- ✅ Built by the Next.js team (perfect compatibility)
- ✅ File store works without changes (persistent within deployment)
- ✅ Zero configuration needed (auto-detects everything)
- ✅ Free tier includes everything you need
- ✅ Preview deployments for every PR
- ✅ Edge functions for fast global performance

**Deploy in 5 minutes:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vinay4556/Inloom2k26&project-name=inkloom&root-directory=frontend)

**Or manually:**

1. **Push to GitHub** → Connect to Vercel
2. **Import project** at [vercel.com/new](https://vercel.com/new)
3. **Set root directory** to `frontend` (auto-detected)
4. **Add environment variables:**
   - `DEMO_MODE=true`
   - `DEMO_ORG_ID=demo`
   - `CONTENT_RETENTION_DAYS=7`
5. **Click Deploy** ✨

**What works immediately on Vercel:**
- ✅ Landing page + 3D graphics
- ✅ Content validation (real-time)
- ✅ Sample content testing
- ✅ **Review persistence** (file store works!)
- ✅ Dashboard analytics with real data
- ✅ Review history with saved reviews

**See detailed guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

### Add Database (Optional - Post-Hackathon)

For multi-deployment persistence and production scale:

**Option 1: Vercel Postgres (Easiest)**
```bash
# In Vercel dashboard:
# Storage → Create Postgres Database
# Auto-adds DATABASE_URL to environment

# Run migration (already written):
psql $DATABASE_URL < db/migrations/0000_init.sql
```

**Option 2: Vercel KV (Redis - Fast)**
```bash
# For demo/cache: Vercel KV
# In dashboard: Storage → Create KV Database
npm install @vercel/kv
```

**Option 3: External Database**
- **Neon** (https://neon.tech) - Serverless Postgres
- **Supabase** (https://supabase.com) - Postgres + realtime
- **PlanetScale** (https://planetscale.com) - Serverless MySQL

---

### Alternative Platforms

**Railway** - Great for persistent storage ($5/mo)  
**Render** - Good free tier with persistent disks  
**DigitalOcean** - Traditional hosting for production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed comparison and instructions.

---

## 📊 Demo Data

### Morrow Goods (Fictional Brand)

**Profile:**
- Home and lifestyle goods company
- Tone: Warm, clear, practical
- Demo rules are illustrative, not legal advice

**Rule Categories:**

1. **Absolute Environmental Claims** (Error)
   - Triggers: "100% sustainable", "zero impact", "completely eco-friendly"
   - Rationale: Difficult to substantiate, may mislead consumers
   - Fix: Use specific, measurable claims

2. **Restricted Phrases** (Error)
   - Triggers: "guaranteed", "miracle", "risk-free"
   - Rationale: Absolute promises hard to verify
   - Fix: Use qualified language

3. **Vague Superlatives** (Warning)
   - Triggers: "best in class", "industry-leading", "unparalleled"
   - Rationale: Subjective claims without evidence
   - Fix: Add specific metrics or qualifiers

**Sample Content:**

| Sample | Content | Outcome | Findings |
|--------|---------|---------|----------|
| Compliant | "Organic cotton throw blanket..." | ✅ Pass | 0 errors |
| Restricted | "Miracle cleaning spray guaranteed..." | ❌ Fail | 3 errors |
| Absolute | "100% sustainable kitchen set..." | ❌ Fail | 2 errors |

---

## 🤝 Contributing

This is a hackathon project showcasing brand governance technology. Contributions welcome post-event!

**Areas for contribution:**
- PostgreSQL adapter implementation
- Additional rule types (tone analysis, fact-checking)
- Multi-language support
- API rate limiting
- Real authentication system
- Webhook integrations

---

## 📄 License

MIT License - See `LICENSE` file for details.

---

## 🏆 Hackathon Context

**Built for:** [Your Hackathon Name]  
**Category:** Developer Tools / Enterprise SaaS  
**Timeline:** [Duration]  

**What we built:**
- Full-stack brand consistency platform
- Deterministic validation engine (no AI)
- Premium 3D landing experience
- Real-time content analysis
- Analytics dashboard
- 25 automated tests

**Technical highlights:**
- Next.js 16 (React Server Components)
- React Three Fiber (WebGL/3D)
- TypeScript strict mode
- Zero-dependency testing
- Serverless-ready architecture

---

## 📞 Support & Resources

**Documentation:**
- [Hackathon Judge Guide](./HACKATHON_JUDGE_GUIDE.md) - 5-minute walkthrough
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Vercel + alternatives
- [3D Typography Update](./3D_TYPOGRAPHY_UPDATE.md) - Visual system docs

**Testing:**
- [Live Demo](https://frontend-gamma-sand-16.vercel.app)
- [API Health Check](https://frontend-gamma-sand-16.vercel.app/api/health)

**Contact:**
- Project Lead: [Your Name]
- Email: [your-email@example.com]
- GitHub: [@your-username](https://github.com/your-username)

---

## 🎯 Project Status

**Current State:** ✅ **Hackathon Complete**

- [x] 3D landing page with kinetic typography
- [x] Content validation engine
- [x] Demo brand with realistic rules
- [x] Analytics dashboard
- [x] Review history
- [x] 25 automated tests
- [x] Vercel deployment (recommended)
- [x] Judge documentation

**Future Roadmap:**
- [ ] PostgreSQL integration
- [ ] Multi-tenant authentication
- [ ] Slack/Teams webhooks
- [ ] Browser extension
- [ ] API rate limiting
- [ ] Advanced rule types (regex, ML-assisted)

---

<div align="center">

**[→ Try Inkloom Live](https://frontend-gamma-sand-16.vercel.app)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vinay4556/Inloom2k26)

Built with ❤️ by **NEURAL NETWORK**

*Turn brand chaos into consistent voice built on trust and evidence.*

</div>
