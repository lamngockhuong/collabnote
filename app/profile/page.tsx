'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Database } from 'lucide-react'

interface ProfileNode {
  username: string
  avatar_url: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileNode | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch profile using GraphQL
        // Note: In a real app, you might use a proper GraphQL client like Apollo or urql
        try {
          await supabase.functions.invoke('graphql-proxy', {
             body: {
                query: `
                  query {
                    profilesCollection(filter: {id: {eq: "${user.id}"}}) {
                      edges {
                        node {
                          username
                          avatar_url
                        }
                      }
                    }
                  }
                `
             }
          })

          // Direct GraphQL fetch if pg_graphql is exposed
          // Usually exposed at /graphql/v1
          const session = await supabase.auth.getSession()
          const token = session.data.session?.access_token

          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            },
            body: JSON.stringify({
              query: `
                query {
                  profilesCollection(filter: {id: {eq: "${user.id}"}}) {
                    edges {
                      node {
                        username
                        avatar_url
                      }
                    }
                  }
                }
              `
            })
          })

          const result = await response.json()
          if (result.data?.profilesCollection?.edges?.[0]?.node) {
            setProfileData(result.data.profilesCollection.edges[0].node as ProfileNode)
          }
        } catch (e) {
          console.error('GraphQL fetch error:', e)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Profile</h1>
                <p className="text-indigo-100 text-sm">Fetched via GraphQL (pg_graphql)</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="text-lg text-gray-900 font-medium">{user?.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <div className="text-lg text-gray-900 font-medium">
                  {profileData?.username || 'Not set'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Avatar URL</label>
                <div className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {profileData?.avatar_url || 'No avatar'}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm">
                  <strong>Technical Note:</strong> This data was fetched directly from the PostgreSQL database using the <code>pg_graphql</code> extension, bypassing the standard Supabase JS client methods.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
