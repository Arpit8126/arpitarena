'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, ActiveTabType } from '@/components/Navbar';
import { DeveloperBanner } from '@/components/DeveloperBanner';
import { HackathonFeed } from '@/components/HackathonFeed';
import { JobFeed } from '@/components/JobFeed';
import { DetailModal } from '@/components/DetailModal';
import { Hackathon, Opportunity } from '@/types';
import {
  Sparkles,
  Zap,
  Briefcase,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Mail,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

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
      {/* 1. BMW Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hackathonsCount={initialHackathons.length}
        internshipsCount={initialInternships.length}
        jobsCount={initialJobs.length}
      />

      {/* 2. Developer Banner: Arpit Pandey (@arpitcodecraft) with Profile Photo */}
      <DeveloperBanner />

      {/* 3. BMW Hero Band (#1a2129 Dark Navy, 700 Display vs 300 Light Body) */}
      <div className="bg-[#1a2129] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#262e38]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-[#1c69d4]">
              <span className="w-2 h-2 rounded-full bg-[#1c69d4] animate-pulse"></span>
              {initialHackathons.length}+ ONGOING HACKATHONS • {initialInternships.length}+ INTERNSHIPS • {initialJobs.length}+ FULL-TIME JOBS
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {activeTab === 'hackathons'
                ? 'Precision Engineering for Student Innovators.'
                : activeTab === 'internships'
                ? 'Launch Your Career with Premier Internships.'
                : 'Direct Access to Full-Time Tech Roles.'}
            </h1>

            <p className="text-base sm:text-lg text-[#bbbbbb] font-light leading-relaxed max-w-2xl">
              100% free, direct official apply links with real-time GPS proximity tracking for hackathons,
              plus curated engineering challenges across India&apos;s leading technology companies. Zero login friction.
            </p>
          </div>

          <div className="p-6 bg-[#262e38] border border-[#374151] rounded-none text-xs space-y-2 w-full md:w-auto shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#9a9a9a]">
              AGGREGATION CHANNELS:
            </div>
            <div className="text-white font-bold text-sm tracking-wide">
              Devfolio • Devpost • Unstop • ATS Boards
            </div>
            <div className="text-[11px] text-[#bbbbbb] font-light">
              Live automated multi-source synchronization
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Feed Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

      {/* 6. BMW Corporate Footer (#f7f7f7 Surface Soft, 0px Radius) */}
      <footer className="bg-[#f7f7f7] border-t border-[#e6e6e6] py-16 px-4 sm:px-6 lg:px-8 text-xs text-[#6b6b6b]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#e6e6e6]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1c69d4] text-white flex items-center justify-center font-bold text-xs">
                  DP
                </div>
                <span className="font-bold text-base text-[#262626] uppercase tracking-wide">
                  DevPulse Platform
                </span>
              </div>
              <p className="text-[#6b6b6b] text-xs font-light max-w-xl">
                Dedicated to empowering Indian engineering students, campus developers, and tech freshers with
                uncompromised access to verified hackathons, internships, and high-growth engineering roles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <a
                href="https://www.instagram.com/arpitcodecraft/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#262626] hover:text-[#1c69d4] font-bold uppercase tracking-[1px] transition-colors"
              >
                Developer: Arpit Pandey (@arpitcodecraft) ›
              </a>

              <a
                href="mailto:contact@devpulse.local?subject=Takedown%20/%20Listing%20Removal%20Request"
                className="text-[#6b6b6b] hover:text-[#262626] transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Takedown Request</span>
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

          {/* Attribution & Legal Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#9a9a9a] font-light">
            <p>
              Direct Attribution Disclaimer: All hackathons, company names, logos, trademarks, and job postings belong
              to their respective organizers and ATS platforms (Devfolio, Devpost, Unstop, Greenhouse, Lever, Ashby). DevPulse
              does not claim ownership or host applications directly; all outbound links redirect immediately to official
              endpoints.
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
