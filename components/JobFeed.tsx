'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Opportunity } from '@/types';
import {
  Briefcase,
  MapPin,
  Building,
  GraduationCap,
  ChevronRight,
  CheckCircle,
  Coins,
} from 'lucide-react';

interface JobFeedProps {
  opportunities: Opportunity[];
  searchQuery: string;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  feedType?: 'internship' | 'full-time' | 'all';
}

export function JobFeed({
  opportunities,
  searchQuery,
  onSelectOpportunity,
  feedType = 'all',
}: JobFeedProps) {
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('all');
  const [selectedOppType, setSelectedOppType] = useState<string>(
    feedType === 'internship' ? 'internship' : feedType === 'full-time' ? 'full-time' : 'all'
  );
  const [selectedTechRole, setSelectedTechRole] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [freshersOnly, setFreshersOnly] = useState<boolean>(feedType === 'full-time');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    if (feedType === 'internship') setSelectedOppType('internship');
    else if (feedType === 'full-time') setSelectedOppType('full-time');
    else setSelectedOppType('all');
  }, [feedType]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => {
      if (o.city && o.city.trim() !== '') {
        const primary = o.city.split(',')[0].trim();
        set.add(primary);
      }
    });
    return Array.from(set).sort();
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      if (feedType === 'internship' && item.opportunity_type !== 'internship') return false;
      if (feedType === 'full-time' && item.opportunity_type !== 'full-time') return false;

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

      if (selectedCompanyType !== 'all') {
        if (selectedCompanyType === 'startup' && item.company_type !== 'startup') return false;
        if (selectedCompanyType === 'mnc' && item.company_type !== 'mnc' && item.company_type !== 'enterprise')
          return false;
      }

      if (selectedOppType !== 'all' && item.opportunity_type !== selectedOppType) {
        return false;
      }

      if (selectedTechRole !== 'all' && item.tech_role !== selectedTechRole) {
        return false;
      }

      if (selectedBatch !== 'all') {
        if (!item.target_batches.includes(selectedBatch as number)) {
          return false;
        }
      }

      if (freshersOnly) {
        if (!item.is_fresher_eligible && item.min_exp_years > 0.5) {
          return false;
        }
      }

      if (selectedLocationType !== 'all' && item.location_type !== selectedLocationType) {
        return false;
      }

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
    feedType,
  ]);

  return (
    <div className="space-y-6">
      {/* Modern Sleek Dark Filter Panel */}
      <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Company Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Company
            </label>
            <select
              value={selectedCompanyType}
              onChange={(e) => setSelectedCompanyType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
            >
              <option value="all">All Companies</option>
              <option value="startup">Startups</option>
              <option value="mnc">MNCs / Large Tech</option>
            </select>
          </div>

          {/* Opportunity Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Type
            </label>
            <select
              value={selectedOppType}
              onChange={(e) => setSelectedOppType(e.target.value)}
              disabled={feedType !== 'all'}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all disabled:opacity-40"
            >
              <option value="all">All Types</option>
              <option value="internship">Internship Only</option>
              <option value="full-time">Full-Time (FTE)</option>
            </select>
          </div>

          {/* Tech Role */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Tech Role
            </label>
            <select
              value={selectedTechRole}
              onChange={(e) => setSelectedTechRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
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

          {/* Target Batch */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
            >
              <option value="all">All Batches</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
              <option value="2028">Batch 2028</option>
            </select>
          </div>

          {/* Workplace Mode */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Workplace
            </label>
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>

          {/* Major Cities */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Toggles & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setFreshersOnly(!freshersOnly)}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              freshersOnly
                ? 'bg-[#1c69d4] text-white border-[#1c69d4] shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Freshers Eligible (0 Exp Required)</span>
            {freshersOnly && <CheckCircle className="w-3.5 h-3.5 text-white" />}
          </button>

          <div className="text-xs text-slate-400 font-normal">
            Showing <strong className="text-white font-bold">{filteredOpportunities.length}</strong> of{' '}
            {opportunities.length} positions
          </div>
        </div>
      </div>

      {/* Grid: 2-column Modern Dark Cards */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-16 text-center space-y-3 shadow-lg">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No roles match your filters</h3>
          <p className="text-sm text-slate-400 font-normal max-w-md mx-auto">
            Try adjusting your batch, role, or city filters to explore more engineering opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const isIntern = opp.opportunity_type === 'internship';
            const isUnpaid = opp.stipend_or_salary?.toLowerCase().includes('unpaid');

            return (
              <div
                key={opp.id}
                className="bg-[#111827]/90 border border-slate-800/90 hover:border-blue-500/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 space-y-4"
              >
                {/* Header: Company Avatar & Badges */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
                    {opp.company_logo_url ? (
                      <img
                        src={opp.company_logo_url}
                        alt={opp.company_name}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain rounded-xl"
                        loading="lazy"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-slate-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-blue-400 truncate">
                        {opp.company_name}
                      </span>
                      {opp.company_type && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                          {opp.company_type}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1 mt-0.5">
                      {opp.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-normal mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{opp.city || 'India'}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize font-medium text-slate-300">
                        {opp.location_type === 'remote' ? 'Remote' : opp.location_type === 'hybrid' ? 'Hybrid' : 'On-Site'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 shadow-xs ${
                      isIntern ? 'bg-blue-950/80 text-blue-400 border border-blue-800' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isIntern ? 'Internship' : 'Full-Time'}
                  </span>
                </div>

                {/* Compensation Banner */}
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Stipend / CTC:
                    </span>
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        isUnpaid
                          ? 'text-amber-400'
                          : opp.stipend_or_salary?.includes('₹')
                          ? 'text-emerald-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {opp.stipend_or_salary || 'Disclosed on Application'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Experience:
                    </span>
                    <span className="font-semibold text-xs text-slate-300">
                      {opp.is_fresher_eligible ? 'Freshers OK (0 Exp)' : `${opp.min_exp_years}+ yrs`}
                    </span>
                  </div>
                </div>

                {/* Role & Eligibility Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-400 border border-blue-800/60">
                    Role: {opp.tech_role}
                  </span>
                  <span className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                    Batches: {opp.target_batches.join(', ')}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-normal truncate">
                    via <span className="text-slate-300 font-semibold">{opp.source_platform}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOpportunity(opp)}
                      className="py-2 px-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all"
                    >
                      Details ›
                    </button>

                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4.5 bg-[#1c69d4] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-500/50 transition-all"
                    >
                      Apply Direct ›
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
