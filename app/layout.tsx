import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'CollabNote - Realtime Collaborative Note Taking',
    template: '%s | CollabNote'
  },
  description: 'A powerful realtime collaborative note-taking application built with Next.js and Supabase. Features include AI-powered summaries, semantic search, and instant collaboration.',
  keywords: ['collaborative notes', 'realtime editing', 'note taking', 'supabase', 'nextjs', 'AI summary', 'vector search'],
  authors: [{ name: 'CollabNote Team' }],
  creator: 'CollabNote',
  publisher: 'CollabNote',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'CollabNote - Realtime Collaborative Note Taking',
    description: 'Collaborate on notes in realtime with AI-powered features',
    url: '/',
    siteName: 'CollabNote',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollabNote - Realtime Collaborative Note Taking',
    description: 'Collaborate on notes in realtime with AI-powered features',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
