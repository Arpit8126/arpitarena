import React from 'react';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabaseClient';
import { Hackathon, Opportunity } from '@/types';
import { ClientApp } from '@/components/ClientApp';

// ISR Cache policy: Revalidate page every 1 hour (3600 seconds)
export const revalidate = 3600;

function readLocalDataset<T>(filename: string): T[] {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Failed to load ${filename}:`, e);
  }
  return [];
}

export default async function HomePage() {
  let hackathons: Hackathon[] = [];
  let internships: Opportunity[] = [];
  let jobs: Opportunity[] = [];

  // Read the freshly scraped datasets from disk as baseline
  const localHackathons = readLocalDataset<Hackathon>('hackathons.json');
  const localInternships = readLocalDataset<Opportunity>('internships.json');
  const localJobs = readLocalDataset<Opportunity>('jobs.json');

  try {
    // 1. Fetch Hackathons from Supabase if populated
    const { data: dbHackathons, error: hError } = await supabase
      .from('hackathons')
      .select(
        'id, title, organizer, banner_image_url, mode, venue_city, venue_address, latitude, longitude, themes, registration_deadline, apply_url, platform, created_at, is_active'
      )
      .eq('is_active', true)
      .order('registration_deadline', { ascending: true })
      .limit(800);

    if (dbHackathons && dbHackathons.length > 50 && !hError) {
      hackathons = dbHackathons as Hackathon[];
    } else {
      hackathons = localHackathons;
    }

    // 2. Fetch Opportunities from Supabase
    const { data: dbOpportunities, error: oError } = await supabase
      .from('opportunities')
      .select(
        'id, title, company_name, company_type, company_logo_url, opportunity_type, tech_role, target_batches, is_fresher_eligible, min_exp_years, location_type, city, stipend_or_salary, apply_url, source_platform, posted_at, is_active'
      )
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(800);

    if (dbOpportunities && dbOpportunities.length > 20 && !oError) {
      const allOpps = dbOpportunities as Opportunity[];
      internships = allOpps.filter((o) => o.opportunity_type === 'internship');
      jobs = allOpps.filter((o) => o.opportunity_type === 'full-time');
    } else {
      internships = localInternships;
      jobs = localJobs;
    }
  } catch {
    hackathons = localHackathons;
    internships = localInternships;
    jobs = localJobs;
  }

  return (
    <ClientApp
      initialHackathons={hackathons}
      initialInternships={internships}
      initialJobs={jobs}
    />
  );
}
