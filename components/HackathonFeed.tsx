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
  Radio,
  Layers,
  ChevronRight,
  Filter,
  AlertCircle,
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

      // Calculate days remaining
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
      // Search query
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

      // Mode filter
      if (selectedMode !== 'all' && h.mode !== selectedMode) {
        return false;
      }

      // Theme filter
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

    // Sort
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
      // Default: Latest
      list.sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }

    return list;
  }, [enrichedHackathons, searchQuery, selectedMode, selectedTheme, selectedSort]);

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 md:p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Mode:
            </span>
            {['all', 'online', 'offline', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  selectedMode === mode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {mode === 'all' ? 'All Modes' : mode}
              </button>
            ))}
          </div>

          {/* Sort Buttons & GPS Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 mr-1">Sort:</span>

            <button
              onClick={() => setSelectedSort('latest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSort === 'latest'
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Latest
            </button>

            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSort === 'deadline'
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Deadline Soonest
            </button>

            <button
              onClick={handleFindNearMe}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSort === 'nearest'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Compute Haversine distance using device GPS"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Detecting GPS...' : selectedSort === 'nearest' ? '📍 Nearest (Active)' : '📍 Find Near Me'}
            </button>
          </div>
        </div>

        {/* Themes Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
          <span className="text-xs font-mono text-zinc-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Themes:
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
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedTheme === theme.id
                  ? 'bg-zinc-700 text-emerald-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* Location Error alert if any */}
        {locationError && (
          <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Hackathons Grid */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <Globe className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-200">No hackathons match your filters</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Try adjusting your mode, theme, or search term to see more active hackathons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const isDeadlinePassed = (hackathon as any).days_remaining <= 0;

            return (
              <div
                key={hackathon.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
              >
                {/* 16:9 Banner Image with Fallback */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={hackathon.banner_image_url}
                    alt={hackathon.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                  {/* Mode Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold backdrop-blur-md shadow-sm ${
                        hackathon.mode === 'online'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-700/50'
                          : hackathon.mode === 'offline'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                          : 'bg-violet-950/80 text-violet-300 border border-violet-700/50'
                      }`}
                    >
                      {hackathon.mode === 'offline' ? '🏢 In-Person' : hackathon.mode === 'hybrid' ? '⚡ Hybrid' : '🌐 Online'}
                    </span>

                    {/* GPS Distance Badge */}
                    {hackathon.distance_km !== undefined && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 font-bold shadow-md">
                        📍 {hackathon.distance_km} km away
                      </span>
                    )}
                  </div>

                  {/* Days left badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-md font-semibold backdrop-blur-md flex items-center gap-1 ${
                        isDeadlinePassed
                          ? 'bg-red-950/80 text-red-300 border border-red-700/50'
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {isDeadlinePassed
                        ? 'Registration Ended'
                        : `${(hackathon as any).days_remaining}d left`}
                    </span>
                  </div>

                  {/* Platform & Organizer Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-medium truncate text-zinc-200">
                      by <strong className="text-white">{hackathon.organizer}</strong>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                      {hackathon.platform}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-base md:text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {hackathon.title}
                    </h3>

                    {/* Location & Dates */}
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          {hackathon.venue_city ? `${hackathon.venue_city}, India` : 'Online Nationwide'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>
                          Deadline: {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Themes Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hackathon.themes.slice(0, 3).map((theme, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                        >
                          #{theme}
                        </span>
                      ))}
                      {hackathon.themes.length > 3 && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 text-zinc-500">
                          +{hackathon.themes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                    <button
                      onClick={() => onSelectHackathon(hackathon)}
                      className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Problem & Rounds</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <a
                      href={hackathon.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Register ↗</span>
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
