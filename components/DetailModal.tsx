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
  Award,
} from 'lucide-react';

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
  const realScrapedImage = hackathon?.banner_image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modern Sleek Dark Dialog Card */}
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-[#0f172a] border border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-200 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-800/90 bg-[#0b0f19]">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isHackathon ? 'Stages & Timeline' : 'Role Overview'}
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Full Description
            </button>
            {isHackathon && (
              <button
                onClick={() => setActiveTab('prizes')}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'prizes'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Prizes &amp; Rewards
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Unified Scrollable Body */}
        <div className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-8 flex-1 bg-[#090d16]/95">
          {isHackathon && hackathon ? (
            /* =================== HACKATHON DETAILS =================== */
            <div className="space-y-8">
              {/* Header Hero Banner with Real Scraped Image */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 min-h-[220px] sm:min-h-[280px] shadow-lg flex items-center justify-center">
                {/* Background blurred glow */}
                <img
                  src={realScrapedImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none"
                />

                {/* Foreground real scraped image */}
                <img
                  src={realScrapedImage}
                  alt={hackathon.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="relative w-full h-full object-contain max-h-[340px] p-4"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/90 text-white backdrop-blur-md shadow-xs border border-white/10">
                    {hackathon.platform}
                  </span>
                </div>
              </div>

              {/* Title & Organization Header */}
              <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Organized by {hackathon.organizer}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                    Verified
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {hackathon.title}
                </h1>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Mode / Venue
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {hackathon.venue_city || 'Online'}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Registration Deadline
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider mb-1">
                      Tracks &amp; Themes
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base truncate block">
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
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Stages and Timelines
                    </h2>
                  </div>

                  {hackathon.rounds_description && hackathon.rounds_description.length > 0 ? (
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                      {hackathon.rounds_description.map((round, idx) => (
                        <div key={idx} className="relative space-y-2">
                          {/* Timeline Date Pill Indicator */}
                          <div className="flex items-center gap-2">
                            <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-blue-500/20">
                              {round.round_num}
                            </div>
                            <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-xs">
                              Stage {round.round_num}: {round.date}
                            </span>
                          </div>

                          {/* Round Card */}
                          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-2 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-white">
                                {round.name}
                              </h3>
                              <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-800">
                                ✓
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 font-normal leading-relaxed">
                              {round.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 text-sm text-slate-400">
                      Standard two-phase timeline: Project development &amp; final prototype judging.
                    </div>
                  )}
                </div>
              )}

              {/* Challenge Overview & Details */}
              {(activeTab === 'details' || activeTab === 'timeline') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Overview &amp; Problem Statement
                    </h2>
                  </div>

                  <div
                    className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 text-sm sm:text-base text-slate-300 font-normal leading-relaxed space-y-3 shadow-md"
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
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Prizes &amp; Rewards
                    </h2>
                  </div>

                  <div className="p-6 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-200 space-y-2 shadow-md">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Official Awards Pool</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-white">
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
              <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl border border-slate-800 flex items-center justify-center p-2.5 shrink-0 shadow-md">
                  {job.company_logo_url ? (
                    <img
                      src={job.company_logo_url}
                      alt={job.company_name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-slate-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-400">
                      {job.company_name}
                    </span>
                    {job.company_type && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {job.company_type}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-normal mt-3">
                    <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-semibold uppercase">
                      Role: {job.tech_role}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Batches: {job.target_batches.join(', ')}
                    </span>
                    {job.stipend_or_salary && (
                      <span className="px-3.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-bold text-xs sm:text-sm">
                        💰 {job.stipend_or_salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 shadow-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Opportunity Type
                  </span>
                  <span className="text-white font-bold text-sm capitalize">
                    {job.opportunity_type}
                  </span>
                </div>
                <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 shadow-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Workplace Mode
                  </span>
                  <span className="text-white font-bold text-sm capitalize">
                    {job.location_type}
                  </span>
                </div>
                <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 shadow-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Location
                  </span>
                  <span className="text-white font-bold text-sm truncate block">
                    {job.city || 'India'}
                  </span>
                </div>
                <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 shadow-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">
                    Experience
                  </span>
                  <span className="text-white font-bold text-sm">
                    {job.is_fresher_eligible ? '0 Exp (Freshers OK)' : `${job.min_exp_years}+ yrs`}
                  </span>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements_bullets && job.requirements_bullets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Key Requirements &amp; Capabilities
                    </h2>
                  </div>

                  <div className="bg-[#111827] p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-md space-y-3">
                    {job.requirements_bullets.map((req, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Position Description
                  </h2>
                </div>

                <div
                  className="bg-[#111827] p-6 sm:p-7 rounded-2xl border border-slate-800 text-sm sm:text-base text-slate-300 font-normal leading-relaxed space-y-3 shadow-md"
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

        {/* Modal Bottom CTA Bar */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-800/90 bg-[#0b0f19] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-normal flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Direct application link • Zero login friction • 100% Free</span>
          </div>

          <a
            href={isHackathon ? hackathon?.apply_url : job?.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1c69d4] hover:bg-[#0284c7] text-white text-sm font-bold tracking-wide uppercase transition-all rounded-full shadow-md shadow-blue-600/30 active:scale-98 text-center"
          >
            <span>{isHackathon ? 'Register on Official Portal ›' : 'Apply on Official Site ›'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
