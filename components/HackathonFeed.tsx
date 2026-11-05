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
  ChevronRight,
  AlertCircle,
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
      {/* Filters Band */}
      <div className="bg-[#f7f7f7] border border-[#e6e6e6] p-4 sm:p-5 rounded-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#6b6b6b] mr-2">
              MODE:
            </span>
            {['all', 'online', 'offline', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-[1px] transition-colors rounded-none border ${
                  selectedMode === mode
                    ? 'bg-[#1c69d4] text-white border-[#1c69d4]'
                    : 'bg-white text-[#262626] border-[#cccccc] hover:border-[#262626]'
                }`}
              >
                {mode === 'all' ? 'All Modes' : mode}
              </button>
            ))}
          </div>

          {/* Sort Buttons & GPS Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#6b6b6b] mr-1">
              SORT:
            </span>

            <button
              onClick={() => setSelectedSort('latest')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none border ${
                selectedSort === 'latest'
                  ? 'bg-[#262626] text-white border-[#262626]'
                  : 'bg-white text-[#262626] border-[#cccccc] hover:border-[#262626]'
              }`}
            >
              Latest
            </button>

            <button
              onClick={() => setSelectedSort('deadline')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none border ${
                selectedSort === 'deadline'
                  ? 'bg-[#262626] text-white border-[#262626]'
                  : 'bg-white text-[#262626] border-[#cccccc] hover:border-[#262626]'
              }`}
            >
              Deadline Soonest
            </button>

            {/* GPS Proximity Button */}
            <button
              onClick={handleFindNearMe}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none ${
                selectedSort === 'nearest'
                  ? 'bg-[#1c69d4] text-white'
                  : 'bg-white border border-[#1c69d4] text-[#1c69d4] hover:bg-[#1c69d4] hover:text-white'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : selectedSort === 'nearest' ? '📍 Nearest (Active)' : '📍 Find Near Me'}</span>
            </button>
          </div>
        </div>

        {/* Themes Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e6e6e6]">
          <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#6b6b6b] mr-1">
            THEMES:
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
              className={`px-2.5 py-1 text-xs uppercase tracking-[0.5px] rounded-none border transition-colors ${
                selectedTheme === theme.id
                  ? 'bg-[#262626] text-white border-[#262626] font-bold'
                  : 'bg-white text-[#3c3c3c] border-[#e6e6e6] hover:border-[#262626]'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Grid: 3-column layout on desktop to eliminate blurry cramped cards */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white border border-[#e6e6e6] p-16 text-center space-y-3">
          <Globe className="w-12 h-12 text-[#9a9a9a] mx-auto" />
          <h3 className="text-xl font-bold text-[#262626]">No hackathons match your criteria</h3>
          <p className="text-sm text-[#6b6b6b] font-light max-w-md mx-auto">
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
                className="bg-white border border-[#e6e6e6] hover:border-[#262626] flex flex-col justify-between transition-colors duration-150 rounded-none group shadow-sm hover:shadow-md"
              >
                {/* Visual Header: Crisp Banner OR Centered Emblem Plate to completely prevent blurry scaling */}
                <div className="relative aspect-[16/9] w-full bg-[#161c24] overflow-hidden flex items-center justify-center">
                  {isThumb ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md p-2.5 border border-white/20 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <img
                          src={hackathon.banner_image_url}
                          alt={hackathon.organizer}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] text-white/70 uppercase tracking-widest mt-2 truncate max-w-[220px]">
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
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {/* Mode Tag */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-0.5 bg-[#262626] text-white">
                      {hackathon.mode === 'offline' ? 'IN-PERSON' : hackathon.mode === 'hybrid' ? 'HYBRID' : 'ONLINE'}
                    </span>
                    {hackathon.distance_km !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1c69d4] text-white">
                        📍 {hackathon.distance_km} KM
                      </span>
                    )}
                  </div>

                  {/* Platform & Days Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 bg-white text-[#262626] border border-[#e6e6e6]">
                      {isDeadlinePassed ? 'CLOSED' : `${(hackathon as any).days_remaining}D LEFT`}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#1c69d4] truncate">
                      {hackathon.organizer}
                    </div>

                    <h3 className="font-bold text-base text-[#262626] group-hover:text-[#1c69d4] transition-colors line-clamp-2 leading-snug">
                      {hackathon.title}
                    </h3>

                    <div className="space-y-1 text-xs text-[#6b6b6b] font-light pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#9a9a9a] shrink-0" />
                        <span>{hackathon.venue_city || 'Online'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9a9a9a] shrink-0" />
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
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {hackathon.themes && hackathon.themes.slice(0, 3).map((theme, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium uppercase px-1.5 py-0.5 bg-[#f7f7f7] text-[#6b6b6b] border border-[#e6e6e6]"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#f0f0f0] grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectHackathon(hackathon)}
                      className="py-2 px-2 text-center bg-white border border-[#cccccc] hover:border-[#262626] text-[#262626] text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none"
                    >
                      DETAILS ›
                    </button>

                    <a
                      href={hackathon.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 text-center bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs font-bold uppercase tracking-[0.5px] transition-colors rounded-none"
                    >
                      REGISTER ›
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
