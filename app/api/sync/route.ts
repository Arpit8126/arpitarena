import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { scrapeDevfolio } from '@/lib/scrapers/devfolio';
import { scrapeDevpost } from '@/lib/scrapers/devpost';
import { scrapeUnstopHackathons, scrapeUnstopOpportunities } from '@/lib/scrapers/unstop';
import { scrapeATS } from '@/lib/scrapers/ats';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // 1. Strict Security Guard: Disallow execution in production
  if (process.env.NODE_ENV === 'production') {
    return new Response(
      JSON.stringify({
        error: 'Forbidden: Admin sync and scraping is restricted to local development environments only.',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Setup streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendLog = async (
    message: string,
    type: 'info' | 'success' | 'warn' | 'error' = 'info',
    source?: string
  ) => {
    const payload =
      JSON.stringify({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type,
        message,
        source,
      }) + '\n';
    try {
      await writer.write(encoder.encode(payload));
    } catch {
      // Stream could be closed by client
    }
  };

  (async () => {
    try {
      await sendLog('🚀 Starting DevPulse deep synchronization engine...', 'info');

      // Initialize Supabase Admin Client
      let supabaseAdmin: any = null;
      try {
        supabaseAdmin = getSupabaseAdmin();
        await sendLog('Connected to Supabase with Service Role credentials.', 'info');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await sendLog(`Supabase warning: ${errorMsg}`, 'warn');
      }

      // 3. Scrape Hackathons (Devfolio + Devpost + Unstop)
      await sendLog('Starting deep aggregation across Devfolio, Devpost, and Unstop...', 'info');
      let devfolioHacks: any[] = [];
      let devpostHacks: any[] = [];
      let unstopHacks: any[] = [];

      try {
        devfolioHacks = await scrapeDevfolio((msg, t) => sendLog(msg, t, 'Devfolio'));
      } catch (e: any) {
        await sendLog(`Devfolio scraper error: ${e.message}`, 'error', 'Devfolio');
      }

      try {
        devpostHacks = await scrapeDevpost(8, (msg, t) => sendLog(msg, t, 'Devpost'));
      } catch (e: any) {
        await sendLog(`Devpost scraper error: ${e.message}`, 'error', 'Devpost');
      }

      try {
        unstopHacks = await scrapeUnstopHackathons(10, (msg, t) => sendLog(msg, t, 'Unstop'));
      } catch (e: any) {
        await sendLog(`Unstop hackathons scraper error: ${e.message}`, 'error', 'Unstop');
      }

      const allHackathons = [...devfolioHacks, ...devpostHacks, ...unstopHacks];
      await sendLog(`[✓] Gathered total ${allHackathons.length} active open hackathons!`, 'success');

      // 4. Scrape Opportunities (Unstop Internships/Jobs + ATS Boards)
      await sendLog('Starting aggregation for Tech Internships & SDE Jobs...', 'info');
      let unstopOpps: any[] = [];
      let atsOpps: any[] = [];

      try {
        unstopOpps = await scrapeUnstopOpportunities(6, (msg, t) => sendLog(msg, t, 'Unstop'));
      } catch (e: any) {
        await sendLog(`Unstop opportunities error: ${e.message}`, 'error', 'Unstop');
      }

      try {
        atsOpps = await scrapeATS((msg, t) => sendLog(msg, t, 'ATS Engine'));
      } catch (e: any) {
        await sendLog(`ATS scraper error: ${e.message}`, 'error', 'ATS Engine');
      }

      const allOpportunities = [...unstopOpps, ...atsOpps];
      const internships = allOpportunities.filter((o) => o.opportunity_type === 'internship');
      const jobs = allOpportunities.filter((o) => o.opportunity_type === 'full-time');

      await sendLog(
        `[✓] Gathered total ${allOpportunities.length} roles (${internships.length} Internships, ${jobs.length} Full-Time Jobs)!`,
        'success'
      );

      // Save to local cached files
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(path.join(dataDir, 'hackathons.json'), JSON.stringify(allHackathons, null, 2));
      fs.writeFileSync(path.join(dataDir, 'internships.json'), JSON.stringify(internships, null, 2));
      fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify(jobs, null, 2));
      await sendLog('[✓] Saved verified live datasets to high-speed local cache.', 'success');

      // Upsert into Supabase if connected
      if (supabaseAdmin) {
        await sendLog('Upserting hackathons and opportunities into Supabase...', 'info');
        let hackSuccess = 0;
        for (const hack of allHackathons) {
          const { error } = await supabaseAdmin.from('hackathons').upsert(
            {
              title: hack.title,
              organizer: hack.organizer,
              banner_image_url: hack.banner_image_url,
              mode: hack.mode,
              venue_city: hack.venue_city,
              venue_address: hack.venue_address,
              latitude: hack.latitude,
              longitude: hack.longitude,
              themes: hack.themes,
              start_date: hack.start_date,
              end_date: hack.end_date,
              registration_deadline: hack.registration_deadline,
              problem_statement: hack.problem_statement,
              rounds_description: hack.rounds_description,
              prizes_summary: hack.prizes_summary,
              apply_url: hack.apply_url,
              platform: hack.platform,
              is_active: true,
            },
            { onConflict: 'title,organizer' }
          );
          if (!error) hackSuccess++;
        }

        let oppSuccess = 0;
        for (const opp of allOpportunities) {
          const { error } = await supabaseAdmin.from('opportunities').upsert(
            {
              title: opp.title,
              company_name: opp.company_name,
              company_type: opp.company_type,
              company_logo_url: opp.company_logo_url,
              opportunity_type: opp.opportunity_type,
              tech_role: opp.tech_role,
              target_batches: opp.target_batches,
              is_fresher_eligible: opp.is_fresher_eligible,
              min_exp_years: opp.min_exp_years,
              location_type: opp.location_type,
              city: opp.city,
              country: opp.country,
              full_description_html: opp.full_description_html,
              requirements_bullets: opp.requirements_bullets,
              stipend_or_salary: opp.stipend_or_salary,
              apply_url: opp.apply_url,
              source_platform: opp.source_platform,
              is_active: true,
            },
            { onConflict: 'company_name,title,apply_url' }
          );
          if (!error) oppSuccess++;
        }

        await sendLog(
          `[✓] Upserted ${hackSuccess} hackathons and ${oppSuccess} opportunities into Supabase.`,
          'success'
        );
      }

      await sendLog('🎉 Deep synchronization finished successfully!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await sendLog(`Sync error: ${errorMsg}`, 'error');
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
