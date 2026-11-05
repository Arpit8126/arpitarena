'use client';

import React, { useState, useMemo } from 'react';
import { Hackathon } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils/geo';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  Globe,
  AlertCircle,
  Building,
  Sparkles,
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
        setLocationError(`Location permission denied or unavailable (${err.message}).`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate distance & days remaining
  const enrichedHackathons = useMemo(() => {
    return hackathons.map((hack) => {
      let distance_km: number | undefined = undefined;
      if (userLocation && hack.latitude && hack.longitude) {
        distance_km = calculateHaversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          hack.latitude,
          hack.longitude
        );
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
        const matchesThemes = h.themes.some((t) => t.toLowerCase().includes(query));
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
        const hasTheme = h.themes.some((themeStr) => {
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
      {/* Modern Unstop-Style Filters Panel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Mode:
            </span>
            {['all', 'online', 'offline', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedMode === mode
                    ? 'bg-[#1c69d4] text-white border-[#1c69d4] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {mode === 'all' ? 'All Modes' : mode === 'offline' ? 'In-Person' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort Buttons & GPS Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Sort:
            </span>

            <button
              onClick={() => setSelectedSort('latest')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedSort === 'latest'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Latest
            </button>

            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedSort === 'deadline'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Deadline Soonest
            </button>

            {/* GPS Proximity Pill Button */}
            <button
              onClick={handleFindNearMe}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                selectedSort === 'nearest'
                  ? 'bg-[#1c69d4] text-white shadow-xs'
                  : 'bg-blue-50 text-[#1c69d4] border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : selectedSort === 'nearest' ? '📍 Nearest (Active)' : '📍 Find Near Me'}</span>
            </button>
          </div>
        </div>

        {/* Themes Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
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
                  ? 'bg-[#1c69d4] text-white border-[#1c69d4] shadow-xs font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Grid: Modern Unstop-Style Rounded Cards (3 columns) */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <Globe className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">No hackathons match your criteria</h3>
          <p className="text-sm text-slate-500 font-normal max-w-md mx-auto">
            Try adjusting your theme or mode filters to explore more active hackathons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const isDeadlinePassed = (hackathon as any).days_remaining <= 0;
            const isThumb =
              hackathon.banner_image_url?.includes('150x150') ||
              hackathon.banner_image_url?.includes('uploadedManual') ||
              hackathon.platform === 'unstop';

            return (
              <div
                key={hackathon.id}
                className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between transition-all duration-200 group"
              >
                {/* Visual Header */}
                <div className="relative aspect-[16/9] w-full bg-[#0f172a] overflow-hidden flex items-center justify-center">
                  {isThumb ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={hackathon.banner_image_url}
                          alt={hackathon.organizer}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider mt-2.5 truncate max-w-[240px]">
                        {hackathon.organizer}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={hackathon.banner_image_url}
                      alt={hackathon.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {/* Mode Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 text-white backdrop-blur-sm shadow-xs">
                      {hackathon.mode === 'offline' ? 'In-Person' : hackathon.mode === 'hybrid' ? 'Hybrid' : 'Online'}
                    </span>
                    {hackathon.distance_km !== undefined && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1c69d4] text-white shadow-xs">
                        📍 {hackathon.distance_km} KM
                      </span>
                    )}
                  </div>

                  {/* Platform & Days Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow-xs border border-white/50 backdrop-blur-sm">
                      {isDeadlinePassed ? 'Closed' : `${(hackathon as any).days_remaining}d Left`}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1c69d4] truncate">
                      {hackathon.organizer}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#1c69d4] transition-colors line-clamp-2 leading-snug">
                      {hackathon.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500 font-normal pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hackathon.venue_city || 'Online'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
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

                  {/* Action Buttons: Modern Rounded Buttons */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onSelectHackathon(hackathon)}
                      className="py-2.5 px-3 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                    >
                      Details ›
                    </button>

                    <a
                      href={hackathon.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 text-center bg-[#1c69d4] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all"
                    >
                      Register ›
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
