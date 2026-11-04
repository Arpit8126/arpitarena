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
  authors: [{ name: 'DevPulse Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
