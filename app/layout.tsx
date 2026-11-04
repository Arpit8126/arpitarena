import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevPulse | Unified Hackathons & Tech Jobs Aggregator for Indian Students',
  description:
    'Discover active hackathons with GPS proximity tracking and verified engineering internships & tech jobs across Indian startups and unicorns. 100% free, direct links, zero logins.',
  keywords: [
    'hackathons India',
    'tech internships India',
    'fresher jobs SDE',
    'Devfolio hackathons',
    'Unstop hackathons',
    'engineering campus jobs',
    'DevPulse',
  ],
  authors: [{ name: 'Arpit Pandey' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Unregister any rogue Service Worker from previous projects running on localhost */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var j = 0; j < names.length; j++) {
                      caches.delete(names[j]);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="bg-white text-[#262626] antialiased min-h-screen selection:bg-[#1c69d4]/20 selection:text-[#1c69d4]">
        {children}
      </body>
    </html>
  );
}
