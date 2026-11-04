-- ====================================================================
-- DevPulse Supabase Database Schema
-- ====================================================================

-- 1. Opportunities Table (Jobs & Internships)
CREATE TABLE IF NOT EXISTS opportunities (
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
CREATE TABLE IF NOT EXISTS hackathons (
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

-- 4. Policies (Idempotent: Drop if exists then create)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'opportunities' AND policyname = 'Public Read Opportunities'
    ) THEN
        CREATE POLICY "Public Read Opportunities" ON opportunities FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'hackathons' AND policyname = 'Public Read Hackathons'
    ) THEN
        CREATE POLICY "Public Read Hackathons" ON hackathons FOR SELECT USING (is_active = true);
    END IF;
END
$$;

-- 5. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_opportunities_tech_role ON opportunities(tech_role);
CREATE INDEX IF NOT EXISTS idx_opportunities_company_type ON opportunities(company_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_opportunity_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_hackathons_active ON hackathons(is_active);
CREATE INDEX IF NOT EXISTS idx_hackathons_deadline ON hackathons(registration_deadline);

