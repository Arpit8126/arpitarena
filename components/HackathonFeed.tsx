'use client';

import React, { useState, useMemo } from 'react';
import { Hackathon } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils/geo';
import {
  Calendar,
  MapPin,
  Navigation,
  Globe,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  RotateCcw,
  X,
  Check,
  Building,
} from 'lucide-react';

interface HackathonFeedProps {
  hackathons: Hackathon[];
  searchQuery: string;
  onSelectHackathon: (hackathon: Hackathon) => void;
}

export function HackathonFeed({
  hackathons,
  searchQuery,
  onSelectHackathon,
}: HackathonFeedProps) {
  const [selectedSort, setSelectedSort] = useState<'latest' | 'deadline' | 'nearest'>('latest');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedSort('latest');
    setSelectedMode('all');
    setSelectedTheme('all');
    setUserLocation(null);
    setLocationError(null);
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedMode !== 'all') count++;
    if (selectedTheme !== 'all') count++;
    if (selectedSort !== 'latest') count++;
    return count;
  }, [selectedMode, selectedTheme, selectedSort]);

  // GPS Proximity Locator
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setSelectedSort('nearest');
        setIsLocating(false);
      },
      (err) => {
        setLocationError(`Location permission denied (${err.message}).`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate distance & days remaining
  const enrichedHackathons = useMemo(() => {
    return hackathons.map((hack) => {
      let distance_km: number | undefined = undefined;
      if (userLocation && hack.latitude && hack.longitude && hack.mode !== 'online') {
        if (Math.abs(hack.latitude) > 0.1 && Math.abs(hack.longitude) > 0.1) {
          distance_km = calculateHaversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            hack.latitude,
            hack.longitude
          );
        }
      }

      const now = new Date().getTime();
      const deadline = new Date(hack.registration_deadline).getTime();
      const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      return {
        ...hack,
        distance_km,
        days_remaining: diffDays,
      };
    });
  }, [hackathons, userLocation]);

  // Filter and Sort
  const filteredHackathons = useMemo(() => {
    let list = enrichedHackathons.filter((h) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesOrg = h.organizer.toLowerCase().includes(query);
        const matchesCity = (h.venue_city || '').toLowerCase().includes(query);
        const matchesThemes = (h.themes || []).some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesOrg && !matchesCity && !matchesThemes) {
          return false;
        }
      }

      if (selectedMode !== 'all' && h.mode !== selectedMode) {
        return false;
      }

      if (selectedTheme !== 'all') {
        const themeMap: Record<string, string[]> = {
          ai: ['ai', 'genai', 'machine learning', 'ml', 'deep learning'],
          web: ['web', 'web & app', 'frontend', 'backend', 'fullstack', 'mobile'],
          web3: ['web3', 'blockchain', 'crypto', 'smart-contracts', 'defi'],
          iot: ['iot', 'hardware', 'robotics', 'embedded'],
          open: ['open innovation', 'open-innovation', 'no restrictions'],
        };

        const targetKeywords = themeMap[selectedTheme] || [selectedTheme];
        const hasTheme = (h.themes || []).some((themeStr) => {
          const lower = themeStr.toLowerCase();
          return targetKeywords.some((kw) => lower.includes(kw));
        });

        if (!hasTheme) return false;
      }

      return true;
    });

    if (selectedSort === 'nearest') {
      list.sort((a, b) => {
        if (a.distance_km !== undefined && b.distance_km !== undefined) {
          return a.distance_km - b.distance_km;
        }
        if (a.distance_km !== undefined) return -1;
        if (b.distance_km !== undefined) return 1;
        return 0;
      });
    } else if (selectedSort === 'deadline') {
      list.sort(
        (a, b) =>
          new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime()
      );
    } else {
      list.sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }

    return list;
  }, [enrichedHackathons, searchQuery, selectedMode, selectedTheme, selectedSort]);

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. MOBILE COMPACT FILTER TOOLBAR (Visible on mobile only)      */}
      {/* ============================================================== */}
      <div className="flex md:hidden items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs">
        {/* Filter Trigger Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#0073e6] text-[10px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Beside Filter: Default / Reset Button */}
        <button
          onClick={handleResetFilters}
          title="Reset all filters to default"
          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>

        {/* Find Near Me Quick Button on Mobile */}
        <button
          onClick={handleFindNearMe}
          disabled={isLocating}
          className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 border transition-all active:scale-98 ${
            selectedSort === 'nearest'
              ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
              : 'bg-blue-50 text-[#0073e6] border-blue-200 hover:bg-blue-100'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>
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
                Filter Hackathons
              </h2>
              <p className="text-xs text-slate-500">
                {filteredHackathons.length} active opportunities found
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
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#f8fafc]">
            {/* Mode / Workplace */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Participation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Modes' },
                  { id: 'offline', label: 'In-Person (Offline)' },
                  { id: 'online', label: 'Online (Remote)' },
                  { id: 'hybrid', label: 'Hybrid' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      selectedMode === m.id
                        ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Proximity / Find Near Me */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Proximity Tracking
              </label>
              <button
                onClick={handleFindNearMe}
                disabled={isLocating}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  selectedSort === 'nearest'
                    ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                    : 'bg-blue-50 text-[#0073e6] border-blue-200 hover:bg-blue-100'
                }`}
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>
                  {isLocating
                    ? 'Acquiring GPS location...'
                    : selectedSort === 'nearest'
                    ? '📍 Showing Nearest Hackathons First'
                    : '📍 Find Hackathons Near Me (GPS)'}
                </span>
              </button>
            </div>

            {/* Sort Order */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedSort('latest')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    selectedSort === 'latest'
                      ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Latest Added
                </button>
                <button
                  onClick={() => setSelectedSort('deadline')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    selectedSort === 'deadline'
                      ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Deadline Soonest
                </button>
              </div>
            </div>

            {/* Themes & Tracks */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Domains &amp; Themes
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Themes' },
                  { id: 'ai', label: 'AI & GenAI' },
                  { id: 'web', label: 'Web & Mobile' },
                  { id: 'web3', label: 'Web3 & Blockchain' },
                  { id: 'iot', label: 'IoT & Hardware' },
                  { id: 'open', label: 'Open Innovation' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`py-2 px-3 rounded-full text-xs font-medium border transition-all ${
                      selectedTheme === t.id
                        ? 'bg-[#0073e6] text-white border-[#0073e6] font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {locationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
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
              className="w-2/3 py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold rounded-xl shadow-md text-center transition-all active:scale-98"
            >
              Apply Filters ({filteredHackathons.length})
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DESKTOP MODERN FILTER CARD (Hidden on mobile)               */}
      {/* ============================================================== */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mode Filter Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Mode:
            </span>
            {['all', 'online', 'offline', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedMode === mode
                    ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mode === 'all'
                  ? 'All Modes'
                  : mode === 'offline'
                  ? 'In-Person'
                  : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Prominent Find Near Me (GPS) Button */}
          <button
            onClick={handleFindNearMe}
            disabled={isLocating}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              selectedSort === 'nearest'
                ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-[#0073e6] border-blue-200 shadow-2xs'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? 'Acquiring GPS...'
                : selectedSort === 'nearest'
                ? '📍 Nearest to You (Active)'
                : '📍 Find Near Me (GPS)'}
            </span>
          </button>

          {/* Sort Buttons & Reset Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Sort:
            </span>

            <button
              onClick={() => setSelectedSort('latest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedSort === 'latest'
                  ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Latest
            </button>

            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedSort === 'deadline'
                  ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Deadline Soonest
            </button>

            {/* Dedicated Reset / Default Button beside controls */}
            <button
              onClick={handleResetFilters}
              title="Reset all filters to default"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Themes Filter Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Themes:
            </span>
            {[
              { id: 'all', label: 'All Themes' },
              { id: 'ai', label: 'AI & GenAI' },
              { id: 'web', label: 'Web & Mobile' },
              { id: 'web3', label: 'Web3 & Blockchain' },
              { id: 'iot', label: 'IoT & Hardware' },
              { id: 'open', label: 'Open Innovation' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-[#0073e6] text-white border-[#0073e6] shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-normal">
            Showing <strong className="text-slate-900 font-bold">{filteredHackathons.length}</strong> verified hackathons
          </div>
        </div>

        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. HACKATHON CARDS GRID                                        */}
      {/* ============================================================== */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <Globe className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No hackathons match your filters</h3>
          <p className="text-sm text-slate-500 font-normal max-w-md mx-auto">
            Try adjusting your theme or mode filters to explore more active Indian hackathons.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0073e6] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const isDeadlinePassed = (hackathon as any).days_remaining <= 0;
            const hasWideCover =
              hackathon.platform === 'devfolio' ||
              hackathon.platform === 'devpost' ||
              (hackathon.banner_image_url &&
                !hackathon.banner_image_url.includes('150x150') &&
                !hackathon.banner_image_url.includes('unstop-logo-icon'));

            return (
              <div
                key={hackathon.id}
                className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between transition-all duration-200 group"
              >
                {/* Visual Header */}
                {hasWideCover ? (
                  /* Wide Banner Presentation for Devfolio & Devpost */
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                      src={hackathon.banner_image_url}
                      alt={hackathon.title}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Gradient overlay for high badge legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                    {/* Mode Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow-xs border border-slate-200/80 backdrop-blur-xs">
                        {hackathon.mode === 'offline'
                          ? 'In-Person'
                          : hackathon.mode === 'hybrid'
                          ? 'Hybrid'
                          : 'Online'}
                      </span>
                      {hackathon.distance_km !== undefined && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0073e6] text-white shadow-xs">
                          📍 {hackathon.distance_km} KM
                        </span>
                      )}
                    </div>

                    {/* Days Left Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-slate-700 shadow-xs border border-slate-200/80 backdrop-blur-xs">
                        {isDeadlinePassed ? 'Closed' : `${(hackathon as any).days_remaining}d Left`}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Clean Modern Header for Organizer Logos (Unstop) - NO barren empty boxes */
                  <div className="p-5 pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
                        {hackathon.banner_image_url ? (
                          <img
                            src={hackathon.banner_image_url}
                            alt={hackathon.organizer}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-contain rounded-xl"
                            loading="lazy"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0073e6] truncate block">
                          {hackathon.organizer}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                            {hackathon.mode === 'offline' ? 'In-Person' : hackathon.mode === 'hybrid' ? 'Hybrid' : 'Online'}
                          </span>
                          {hackathon.distance_km !== undefined && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0073e6] text-white shadow-xs">
                              📍 {hackathon.distance_km} KM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {isDeadlinePassed ? 'Closed' : `${(hackathon as any).days_remaining}d Left`}
                    </span>
                  </div>
                )}

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {hasWideCover && (
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#0073e6] truncate">
                        {hackathon.organizer}
                      </div>
                    )}

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#0073e6] transition-colors line-clamp-2 leading-snug">
                      {hackathon.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500 font-normal pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-700">{hackathon.venue_city || 'Online'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-700">
                          Deadline: {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Themes Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {hackathon.themes && hackathon.themes.slice(0, 3).map((theme, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Improved Prominent Buttons */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onSelectHackathon(hackathon)}
                      className="py-2.5 px-3 text-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-98"
                    >
                      Details ›
                    </button>

                    <a
                      href={hackathon.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 text-center bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all active:scale-98 flex items-center justify-center gap-1"
                    >
                      <span>Register</span>
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
