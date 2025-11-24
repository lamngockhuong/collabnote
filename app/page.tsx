import Link from 'next/link'
import { FileText, Zap, Shield, Users, Database, Cloud } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Home',
  description: 'CollabNote - The ultimate collaborative note-taking app with realtime editing, AI-powered summaries, and semantic search. Built with Next.js and Supabase.',
  openGraph: {
    title: 'CollabNote - Realtime Collaborative Note Taking',
    description: 'Collaborate on notes in realtime with AI-powered features. Free to start.',
    type: 'website',
  },
}


export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CollabNote',
    applicationCategory: 'ProductivityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A powerful realtime collaborative note-taking application with AI-powered features',
    operatingSystem: 'Web',
    featureList: [
      'Realtime collaboration',
      'AI-powered summaries',
      'Semantic search',
      'Image upload',
      'Public/Private notes',
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              CollabNote
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate collaborative note-taking app powered by{' '}
              <span className="font-semibold text-indigo-600">Supabase</span>
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition border border-gray-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Powered by Supabase Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Realtime Collaboration
            </h3>
            <p className="text-gray-600">
              See changes instantly as your team edits. Powered by Supabase Realtime and Presence.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Row Level Security
            </h3>
            <p className="text-gray-600">
              Your notes are protected with PostgreSQL RLS. Only you and collaborators can access them.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Social Authentication
            </h3>
            <p className="text-gray-600">
              Sign in with GitHub, Google, or email. Powered by Supabase Auth.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              File Storage
            </h3>
            <p className="text-gray-600">
              Upload images directly to your notes. Stored securely in Supabase Storage.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Vector Search
            </h3>
            <p className="text-gray-600">
              Find notes by meaning, not just keywords. Powered by pgvector AI embeddings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Edge Functions
            </h3>
            <p className="text-gray-600">
              AI-powered summarization and more. Serverless functions at the edge.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to experience the future of note-taking?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of users collaborating in real-time
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition shadow-lg"
          >
            Start Taking Notes Now
          </Link>
        </div>
      </div>
    </div>
  )
}
