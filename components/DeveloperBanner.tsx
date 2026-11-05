'use client';

import React from 'react';
import { Instagram } from 'lucide-react';

export function DeveloperBanner() {
  return (
    <div className="w-full bg-[#1a2129] text-white border-b border-[#262e38] relative">
      {/* 4px BMW M-Tricolor accent stripe */}
      <div className="m-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Profile & Developer Info */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            {/* Arpit Pandey's Uploaded Profile Picture */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#1c69d4] shadow-sm bg-[#262e38]">
              <img
                src="/arpit-pandey.jpg"
                alt="Arpit Pandey"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Developed by Arpit Pandey
              </h2>
              <p className="text-xs text-[#a0aab5] font-light">
                Instagram: <a href="https://www.instagram.com/arpitcodecraft/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#1c69d4] font-medium transition-colors">@arpitcodecraft</a>
              </p>
            </div>
          </div>

          {/* Action Button: Redirect to Instagram */}
          <div className="shrink-0">
            <a
              href="https://www.instagram.com/arpitcodecraft/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1c69d4] hover:bg-[#0653b6] text-white text-xs font-bold tracking-[0.5px] uppercase transition-colors rounded-none shadow-sm active:translate-y-px"
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
