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
      {/* BMW Configuration Filter Bar (#f7f7f7, hairline #e6e6e6, 0px radius) */}
      <div className="bg-[#f7f7f7] border border-[#e6e6e6] p-4 sm:p-6 rounded-none space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Company Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              Company
            </label>
            <select
              value={selectedCompanyType}
              onChange={(e) => setSelectedCompanyType(e.target.value)}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
            >
              <option value="all">All Companies</option>
              <option value="startup">Startups</option>
              <option value="mnc">MNCs / Large Tech</option>
            </select>
          </div>

          {/* Opportunity Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              Type
            </label>
            <select
              value={selectedOppType}
              onChange={(e) => setSelectedOppType(e.target.value)}
              disabled={feedType !== 'all'}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none disabled:opacity-60"
            >
              <option value="all">All Types</option>
              <option value="internship">Internship Only</option>
              <option value="full-time">Full-Time (FTE)</option>
            </select>
          </div>

          {/* Tech Role */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              Tech Role
            </label>
            <select
              value={selectedTechRole}
              onChange={(e) => setSelectedTechRole(e.target.value)}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
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
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
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
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              Workplace
            </label>
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-1">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white border border-[#cccccc] focus:border-[#262626] rounded-none px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
            >
              <option value="all">All Cities</option>
              {uniqueCities.slice(0, 20).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e6e6e6]">
          <button
            onClick={() => setFreshersOnly(!freshersOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.5px] rounded-none border transition-colors ${
              freshersOnly
                ? 'bg-[#262626] text-white border-[#262626]'
                : 'bg-white text-[#262626] border-[#cccccc] hover:border-[#262626]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Freshers Eligible (0 Exp Required)</span>
            {freshersOnly && <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />}
          </button>

          <div className="text-xs text-[#6b6b6b] font-light">
            Showing <strong className="text-[#262626] font-bold">{filteredOpportunities.length}</strong> of{' '}
            {opportunities.length} positions
          </div>
        </div>
      </div>

      {/* Grid: 2-up on desktop, clean white cards with hairline borders */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-[#e6e6e6] p-16 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-[#9a9a9a] mx-auto" />
          <h3 className="text-xl font-bold text-[#262626]">No roles match your filters</h3>
          <p className="text-sm text-[#6b6b6b] font-light max-w-md mx-auto">
            Try adjusting your batch, role, or company filters to explore more engineering opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const isIntern = opp.opportunity_type === 'internship';

            return (
              <div
                key={opp.id}
                className="bg-white border border-[#e6e6e6] hover:border-[#262626] p-6 flex flex-col justify-between transition-colors duration-150 rounded-none group space-y-4"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center shrink-0 p-1 rounded-none">
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
                      <Building className="w-6 h-6 text-[#9a9a9a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-[1px] text-[#1c69d4] truncate">
                        {opp.company_name}
                      </span>
                      {opp.company_type && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#f7f7f7] text-[#6b6b6b] border border-[#e6e6e6]">
                          {opp.company_type}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-[#262626] group-hover:text-[#1c69d4] transition-colors line-clamp-1 mt-0.5">
                      {opp.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[#6b6b6b] font-light mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#9a9a9a]" />
                        <span className="truncate">{opp.city || 'India'}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {opp.location_type === 'remote' ? 'Remote' : opp.location_type === 'hybrid' ? 'Hybrid' : 'On-Site'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-1 shrink-0 ${
                      isIntern ? 'bg-[#1c69d4] text-white' : 'bg-[#262626] text-white'
                    }`}
                  >
                    {isIntern ? 'INTERNSHIP' : 'FULL-TIME'}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-medium uppercase px-2 py-0.5 bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6]">
                    ROLE: {opp.tech_role}
                  </span>
                  <span className="text-[11px] font-medium uppercase px-2 py-0.5 bg-[#f7f7f7] text-[#6b6b6b] border border-[#e6e6e6]">
                    BATCHES: {opp.target_batches.join(', ')}
                  </span>
                  {opp.stipend_or_salary && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200">
                      💰 {opp.stipend_or_salary}
                    </span>
                  )}
                  {opp.is_fresher_eligible && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-[#1c69d4] border border-blue-200">
                      FRESHERS OK
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-3">
                  <div className="text-[11px] text-[#9a9a9a] uppercase tracking-wider font-light truncate">
                    via <span className="text-[#262626] font-medium">{opp.source_platform}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOpportunity(opp)}
                      className="py-2 px-3 bg-white border border-[#cccccc] hover:border-[#262626] text-[#262626] text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none"
                    >
                      DETAILS ›
                    </button>

                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none"
                    >
                      APPLY DIRECT ›
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
