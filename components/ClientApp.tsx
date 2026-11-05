'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopHeader, StickyNav, ActiveTabType } from '@/components/Navbar';
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* 1. Top Brand Header with Integrated Developer Profile (Scrolls naturally with page) */}
      <TopHeader />

      {/* 2. Sticky Category Navigation & Dedicated Search Bar (Pins to top-0 on scroll) */}
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

      {/* 6. Clean Light Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  DP
                </div>
                <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  DevPulse Platform
                </span>
              </div>
              <p className="text-slate-500 text-xs font-normal max-w-xl">
                Real-time technology opportunities aggregator connecting Indian student builders with verified hackathons, internships, and engineering careers.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <a
                href="https://www.instagram.com/arpitcodecraft/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition-colors"
              >
                @arpitcodecraft
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <span>© {new Date().getFullYear()} DevPulse. Engineered for Indian Developers.</span>
            <span>Direct official application links. Verified opportunities.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
