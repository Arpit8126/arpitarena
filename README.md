# DevPulse ⚡

> **Unified, zero-authentication aggregator for Indian tech students, engineering freshers, and campus builders.**

DevPulse aggregates:
1. **Active Hackathons** across India with device GPS proximity tracking (Haversine formula), real-time countdowns, themes, submission rounds, and official registration links.
2. **Tech Internships & Entry-Level Roles (SDE)** across 25+ top startups and unicorns (CRED, Meesho, Groww, Linear, Sentry, Supabase, etc.) and hiring challenges from Unstop with batch eligibility, fresher toggle, and direct ATS apply links.

---

## ⚡ Architectural Principles & Security

1. **Zero Authentication for Visitors:**
   - No login, signups, cookies, or tracking. Students get instant, direct access to all verified opportunities.
   - All outbound apply links open directly in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.

2. **Isolated Local Scraper & Protected Admin Trigger:**
   - Hidden route at `/admin-sync` with a terminal-styled interface.
   - Guarded route: If `process.env.NODE_ENV === 'production'`, `POST /api/sync` and `/admin-sync` instantly reject requests with `403 Forbidden`.
   - Node.js server-side streaming via `ReadableStream` providing real-time console progress.

3. **Supabase Database & Keys:**
   - **Frontend & Public Pages:** Read data using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` protected by Row Level Security (`is_active = true`).
   - **Local Sync Engine:** Writes/upserts data using `SUPABASE_SERVICE_ROLE_KEY` (never exposed to client bundles).
   - **ISR Caching:** Incremental Static Regeneration (`revalidate = 3600`) caches public pages to conserve Supabase egress limits.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 & 22)
- npm or pnpm

### 2. Environment Variables
Create a `.env.local` file in the root directory (this file is strictly ignored by git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - Creates `opportunities` table with batch, tech role, and uniqueness constraints.
   - Creates `hackathons` table with location, mode, and round details.
   - Enables Row Level Security (RLS) with public read policies.

### 4. Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live platform.

### 5. Running the Sync Engine (Local Only)
1. Navigate to [http://localhost:3000/admin-sync](http://localhost:3000/admin-sync).
2. Click **"START SCRAPING & SYNC"**.
3. The server-side scraper fetches listings from Devfolio, Unstop, and company ATS boards (Greenhouse, Lever, Ashby), cleans and categorizes them, and upserts them directly to Supabase with live terminal logs.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Cyberpunk/terminal dark aesthetic: `bg-zinc-950`, `border-zinc-800`, emerald and violet accents)
- **Icons:** Lucide React
- **Database:** Supabase PostgreSQL with RLS
- **Scraping & Parsing:** Cheerio, native Fetch
- **Geolocation:** Haversine formula calculation with Indian city lookup dictionary

---

## 🔒 Security & Safe Deployment

- **Version Control:** All `.env` and `.env.*` files are in `.gitignore`. No secret credentials are committed.
- **Production Deployment (Vercel):**
  - Only configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.
  - Do **NOT** set `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
  - The scraper route `/api/sync` is locked with a 403 guard when deployed.

