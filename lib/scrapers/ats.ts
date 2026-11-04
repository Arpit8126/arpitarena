import { Opportunity, TechRole, CompanyType, LocationType, OpportunityType } from '@/types';

interface ATSBoardConfig {
  name: string;
  slug: string;
  type: 'greenhouse' | 'lever' | 'ashby';
  companyType: CompanyType;
  logoUrl?: string;
}

const ATS_BOARDS: ATSBoardConfig[] = [
  // Lever Boards
  { name: 'CRED', slug: 'cred', type: 'lever', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/cred.club' },
  { name: 'Meesho', slug: 'meesho', type: 'lever', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/meesho.com' },
  { name: 'Hotstar', slug: 'hotstar', type: 'lever', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/hotstar.com' },
  { name: 'Linear', slug: 'linear', type: 'ashby', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/linear.app' },
  { name: 'Supabase', slug: 'supabase', type: 'ashby', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/supabase.com' },
  { name: 'Sentry', slug: 'sentry', type: 'ashby', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/sentry.io' },
  { name: 'Pinecone', slug: 'pinecone', type: 'ashby', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/pinecone.io' },
  { name: 'Modal', slug: 'modal', type: 'ashby', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/modal.com' },

  // Greenhouse Boards
  { name: 'Groww', slug: 'groww', type: 'greenhouse', companyType: 'startup', logoUrl: 'https://logo.clearbit.com/groww.in' },
  { name: 'GitLab', slug: 'gitlab', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/gitlab.com' },
  { name: 'Canonical', slug: 'canonical', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/canonical.com' },
  { name: 'Stripe', slug: 'stripe', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/stripe.com' },
  { name: 'Cloudflare', slug: 'cloudflare', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/cloudflare.com' },
  { name: 'Databricks', slug: 'databricks', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/databricks.com' },
  { name: 'Datadog', slug: 'datadog', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/datadoghq.com' },
  { name: 'Airtable', slug: 'airtable', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/airtable.com' },
  { name: 'Robinhood', slug: 'robinhood', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/robinhood.com' },
  { name: 'Elastic', slug: 'elastic', type: 'greenhouse', companyType: 'enterprise', logoUrl: 'https://logo.clearbit.com/elastic.co' },
];

const TECH_KEYWORDS = [
  'intern',
  'internship',
  'sde',
  'software',
  'frontend',
  'front-end',
  'backend',
  'back-end',
  'full stack',
  'fullstack',
  'engineer',
  'developer',
  'data scientist',
  'data engineer',
  'machine learning',
  'ai ',
  'ai/',
  'ml ',
  'mobile',
  'android',
  'ios',
  'devops',
  'cloud',
  'qa',
  'test',
  'security',
];

function categorizeTechRole(title: string): TechRole {
  const lower = title.toLowerCase();
  if (lower.includes('front')) return 'frontend';
  if (lower.includes('back')) return 'backend';
  if (lower.includes('full') || lower.includes('stack')) return 'fullstack';
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) return 'ai-ml';
  if (lower.includes('data')) return 'data-science';
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('infra') || lower.includes('platform')) return 'devops';
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) return 'mobile';
  return 'fullstack';
}

function inferOpportunityType(title: string): OpportunityType {
  const lower = title.toLowerCase();
  if (lower.includes('intern') || lower.includes('trainee') || lower.includes('fellow')) {
    return 'internship';
  }
  return 'full-time';
}

function isTechJob(title: string): boolean {
  const lower = title.toLowerCase();
  return TECH_KEYWORDS.some((kw) => lower.includes(kw));
}

function isIndiaOrRemote(locationText: string): boolean {
  if (!locationText) return true;
  const lower = locationText.toLowerCase();
  const indiaKeywords = ['india', 'bengaluru', 'bangalore', 'delhi', 'gurugram', 'gurgaon', 'noida', 'mumbai', 'pune', 'hyderabad', 'chennai', 'remote', 'anywhere'];
  return indiaKeywords.some((k) => lower.includes(k));
}

export async function scrapeATS(
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Opportunity[]> {
  const allOpportunities: Opportunity[] = [];
  log?.(`Starting multi-source ATS scraper across ${ATS_BOARDS.length} company boards...`, 'info');

  for (const board of ATS_BOARDS) {
    try {
      if (board.type === 'greenhouse') {
        const url = `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
        if (!res.ok) continue;

        const data = await res.json();
        const jobs = data.jobs || [];
        let matched = 0;

        for (const job of jobs) {
          const title = job.title || '';
          const location = job.location?.name || '';

          if (!isTechJob(title) || !isIndiaOrRemote(location)) continue;

          const oppType = inferOpportunityType(title);
          const role = categorizeTechRole(title);
          const isRemote = location.toLowerCase().includes('remote');
          const isHybrid = location.toLowerCase().includes('hybrid');
          const locType: LocationType = isRemote ? 'remote' : isHybrid ? 'hybrid' : 'on-site';

          allOpportunities.push({
            id: `gh-${board.slug}-${job.id}`,
            title,
            company_name: board.name,
            company_type: board.companyType,
            company_logo_url: board.logoUrl || null,
            opportunity_type: oppType,
            tech_role: role,
            target_batches: oppType === 'internship' ? [2025, 2026, 2027, 2028] : [2024, 2025, 2026],
            is_fresher_eligible: oppType === 'internship' || title.toLowerCase().includes('junior') || title.toLowerCase().includes('i') || title.toLowerCase().includes('associate'),
            min_exp_years: oppType === 'internship' ? 0.0 : 0.0,
            location_type: locType,
            city: location || 'Bengaluru',
            country: 'India',
            full_description_html: job.content ? String(job.content) : `<p>${title} at ${board.name}.</p>`,
            requirements_bullets: [
              'Strong CS fundamentals in Algorithms, Data Structures and System Design',
              'Hands-on experience in building performant and scalable software',
              'Clear communication and self-driven execution ability',
            ],
            stipend_or_salary: oppType === 'internship' ? '₹40,000 - ₹80,000 / month' : '₹12 - 30 LPA',
            apply_url: job.absolute_url || `https://boards.greenhouse.io/${board.slug}/jobs/${job.id}`,
            source_platform: 'Greenhouse',
            posted_at: job.updated_at || new Date().toISOString(),
            is_active: true,
          });
          matched++;
        }
        if (matched > 0) {
          log?.(`[✓] ${board.name} (Greenhouse): Extracted ${matched} tech opportunities`, 'info');
        }
      } else if (board.type === 'lever') {
        const url = `https://api.lever.co/v0/postings/${board.slug}?mode=json`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
        if (!res.ok) continue;

        const jobs = await res.json();
        if (!Array.isArray(jobs)) continue;

        let matched = 0;
        for (const job of jobs) {
          const title = job.text || '';
          const location = job.categories?.location || '';

          if (!isTechJob(title) || !isIndiaOrRemote(location)) continue;

          const oppType = inferOpportunityType(title);
          const role = categorizeTechRole(title);
          const isRemote = job.workplaceType === 'remote' || location.toLowerCase().includes('remote');
          const isHybrid = job.workplaceType === 'hybrid' || location.toLowerCase().includes('hybrid');
          const locType: LocationType = isRemote ? 'remote' : isHybrid ? 'hybrid' : 'on-site';

          allOpportunities.push({
            id: `lever-${board.slug}-${job.id}`,
            title,
            company_name: board.name,
            company_type: board.companyType,
            company_logo_url: board.logoUrl || null,
            opportunity_type: oppType,
            tech_role: role,
            target_batches: oppType === 'internship' ? [2025, 2026, 2027, 2028] : [2024, 2025, 2026],
            is_fresher_eligible: oppType === 'internship' || title.toLowerCase().includes('junior') || title.toLowerCase().includes('1'),
            min_exp_years: oppType === 'internship' ? 0.0 : 0.0,
            location_type: locType,
            city: location || 'Bengaluru',
            country: 'India',
            full_description_html: job.descriptionPlain ? `<p>${job.descriptionPlain}</p>` : `<p>${title} at ${board.name}.</p>`,
            requirements_bullets: [
              'Hands-on experience in software engineering projects',
              'Knowledge of modern web frameworks, databases, and APIs',
              'Team player with high curiosity and engineering rigor',
            ],
            stipend_or_salary: oppType === 'internship' ? '₹45,000 - ₹90,000 / month' : '₹15 - 35 LPA',
            apply_url: job.hostedUrl || `https://jobs.lever.co/${board.slug}/${job.id}`,
            source_platform: 'Lever',
            posted_at: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
            is_active: true,
          });
          matched++;
        }
        if (matched > 0) {
          log?.(`[✓] ${board.name} (Lever): Extracted ${matched} tech opportunities`, 'info');
        }
      } else if (board.type === 'ashby') {
        const url = `https://api.ashbyhq.com/posting-api/job-board/${board.slug}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
        if (!res.ok) continue;

        const data = await res.json();
        const jobs = data.jobs || [];
        let matched = 0;

        for (const job of jobs) {
          const title = job.title || '';
          const location = job.location || job.department || '';

          if (!isTechJob(title) || !isIndiaOrRemote(location)) continue;

          const oppType = inferOpportunityType(title);
          const role = categorizeTechRole(title);
          const isRemote = job.isRemote || location.toLowerCase().includes('remote');
          const locType: LocationType = isRemote ? 'remote' : 'hybrid';

          allOpportunities.push({
            id: `ashby-${board.slug}-${job.id}`,
            title,
            company_name: board.name,
            company_type: board.companyType,
            company_logo_url: board.logoUrl || null,
            opportunity_type: oppType,
            tech_role: role,
            target_batches: oppType === 'internship' ? [2025, 2026, 2027, 2028] : [2024, 2025, 2026],
            is_fresher_eligible: oppType === 'internship' || title.toLowerCase().includes('early') || title.toLowerCase().includes('junior'),
            min_exp_years: 0.0,
            location_type: locType,
            city: location || 'Remote',
            country: 'India',
            full_description_html: job.descriptionHtml || `<p>${title} at ${board.name}.</p>`,
            requirements_bullets: [
              'Experience developing production web applications or distributed systems',
              'Strong knowledge of modern frameworks (Next.js, Node, Go, or Python)',
              'Passionate about developer productivity and crafting high quality products',
            ],
            stipend_or_salary: oppType === 'internship' ? '₹50,000 - ₹1,00,000 / month' : '₹18 - 40 LPA',
            apply_url: job.jobUrl || `https://jobs.ashbyhq.com/${board.slug}/${job.id}`,
            source_platform: 'Ashby',
            posted_at: job.publishedAt || new Date().toISOString(),
            is_active: true,
          });
          matched++;
        }
        if (matched > 0) {
          log?.(`[✓] ${board.name} (Ashby): Extracted ${matched} tech opportunities`, 'info');
        }
      }
    } catch {
      // Continue next board without crashing
    }
  }

  log?.(`[✓] Extracted total ${allOpportunities.length} jobs & internships from ATS boards`, 'success');
  return allOpportunities;
}

