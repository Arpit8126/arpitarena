import * as cheerio from 'cheerio';
import { Hackathon, HackathonMode } from '@/types';
import { getCityCoordinates } from '@/lib/utils/geo';

interface DevfolioRawHackathon {
  uuid?: string;
  slug?: string;
  name?: string;
  tagline?: string;
  desc?: string;
  is_online?: boolean;
  starts_at?: string;
  ends_at?: string;
  city?: string;
  location?: string;
  themes?: Array<{ theme?: { name?: string }; name?: string }>;
  settings?: {
    reg_ends_at?: string;
    site?: string;
    featured_cover_img?: string;
    featured_cover_img_v2?: string;
    external_apply_url?: string;
  };
  hackathon_setting?: {
    reg_ends_at?: string;
    site?: string;
  };
  cover_img?: string;
}

export async function scrapeDevfolio(
  log?: (msg: string, type?: 'info' | 'success' | 'warn' | 'error') => void
): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  log?.('Connecting to Devfolio hackathons listing...', 'info');

  try {
    const response = await fetch('https://devfolio.co/hackathons', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      log?.(`Devfolio returned HTTP ${response.status}`, 'warn');
      return hackathons;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const nextDataRaw = $('script#__NEXT_DATA__').html();

    if (!nextDataRaw) {
      log?.('Could not extract __NEXT_DATA__ from Devfolio', 'warn');
      return hackathons;
    }

    const parsed = JSON.parse(nextDataRaw);
    const queries = parsed?.props?.pageProps?.dehydratedState?.queries || [];
    const queryData = queries[0]?.state?.data;

    const rawList: DevfolioRawHackathon[] = [
      ...(queryData?.open_hackathons || []),
      ...(queryData?.upcoming_hackathons || []),
      ...(queryData?.featured_hackathons || []),
    ];

    // Deduplicate by slug
    const seenSlugs = new Set<string>();
    const uniqueRaw: DevfolioRawHackathon[] = [];
    for (const item of rawList) {
      if (item.slug && !seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        uniqueRaw.push(item);
      }
    }

    log?.(`Discovered ${uniqueRaw.length} active/upcoming hackathons on Devfolio. Fetching details...`, 'info');

    // Fetch details for top 15 items to get precise city, cover image, and description
    for (const item of uniqueRaw.slice(0, 15)) {
      if (!item.slug) continue;

      let detail: DevfolioRawHackathon = item;
      try {
        const detailRes = await fetch(`https://api.devfolio.co/api/hackathons/${item.slug}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: 'application/json',
          },
        });
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          detail = { ...item, ...detailJson };
        }
      } catch {
        // Fallback to list item if detail fetch fails
      }

      const title = detail.name || item.name || 'Devfolio Hackathon';
      const organizer = detail.slug ? `${detail.slug.toUpperCase()} Community` : 'Devfolio Community';

      // Mode detection
      let mode: HackathonMode = 'online';
      if (detail.is_online === false) {
        mode = 'offline';
      }

      // Venue / City
      const venueCity = detail.city || 'India';
      const venueAddress = detail.location || (mode === 'offline' ? venueCity : 'Online');

      // Coordinates
      const coords = getCityCoordinates(venueCity);
      const latitude = coords?.latitude ?? (mode === 'offline' ? 20.5937 : null);
      const longitude = coords?.longitude ?? (mode === 'offline' ? 78.9629 : null);

      // Themes
      const themesList: string[] = [];
      if (Array.isArray(detail.themes)) {
        for (const t of detail.themes) {
          const name = t.theme?.name || t.name;
          if (name) themesList.push(name.toLowerCase());
        }
      }
      if (themesList.length === 0) {
        themesList.push('open-innovation', 'web3', 'ai');
      }

      // Registration deadline
      const regDeadline =
        detail.hackathon_setting?.reg_ends_at ||
        detail.settings?.reg_ends_at ||
        detail.ends_at ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      // Banner image
      const banner =
        detail.cover_img ||
        detail.settings?.featured_cover_img ||
        detail.settings?.featured_cover_img_v2 ||
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';

      const applyUrl =
        detail.settings?.site ||
        `https://${detail.slug}.devfolio.co` ||
        `https://devfolio.co/hackathons/${detail.slug}`;

      hackathons.push({
        id: detail.uuid || `devfolio-${detail.slug}`,
        title,
        organizer,
        banner_image_url: banner,
        mode,
        venue_city: venueCity,
        venue_address: venueAddress,
        latitude,
        longitude,
        themes: themesList,
        start_date: detail.starts_at || null,
        end_date: detail.ends_at || null,
        registration_deadline: regDeadline,
        problem_statement: detail.desc || detail.tagline || 'Build innovative solutions across open tracks and themes.',
        rounds_description: [
          {
            round_num: 1,
            name: 'Registration & Team Formation',
            date: detail.starts_at ? new Date(detail.starts_at).toLocaleDateString() : 'TBA',
            details: 'Register your team and submit project ideas.',
          },
          {
            round_num: 2,
            name: 'Hacking & Building',
            date: detail.ends_at ? new Date(detail.ends_at).toLocaleDateString() : 'TBA',
            details: 'Develop the prototype and submit GitHub repo + video pitch.',
          },
          {
            round_num: 3,
            name: 'Grand Finale & Judging',
            date: detail.ends_at ? new Date(detail.ends_at).toLocaleDateString() : 'TBA',
            details: 'Live presentations, Q&A with industry judges, and prize distribution.',
          },
        ],
        prizes_summary: 'Cash prizes, sponsored pool prizes, schwag, and internship opportunities.',
        apply_url: applyUrl,
        platform: 'devfolio',
        created_at: new Date().toISOString(),
        is_active: true,
      });
    }

    log?.(`[✓] Extracted ${hackathons.length} hackathons from Devfolio`, 'success');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log?.(`Devfolio scraper error: ${message}`, 'error');
  }

  return hackathons;
}
