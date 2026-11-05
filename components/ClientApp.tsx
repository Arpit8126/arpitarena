'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopHeader, StickyNav, ActiveTabType } from '@/components/Navbar';
import { DeveloperBanner } from '@/components/DeveloperBanner';
import { HackathonFeed } from '@/components/HackathonFeed';
import { JobFeed } from '@/components/JobFeed';
import { DetailModal } from '@/components/DetailModal';
import { Hackathon, Opportunity } from '@/types';
import { Mail, Terminal } from 'lucide-react';

interface ClientAppProps {
  initialHackathons: Hackathon[];
  initialInternships: Opportunity[];
  initialJobs: Opportunity[];
}

export function ClientApp({
  initialHackathons,
  initialInternships,
  initialJobs,
}: ClientAppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('hackathons');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#0b0f19] to-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-400">
      {/* 1. Top Brand Header (Scrolls naturally with page) */}
      <TopHeader />

      {/* 2. Developer Banner: Arpit Pandey (@arpitcodecraft) (Scrolls naturally with page) */}
      <DeveloperBanner />

      {/* 3. Sticky Category Navigation & Dedicated Search Bar (Pins to top-0 on scroll) */}
      <StickyNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hackathonsCount={initialHackathons.length}
        internshipsCount={initialInternships.length}
        jobsCount={initialJobs.length}
      />

      {/* 4. Main Feed Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hackathons' ? (
          <HackathonFeed
            hackathons={initialHackathons}
            searchQuery={searchQuery}
            onSelectHackathon={(hack) => setSelectedHackathon(hack)}
          />
        ) : activeTab === 'internships' ? (
          <JobFeed
            opportunities={initialInternships}
            searchQuery={searchQuery}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            feedType="internship"
          />
        ) : (
          <JobFeed
            opportunities={initialJobs}
            searchQuery={searchQuery}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            feedType="full-time"
          />
        )}
      </main>

      {/* 5. Detail Modal */}
      <DetailModal
        type={selectedHackathon ? 'hackathon' : selectedOpportunity ? 'job' : null}
        item={selectedHackathon || selectedOpportunity}
        onClose={() => {
          setSelectedHackathon(null);
          setSelectedOpportunity(null);
        }}
      />

      {/* 6. Modern Dark Cyber Footer */}
      <footer className="bg-[#070a12] border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  DP
                </div>
                <span className="font-extrabold text-sm text-white uppercase tracking-wide">
                  DevPulse Platform
                </span>
              </div>
              <p className="text-slate-400 text-xs font-normal max-w-xl">
                Real-time technology opportunities aggregator connecting Indian student builders with verified hackathons, internships, and engineering careers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <a
                href="https://www.instagram.com/arpitcodecraft/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 font-semibold transition-colors"
              >
                Developer: Arpit Pandey (@arpitcodecraft) ›
              </a>

              <a
                href="mailto:contact@devpulse.local?subject=Listing%20Inquiry"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact / Inquiry</span>
              </a>

              <Link
                href="/admin-sync"
                className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
                title="Hidden Local Admin Sync Dashboard"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Sync Console</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-normal">
            <p>
              Direct Attribution Disclaimer: All hackathons, company names, logos, trademarks, and job postings belong to their respective organizers and platforms (Devfolio, Devpost, Unstop, Greenhouse). DevPulse aggregates official public listings and redirects directly to official endpoints.
            </p>
            <div className="shrink-0 text-slate-400 font-medium">
              Engineered by Arpit Pandey
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
