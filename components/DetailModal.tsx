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
  Briefcase,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface DetailModalProps {
  type: 'hackathon' | 'job' | null;
  item: Hackathon | Opportunity | null;
  onClose: () => void;
}

export function DetailModal({ type, item, onClose }: DetailModalProps) {
  const [detailedItem, setDetailedItem] = useState<any>(item);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setDetailedItem(item);
    if (!item) return;

    // Optional lazy-fetch from Supabase to grab full HTML JD or rounds if not loaded
    const fetchFullDetails = async () => {
      if (!item.id) return;
      try {
        setLoading(true);
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
        // Fallback to item
      } finally {
        setLoading(false);
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-fade-in text-zinc-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isHackathon ? 'HACKATHON SPECIFICATION' : 'JOB & INTERNSHIP ROLE BRIEF'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isHackathon && hackathon ? (
            /* =================== HACKATHON DETAILS =================== */
            <div className="space-y-6">
              {/* Banner Image */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
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
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-md bg-zinc-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                    {hackathon.platform}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h2 className="text-2xl font-extrabold text-white">{hackathon.title}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Organized by <span className="text-emerald-400 font-semibold">{hackathon.organizer}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                  <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">MODE / VENUE</span>
                    <span className="text-zinc-200 capitalize font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {hackathon.venue_city || 'Online'}
                    </span>
                  </div>

                  <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">REGISTRATION DEADLINE</span>
                    <span className="text-zinc-200 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(hackathon.registration_deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">THEMES</span>
                    <span className="text-zinc-200 font-medium truncate block">
                      {hackathon.themes.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300">
                  Problem Statement &amp; Overview
                </h3>
                <div
                  className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-sm text-zinc-300 leading-relaxed max-h-60 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      hackathon.problem_statement ||
                      'Build high-impact solutions leveraging cutting-edge web, mobile, and AI technologies.',
                  }}
                />
              </div>

              {/* Rounds & Stages Vertical Timeline */}
              {hackathon.rounds_description && hackathon.rounds_description.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300">
                    Rounds &amp; Submission Timeline
                  </h3>
                  <div className="space-y-3 relative pl-4 border-l-2 border-zinc-800 ml-2">
                    {hackathon.rounds_description.map((round, idx) => (
                      <div key={idx} className="relative pl-4 space-y-1">
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            Round {round.round_num}:
                          </span>
                          <span className="text-sm font-semibold text-white">{round.name}</span>
                          <span className="text-xs text-zinc-500 font-mono">({round.date})</span>
                        </div>
                        <p className="text-xs text-zinc-400">{round.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prizes Summary */}
              {hackathon.prizes_summary && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-zinc-300 space-y-1">
                  <span className="font-mono uppercase font-bold text-emerald-400 block">
                    🏆 Awards &amp; Opportunities
                  </span>
                  <p>{hackathon.prizes_summary}</p>
                </div>
              )}
            </div>
          ) : job ? (
            /* =================== JOB & INTERNSHIP DETAILS =================== */
            <div className="space-y-6">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
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
                    <Building className="w-8 h-8 text-zinc-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wide">
                      {job.company_name}
                    </span>
                    {job.company_type && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase border border-zinc-700">
                        {job.company_type}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mt-1">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Role: {job.tech_role}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Batches: {job.target_batches.join(', ')}
                    </span>
                    {job.stipend_or_salary && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                        {job.stipend_or_salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Role Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">TYPE</span>
                  <span className="text-zinc-200 capitalize font-medium">
                    {job.opportunity_type}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">WORKPLACE</span>
                  <span className="text-zinc-200 capitalize font-medium">
                    {job.location_type}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">LOCATION</span>
                  <span className="text-zinc-200 font-medium truncate block">
                    {job.city || 'India'}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">EXPERIENCE</span>
                  <span className="text-zinc-200 font-medium">
                    {job.is_fresher_eligible ? '0 Exp (Freshers OK)' : `${job.min_exp_years}+ yrs`}
                  </span>
                </div>
              </div>

              {/* Requirements Bullets */}
              {job.requirements_bullets && job.requirements_bullets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300">
                    Key Requirements &amp; Skills
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                    {job.requirements_bullets.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-300">
                  Full Role Specification
                </h3>
                <div
                  className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-64 overflow-y-auto prose prose-invert"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.full_description_html ||
                      `<p>${job.title} at ${job.company_name}. Apply directly through the official link below.</p>`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Sticky Outbound Apply Bar */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero redirects • Direct to official application portal</span>
          </div>

          <a
            href={isHackathon ? hackathon?.apply_url : job?.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95"
          >
            <span>{isHackathon ? 'Go to Registration Page ↗' : 'Apply on Official Site ↗'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

