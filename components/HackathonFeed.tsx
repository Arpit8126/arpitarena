'use client';

import React, { useState, useMemo } from 'react';
import { Hackathon } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils/geo';
import {
  Calendar,
  MapPin,
  Clock,
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
      // Only calculate distance if the hackathon has valid coordinates AND is not online
      if (userLocation && hack.latitude && hack.longitude && hack.mode !== 'online') {
        // Guard against zero / null
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
        // Items with real calculated distance come first
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
      {/* Modern Sleek Dark Filter Panel */}
      <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-4">
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedMode === mode
                    ? 'bg-[#1c69d4] text-white border-[#1c69d4] shadow-sm shadow-blue-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80'
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedSort === 'latest'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              Latest
            </button>

            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedSort === 'deadline'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
              }`}
            >
              Deadline Soonest
            </button>

            {/* GPS Proximity Pill Button */}
            <button
              onClick={handleFindNearMe}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                selectedSort === 'nearest'
                  ? 'bg-[#1c69d4] text-white shadow-sm'
                  : 'bg-blue-950/60 text-blue-400 border border-blue-700/60 hover:bg-blue-900/60'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : selectedSort === 'nearest' ? '📍 Nearest (Active)' : '📍 Find Near Me'}</span>
            </button>
          </div>
        </div>

        {/* Themes Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
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
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-semibold'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Grid: 3-column Layout with Real Scraped Images */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-16 text-center space-y-3 shadow-lg">
          <Globe className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No hackathons match your criteria</h3>
          <p className="text-sm text-slate-400 font-normal max-w-md mx-auto">
            Try adjusting your theme or mode filters to explore more active hackathons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const isDeadlinePassed = (hackathon as any).days_remaining <= 0;
            const realScrapedImage = hackathon.banner_image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={hackathon.id}
                className="bg-[#111827]/90 border border-slate-800/90 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col justify-between transition-all duration-300 group"
              >
                {/* Visual Header displaying the REAL Scraped Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  {/* Blurred ambient background of the exact same image to ensure perfect aspect ratio fit */}
                  <img
                    src={realScrapedImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none"
                    loading="lazy"
                  />

                  {/* Foreground real scraped image */}
                  <img
                    src={realScrapedImage}
                    alt={hackathon.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="relative w-full h-full object-contain group-hover:scale-103 transition-transform duration-300 p-2"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for high-contrast badge legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Mode Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 text-white backdrop-blur-md shadow-xs border border-white/10">
                      {hackathon.mode === 'offline' ? 'In-Person' : hackathon.mode === 'hybrid' ? 'Hybrid' : 'Online'}
                    </span>
                    {hackathon.distance_km !== undefined && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1c69d4] text-white shadow-xs">
                        📍 {hackathon.distance_km} KM
                      </span>
                    )}
                  </div>

                  {/* Platform & Days Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-200 shadow-xs border border-white/10 backdrop-blur-md">
                      {isDeadlinePassed ? 'Closed' : `${(hackathon as any).days_remaining}d Left`}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 truncate">
                      {hackathon.organizer}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {hackathon.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-400 font-normal pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{hackathon.venue_city || 'Online'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
                          className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onSelectHackathon(hackathon)}
                      className="py-2.5 px-3 text-center bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all"
                    >
                      Details ›
                    </button>

                    <a
                      href={hackathon.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 text-center bg-[#1c69d4] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-500/50 transition-all"
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
