'use client';

import React, { useState, useMemo } from 'react';
import { Opportunity, TechRole, CompanyType, OpportunityType } from '@/types';
import {
  Briefcase,
  MapPin,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

interface JobFeedProps {
  opportunities: Opportunity[];
  searchQuery: string;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export function JobFeed({
  opportunities,
  searchQuery,
  onSelectOpportunity,
}: JobFeedProps) {
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('all');
  const [selectedOppType, setSelectedOppType] = useState<string>('all');
  const [selectedTechRole, setSelectedTechRole] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [freshersOnly, setFreshersOnly] = useState<boolean>(false);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => {
      if (o.city && o.city.trim() !== '') {
        // Clean city string if multiple
        const primary = o.city.split(',')[0].trim();
        set.add(primary);
      }
    });
    return Array.from(set).sort();
  }, [opportunities]);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesComp = item.company_name.toLowerCase().includes(query);
        const matchesRole = item.tech_role.toLowerCase().includes(query);
        const matchesCity = (item.city || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesComp && !matchesRole && !matchesCity) {
          return false;
        }
      }

      // Company Type
      if (selectedCompanyType !== 'all') {
        if (selectedCompanyType === 'startup' && item.company_type !== 'startup') return false;
        if (selectedCompanyType === 'mnc' && item.company_type !== 'mnc' && item.company_type !== 'enterprise') return false;
      }

      // Opportunity Type
      if (selectedOppType !== 'all' && item.opportunity_type !== selectedOppType) {
        return false;
      }

      // Tech Role
      if (selectedTechRole !== 'all' && item.tech_role !== selectedTechRole) {
        return false;
      }

      // Batch
      if (selectedBatch !== 'all') {
        if (!item.target_batches.includes(selectedBatch as number)) {
          return false;
        }
      }

      // Freshers (0 exp)
      if (freshersOnly) {
        if (!item.is_fresher_eligible && item.min_exp_years > 0.5) {
          return false;
        }
      }

      // Location Type
      if (selectedLocationType !== 'all' && item.location_type !== selectedLocationType) {
        return false;
      }

      // City
      if (selectedCity !== 'all') {
        if (!item.city || !item.city.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    opportunities,
    searchQuery,
    selectedCompanyType,
    selectedOppType,
    selectedTechRole,
    selectedBatch,
    freshersOnly,
    selectedLocationType,
    selectedCity,
  ]);

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 md:p-5 backdrop-blur-sm space-y-4">
        {/* Row 1: Primary Dropdowns & Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Company Type */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Company Type</label>
            <select
              value={selectedCompanyType}
              onChange={(e) => setSelectedCompanyType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Companies</option>
              <option value="startup">Startups</option>
              <option value="mnc">MNCs / Large Tech</option>
            </select>
          </div>

          {/* Opportunity Type */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Opportunity</label>
            <select
              value={selectedOppType}
              onChange={(e) => setSelectedOppType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Types</option>
              <option value="internship">Internship Only</option>
              <option value="full-time">Full-Time (FTE)</option>
            </select>
          </div>

          {/* Tech Role */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Tech Role</label>
            <select
              value={selectedTechRole}
              onChange={(e) => setSelectedTechRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Roles</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full-Stack</option>
              <option value="ai-ml">AI / ML</option>
              <option value="data-science">Data Science</option>
              <option value="devops">DevOps / Cloud</option>
              <option value="mobile">Mobile (iOS/Android)</option>
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Batches</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
              <option value="2028">Batch 2028</option>
            </select>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Workplace Mode</label>
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">City Filter</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Cities</option>
              {uniqueCities.slice(0, 15).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Quick Toggles (Freshers 0 Exp, Active count) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60">
          <button
            onClick={() => setFreshersOnly(!freshersOnly)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              freshersOnly
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Freshers Eligible (0 Exp Required)</span>
            {freshersOnly && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <div className="text-xs font-mono text-zinc-500">
            Showing <span className="text-zinc-200 font-bold">{filteredOpportunities.length}</span> of {opportunities.length} roles
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-200">No opportunities match your filters</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Try resetting your batch, role, or company filters to explore more tech openings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => {
            const isIntern = opp.opportunity_type === 'internship';

            return (
              <div
                key={opp.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between group transition-all duration-200 hover:shadow-xl hover:shadow-black/40 space-y-4"
              >
                {/* Header: Company Logo & Details */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {opp.company_logo_url ? (
                      <img
                        src={opp.company_logo_url}
                        alt={opp.company_name}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-400 uppercase tracking-wide truncate">
                        {opp.company_name}
                      </span>
                      {opp.company_type && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase border border-zinc-700">
                          {opp.company_type}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-violet-400 transition-colors line-clamp-1 mt-0.5">
                      {opp.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span className="truncate">{opp.city || 'India'}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="capitalize text-zinc-400">
                        {opp.location_type === 'remote' ? '🌐 Remote' : opp.location_type === 'hybrid' ? '⚡ Hybrid' : '🏢 On-Site'}
                      </span>
                    </div>
                  </div>

                  {/* Opp Type Badge */}
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isIntern
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    }`}
                  >
                    {isIntern ? 'Internship' : 'Full-Time'}
                  </span>
                </div>

                {/* Badges: Role, Batches, Salary */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Tech Role Badge */}
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Role: {opp.tech_role}
                  </span>

                  {/* Target Batches */}
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                    Batches: {opp.target_batches.join(', ')}
                  </span>

                  {/* Stipend/Salary */}
                  {opp.stipend_or_salary && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                      <span>💰</span> {opp.stipend_or_salary}
                    </span>
                  )}

                  {/* Fresher Badge */}
                  {opp.is_fresher_eligible && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/50">
                      Freshers OK
                    </span>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-zinc-500 truncate">
                    via <span className="text-zinc-400">{opp.source_platform}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOpportunity(opp)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>View Full Role</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>Apply Direct ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
