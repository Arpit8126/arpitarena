'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
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
  Code2,
  Heart,
  Mail,
} from 'lucide-react';

interface ClientAppProps {
  initialHackathons: Hackathon[];
  initialOpportunities: Opportunity[];
}

export function ClientApp({
  initialHackathons,
  initialOpportunities,
}: ClientAppProps) {
  const [activeTab, setActiveTab] = useState<'hackathons' | 'jobs'>('hackathons');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navbar with Category Switcher & Search */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hackathonsCount={initialHackathons.length}
        jobsCount={initialOpportunities.length}
      />

      {/* Hero Banner Section */}
      <div className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900/50 via-zinc-950 to-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE AGGREGATOR FOR INDIAN TECH STUDENTS &amp; FRESHERS
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Launch your engineering career with verified opportunities.
            </h1>
            <p className="text-sm text-zinc-400">
              Zero login friction. Direct official apply links with GPS proximity sorting for hackathons,
              plus hiring challenges from top tech startups &amp; unicorns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono space-y-1 w-full md:w-auto">
              <div className="text-zinc-500">AGGREGATION SOURCES:</div>
              <div className="text-zinc-200 font-semibold">
                Devfolio • Unstop • Greenhouse • Lever • Ashby
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hackathons' ? (
          <HackathonFeed
            hackathons={initialHackathons}
            searchQuery={searchQuery}
            onSelectHackathon={(hack) => setSelectedHackathon(hack)}
          />
        ) : (
          <JobFeed
            opportunities={initialOpportunities}
            searchQuery={searchQuery}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          />
        )}
      </main>

      {/* Detail Modal */}
      <DetailModal
        type={selectedHackathon ? 'hackathon' : selectedOpportunity ? 'job' : null}
        item={selectedHackathon || selectedOpportunity}
        onClose={() => {
          setSelectedHackathon(null);
          setSelectedOpportunity(null);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  DP
                </div>
                <span className="font-bold text-sm text-white">DevPulse</span>
                <span className="text-zinc-500 font-mono text-[11px]">— Open Technology Aggregator</span>
              </div>
              <p className="text-zinc-500 text-xs max-w-xl">
                Dedicated to helping Indian computer science students, engineering graduates, and freshers
                discover hackathons, hiring challenges, and authentic entry-level engineering roles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <a
                href="mailto:contact@devpulse.local?subject=Takedown%20/%20Listing%20Removal%20Request"
                className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Takedown / Removal Request</span>
              </a>

              <Link
                href="/admin-sync"
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                title="Hidden Local Admin Sync Dashboard"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Sync Engine (Local)</span>
              </Link>
            </div>
          </div>

          {/* Attribution & Legal Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-zinc-500">
            <p>
              Direct Attribution Disclaimer: All hackathons, company names, logos, trademarks, and job postings belong
              to their respective organizers and ATS platforms (Devfolio, Unstop, Greenhouse, Lever, Ashby). DevPulse
              does not claim ownership or host applications directly; all outbound links redirect immediately to official
              endpoints.
            </p>
            <div className="shrink-0 flex items-center gap-1 text-zinc-600">
              Built with Next.js &amp; Supabase
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
