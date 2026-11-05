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
    <div className="min-h-screen bg-white text-[#262626] flex flex-col font-sans selection:bg-[#1c69d4]/20 selection:text-[#1c69d4]">
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

      {/* 5. Detail Modal (Spacious Big Card + Body Scroll Lock) */}
      <DetailModal
        type={selectedHackathon ? 'hackathon' : selectedOpportunity ? 'job' : null}
        item={selectedHackathon || selectedOpportunity}
        onClose={() => {
          setSelectedHackathon(null);
          setSelectedOpportunity(null);
        }}
      />

      {/* 6. Corporate Minimal Footer */}
      <footer className="bg-[#f7f7f7] border-t border-[#e6e6e6] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#6b6b6b]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#e6e6e6]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1c69d4] text-white flex items-center justify-center font-bold text-xs">
                  DP
                </div>
                <span className="font-bold text-sm text-[#262626] uppercase tracking-wide">
                  DevPulse Platform
                </span>
              </div>
              <p className="text-[#6b6b6b] text-xs font-light max-w-xl">
                Real-time technology opportunities aggregator connecting Indian student builders with verified hackathons, internships, and engineering careers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <a
                href="https://www.instagram.com/arpitcodecraft/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#262626] hover:text-[#1c69d4] font-bold uppercase tracking-[0.5px] transition-colors"
              >
                Developer: Arpit Pandey (@arpitcodecraft) ›
              </a>

              <a
                href="mailto:contact@devpulse.local?subject=Listing%20Inquiry"
                className="text-[#6b6b6b] hover:text-[#262626] transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact / Inquiry</span>
              </a>

              <Link
                href="/admin-sync"
                className="text-[#9a9a9a] hover:text-[#262626] transition-colors flex items-center gap-1 font-mono text-[11px]"
                title="Hidden Local Admin Sync Dashboard"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Sync Console</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#9a9a9a] font-light">
            <p>
              Direct Attribution Disclaimer: All hackathons, company names, logos, trademarks, and job postings belong to their respective organizers and platforms (Devfolio, Devpost, Unstop). DevPulse aggregates official public listings and redirects directly to official endpoints.
            </p>
            <div className="shrink-0 text-[#6b6b6b] font-medium">
              Engineered by Arpit Pandey
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
