Markdown
You are an expert full-stack engineer building a unified, production-ready, zero-authentication web platform called "DevPulse" for Indian tech students. 

The application aggregates:
1. Active Hackathons (with GPS proximity sorting, countdowns, rounds, problem statements, and direct apply links).
2. Tech Internships & Jobs (with company type, role, graduation batch, fresher, and city filters, full JD modal, and direct apply links).

### CRITICAL ARCHITECTURAL CONSTRAINTS
1. Single Unified Codebase: Build everything within one Next.js project using TypeScript and Node.js. NO Python under any circumstances.
2. Zero Authentication for Visitors: No sign up, no login, no cookies, no tracking. Outbound links must open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
3. Local-Only Scraper / Admin Trigger:
   - Provide a hidden route `/admin-sync` with a sleek dashboard and a "Trigger Full Sync" button.
   - Guard this route and its API route `POST /api/sync`: If `process.env.NODE_ENV === 'production'`, immediately return 403 Forbidden.
   - Scraping/syncing runs on Node.js server-side inside `app/api/sync/route.ts` using native fetch and Cheerio. It streams real-time console log progress to the `/admin-sync` UI using standard ReadableStream.
4. Database & Keys (Supabase):
   - Frontend reads data using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - The local sync engine writes and upserts data using `SUPABASE_SERVICE_ROLE_KEY` (bypassing RLS).
   - Use Next.js Incremental Static Regeneration (ISR) with `export const revalidate = 3600` on public pages to conserve Supabase egress limits. Never fetch full HTML job descriptions or hackathon rounds in initial card listings.
5. Tech Stack & Styling:
   - Next.js (App Router, TypeScript)
   - Tailwind CSS (Terminal/cyberpunk-inspired dark theme: `bg-zinc-950`, `border-zinc-800`, `text-zinc-100`, high-contrast green/emerald and violet accents)
   - Lucide React icons
   - Cheerio, Axios, @supabase/supabase-js

---

### 1. SUPABASE DATABASE SCHEMA (SQL DDL)
Provide `supabase/schema.sql`:

```sql
-- 1. Opportunities Table (Jobs & Internships)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_type TEXT CHECK (company_type IN ('startup', 'mnc', 'enterprise')),
    company_logo_url TEXT,
    opportunity_type TEXT CHECK (opportunity_type IN ('internship', 'full-time')),
    tech_role TEXT NOT NULL, -- 'frontend', 'backend', 'fullstack', 'ai-ml', 'data-science', 'devops', 'mobile'
    target_batches INT[] NOT NULL, -- e.g. ARRAY[2025, 2026, 2027, 2028]
    is_fresher_eligible BOOLEAN DEFAULT TRUE,
    min_exp_years NUMERIC(3,1) DEFAULT 0.0,
    location_type TEXT CHECK (location_type IN ('remote', 'hybrid', 'on-site')),
    city TEXT,
    country TEXT DEFAULT 'India',
    full_description_html TEXT,
    requirements_bullets TEXT[],
    stipend_or_salary TEXT,
    apply_url TEXT NOT NULL,
    source_platform TEXT NOT NULL, -- 'Greenhouse', 'Lever', 'Ashby', 'Unstop', 'Direct'
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_opportunity UNIQUE (company_name, title, apply_url)
);

-- 2. Hackathons Table
CREATE TABLE hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    banner_image_url TEXT NOT NULL,
    mode TEXT CHECK (mode IN ('online', 'offline', 'hybrid')),
    venue_city TEXT,
    venue_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    themes TEXT[] NOT NULL, -- ['ai', 'web3', 'fintech', 'iot', 'open-innovation', 'cloud']
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ NOT NULL,
    problem_statement TEXT,
    rounds_description JSONB, -- Array of { round_num: number, name: string, date: string, details: string }
    prizes_summary TEXT,
    apply_url TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'unstop', 'devfolio', 'devpost', 'luma', 'mlh'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_hackathon UNIQUE (title, organizer)
);

-- 3. Row Level Security (RLS)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Opportunities" ON opportunities FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Hackathons" ON hackathons FOR SELECT USING (is_active = true);
2. SCRAPING & SYNC LOGIC (Pure Node.js / TypeScript)
Implement modular scraper modules under lib/scrapers/:

lib/scrapers/devfolio.ts:

Fetch public active hackathons from Devfolio API/search endpoints.

Extract title, organizer, banner image URL, mode, venue city, coordinates (latitude/longitude), tags/themes, deadline, and registration link.

lib/scrapers/unstop.ts:

Fetch active student hackathons and hiring challenges via Unstop's public listings API.

Parse rounds/stages into a JSON array, capture banner images, location, and apply URL.

lib/scrapers/ats.ts:

Query public ATS endpoints for an array of 25+ Indian startups and unicorns (e.g., Razorpay, Swiggy, Postman, CRED, Meesho, InVideo, Zepto):

Greenhouse: https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true

Lever: https://api.lever.co/v0/postings/{company}?mode=json

Ashby: https://api.ashbyhq.com/posting-api/job-board/{company}

Filter strictly for engineering/tech keywords ("Intern", "Internship", "SDE", "Frontend", "Backend", "Full Stack", "Data Science", "AI", "Mobile") in India or Remote.

Infer target batches [2025, 2026, 2027, 2028] and categorize tech_role.

lib/utils/geo.ts:

Indian city lookup dictionary mapping major cities (Bengaluru, Delhi NCR, Gurugram, Noida, Mumbai, Pune, Hyderabad, Chennai, Kolkata, Mathura, Roorkee) to exact latitude and longitude for proximity calculations.

app/api/sync/route.ts:

Enforce environment protection: If process.env.NODE_ENV === 'production', reject with 403.

Use Supabase Service Role client (SUPABASE_SERVICE_ROLE_KEY).

Mark existing records is_active = false.

Run scrapers with try/catch per source so one failed endpoint doesn't abort the sync.

Perform PostgreSQL UPSERTS (onConflict) with is_active = true.

Return real-time progress text using a ReadableStream.

3. FRONTEND UI & FEATURES
Build a modular UI with the following components:

Navigation Bar & Hero:

Header with category switcher: "⚡ Hackathons" vs "💼 Tech Internships & Jobs".

Search bar filtering cards by keyword on the client.

Trust badge: "100% Free • Direct Links • Zero Logins".

"💼 Tech Internships & Jobs" Tab:

Filters:

Company Type: All, Startups, MNCs / Large Tech.

Opportunity Type: All, Internship, Full-Time.

Tech Role: All, Frontend, Backend, Full-Stack, AI/ML, Data Science, DevOps/Cloud, Mobile.

Target Batch: 2025, 2026, 2027, 2028, and a Freshers (0 Exp) toggle.

Location: Remote Only, Hybrid, On-site + City dropdown.

Job Card: Clean card showing company logo, title, badges for batch and role, stipend/salary, location, and two buttons:

"View Full Role" (Opens modal).

"Apply Direct ↗" (Outbound link).

"⚡ Hackathons" Tab:

Filters:

Sort: Latest to Oldest, Deadline Soonest, Nearest (GPS).

Mode: All, Online, Offline, Hybrid.

Themes: AI / GenAI, Web & App, Web3 / Blockchain, IoT / Hardware, Open Innovation.

GPS Proximity Tracking:

"📍 Find Near Me" button using navigator.geolocation.getCurrentPosition.

Computes Haversine distance from the user's coordinates to each hackathon's lat/lng.

Displays distance badges (e.g., "📍 14 km away - Bengaluru") and sorts closest to furthest.

Hackathon Card:

Banner image (16:9) with fallback gradient SVGs if broken.

Days left to register badge.

Action buttons: "View Problem & Rounds" and "Register on [Platform] ↗".

Rich Detail Modal (components/DetailModal.tsx):

Lazy-loads complete information on demand by ID from Supabase.

Jobs: Formatted JD, bulleted requirements, stipend, and a sticky "Apply on Official Site ↗" button.

Hackathons: Large banner, visual step-by-step vertical timeline of rounds, problem statement, themes, and a sticky "Go to Registration Page ↗" button.

Hidden Admin Sync Dashboard (app/admin-sync/page.tsx):

If in production mode, displays "403 Forbidden - Local Development Only".

If local (localhost:3000), displays a terminal-styled interface with a "Start Scraping & Sync" button.

When clicked, connects to POST /api/sync, listens to the stream, and prints live logs in a dark-mode terminal window (e.g., [✓] Extracted 34 hackathons from Devfolio, [✓] Upserted 85 jobs into Supabase).

Footer:

Direct attribution disclaimer and "Takedown / Removal Request" link.

DELIVERABLES
Generate complete, error-free files for:

supabase/schema.sql

types/index.ts

lib/supabaseClient.ts (public client) and lib/supabaseAdmin.ts (service role client)

lib/scrapers/devfolio.ts, lib/scrapers/unstop.ts, and lib/scrapers/ats.ts

lib/utils/geo.ts

app/api/sync/route.ts

app/admin-sync/page.tsx

components/Navbar.tsx, components/HackathonFeed.tsx, components/JobFeed.tsx, and components/DetailModal.tsx

app/page.tsx

app/layout.tsx and .env.example


---

### How Your Workflow Will Function Once Built

1. **In Development (Local Machine):**
   * Run `npm run dev`.
   * Open `http://localhost:3000/admin-sync`.
   * Click **"Start Scraping & Sync"**. The Node.js route handler fetches Devfolio, Unstop, and the company ATS boards, cleans the listings, and upserts them to your live Supabase database.
2. **In Production (Vercel):**
   * You push to GitHub and deploy to Vercel.
   * Add only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel's environment variables.
   * Any student opening your live domain gets the fast, cached read-only interface with instant