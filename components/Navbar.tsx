'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Zap, GraduationCap, Briefcase, Terminal } from 'lucide-react';

export type ActiveTabType = 'hackathons' | 'internships' | 'jobs';

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
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Modern Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1c69d4] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              DP
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">
                DevPulse
              </span>
              <span className="text-[11px] text-slate-500 block font-normal -mt-0.5 tracking-wide">
                India&apos;s Engineering Opportunities Aggregator
              </span>
            </div>
          </Link>

          {/* Right Controls: Local Scraper Sync */}
          <div className="flex items-center gap-3">
            {isLocalhost && (
              <Link
                href="/admin-sync"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-full border border-slate-300 transition-all shadow-2xs hover:shadow-xs"
                title="Only visible on localhost for developer DB sync"
              >
                <Terminal className="w-3.5 h-3.5 text-[#1c69d4]" />
                <span>SYNC DATABASE ›</span>
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
      ? 'Search hackathons by title, theme, organizer, city...'
      : activeTab === 'internships'
      ? 'Search internships by role, company, city, skills...'
      : 'Search full-time roles by title, tech stack, company...';

  return (
    <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
          {/* Category Tabs: Modern Pill Segmented Style */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
            {/* Tab 1: Hackathons */}
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'hackathons'
                  ? 'bg-white text-[#1c69d4] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'hackathons' ? 'text-[#1c69d4]' : 'text-slate-400'}`} />
              <span>Hackathons</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'hackathons' ? 'bg-blue-100 text-[#1c69d4]' : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {hackathonsCount}
              </span>
            </button>

            {/* Tab 2: Internships */}
            <button
              onClick={() => onTabChange('internships')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'internships'
                  ? 'bg-white text-[#1c69d4] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'internships' ? 'text-[#1c69d4]' : 'text-slate-400'}`} />
              <span>Internships</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'internships' ? 'bg-blue-100 text-[#1c69d4]' : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {internshipsCount}
              </span>
            </button>

            {/* Tab 3: Full-Time Jobs */}
            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'bg-white text-[#1c69d4] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-[#1c69d4]' : 'text-slate-400'}`} />
              <span>Full-Time Jobs</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'jobs' ? 'bg-blue-100 text-[#1c69d4]' : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {jobsCount}
              </span>
            </button>
          </div>

          {/* Modern Pill Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1c69d4] focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 text-xs flex items-center justify-center transition-colors"
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
