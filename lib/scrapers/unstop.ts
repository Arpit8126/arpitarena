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
  opportunity_config?: {
    banner_config?: string;
  };
}

export async function scrapeUnstopHackathons(
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  log?.('Connecting to Unstop Hackathons API...', 'info');

  try {
    const url = 'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=20&oppstatus=open';
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      log?.(`Unstop hackathons API returned HTTP ${res.status}`, 'warn');
      return hackathons;
    }

    const json = await res.json();
    const items: UnstopItem[] = json.data?.data || [];
    log?.(`Fetched ${items.length} hackathons from Unstop. Parsing details...`, 'info');

    for (const item of items) {
      const title = item.title || 'Unstop Innovation Challenge';
      const organizer = item.organisation?.name || 'Unstop Partner';

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
        themes.push('ai', 'full-stack', 'problem-solving');
      }

      // Registration deadline
      const deadline =
        item.regnRequirements?.end_regn_dt ||
        item.end_date ||
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      // Banner URL
      const banner =
        item.logoUrl2 ||
        item.thumb ||
        item.organisation?.logoUrl2 ||
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

      const applyUrl =
        item.seo_url ||
        (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/hackathons/${item.id}`);

      // Rounds parsing
      const rounds: HackathonRound[] = [
        {
          round_num: 1,
          name: 'Online Idea Submission',
          date: 'Stage 1',
          details: 'Submit executive abstract, architecture diagram, and USP.',
        },
        {
          round_num: 2,
          name: 'Prototype Development & Review',
          date: 'Stage 2',
          details: 'Develop working proof-of-concept with live demo / code repository.',
        },
        {
          round_num: 3,
          name: 'Grand Finale & Pitching',
          date: item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Grand Finale',
          details: 'Pitch in front of jury and industry leaders for rewards and hiring tracks.',
        },
      ];

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
        problem_statement: item.details || 'Exciting hackathon challenge on Unstop.',
        rounds_description: rounds,
        prizes_summary: 'Cash prizes, certificates, mentorship, and direct interview opportunities.',
        apply_url: applyUrl,
        platform: 'unstop',
        created_at: new Date().toISOString(),
        is_active: true,
      });
    }

    log?.(`[✓] Extracted ${hackathons.length} hackathons from Unstop`, 'success');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log?.(`Unstop scraper error: ${message}`, 'error');
  }

  return hackathons;
}

export async function scrapeUnstopOpportunities(
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  log?.('Connecting to Unstop Tech Internships & Jobs API...', 'info');

  try {
    const urls = [
      'https://unstop.com/api/public/opportunity/search-result?opportunity=internships&per_page=15',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=jobs&per_page=15',
    ];

    for (const url of urls) {
      const isIntern = url.includes('internships');
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });

      if (!res.ok) continue;

      const json = await res.json();
      const items: UnstopItem[] = json.data?.data || [];

      for (const item of items) {
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

        const company = item.organisation?.name || 'Tech Company';
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
          opportunity_type: isIntern ? 'internship' : 'full-time',
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
          stipend_or_salary: isIntern ? '₹25,000 - ₹50,000 / month' : '₹6 - 15 LPA',
          apply_url: applyUrl,
          source_platform: 'Unstop',
          posted_at: new Date().toISOString(),
          is_active: true,
        });
      }
    }

    log?.(`[✓] Extracted ${opportunities.length} opportunities from Unstop`, 'success');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log?.(`Unstop opportunities scraper error: ${message}`, 'error');
  }

  return opportunities;
}
