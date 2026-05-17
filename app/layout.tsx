import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/components/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TripNest AI | Personalized AI Travel Planning',
    template: '%s | TripNest AI',
  },
  description:
    'TripNest AI builds personalized travel plans around your vibe, budget, group type and destination.',
  keywords: [
    'TripNest AI',
    'AI travel planner',
    'personalized travel planning',
    'India travel planner',
    'AI itinerary generator',
    'budget trip planner',
  ],
  authors: [{ name: 'TripNest AI' }],
  creator: 'TripNest AI',
  publisher: 'TripNest AI',
  metadataBase: new URL('https://tripnestai.vercel.app'),
  openGraph: {
    title: 'TripNest AI | Personalized AI Travel Planning',
    description:
      'AI-powered travel experiences built around your vibe, budget and journey.',
    url: 'https://tripnestai.vercel.app',
    siteName: 'TripNest AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripNest AI | Personalized AI Travel Planning',
    description:
      'AI-powered personalized travel planning for modern explorers.',
  },
  icons: {
    icon: [
      {
        url: '/favicon.png?v=3',
        type: 'image/png',
      },
    ],
    shortcut: ['/favicon.png?v=3'],
    apple: [
      {
        url: '/favicon.png?v=3',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}