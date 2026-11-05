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
  ExternalLink,
  SlidersHorizontal,
  RotateCcw,
  X,
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
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedOppType, setSelectedOppType] = useState<string>(
    feedType === 'internship' ? 'internship' : feedType === 'full-time' ? 'full-time' : 'all'
  );
  const [selectedTechRole, setSelectedTechRole] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [freshersOnly, setFreshersOnly] = useState<boolean>(false);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    if (feedType === 'internship') setSelectedOppType('internship');
    else if (feedType === 'full-time') setSelectedOppType('full-time');
    else setSelectedOppType('all');
  }, [feedType]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCompany('all');
    setSelectedCity('all');
    setSelectedTechRole('all');
    setSelectedBatch('all');
    setSelectedLocationType('all');
    setFreshersOnly(false);
    if (feedType === 'all') setSelectedOppType('all');
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCompany !== 'all') count++;
    if (selectedCity !== 'all') count++;
    if (selectedTechRole !== 'all') count++;
    if (selectedBatch !== 'all') count++;
    if (selectedLocationType !== 'all') count++;
    if (freshersOnly) count++;
    return count;
  }, [
    selectedCompany,
    selectedCity,
    selectedTechRole,
    selectedBatch,
    selectedLocationType,
    freshersOnly,
  ]);

  // Extract all unique Indian cities
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

  // Extract all unique hiring companies
  const uniqueCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach((o) => {
      if (o.company_name && o.company_name.trim() !== '') {
        const name = o.company_name.trim();
        counts[name] = (counts[name] || 0) + 1;
      }
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }, [opportunities]);

  // Top featured companies for quick filter pills
  const topCompanies = useMemo(() => {
    return uniqueCompanies.slice(0, 6);
  }, [uniqueCompanies]);

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

      if (selectedCompany !== 'all') {
        if (item.company_name.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      if (selectedOppType !== 'all' && item.opportunity_type !== selectedOppType) {
        return false;
      }

      if (selectedTechRole !== 'all' && item.tech_role !== selectedTechRole) {
        return false;
      }

      if (selectedBatch !== 'all') {
        if (!item.target_batches || !item.target_batches.includes(selectedBatch as number)) {
          return false;
        }
      }

      if (freshersOnly && !item.is_fresher_eligible) {
        return false;
      }

      if (selectedLocationType !== 'all') {
        if (selectedLocationType === 'remote' && item.location_type !== 'remote') {
          return false;
        }
        if (selectedLocationType === 'hybrid' && item.location_type !== 'hybrid') {
          return false;
        }
        if (selectedLocationType === 'on-site' && item.location_type !== 'on-site') {
          return false;
        }
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
    selectedCompany,
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
      {/* ============================================================== */}
      {/* 1. MOBILE COMPACT FILTER TOOLBAR (Visible on mobile only)      */}
      {/* ============================================================== */}
      <div className="flex md:hidden items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs">
        {/* Filter Trigger Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-slate-900 text-[10px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Beside Filter: Default / Reset Button */}
        <button
          onClick={handleResetFilters}
          title="Reset all filters to default"
          className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          <strong>{filteredOpportunities.length}</strong> roles
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FULL-SCREEN MOBILE FILTER MODAL                             */}
      {/* ============================================================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Filter Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                {filteredOpportunities.length} matching positions found
              </p>
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Filter Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8fafc]">
            {/* Filter by Company */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Company Name
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
              >
                <option value="all">All Companies ({uniqueCompanies.length})</option>
                {uniqueCompanies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Indian City */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Indian City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
              >
                <option value="all">All Indian Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Tech Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Tech Role
              </label>
              <select
                value={selectedTechRole}
                onChange={(e) => setSelectedTechRole(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Target Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) =>
                  setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
              >
                <option value="all">All Batches</option>
                <option value="2025">Batch 2025</option>
                <option value="2026">Batch 2026</option>
                <option value="2027">Batch 2027</option>
                <option value="2028">Batch 2028</option>
              </select>
            </div>

            {/* Workplace Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Workplace Mode
              </label>
              <select
                value={selectedLocationType}
                onChange={(e) => setSelectedLocationType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
              >
                <option value="all">All Modes</option>
                <option value="remote">Remote (Work From Home)</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-Site</option>
              </select>
            </div>

            {/* Freshers Eligible Toggle */}
            <div className="pt-2">
              <button
                onClick={() => setFreshersOnly(!freshersOnly)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                  freshersOnly
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Freshers Eligible (0 Exp Required)</span>
                </span>
                {freshersOnly && <CheckCircle className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Sticky Modal Bottom Action Bar */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="w-1/3 py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl text-center transition-all active:scale-98"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-2/3 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md text-center transition-all active:scale-98"
            >
              Apply Filters ({filteredOpportunities.length})
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DESKTOP MODERN FILTER CARD (Clean Dark Slate Neutrals)      */}
      {/* ============================================================== */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Filter by Company */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all"
            >
              <option value="all">All Companies ({uniqueCompanies.length})</option>
              {uniqueCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Indian Cities Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Indian City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all"
            >
              <option value="all">All Indian Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tech Role Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tech Role
            </label>
            <select
              value={selectedTechRole}
              onChange={(e) => setSelectedTechRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all"
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

          {/* 4. Target Batch */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) =>
                setSelectedBatch(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all"
            >
              <option value="all">All Batches</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
              <option value="2028">Batch 2028</option>
            </select>
          </div>

          {/* 5. Workplace Mode */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Workplace
            </label>
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all"
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote (Work From Home)</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>

          {/* 6. Opportunity Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Type
            </label>
            <select
              value={selectedOppType}
              onChange={(e) => setSelectedOppType(e.target.value)}
              disabled={feedType !== 'all'}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-all disabled:opacity-50"
            >
              <option value="all">All Opportunities</option>
              <option value="internship">Internship Only</option>
              <option value="full-time">Full-Time (FTE)</option>
            </select>
          </div>
        </div>

        {/* Quick Company Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Top Companies:
          </span>
          {topCompanies.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompany(selectedCompany === comp ? 'all' : comp)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                selectedCompany === comp
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {comp}
            </button>
          ))}
          {selectedCompany !== 'all' && (
            <button
              onClick={() => setSelectedCompany('all')}
              className="text-xs text-red-600 hover:underline font-semibold ml-2"
            >
              Clear Company Filter ✕
            </button>
          )}
        </div>

        {/* Filter Toggles & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFreshersOnly(!freshersOnly)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                freshersOnly
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Freshers Eligible (0 Exp Required)</span>
              {freshersOnly && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </button>

            {/* Desktop Reset Button */}
            <button
              onClick={handleResetFilters}
              title="Reset all filters to default"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-normal">
            Showing <strong className="text-slate-900 font-bold">{filteredOpportunities.length}</strong> of{' '}
            {opportunities.length} Indian tech positions
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. OPPORTUNITIES GRID                                          */}
      {/* ============================================================== */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">No roles match your filters</h3>
          <p className="text-sm text-slate-500 font-normal max-w-md mx-auto">
            Try adjusting your batch, company, or city filters to explore more engineering opportunities.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const isIntern = opp.opportunity_type === 'internship';
            const isUnpaid = opp.stipend_or_salary?.toLowerCase().includes('unpaid');

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 group shadow-xs hover:shadow-md hover:-translate-y-0.5 space-y-4"
              >
                {/* Header: Company Avatar & Badges */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                    {opp.company_logo_url ? (
                      <img
                        src={opp.company_logo_url}
                        alt={opp.company_name}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-600 truncate">
                        {opp.company_name}
                      </span>
                      {opp.company_type && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {opp.company_type}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-slate-700 transition-colors leading-snug line-clamp-1 mt-0.5">
                      {opp.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-normal mt-1">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{opp.city || 'India'}</span>
                      </div>
                      <span>•</span>
                      <span className="capitalize text-slate-600 font-medium">{opp.location_type}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isIntern
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {opp.opportunity_type}
                    </span>
                  </div>
                </div>

                {/* Compensation & Experience Row */}
                <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      {isIntern ? 'Stipend:' : 'Salary / CTC:'}
                    </span>
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        isUnpaid ? 'text-slate-500' : 'text-emerald-700'
                      }`}
                    >
                      {opp.stipend_or_salary || 'Disclosed on Application'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Experience:
                    </span>
                    <span className="font-semibold text-xs text-slate-700">
                      {opp.is_fresher_eligible ? 'Freshers OK (0 Exp)' : `${opp.min_exp_years}+ yrs`}
                    </span>
                  </div>
                </div>

                {/* Role & Eligibility Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                    Role: {opp.tech_role}
                  </span>
                  <span className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    Batches: {(opp.target_batches || []).join(', ')}
                  </span>
                </div>

                {/* Actions: Clean High-Contrast Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-normal truncate">
                    via <span className="text-slate-700 font-semibold">{opp.source_platform}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOpportunity(opp)}
                      className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-98"
                    >
                      Details ›
                    </button>

                    <a
                      href={opp.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all active:scale-98 flex items-center gap-1.5"
                    >
                      <span>Apply Direct</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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
