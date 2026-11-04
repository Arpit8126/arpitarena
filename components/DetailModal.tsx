'use client';

import React, { useEffect, useState } from 'react';
import { Hackathon, Opportunity } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface DetailModalProps {
  type: 'hackathon' | 'job' | null;
  item: Hackathon | Opportunity | null;
  onClose: () => void;
}

export function DetailModal({ type, item, onClose }: DetailModalProps) {
  const [detailedItem, setDetailedItem] = useState<any>(item);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1a2129]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal: BMW Rectangular 0px Radius Architecture */}
      <div className="relative w-full max-w-3xl bg-white border border-[#cccccc] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-[#262626] rounded-none">
        {/* Top 4px M-Tricolor Stripe */}
        <div className="m-stripe" />

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6] bg-[#f7f7f7]">
          <div className="text-xs font-bold uppercase tracking-[1.5px] text-[#1c69d4]">
            {isHackathon ? 'HACKATHON SPECIFICATION' : 'ROLE SPECIFICATION & DETAILS'}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6b6b6b] hover:text-[#262626] hover:bg-[#e6e6e6] transition-colors rounded-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {isHackathon && hackathon ? (
            /* =================== HACKATHON DETAILS =================== */
            <div className="space-y-6">
              {/* Banner */}
              <div className="relative aspect-[16/9] w-full bg-[#fafafa] border border-[#e6e6e6] overflow-hidden rounded-none">
                <img
                  src={hackathon.banner_image_url}
                  alt={hackathon.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-bold uppercase tracking-[1px] px-3 py-1 bg-[#262626] text-white">
                    {hackathon.platform}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-[1.5px] text-[#1c69d4]">
                  ORGANIZED BY {hackathon.organizer}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] leading-tight">
                  {hackathon.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                  <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6] rounded-none">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      MODE / VENUE
                    </span>
                    <span className="text-[#262626] font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1c69d4]" />
                      {hackathon.venue_city || 'Online'}
                    </span>
                  </div>

                  <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6] rounded-none">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      REGISTRATION DEADLINE
                    </span>
                    <span className="text-[#262626] font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1c69d4]" />
                      {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-[#f7f7f7] p-3.5 border border-[#e6e6e6] rounded-none">
                    <span className="text-[#6b6b6b] block text-[11px] font-bold uppercase tracking-[1px] mb-1">
                      TRACKS / THEMES
                    </span>
                    <span className="text-[#262626] font-bold truncate block">
                      {hackathon.themes.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                  OVERVIEW &amp; CHALLENGE DESCRIPTION
                </h3>
                <div
                  className="bg-[#fafafa] p-4 border border-[#e6e6e6] text-sm text-[#3c3c3c] font-light leading-relaxed max-h-56 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      hackathon.problem_statement ||
                      'Build high-impact solutions leveraging modern engineering, web, and AI stacks.',
                  }}
                />
              </div>

              {/* Rounds Timeline */}
              {hackathon.rounds_description && hackathon.rounds_description.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                    ROUNDS &amp; SUBMISSION TIMELINE
                  </h3>
                  <div className="space-y-3 pl-4 border-l-2 border-[#1c69d4]">
                    {hackathon.rounds_description.map((round, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1c69d4] uppercase tracking-wider">
                            Round {round.round_num}:
                          </span>
                          <span className="text-sm font-bold text-[#262626]">{round.name}</span>
                          <span className="text-xs text-[#6b6b6b] font-light">({round.date})</span>
                        </div>
                        <p className="text-xs text-[#3c3c3c] font-light">{round.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prizes Summary */}
              {hackathon.prizes_summary && (
                <div className="p-4 bg-[#f7f7f7] border border-[#e6e6e6] text-xs text-[#3c3c3c] space-y-1 rounded-none">
                  <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#1c69d4] block">
                    🏆 AWARDS &amp; REWARDS
                  </span>
                  <p className="font-light">{hackathon.prizes_summary}</p>
                </div>
              )}
            </div>
          ) : job ? (
            /* =================== JOB & INTERNSHIP DETAILS =================== */
            <div className="space-y-6">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center p-1.5 shrink-0 rounded-none">
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

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[1px] text-[#1c69d4]">
                      {job.company_name}
                    </span>
                    {job.company_type && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#f7f7f7] text-[#6b6b6b] border border-[#e6e6e6]">
                        {job.company_type}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-[#262626] mt-1">{job.title}</h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b6b6b] font-light mt-2">
                    <span className="px-2 py-0.5 bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6]">
                      Role: {job.tech_role}
                    </span>
                    <span className="px-2 py-0.5 bg-[#f7f7f7] text-[#6b6b6b] border border-[#e6e6e6]">
                      Batches: {job.target_batches.join(', ')}
                    </span>
                    {job.stipend_or_salary && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 font-bold">
                        💰 {job.stipend_or_salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#f7f7f7] p-3 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    TYPE
                  </span>
                  <span className="text-[#262626] font-bold capitalize">{job.opportunity_type}</span>
                </div>
                <div className="bg-[#f7f7f7] p-3 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    WORKPLACE
                  </span>
                  <span className="text-[#262626] font-bold capitalize">{job.location_type}</span>
                </div>
                <div className="bg-[#f7f7f7] p-3 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    LOCATION
                  </span>
                  <span className="text-[#262626] font-bold truncate block">{job.city || 'India'}</span>
                </div>
                <div className="bg-[#f7f7f7] p-3 border border-[#e6e6e6]">
                  <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-wider mb-1">
                    EXPERIENCE
                  </span>
                  <span className="text-[#262626] font-bold">
                    {job.is_fresher_eligible ? '0 Exp (Freshers OK)' : `${job.min_exp_years}+ yrs`}
                  </span>
                </div>
              </div>

              {/* Requirements Bullets */}
              {job.requirements_bullets && job.requirements_bullets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                    KEY REQUIREMENTS &amp; SKILLS
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#3c3c3c] font-light">
                    {job.requirements_bullets.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1c69d4] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#262626]">
                  FULL ROLE DESCRIPTION
                </h3>
                <div
                  className="bg-[#fafafa] p-4 border border-[#e6e6e6] text-xs sm:text-sm text-[#3c3c3c] font-light leading-relaxed max-h-56 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.full_description_html ||
                      `<p>${job.title} at ${job.company_name}. Apply through the official link below.</p>`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer CTA (BMW Blue Button, Rectangular 0px Radius) */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#e6e6e6] bg-[#f7f7f7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6b6b6b] font-light flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1c69d4]" />
            <span>Direct redirect to official career portal</span>
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
