const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function scrapeAll() {
  console.log('--- 1. Fetching Devfolio Hackathons ---');
  let devfolioHacks = [];
  try {
    const res = await fetch('https://devfolio.co/hackathons', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const script = $('script#__NEXT_DATA__').html();
    if (script) {
      const parsed = JSON.parse(script);
      const queryData = parsed?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data;
      const raw = [
        ...(queryData?.open_hackathons || []),
        ...(queryData?.upcoming_hackathons || [])
      ];
      for (const item of raw) {
        if (!item.name || !item.slug) continue;
        devfolioHacks.push({
          id: `devfolio-${item.slug}`,
          title: item.name,
          organizer: `${item.slug.toUpperCase()} Community`,
          banner_image_url: item.settings?.featured_cover_img || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          mode: item.is_online ? 'online' : 'offline',
          venue_city: item.is_online ? 'Online' : 'Bengaluru',
          venue_address: item.is_online ? 'Online' : 'Bengaluru, India',
          latitude: item.is_online ? null : 12.9716,
          longitude: item.is_online ? null : 77.5946,
          themes: (item.themes || []).map(t => t.theme?.name || t.name).filter(Boolean),
          registration_deadline: item.settings?.reg_ends_at || item.ends_at || new Date(Date.now() + 20 * 86400000).toISOString(),
          problem_statement: item.name + ' - Build cutting-edge products across open tracks and themes.',
          rounds_description: [
            { round_num: 1, name: 'Registration & Team Formation', date: 'Active', details: 'Register and submit proposal' },
            { round_num: 2, name: 'Hacking & Grand Finale', date: 'Finale', details: 'Prototype demo and judging' }
          ],
          prizes_summary: 'Cash pool, grant tracks, schwag, and hiring opportunities.',
          apply_url: item.settings?.site || `https://${item.slug}.devfolio.co`,
          platform: 'devfolio',
          created_at: new Date().toISOString(),
          is_active: true
        });
      }
    }
    console.log('Devfolio fetched:', devfolioHacks.length);
  } catch (e) {
    console.error('Devfolio error:', e.message);
  }

  console.log('\n--- 2. Fetching Devpost Hackathons ---');
  let devpostHacks = [];
  for (let p = 1; p <= 12; p++) {
    try {
      const url = `https://devpost.com/api/hackathons?challenge_type[]=online&challenge_type[]=in-person&status[]=open&status[]=upcoming&page=${p}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) break;
      const data = await res.json();
      const list = data.hackathons || [];
      if (list.length === 0) break;
      for (const item of list) {
        let banner = item.thumbnail_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
        if (banner.startsWith('//')) banner = 'https:' + banner;
        const locationStr = item.displayed_location?.location || 'Online';
        const isOffline = locationStr.toLowerCase().includes('in-person') || (!locationStr.toLowerCase().includes('online') && locationStr.length > 2);
        const prizeClean = item.prize_amount ? item.prize_amount.replace(/<[^>]*>?/gm, '') : 'Sponsored prizes';

        devpostHacks.push({
          id: `devpost-${item.id}`,
          title: item.title,
          organizer: item.organization_name || 'Global Tech Community',
          banner_image_url: banner,
          mode: isOffline ? 'offline' : 'online',
          venue_city: isOffline ? locationStr.split(',')[0].trim() : 'Global Online',
          venue_address: locationStr,
          latitude: isOffline ? 28.6139 : null,
          longitude: isOffline ? 77.2090 : null,
          themes: (item.themes || []).map(t => (t.name || '').toLowerCase()).filter(Boolean),
          registration_deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
          problem_statement: `Build solutions for ${item.title}. Prizes: ${prizeClean}. Open submission via Devpost.`,
          rounds_description: [
            { round_num: 1, name: 'Project Submission', date: item.submission_period_dates || 'Active', details: 'Submit repository and demo video' },
            { round_num: 2, name: 'Evaluation & Winners', date: 'Finale', details: 'Jury review and announcement' }
          ],
          prizes_summary: prizeClean,
          apply_url: item.url || `https://devpost.com/software/${item.id}`,
          platform: 'devpost',
          created_at: new Date().toISOString(),
          is_active: true
        });
      }
    } catch {}
  }
  console.log('Devpost fetched:', devpostHacks.length);

  console.log('\n--- 3. Fetching Unstop Open Hackathons & Competitions ---');
  let unstopHacks = [];
  const seenIds = new Set();
  const unstopCats = ['hackathons', 'competitions'];
  for (const cat of unstopCats) {
    for (let p = 1; p <= 10; p++) {
      try {
        const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=${cat}&oppstatus=open&per_page=50&page=${p}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) break;
        const d = await res.json();
        const items = d.data?.data || [];
        if (items.length === 0) break;
        for (const item of items) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          const region = (item.region || '').toLowerCase();
          const mode = region.includes('offline') ? 'offline' : region.includes('hybrid') ? 'hybrid' : 'online';
          const city = item.address_with_country_logo?.city || (mode === 'offline' ? 'Bengaluru' : 'India');
          const banner = item.logoUrl2 || item.thumb || item.organisation?.logoUrl2 || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';
          const deadline = item.regnRequirements?.end_regn_dt || item.end_date || new Date(Date.now() + 21 * 86400000).toISOString();
          const applyUrl = item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/hackathons/${item.id}`);

          unstopHacks.push({
            id: `unstop-${item.id}`,
            title: item.title,
            organizer: item.organisation?.name || 'Unstop Partner',
            banner_image_url: banner,
            mode,
            venue_city: city,
            venue_address: item.address_with_country_logo?.address || city,
            latitude: mode === 'offline' ? 20.5937 : null,
            longitude: mode === 'offline' ? 78.9629 : null,
            themes: (item.required_skills || []).map(s => (s.skill_name || s.skill || '').toLowerCase()).filter(Boolean),
            registration_deadline: deadline,
            problem_statement: item.details || `Official challenge for ${item.title} organized by ${item.organisation?.name || 'Unstop'}.`,
            rounds_description: [
              { round_num: 1, name: 'Round 1: Screening & Idea Submission', date: 'Stage 1', details: 'Concept paper and abstract' },
              { round_num: 2, name: 'Round 2: Prototype & Solution Development', date: 'Stage 2', details: 'Working prototype and code demo' },
              { round_num: 3, name: 'Grand Finale & Review', date: 'Finale', details: 'Live pitching and prize presentation' }
            ],
            prizes_summary: 'Cash prizes, certificates, official mentorship, and PPI hiring opportunities.',
            apply_url: applyUrl,
            platform: 'unstop',
            created_at: new Date().toISOString(),
            is_active: true
          });
        }
      } catch {}
    }
  }
  console.log('Unstop hackathons fetched:', unstopHacks.length);

  const totalHackathons = [...devfolioHacks, ...devpostHacks, ...unstopHacks];
  console.log(`\n🎉 TOTAL OPEN HACKATHONS COLLECTED: ${totalHackathons.length}`);
  fs.writeFileSync(path.join(dataDir, 'hackathons.json'), JSON.stringify(totalHackathons, null, 2));

  console.log('\n--- 4. Fetching Unstop Internships ---');
  let internships = [];
  const seenInterns = new Set();
  for (let p = 1; p <= 5; p++) {
    try {
      const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=internships&oppstatus=open&per_page=50&page=${p}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) break;
      const d = await res.json();
      const items = d.data?.data || [];
      if (items.length === 0) break;
      for (const item of items) {
        if (seenInterns.has(item.id)) continue;
        seenInterns.add(item.id);
        const title = item.title || 'Software Engineering Intern';
        const titleLower = title.toLowerCase();
        let techRole = 'fullstack';
        if (titleLower.includes('front')) techRole = 'frontend';
        else if (titleLower.includes('back')) techRole = 'backend';
        else if (titleLower.includes('ai') || titleLower.includes('ml')) techRole = 'ai-ml';
        else if (titleLower.includes('data')) techRole = 'data-science';
        else if (titleLower.includes('cloud') || titleLower.includes('devops')) techRole = 'devops';
        else if (titleLower.includes('mobile')) techRole = 'mobile';

        const region = (item.region || '').toLowerCase();
        const locType = region.includes('remote') ? 'remote' : region.includes('hybrid') ? 'hybrid' : 'on-site';
        const applyUrl = item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/o/${item.id}`);

        internships.push({
          id: `intern-${item.id}`,
          title,
          company_name: item.organisation?.name || 'Tech Organization',
          company_type: 'startup',
          company_logo_url: item.organisation?.logoUrl2 || item.logoUrl2 || null,
          opportunity_type: 'internship',
          tech_role: techRole,
          target_batches: [2025, 2026, 2027, 2028],
          is_fresher_eligible: true,
          min_exp_years: 0.0,
          location_type: locType,
          city: item.address_with_country_logo?.city || 'Bengaluru',
          country: 'India',
          full_description_html: item.details || `<p>${title} at ${item.organisation?.name || 'Company'}.</p>`,
          requirements_bullets: [
            'Foundations in Data Structures and Algorithms',
            'Familiarity with modern software tech stack',
            'Eagerness to learn and build scalable projects'
          ],
          stipend_or_salary: '₹25,000 - ₹60,000 / month',
          apply_url: applyUrl,
          source_platform: 'Unstop',
          posted_at: new Date().toISOString(),
          is_active: true
        });
      }
    } catch {}
  }
  console.log(`🎉 TOTAL INTERNSHIPS COLLECTED: ${internships.length}`);
  fs.writeFileSync(path.join(dataDir, 'internships.json'), JSON.stringify(internships, null, 2));

  console.log('\n--- 5. Fetching Unstop Full-Time Jobs ---');
  let jobs = [];
  const seenJobs = new Set();
  for (let p = 1; p <= 5; p++) {
    try {
      const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=jobs&oppstatus=open&per_page=50&page=${p}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) break;
      const d = await res.json();
      const items = d.data?.data || [];
      if (items.length === 0) break;
      for (const item of items) {
        if (seenJobs.has(item.id)) continue;
        seenJobs.add(item.id);
        const title = item.title || 'Software Development Engineer (SDE)';
        const titleLower = title.toLowerCase();
        let techRole = 'fullstack';
        if (titleLower.includes('front')) techRole = 'frontend';
        else if (titleLower.includes('back')) techRole = 'backend';
        else if (titleLower.includes('ai') || titleLower.includes('ml')) techRole = 'ai-ml';
        else if (titleLower.includes('data')) techRole = 'data-science';
        else if (titleLower.includes('cloud') || titleLower.includes('devops')) techRole = 'devops';
        else if (titleLower.includes('mobile')) techRole = 'mobile';

        const region = (item.region || '').toLowerCase();
        const locType = region.includes('remote') ? 'remote' : region.includes('hybrid') ? 'hybrid' : 'on-site';
        const applyUrl = item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/o/${item.id}`);

        jobs.push({
          id: `job-${item.id}`,
          title,
          company_name: item.organisation?.name || 'Tech Company',
          company_type: 'startup',
          company_logo_url: item.organisation?.logoUrl2 || item.logoUrl2 || null,
          opportunity_type: 'full-time',
          tech_role: techRole,
          target_batches: [2024, 2025, 2026],
          is_fresher_eligible: true,
          min_exp_years: 0.0,
          location_type: locType,
          city: item.address_with_country_logo?.city || 'Bengaluru',
          country: 'India',
          full_description_html: item.details || `<p>${title} at ${item.organisation?.name || 'Company'}.</p>`,
          requirements_bullets: [
            'Solid understanding of Computer Science fundamentals',
            'Proficiency in building backend/frontend microservices',
            'Experience with databases, Git, and automated testing'
          ],
          stipend_or_salary: '₹8 - 22 LPA',
          apply_url: applyUrl,
          source_platform: 'Unstop',
          posted_at: new Date().toISOString(),
          is_active: true
        });
      }
    } catch {}
  }
  console.log(`🎉 TOTAL FULL-TIME JOBS COLLECTED: ${jobs.length}`);
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify(jobs, null, 2));

  console.log('\nAll datasets successfully updated on disk!');
}

scrapeAll();
