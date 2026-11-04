'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Zap, GraduationCap, Briefcase, ChevronRight, ShieldCheck } from 'lucide-react';

export type ActiveTabType = 'hackathons' | 'internships' | 'jobs';

interface NavbarProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hackathonsCount: number;
  internshipsCount: number;
  jobsCount: number;
}

export function Navbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  hackathonsCount,
  internshipsCount,
  jobsCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#e6e6e6]">
      {/* Top Utility Bar (64px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 md:py-0 md:h-16">
          {/* BMW Circular Inspired Brand Mark + Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-[#1c69d4] flex items-center justify-center text-white font-bold text-sm shadow-sm">
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

            {/* Mobile Zero Logins badge */}
            <div className="md:hidden flex items-center gap-1 text-[11px] font-bold tracking-[1px] uppercase text-[#1c69d4] border border-[#1c69d4] px-2 py-0.5 rounded-none">
              <span>ZERO LOGINS</span>
            </div>
          </div>

          {/* BMW Precision Search Input (48px height, 0px radius) */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                activeTab === 'hackathons'
                  ? 'Search 600+ open hackathons...'
                  : activeTab === 'internships'
                  ? 'Search 200+ student internships...'
                  : 'Search 200+ SDE entry-level roles...'
              }
              className="w-full bg-white border border-[#e6e6e6] focus:border-[#262626] rounded-none pl-10 pr-8 py-2.5 text-sm text-[#262626] placeholder:text-[#9a9a9a] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#262626] text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Desktop Trust Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#6b6b6b] font-light">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="text-[#262626] font-bold">100% Free</span>
            <span>•</span>
            <span>Direct Official Links</span>
            <span>•</span>
            <span className="text-[#1c69d4] font-bold uppercase tracking-wider">Zero Logins</span>
          </div>
        </div>

        {/* Category Tabs (BMW Category Tab Specs: 0px radius, uppercase, 1.5px tracking) */}
        <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Tab 1: Hackathons */}
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold tracking-[1.5px] uppercase transition-all rounded-none border-b-2 ${
                activeTab === 'hackathons'
                  ? 'border-[#1c69d4] text-[#262626]'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeTab === 'hackathons' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>HACKATHONS</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-none font-bold ${
                activeTab === 'hackathons' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
              }`}>
                {hackathonsCount}
              </span>
            </button>

            {/* Tab 2: Internships */}
            <button
              onClick={() => onTabChange('internships')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold tracking-[1.5px] uppercase transition-all rounded-none border-b-2 ${
                activeTab === 'internships'
                  ? 'border-[#1c69d4] text-[#262626]'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626]'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${activeTab === 'internships' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>INTERNSHIPS</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-none font-bold ${
                activeTab === 'internships' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
              }`}>
                {internshipsCount}
              </span>
            </button>

            {/* Tab 3: Full-Time Jobs */}
            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold tracking-[1.5px] uppercase transition-all rounded-none border-b-2 ${
                activeTab === 'jobs'
                  ? 'border-[#1c69d4] text-[#262626]'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#262626]'
              }`}
            >
              <Briefcase className={`w-3.5 h-3.5 ${activeTab === 'jobs' ? 'text-[#1c69d4]' : 'text-[#6b6b6b]'}`} />
              <span>FULL-TIME JOBS</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-none font-bold ${
                activeTab === 'jobs' ? 'bg-[#1c69d4] text-white' : 'bg-[#ebebeb] text-[#6b6b6b]'
              }`}>
                {jobsCount}
              </span>
            </button>
          </div>

          <div className="hidden md:block text-[11px] text-[#6b6b6b] uppercase tracking-[1px]">
            {activeTab === 'hackathons'
              ? 'Devfolio • Devpost • Unstop'
              : activeTab === 'internships'
              ? 'Campus & Student Stipends'
              : 'Verified Engineering CTC'}
          </div>
        </div>
      </div>
    </header>
  );
}
