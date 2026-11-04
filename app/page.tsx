import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Hackathon, Opportunity } from '@/types';
import { ClientApp } from '@/components/ClientApp';

// ISR Cache policy: Revalidate page every 1 hour (3600 seconds)
export const revalidate = 3600;

// High-quality initial fallback items for immediate first paint before sync
const FALLBACK_HACKATHONS: Hackathon[] = [
  {
    id: 'seed-devnexus',
    title: 'DevNexus 2.0 Hackathon',
    organizer: 'DevNexus Community & GCELT',
    banner_image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    mode: 'offline',
    venue_city: 'Kolkata',
    venue_address: 'Government College of Engineering, Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    themes: ['ai', 'web3', 'open-innovation', 'fintech'],
    registration_deadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
    apply_url: 'https://devfolio.co/hackathons',
    platform: 'devfolio',
    is_active: true,
  },
  {
    id: 'seed-vit-health',
    title: 'Health Hackathon 3.0: Global Health Access Innovation',
    organizer: 'VIT Bhopal & Johns Hopkins University',
    banner_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    mode: 'offline',
    venue_city: 'Bhopal',
    venue_address: 'VIT Bhopal University Campus, Madhya Pradesh',
    latitude: 23.2599,
    longitude: 77.4126,
    themes: ['ai', 'healthtech', 'data-science', 'predictive-analytics'],
    registration_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    apply_url: 'https://unstop.com/hackathons',
    platform: 'unstop',
    is_active: true,
  },
  {
    id: 'seed-smart-india',
    title: 'Smart India AI Innovators Cup 2026',
    organizer: 'Ministry of Education & AICTE',
    banner_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    mode: 'online',
    venue_city: 'Delhi NCR',
    venue_address: 'Virtual Nationwide Platform',
    latitude: 28.6139,
    longitude: 77.209,
    themes: ['genai', 'cloud', 'iot', 'smart-governance'],
    registration_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    apply_url: 'https://unstop.com',
    platform: 'unstop',
    is_active: true,
  },
  {
    id: 'seed-bangalore-defi',
    title: 'Namma Buidl Bengaluru Web3 Hack',
    organizer: 'Bangalore Blockchain Network',
    banner_image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    mode: 'offline',
    venue_city: 'Bengaluru',
    venue_address: 'Indiranagar Tech Hub, Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    themes: ['web3', 'defi', 'zero-knowledge', 'solana'],
    registration_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    apply_url: 'https://devfolio.co',
    platform: 'devfolio',
    is_active: true,
  },
];

const FALLBACK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'seed-cred-sde',
    title: 'Frontend Engineer - Member Experience',
    company_name: 'CRED',
    company_type: 'startup',
    company_logo_url: 'https://logo.clearbit.com/cred.club',
    opportunity_type: 'full-time',
    tech_role: 'frontend',
    target_batches: [2024, 2025, 2026],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'on-site',
    city: 'Bengaluru',
    country: 'India',
    stipend_or_salary: '₹18 - 30 LPA',
    apply_url: 'https://jobs.lever.co/cred',
    source_platform: 'Lever',
    is_active: true,
  },
  {
    id: 'seed-meesho-intern',
    title: 'Software Development Engineering Intern (Backend)',
    company_name: 'Meesho',
    company_type: 'startup',
    company_logo_url: 'https://logo.clearbit.com/meesho.com',
    opportunity_type: 'internship',
    tech_role: 'backend',
    target_batches: [2025, 2026, 2027],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'hybrid',
    city: 'Bengaluru',
    country: 'India',
    stipend_or_salary: '₹50,000 / month',
    apply_url: 'https://jobs.lever.co/meesho',
    source_platform: 'Lever',
    is_active: true,
  },
  {
    id: 'seed-groww-fullstack',
    title: 'Full Stack Engineer - Core Trading Platform',
    company_name: 'Groww',
    company_type: 'startup',
    company_logo_url: 'https://logo.clearbit.com/groww.in',
    opportunity_type: 'full-time',
    tech_role: 'fullstack',
    target_batches: [2024, 2025, 2026],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'on-site',
    city: 'Bengaluru',
    country: 'India',
    stipend_or_salary: '₹16 - 28 LPA',
    apply_url: 'https://boards.greenhouse.io/groww',
    source_platform: 'Greenhouse',
    is_active: true,
  },
  {
    id: 'seed-linear-ai',
    title: 'AI / Machine Learning Engineer (Product Systems)',
    company_name: 'Linear',
    company_type: 'startup',
    company_logo_url: 'https://logo.clearbit.com/linear.app',
    opportunity_type: 'full-time',
    tech_role: 'ai-ml',
    target_batches: [2024, 2025, 2026],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'remote',
    city: 'Remote (India)',
    country: 'India',
    stipend_or_salary: '₹25 - 45 LPA',
    apply_url: 'https://jobs.ashbyhq.com/linear',
    source_platform: 'Ashby',
    is_active: true,
  },
  {
    id: 'seed-sentry-mobile',
    title: 'Mobile Engineer - React Native & Mobile SDKs',
    company_name: 'Sentry',
    company_type: 'enterprise',
    company_logo_url: 'https://logo.clearbit.com/sentry.io',
    opportunity_type: 'full-time',
    tech_role: 'mobile',
    target_batches: [2025, 2026, 2027],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'remote',
    city: 'Remote (India)',
    country: 'India',
    stipend_or_salary: '₹22 - 38 LPA',
    apply_url: 'https://jobs.ashbyhq.com/sentry',
    source_platform: 'Ashby',
    is_active: true,
  },
  {
    id: 'seed-unstop-trainee',
    title: 'Graduate Tech Trainee (Data Science & Analytics)',
    company_name: 'Reliance Jio Platforms',
    company_type: 'enterprise',
    company_logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80',
    opportunity_type: 'full-time',
    tech_role: 'data-science',
    target_batches: [2025, 2026],
    is_fresher_eligible: true,
    min_exp_years: 0.0,
    location_type: 'hybrid',
    city: 'Mumbai',
    country: 'India',
    stipend_or_salary: '₹8 - 14 LPA',
    apply_url: 'https://unstop.com',
    source_platform: 'Unstop',
    is_active: true,
  },
];

export default async function HomePage() {
  let hackathons: Hackathon[] = [];
  let opportunities: Opportunity[] = [];

  try {
    // 1. Fetch Hackathons without heavy description / rounds for fast initial payload
    const { data: dbHackathons, error: hError } = await supabase
      .from('hackathons')
      .select(
        'id, title, organizer, banner_image_url, mode, venue_city, venue_address, latitude, longitude, themes, registration_deadline, apply_url, platform, created_at, is_active'
      )
      .eq('is_active', true)
      .order('registration_deadline', { ascending: true })
      .limit(60);

    if (dbHackathons && dbHackathons.length > 0 && !hError) {
      hackathons = dbHackathons as Hackathon[];
    } else {
      hackathons = FALLBACK_HACKATHONS;
    }

    // 2. Fetch Opportunities without full description HTML
    const { data: dbOpportunities, error: oError } = await supabase
      .from('opportunities')
      .select(
        'id, title, company_name, company_type, company_logo_url, opportunity_type, tech_role, target_batches, is_fresher_eligible, min_exp_years, location_type, city, stipend_or_salary, apply_url, source_platform, posted_at, is_active'
      )
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(60);

    if (dbOpportunities && dbOpportunities.length > 0 && !oError) {
      opportunities = dbOpportunities as Opportunity[];
    } else {
      opportunities = FALLBACK_OPPORTUNITIES;
    }
  } catch {
    hackathons = FALLBACK_HACKATHONS;
    opportunities = FALLBACK_OPPORTUNITIES;
  }

  return (
    <ClientApp
      initialHackathons={hackathons}
      initialOpportunities={opportunities}
    />
  );
}
