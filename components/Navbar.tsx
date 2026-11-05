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
    <div className="w-full bg-[#090d16] border-b border-slate-800/90 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-[#1c69d4] to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              DP
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white uppercase flex items-center gap-1.5">
                DevPulse
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[11px] text-slate-400 block font-normal -mt-0.5 tracking-wide">
                India&apos;s Engineering Opportunities Aggregator
              </span>
            </div>
          </Link>

          {/* Right Controls: Local Scraper Sync */}
          <div className="flex items-center gap-3">
            {isLocalhost && (
              <Link
                href="/admin-sync"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-full border border-slate-700 transition-all shadow-xs"
                title="Only visible on localhost for developer DB sync"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
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
    <div className="sticky top-0 z-40 w-full bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/90 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
          {/* Category Tabs: Mobile Responsive Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-full">
            {/* Tab 1: Hackathons */}
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'hackathons'
                  ? 'bg-[#1c69d4] text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'hackathons' ? 'text-white' : 'text-slate-500'}`} />
              <span>Hackathons</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'hackathons' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hackathonsCount}
              </span>
            </button>

            {/* Tab 2: Internships */}
            <button
              onClick={() => onTabChange('internships')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'internships'
                  ? 'bg-[#1c69d4] text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'internships' ? 'text-white' : 'text-slate-500'}`} />
              <span>Internships</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'internships' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {internshipsCount}
              </span>
            </button>

            {/* Tab 3: Full-Time Jobs */}
            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'bg-[#1c69d4] text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-white' : 'text-slate-500'}`} />
              <span>Full-Time Jobs</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {jobsCount}
              </span>
            </button>
          </div>

          {/* Modern Dark Pill Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:bg-slate-900/90 focus:ring-4 focus:ring-blue-500/20 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors"
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
