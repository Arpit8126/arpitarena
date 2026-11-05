'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Zap, GraduationCap, Briefcase, Terminal } from 'lucide-react';

export type ActiveTabType = 'hackathons' | 'internships' | 'jobs';

interface TopHeaderProps {
  // Optional extra props if needed
}

export function TopHeader() {
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      setIsLocalhost(true);
    }
  }, []);

  return (
    <div className="w-full bg-white border-b border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* DevPulse Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#1c69d4] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-[#0653b6] transition-colors">
              DP
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#262626] uppercase">
                DevPulse
              </span>
              <span className="text-[11px] text-[#6b6b6b] block font-light -mt-0.5 tracking-wide">
                Official Technology Aggregator
              </span>
            </div>
          </Link>

          {/* Right Controls: Local Scraper Sync (Only visible on localhost) */}
          <div className="flex items-center gap-3">
            {isLocalhost && (
              <Link
                href="/admin-sync"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs font-bold uppercase tracking-[1px] transition-colors shadow-sm"
                title="Only visible on localhost for developer DB sync"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SCRAPE &amp; SYNC DB (LOCAL) ›</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StickyNavProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hackathonsCount: number;
  internshipsCount: number;
  jobsCount: number;
}

export function StickyNav({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  hackathonsCount,
  internshipsCount,
  jobsCount,
}: StickyNavProps) {
  const searchPlaceholder =
    activeTab === 'hackathons'
      ? 'Search hackathons by title, theme, city, organizer...'
      : activeTab === 'internships'
      ? 'Search internships by role, company, city, skills...'
      : 'Search full-time roles by title, tech stack, company...';

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-[#e6e6e6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* Tab 1: Hackathons */}
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-[1.2px] uppercase transition-all rounded-none border-b-2 whitespace-nowrap ${
                activeTab === 'hackathons'
                  ? 'border-[#1c69d4] text-[#1c69d4] bg-[#1c69d4]/5'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626] hover:bg-[#fafafa]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeTab === 'hackathons' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>HACKATHONS</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 font-bold ${
                  activeTab === 'hackathons' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
                }`}
              >
                {hackathonsCount}
              </span>
            </button>

            {/* Tab 2: Internships */}
            <button
              onClick={() => onTabChange('internships')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-[1.2px] uppercase transition-all rounded-none border-b-2 whitespace-nowrap ${
                activeTab === 'internships'
                  ? 'border-[#1c69d4] text-[#1c69d4] bg-[#1c69d4]/5'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626] hover:bg-[#fafafa]'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${activeTab === 'internships' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>INTERNSHIPS</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 font-bold ${
                  activeTab === 'internships' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
                }`}
              >
                {internshipsCount}
              </span>
            </button>

            {/* Tab 3: Full-Time Jobs */}
            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold tracking-[1.2px] uppercase transition-all rounded-none border-b-2 whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-[#1c69d4] text-[#1c69d4] bg-[#1c69d4]/5'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626] hover:bg-[#fafafa]'
              }`}
            >
              <Briefcase className={`w-3.5 h-3.5 ${activeTab === 'jobs' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>FULL-TIME JOBS</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 font-bold ${
                  activeTab === 'jobs' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
                }`}
              >
                {jobsCount}
              </span>
            </button>
          </div>

          {/* Dedicated In-Menu Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#fafafa] border border-[#d6d6d6] focus:border-[#1c69d4] focus:bg-white rounded-none pl-10 pr-8 py-2 text-xs sm:text-sm text-[#262626] placeholder:text-[#888888] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#262626] text-xs px-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
