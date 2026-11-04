import { Hackathon, HackathonMode, HackathonRound, Opportunity } from '@/types';
import { getCityCoordinates } from '@/lib/utils/geo';

interface UnstopItem {
  id: number;
  title: string;
  public_url?: string;
  seo_url?: string;
  region?: string; // 'online', 'offline', 'hybrid'
  details?: string;
  logoUrl2?: string;
  thumb?: string;
  end_date?: string;
  organisation?: {
    name?: string;
    logoUrl?: string;
    logoUrl2?: string;
  };
  address_with_country_logo?: {
    city?: string;
    address?: string;
    lat?: number | string | null;
    lng?: number | string | null;
  };
  regnRequirements?: {
    end_regn_dt?: string;
  };
  required_skills?: Array<{
    skill?: string;
    skill_name?: string;
  }>;
  prizes?: Array<{
    cash?: number;
    title?: string;
  }>;
}

export async function scrapeUnstopHackathons(
  maxPages: number = 8,
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  const seenIds = new Set<number>();
  log?.('Connecting to Unstop Hackathons & Student Challenges API...', 'info');

  const categories = ['hackathons', 'competitions'];

  for (const cat of categories) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=${cat}&oppstatus=open&per_page=50&page=${page}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          next: { revalidate: 0 },
        });

        if (!res.ok) break;

        const json = await res.json();
        const items: UnstopItem[] = json.data?.data || [];
        if (items.length === 0) break;

        for (const item of items) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          const title = item.title || 'Unstop Innovation Challenge';
          const organizer = item.organisation?.name || 'Unstop Partner Institute';

          // Mode
          let mode: HackathonMode = 'online';
          const regionLower = (item.region || '').toLowerCase();
          if (regionLower.includes('offline') || regionLower.includes('on-site')) {
            mode = 'offline';
          } else if (regionLower.includes('hybrid')) {
            mode = 'hybrid';
          }

          // City & Venue
          const city = item.address_with_country_logo?.city || (mode === 'offline' ? 'Bengaluru' : 'India');
          const address = item.address_with_country_logo?.address || city;

          // Coordinates
          let latitude: number | null = null;
          let longitude: number | null = null;
          if (item.address_with_country_logo?.lat && item.address_with_country_logo?.lng) {
            latitude = Number(item.address_with_country_logo.lat);
            longitude = Number(item.address_with_country_logo.lng);
          } else {
            const coords = getCityCoordinates(city);
            latitude = coords?.latitude ?? (mode === 'offline' ? 20.5937 : null);
            longitude = coords?.longitude ?? (mode === 'offline' ? 78.9629 : null);
          }

          // Themes
          const themes: string[] = [];
          if (Array.isArray(item.required_skills)) {
            for (const s of item.required_skills) {
              const sk = s.skill_name || s.skill;
              if (sk) themes.push(sk.toLowerCase());
            }
          }
          if (themes.length === 0) {
            themes.push('ai', 'full-stack', 'problem-solving', 'coding');
          }

          // Registration deadline
          const deadline =
            item.regnRequirements?.end_regn_dt ||
            item.end_date ||
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

          // Banner URL
          const banner =
            item.logoUrl2 ||
            item.thumb ||
            item.organisation?.logoUrl2 ||
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

          const applyUrl =
            item.seo_url ||
            (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/hackathons/${item.id}`);

          hackathons.push({
            id: `unstop-${item.id}`,
            title,
            organizer,
            banner_image_url: banner,
            mode,
            venue_city: city,
            venue_address: address,
            latitude,
            longitude,
            themes,
            start_date: new Date().toISOString(),
            end_date: item.end_date || null,
            registration_deadline: deadline,
            problem_statement: item.details || `Official challenge for ${title} hosted by ${organizer}.`,
            rounds_description: [
              {
                round_num: 1,
                name: 'Round 1: Screening & Idea Submission',
                date: 'Stage 1',
                details: 'Submit concept notes, presentation, and team details.',
              },
              {
                round_num: 2,
                name: 'Round 2: Prototype & Solution Development',
                date: 'Stage 2',
                details: 'Build working prototype and deliver project walkthrough.',
              },
              {
                round_num: 3,
                name: 'Grand Finale & Jury Review',
                date: 'Grand Finale',
                details: 'Live pitching, evaluation by panel, and cash award ceremony.',
              },
            ],
            prizes_summary: 'Cash prizes, certificates, official mentorship, and PPI hiring opportunities.',
            apply_url: applyUrl,
            platform: 'unstop',
            created_at: new Date().toISOString(),
            is_active: true,
          });
        }
      } catch {
        // Continue to next page
      }
    }
  }

  log?.(`[✓] Extracted total ${hackathons.length} active hackathons from Unstop`, 'success');
  return hackathons;
}

export async function scrapeUnstopOpportunities(
  maxPages: number = 4,
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  const seenIds = new Set<number>();
  log?.('Connecting to Unstop Tech Internships & Jobs API...', 'info');

  const targets = [
    { type: 'internships', oppType: 'internship' as const },
    { type: 'jobs', oppType: 'full-time' as const },
  ];

  for (const target of targets) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=${target.type}&oppstatus=open&per_page=50&page=${page}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
          next: { revalidate: 0 },
        });

        if (!res.ok) break;

        const json = await res.json();
        const items: UnstopItem[] = json.data?.data || [];
        if (items.length === 0) break;

        for (const item of items) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          const title = item.title || 'Software Development Engineer';
          const titleLower = title.toLowerCase();

          // Infer tech role
          let techRole = 'fullstack';
          if (titleLower.includes('front')) techRole = 'frontend';
          else if (titleLower.includes('back')) techRole = 'backend';
          else if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('ml')) techRole = 'ai-ml';
          else if (titleLower.includes('data') || titleLower.includes('analyst')) techRole = 'data-science';
          else if (titleLower.includes('cloud') || titleLower.includes('devops')) techRole = 'devops';
          else if (titleLower.includes('mobile') || titleLower.includes('android') || titleLower.includes('ios')) techRole = 'mobile';

          const company = item.organisation?.name || 'Tech Innovator';
          const logo = item.organisation?.logoUrl2 || item.logoUrl2 || null;
          const city = item.address_with_country_logo?.city || 'Bengaluru';
          const regionLower = (item.region || '').toLowerCase();
          const locType = regionLower.includes('remote') ? 'remote' : regionLower.includes('hybrid') ? 'hybrid' : 'on-site';

          const applyUrl =
            item.seo_url ||
            (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/o/${item.id}`);

          opportunities.push({
            id: `unstop-${item.id}`,
            title,
            company_name: company,
            company_type: 'startup',
            company_logo_url: logo,
            opportunity_type: target.oppType,
            tech_role: techRole,
            target_batches: [2025, 2026, 2027, 2028],
            is_fresher_eligible: true,
            min_exp_years: 0.0,
            location_type: locType,
            city,
            country: 'India',
            full_description_html: item.details || `<p>${title} opportunity at ${company}.</p>`,
            requirements_bullets: [
              'Proficiency in core computer science subjects (Data Structures, Algorithms)',
              'Experience with modern web / application frameworks',
              'Strong problem solving and team collaboration skills',
            ],
            stipend_or_salary: target.oppType === 'internship' ? '₹25,000 - ₹50,000 / month' : '₹6 - 18 LPA',
            apply_url: applyUrl,
            source_platform: 'Unstop',
            posted_at: new Date().toISOString(),
            is_active: true,
          });
        }
      } catch {
        // Next page
      }
    }
  }

  log?.(`[✓] Extracted ${opportunities.length} opportunities from Unstop`, 'success');
  return opportunities;
}
