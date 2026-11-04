'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Instagram, Sparkles, CheckCircle2 } from 'lucide-react';

export function DeveloperBanner() {
  return (
    <div className="w-full bg-[#1a2129] text-white border-b border-[#262e38] relative overflow-hidden">
      {/* 4px BMW M-Tricolor accent stripe at the very top of banner */}
      <div className="m-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Profile & Developer Info */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            {/* Arpit Pandey's Uploaded Profile Picture */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border-2 border-[#1c69d4] shadow-md bg-white">
              <img
                src="/arpit-pandey.jpg"
                alt="Arpit Pandey"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#9a9a9a]">
                  ARCHITECT &amp; LEAD DEVELOPER
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-[#1c69d4]/20 text-[#1c69d4] border border-[#1c69d4]/40">
                  <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
                Developed by Arpit Pandey
              </h2>
              <p className="text-xs text-[#bbbbbb] font-light">
                Instagram: <strong className="text-white font-medium">@arpitcodecraft</strong> • Full-Stack Engineer &amp; Platform Creator
              </p>
            </div>
          </div>

          {/* Action Button: Redirect to Instagram */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.instagram.com/arpitcodecraft/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs sm:text-sm font-bold tracking-[0.5px] uppercase transition-colors rounded-none shadow-sm active:translate-y-px"
            >
              <Instagram className="w-4 h-4" />
              <span>FOLLOW @ARPITCODECRAFT ›</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
