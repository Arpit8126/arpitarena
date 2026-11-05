'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Zap, GraduationCap, Briefcase, Terminal, Instagram } from 'lucide-react';

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
    <header className="w-full bg-white border-b border-slate-200 text-slate-900 sticky top-0 md:static z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-xs group-hover:bg-slate-800 transition-colors">
              DP
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 uppercase flex items-center gap-1.5">
                DevPulse
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block font-normal -mt-0.5 tracking-wide">
                India&apos;s Engineering Opportunities Aggregator
              </span>
            </div>
          </Link>

          {/* Right Controls: Integrated Developer Profile & Instagram Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Arpit Pandey Profile Picture & Identity */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-200 shadow-2xs bg-white">
                <img
                  src="/arpit-pandey.jpg"
                  alt="Arpit Pandey"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
                    Developed by Arpit Pandey
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Creator
                  </span>
                </div>
                <a
                  href="https://www.instagram.com/arpitcodecraft/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-semibold block leading-tight"
                >
                  @arpitcodecraft
                </a>
              </div>
            </div>

            {/* Visit Instagram Button */}
            <a
              href="https://www.instagram.com/arpitcodecraft/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold tracking-wide transition-all rounded-full shadow-xs active:scale-98"
            >
              <Instagram className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">VISIT INSTAGRAM ›</span>
              <span className="xs:hidden sm:hidden">Instagram</span>
            </a>

            {/* Local Scraper Sync (Only visible on localhost) */}
            {isLocalhost && (
              <Link
                href="/admin-sync"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-300 transition-all shadow-2xs"
                title="Only visible on localhost for developer DB sync"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-700" />
                <span>SYNC DB</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
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
    <div className="sticky top-0 md:top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
          {/* Category Tabs: Clean Dark Neutral Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-full">
            {/* Tab 1: Hackathons */}
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                activeTab === 'hackathons'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'hackathons' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Hackathons</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'hackathons' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'internships' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Internships</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'internships' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>Full-Time Jobs</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {jobsCount}
              </span>
            </button>
          </div>

          {/* Dedicated Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
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
