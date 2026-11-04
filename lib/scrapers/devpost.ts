import { Hackathon, HackathonMode } from '@/types';
import { getCityCoordinates } from '@/lib/utils/geo';

interface DevpostRawHackathon {
  id: number;
  title: string;
  displayed_location?: {
    icon?: string;
    location?: string;
  };
  open_state?: string;
  thumbnail_url?: string;
  url?: string;
  time_left_to_submission?: string;
  submission_period_dates?: string;
  themes?: Array<{
    id?: number;
    name?: string;
  }>;
  prize_amount?: string;
  organization_name?: string;
}

export async function scrapeDevpost(
  maxPages: number = 5,
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  log?.('Connecting to Devpost public hackathons API...', 'info');

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `https://devpost.com/api/hackathons?challenge_type[]=online&challenge_type[]=in-person&status[]=open&status[]=upcoming&page=${page}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) break;

      const data = await res.json();
      const rawList: DevpostRawHackathon[] = data.hackathons || [];
      if (rawList.length === 0) break;

      for (const item of rawList) {
        // Skip invite-only or non-open
        if (item.open_state && item.open_state !== 'open' && item.open_state !== 'upcoming') {
          continue;
        }

        const locationStr = item.displayed_location?.location || 'Online';
        let mode: HackathonMode = 'online';
        if (locationStr.toLowerCase().includes('in-person') || (!locationStr.toLowerCase().includes('online') && locationStr.length > 2)) {
          mode = 'offline';
        }

        const city = mode === 'offline' ? locationStr.split(',')[0].trim() : 'Global Online';
        const coords = getCityCoordinates(city);
        const latitude = coords?.latitude ?? (mode === 'offline' ? 20.5937 : null);
        const longitude = coords?.longitude ?? (mode === 'offline' ? 78.9629 : null);

        // Themes
        const themes = (item.themes || []).map((t) => (t.name || '').toLowerCase()).filter(Boolean);
        if (themes.length === 0) {
          themes.push('ai', 'web', 'open-innovation');
        }

        // Clean banner thumbnail
        let banner = item.thumbnail_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
        if (banner.startsWith('//')) {
          banner = 'https:' + banner;
        }

        // Clean prize summary
        let prizeClean = item.prize_amount ? item.prize_amount.replace(/<[^>]*>?/gm, '') : 'Sponsored prizes & global recognition';

        // Calculate deadline
        const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        hackathons.push({
          id: `devpost-${item.id}`,
          title: item.title,
          organizer: item.organization_name || 'Devpost Community',
          banner_image_url: banner,
          mode,
          venue_city: city,
          venue_address: locationStr,
          latitude,
          longitude,
          themes,
          registration_deadline: deadline,
          problem_statement: `Build solutions for ${item.title}. Prizes: ${prizeClean}. Open submission via Devpost.`,
          rounds_description: [
            {
              round_num: 1,
              name: 'Project Submission & Review',
              date: item.submission_period_dates || 'Active',
              details: 'Submit project overview, demo video, and public repository.',
            },
            {
              round_num: 2,
              name: 'Judging & Winner Announcement',
              date: 'Post-Deadline',
              details: 'Judges score projects across novelty, design, technical execution, and impact.',
            },
          ],
          prizes_summary: prizeClean,
          apply_url: item.url || `https://devpost.com/software/${item.id}`,
          platform: 'devpost',
          created_at: new Date().toISOString(),
          is_active: true,
        });
      }
    }

    log?.(`[✓] Extracted ${hackathons.length} hackathons from Devpost`, 'success');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log?.(`Devpost scraper error: ${message}`, 'error');
  }

  return hackathons;
}
