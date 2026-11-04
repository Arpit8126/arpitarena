import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { scrapeDevfolio } from '@/lib/scrapers/devfolio';
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
    const payload = JSON.stringify({
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

  // Run the scraping and synchronization in the background of the stream
  (async () => {
    try {
      await sendLog('🚀 Starting DevPulse local synchronization engine...', 'info');

      // Initialize Supabase Admin Client
      let supabaseAdmin;
      try {
        supabaseAdmin = getSupabaseAdmin();
        await sendLog('Connected to Supabase with Service Role credentials.', 'info');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await sendLog(`Supabase initialization error: ${errorMsg}`, 'error');
        await writer.close();
        return;
      }

      // Check if schema tables exist
      const { error: testTableErr } = await supabaseAdmin
        .from('hackathons')
        .select('id')
        .limit(1);

      if (testTableErr) {
        await sendLog(
          `⚠️ Database table warning: ${testTableErr.message}. Make sure you executed supabase/schema.sql in the Supabase Dashboard SQL Editor!`,
          'warn'
        );
      }

      // 3. Mark existing records as inactive
      await sendLog('Archiving stale records (setting is_active = false)...', 'info');
      const { error: deactOppsErr } = await supabaseAdmin
        .from('opportunities')
        .update({ is_active: false })
        .eq('is_active', true);
      if (deactOppsErr && !deactOppsErr.message.includes('relation "opportunities" does not exist')) {
        await sendLog(`Note during archiving opportunities: ${deactOppsErr.message}`, 'warn');
      }

      const { error: deactHacksErr } = await supabaseAdmin
        .from('hackathons')
        .update({ is_active: false })
        .eq('is_active', true);
      if (deactHacksErr && !deactHacksErr.message.includes('relation "hackathons" does not exist')) {
        await sendLog(`Note during archiving hackathons: ${deactHacksErr.message}`, 'warn');
      }

      // 4. Scrape Hackathons (Devfolio + Unstop)
      await sendLog('Starting Hackathons aggregation...', 'info');
      let devfolioHacks: any[] = [];
      let unstopHacks: any[] = [];

      try {
        devfolioHacks = await scrapeDevfolio((msg, t) => sendLog(msg, t, 'Devfolio'));
      } catch (e: any) {
        await sendLog(`Devfolio scraper failed: ${e.message}`, 'error', 'Devfolio');
      }

      try {
        unstopHacks = await scrapeUnstopHackathons((msg, t) => sendLog(msg, t, 'Unstop'));
      } catch (e: any) {
        await sendLog(`Unstop hackathons scraper failed: ${e.message}`, 'error', 'Unstop');
      }

      const allHackathons = [...devfolioHacks, ...unstopHacks];
      await sendLog(`Total hackathons gathered from all sources: ${allHackathons.length}`, 'info');

      // Upsert Hackathons into Supabase
      if (allHackathons.length > 0) {
        await sendLog('Upserting hackathons into Supabase...', 'info');
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

          if (!error) {
            hackSuccess++;
          }
        }
        await sendLog(`[✓] Upserted ${hackSuccess} / ${allHackathons.length} hackathons into Supabase`, 'success');
      }

      // 5. Scrape Opportunities (Unstop + ATS Boards)
      await sendLog('Starting Opportunities & Internships aggregation...', 'info');
      let unstopOpps: any[] = [];
      let atsOpps: any[] = [];

      try {
        unstopOpps = await scrapeUnstopOpportunities((msg, t) => sendLog(msg, t, 'Unstop Jobs'));
      } catch (e: any) {
        await sendLog(`Unstop opportunities failed: ${e.message}`, 'error', 'Unstop Jobs');
      }

      try {
        atsOpps = await scrapeATS((msg, t) => sendLog(msg, t, 'ATS Engine'));
      } catch (e: any) {
        await sendLog(`ATS scraper failed: ${e.message}`, 'error', 'ATS Engine');
      }

      const allOpportunities = [...unstopOpps, ...atsOpps];
      await sendLog(`Total opportunities gathered: ${allOpportunities.length}`, 'info');

      // Upsert Opportunities into Supabase
      if (allOpportunities.length > 0) {
        await sendLog('Upserting opportunities into Supabase...', 'info');
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

          if (!error) {
            oppSuccess++;
          }
        }
        await sendLog(`[✓] Upserted ${oppSuccess} / ${allOpportunities.length} opportunities into Supabase`, 'success');
      }

      await sendLog('🎉 Synchronization completed successfully!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await sendLog(`Fatal sync error: ${errorMsg}`, 'error');
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
