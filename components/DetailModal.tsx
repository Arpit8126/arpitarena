'use client';

import React, { useEffect, useState } from 'react';
import { Hackathon, Opportunity } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Award,
  Globe,
  Share2,
  CheckCircle,
} from 'lucide-react';

// Intelligent theme-based banner selector
function getHackathonCoverBanner(hackathon: Hackathon): string {
  const url = hackathon.banner_image_url || '';
  const isLogoOnly =
    url.includes('150x150') ||
    url.includes('uploadedManual') ||
    url.includes('organisation_image') ||
    url.includes('svg/unstop-logo');

  if (!isLogoOnly && url && url.startsWith('http')) {
    return url;
  }

  const text = (hackathon.title + ' ' + (hackathon.themes || []).join(' ') + ' ' + hackathon.organizer).toLowerCase();

  if (text.includes('ai') || text.includes('genai') || text.includes('machine learning') || text.includes('deep learning')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80';
  }
  if (text.includes('web3') || text.includes('blockchain') || text.includes('crypto')) {
    return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80';
  }
  if (text.includes('robot') || text.includes('hardware') || text.includes('iot')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80';
  }
  if (text.includes('cyber') || text.includes('security') || text.includes('ctf')) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
  }
  if (text.includes('case') || text.includes('strategy') || text.includes('econo') || text.includes('business')) {
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80';
  }
  if (text.includes('code') || text.includes('coding') || text.includes('software')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
}

interface DetailModalProps {
  type: 'hackathon' | 'job' | null;
  item: Hackathon | Opportunity | null;
  onClose: () => void;
}

export function DetailModal({ type, item, onClose }: DetailModalProps) {
  const [detailedItem, setDetailedItem] = useState<any>(item);
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'prizes'>('timeline');

  // Lock background page scrolling when modal is active
  useEffect(() => {
    if (item && type) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [item, type]);

  useEffect(() => {
    setDetailedItem(item);
    if (!item) return;

    const fetchFullDetails = async () => {
      if (!item.id) return;
      try {
        const tableName = type === 'hackathon' ? 'hackathons' : 'opportunities';
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', item.id)
          .single();

        if (data && !error) {
          setDetailedItem((prev: any) => ({ ...prev, ...data }));
        }
      } catch {
        // Fallback to initial
      }
    };

    fetchFullDetails();
  }, [item, type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item || !type) return null;

  const isHackathon = type === 'hackathon';
  const hackathon = isHackathon ? (detailedItem as Hackathon) : null;
  const job = !isHackathon ? (detailedItem as Opportunity) : null;

  const isThumbnailLogo =
    hackathon?.banner_image_url?.includes('150x150') ||
    hackathon?.banner_image_url?.includes('uploadedManual') ||
    hackathon?.platform === 'unstop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modern Unstop Dialog Card (rounded-3xl, shadow-2xl, border-slate-200) */}
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Navigation Bar (Unstop style with clean tabs & close button) */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-50 text-[#1c69d4] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isHackathon ? 'Stages & Timeline' : 'Role Overview'}
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                activeTab === 'details'
                  ? 'bg-blue-50 text-[#1c69d4] font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Full Description
            </button>
            {isHackathon && (
              <button
                onClick={() => setActiveTab('prizes')}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'prizes'
                    ? 'bg-blue-50 text-[#1c69d4] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Prizes &amp; Rewards
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Unified Scrollable Body */}
        <div className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
          {isHackathon && hackathon ? (
            /* =================== HACKATHON DETAILS =================== */
            <div className="space-y-8">
              {/* Header Hero Banner Plate */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 min-h-[220px] sm:min-h-[260px] shadow-sm">
                <img
                  src={getHackathonCoverBanner(hackathon)}
                  alt={hackathon.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover max-h-[340px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-black/30" />

                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/90 text-white backdrop-blur-md shadow-xs border border-white/10">
                    {hackathon.platform}
                  </span>
                </div>

                {hackathon.banner_image_url && hackathon.banner_image_url.startsWith('http') && (
                  <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-lg border border-white/80 flex items-center justify-center shrink-0">
                      <img
                        src={hackathon.banner_image_url}
                        alt={hackathon.organizer}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      {hackathon.organizer}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Organization Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1c69d4]">
                    Organized by {hackathon.organizer}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#1c69d4] border border-blue-200">
                    Verified
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {hackathon.title}
                </h1>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Mode / Venue
                    </span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#1c69d4]" />
                      {hackathon.venue_city || 'Online'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Registration Deadline
                    </span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#1c69d4]" />
                      {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Tracks &amp; Themes
                    </span>
                    <span className="text-slate-900 font-bold text-sm sm:text-base truncate block">
                      {hackathon.themes && hackathon.themes.length > 0
                        ? hackathon.themes.join(', ')
                        : 'Open Innovation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Unstop Stages and Timelines View */}
              {(activeTab === 'timeline' || activeTab === 'details') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-[#1c69d4] rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Stages and Timelines
                    </h2>
                  </div>

                  {hackathon.rounds_description && hackathon.rounds_description.length > 0 ? (
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {hackathon.rounds_description.map((round, idx) => (
                        <div key={idx} className="relative space-y-2">
                          {/* Timeline Date Pill Indicator (Exact Unstop Style) */}
                          <div className="flex items-center gap-2">
                            <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                              {round.round_num}
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                              Stage {round.round_num}: {round.date}
                            </span>
                          </div>

                          {/* Round Card */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-slate-900">
                                {round.name}
                              </h3>
                              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1c69d4] flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 font-normal leading-relaxed">
                              {round.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-600">
                      Standard two-phase timeline: Project development &amp; final prototype judging.
                    </div>
                  )}
                </div>
              )}

              {/* Challenge Overview & Details */}
              {(activeTab === 'details' || activeTab === 'timeline') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-[#1c69d4] rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Overview &amp; Problem Statement
                    </h2>
                  </div>

                  <div
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 text-sm sm:text-base text-slate-700 font-normal leading-relaxed space-y-3 shadow-xs"
                    dangerouslySetInnerHTML={{
                      __html:
                        hackathon.problem_statement ||
                        'Build scalable tech solutions solving real-world challenges. Open to students and developers across India.',
                    }}
                  />
                </div>
              )}

              {/* Prizes & Rewards */}
              {(activeTab === 'prizes' || activeTab === 'timeline') && hackathon.prizes_summary && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Prizes &amp; Rewards
                    </h2>
                  </div>

                  <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Official Awards Pool</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-emerald-950">
                      {hackathon.prizes_summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : job ? (
            /* =================== JOB & INTERNSHIP DETAILS =================== */
            <div className="space-y-8">
              {/* Company Header Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                  {job.company_logo_url ? (
                    <img
                      src={job.company_logo_url}
                      alt={job.company_name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1c69d4]">
                      {job.company_name}
                    </span>
                    {job.company_type && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        {job.company_type}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-normal mt-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1c69d4] border border-blue-200 font-semibold uppercase">
                      Role: {job.tech_role}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Batches: {job.target_batches.join(', ')}
                    </span>
                    {job.stipend_or_salary && (
                      <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm">
                        💰 {job.stipend_or_salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Opportunity Type
                  </span>
                  <span className="text-slate-900 font-bold text-sm capitalize">
                    {job.opportunity_type}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Workplace Mode
                  </span>
                  <span className="text-slate-900 font-bold text-sm capitalize">
                    {job.location_type}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Location
                  </span>
                  <span className="text-slate-900 font-bold text-sm truncate block">
                    {job.city || 'India'}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Experience
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {job.is_fresher_eligible ? '0 Exp (Freshers OK)' : `${job.min_exp_years}+ yrs`}
                  </span>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements_bullets && job.requirements_bullets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-[#1c69d4] rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      Key Requirements &amp; Capabilities
                    </h2>
                  </div>

                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    {job.requirements_bullets.map((req, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#1c69d4] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 bg-[#1c69d4] rounded-full" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Position Description
                  </h2>
                </div>

                <div
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 text-sm sm:text-base text-slate-700 font-normal leading-relaxed space-y-3 shadow-xs"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.full_description_html ||
                      `<p>${job.title} at ${job.company_name}. Submit your official application using the button below.</p>`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom CTA Bar: Modern Rounded Unstop-Style Action */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-normal flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1c69d4]" />
            <span>Direct application link • Zero login friction • 100% Free</span>
          </div>

          <a
            href={isHackathon ? hackathon?.apply_url : job?.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1c69d4] hover:bg-[#0284c7] text-white text-sm font-bold tracking-wide uppercase transition-all rounded-full shadow-md hover:shadow-lg active:scale-98 text-center"
          >
            <span>{isHackathon ? 'Register on Official Portal ›' : 'Apply on Official Site ›'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
