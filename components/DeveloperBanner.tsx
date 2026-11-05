'use client';

import React from 'react';
import { Instagram } from 'lucide-react';

export function DeveloperBanner() {
  return (
    <div className="w-full bg-slate-50 text-slate-800 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Profile & Developer Info */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            {/* Arpit Pandey's Uploaded Profile Picture */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-[#0073e6] shadow-2xs bg-white">
              <img
                src="/arpit-pandey.jpg"
                alt="Arpit Pandey"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Developed by Arpit Pandey
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0073e6] border border-blue-200">
                  Creator
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Instagram:{' '}
                <a
                  href="https://www.instagram.com/arpitcodecraft/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0073e6] hover:underline font-semibold transition-colors"
                >
                  @arpitcodecraft
                </a>
              </p>
            </div>
          </div>

          {/* Action Button: Modern Pill Button */}
          <div className="shrink-0">
            <a
              href="https://www.instagram.com/arpitcodecraft/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-semibold tracking-wide uppercase transition-all rounded-full shadow-xs hover:shadow active:scale-98"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>VISIT INSTAGRAM ›</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
