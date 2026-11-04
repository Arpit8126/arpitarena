'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, Briefcase, Zap, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'hackathons' | 'jobs';
  onTabChange: (tab: 'hackathons' | 'jobs') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hackathonsCount: number;
  jobsCount: number;
}

export function Navbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  hackathonsCount,
  jobsCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo & Trust Badge */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5 fill-emerald-400/20 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  DevPulse
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    IN
                  </span>
                </span>
                <span className="text-[11px] text-zinc-400 block -mt-0.5">
                  Aggregator for Indian Tech Students
                </span>
              </div>
            </Link>

            {/* Mobile Trust badge */}
            <div className="md:hidden flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              <span>Zero Logins</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                activeTab === 'hackathons'
                  ? 'Search hackathons by title, theme, city, organizer...'
                  : 'Search jobs by title, company, tech stack, location...'
              }
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Desktop Trust Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% Free</span>
            <span className="text-zinc-600">•</span>
            <span>Direct Links</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-semibold">Zero Logins</span>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('hackathons')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'hackathons'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'hackathons' ? 'text-emerald-400 fill-emerald-400/20' : 'text-zinc-500'}`} />
              <span>⚡ Hackathons</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'hackathons' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {hackathonsCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('jobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'jobs'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === 'jobs' ? 'text-violet-400' : 'text-zinc-500'}`} />
              <span>💼 Tech Internships & Jobs</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'jobs' ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {jobsCount}
              </span>
            </button>
          </div>

          <div className="hidden sm:block text-xs font-mono text-zinc-500">
            {activeTab === 'hackathons' ? 'Devfolio • Unstop' : 'Greenhouse • Lever • Ashby • Unstop'}
          </div>
        </div>
      </div>
    </header>
  );
}
