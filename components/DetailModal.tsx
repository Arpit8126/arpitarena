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
  Briefcase,
  Layers,
} from 'lucide-react';

interface DetailModalProps {
  type: 'hackathon' | 'job' | null;
  item: Hackathon | Opportunity | null;
  onClose: () => void;
}

export function DetailModal({ type, item, onClose }: DetailModalProps) {
  const [detailedItem, setDetailedItem] = useState<any>(item);

  // 1. Lock background page scrolling when modal is active
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

  // Determine if image is a 150x150 thumbnail / square logo
  const isThumbnailLogo =
    hackathon?.banner_image_url?.includes('150x150') ||
    hackathon?.banner_image_url?.includes('uploadedManual') ||
    hackathon?.platform === 'unstop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0f141c]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Spacious Big Card Architecture (max-w-4xl to max-w-5xl) */}
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white border border-[#cccccc] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-[#262626] rounded-none">
        {/* Top 4px M-Tricolor Stripe */}
        <div className="m-stripe" />

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-[#e6e6e6] bg-[#f9f9f9]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1c69d4]"></span>
            <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#1c69d4]">
              {isHackathon ? 'HACKATHON SPECIFICATION' : 'ROLE SPECIFICATION & DETAILS'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#6b6b6b] hover:text-[#262626] hover:bg-[#e6e6e6] transition-colors rounded-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content: Unified smooth scroll container without nested trapped boxes */}
        <div className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-8 flex-1">
          {isHackathon && hackathon ? (
            /* =================== HACKATHON DETAILS =================== */
            <div className="space-y-8">
              {/* Image Plate: High-res banner or crisp centered emblem header */}
              <div className="relative w-full border border-[#e6e6e6] overflow-hidden bg-[#161c24] min-h-[220px] sm:min-h-[280px] flex items-center justify-center">
                {isThumbnailLogo ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-md p-3 border border-white/20 flex items-center justify-center shadow-lg">
                      <img
                        src={hackathon.banner_image_url}
                        alt={hackathon.organizer}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-white text-xs font-bold tracking-[1.5px] uppercase">
                      {hackathon.organizer}
                    </div>
                  </div>
                ) : (
                  <img
                    src={hackathon.banner_image_url}
                    alt={hackathon.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover max-h-[360px]"
                  />
                )}

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[1px] px-3 py-1 bg-[#262626] text-white">
                    {hackathon.platform}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[1.5px] text-[#1c69d4]">
                  ORGANIZED BY {hackathon.organizer}
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-[#262626] leading-tight tracking-tight">
                  {hackathon.title}
                </h1>

                {/* KPI Metrics Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
                  <div className="bg-[#f7f7f7] p-4 border border-[#e6e6e6]">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      MODE / VENUE
                    </span>
                    <span className="text-[#262626] font-bold text-sm sm:text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1c69d4]" />
                      {hackathon.venue_city || 'Online'}
                    </span>
                  </div>

                  <div className="bg-[#f7f7f7] p-4 border border-[#e6e6e6]">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      REGISTRATION DEADLINE
                    </span>
                    <span className="text-[#262626] font-bold text-sm sm:text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1c69d4]" />
                      {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-[#f7f7f7] p-4 border border-[#e6e6e6]">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      TRACKS / DOMAINS
                    </span>
                    <span className="text-[#262626] font-bold text-sm sm:text-base truncate block">
                      {hackathon.themes && hackathon.themes.length > 0
                        ? hackathon.themes.join(', ')
                        : 'Open Innovation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Statement & Overview (Spacious, easily readable) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                  OVERVIEW &amp; CHALLENGE DESCRIPTION
                </h3>
                <div
                  className="bg-[#fafafa] p-5 sm:p-6 border border-[#e6e6e6] text-sm sm:text-base text-[#333333] font-light leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      hackathon.problem_statement ||
                      'Participate in this official hackathon challenge. Build scalable products, leverage modern software stacks, and present your solution to an industry jury panel.',
                  }}
                />
              </div>

              {/* Timeline & Stages */}
              {hackathon.rounds_description && hackathon.rounds_description.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                    ROUNDS &amp; SUBMISSION TIMELINE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {hackathon.rounds_description.map((round, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#f7f7f7] border-l-4 border-[#1c69d4] border-t border-r border-b border-[#e6e6e6] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1c69d4] uppercase tracking-wider">
                            Round {round.round_num}
                          </span>
                          <span className="text-xs text-[#6b6b6b] font-light">{round.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#262626]">{round.name}</h4>
                        <p className="text-xs text-[#555555] font-light leading-relaxed">
                          {round.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards & Prizes */}
              {hackathon.prizes_summary && (
                <div className="p-5 bg-[#f0f6ff] border border-[#bcd7ff] text-xs sm:text-sm text-[#1c69d4] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[1.5px] flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> AWARDS &amp; RECOGNITION
                  </span>
                  <p className="font-medium text-[#1e3a8a] text-sm sm:text-base">
                    {hackathon.prizes_summary}
                  </p>
                </div>
              )}
            </div>
          ) : job ? (
            /* =================== JOB & INTERNSHIP DETAILS =================== */
            <div className="space-y-8">
              {/* Company Header */}
              <div className="flex items-start gap-5 pb-6 border-b border-[#e6e6e6]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center p-2 shrink-0">
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
                    <Building className="w-8 h-8 text-[#9a9a9a]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#1c69d4]">
                      {job.company_name}
                    </span>
                    {job.company_type && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f0f0f0] text-[#555555] border border-[#e0e0e0]">
                        {job.company_type}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] mt-1 tracking-tight">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b6b6b] font-light mt-3">
                    <span className="px-2.5 py-1 bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6] font-medium uppercase">
                      Role: {job.tech_role}
                    </span>
                    <span className="px-2.5 py-1 bg-[#f7f7f7] text-[#555555] border border-[#e6e6e6]">
                      Batches: {job.target_batches.join(', ')}
                    </span>
                    {job.stipend_or_salary && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm">
                        💰 {job.stipend_or_salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    OPPORTUNITY TYPE
                  </span>
                  <span className="text-[#262626] font-bold text-sm capitalize">
                    {job.opportunity_type}
                  </span>
                </div>
                <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    WORKPLACE MODE
                  </span>
                  <span className="text-[#262626] font-bold text-sm capitalize">
                    {job.location_type}
                  </span>
                </div>
                <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    LOCATION
                  </span>
                  <span className="text-[#262626] font-bold text-sm truncate block">
                    {job.city || 'India'}
                  </span>
                </div>
                <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    EXPERIENCE
                  </span>
                  <span className="text-[#262626] font-bold text-sm">
                    {job.is_fresher_eligible ? '0 Exp (Freshers OK)' : `${job.min_exp_years}+ yrs`}
                  </span>
                </div>
              </div>

              {/* Requirements Bullets */}
              {job.requirements_bullets && job.requirements_bullets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                    KEY REQUIREMENTS &amp; CAPABILITIES
                  </h3>
                  <div className="bg-[#fafafa] p-5 sm:p-6 border border-[#e6e6e6] space-y-2.5">
                    {job.requirements_bullets.map((req, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#333333]">
                        <CheckCircle2 className="w-4 h-4 text-[#1c69d4] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                  FULL POSITION DETAILS
                </h3>
                <div
                  className="bg-[#fafafa] p-5 sm:p-6 border border-[#e6e6e6] text-xs sm:text-sm text-[#333333] font-light leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.full_description_html ||
                      `<p>${job.title} at ${job.company_name}. Submit your official application using the link below.</p>`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#e6e6e6] bg-[#f9f9f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6b6b6b] font-light flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1c69d4]" />
            <span>Direct redirect to official portal • No middlemen</span>
          </div>

          <a
            href={isHackathon ? hackathon?.apply_url : job?.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs sm:text-sm font-bold uppercase tracking-[1px] transition-colors rounded-none shadow-sm text-center"
          >
            <span>{isHackathon ? 'GO TO REGISTRATION PAGE ›' : 'APPLY ON OFFICIAL SITE ›'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
