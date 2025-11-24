'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { PlusCircle, FileText, LogOut, Search, User as UserIcon, MoreVertical, Loader2 } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: unknown
  created_at: string
  updated_at: string
  is_public: boolean
  similarity?: number
}

interface Props {
  initialNotes: Note[]
  user: User
  totalNotes: number
}

export default function DashboardClient({ initialNotes, user, totalNotes }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [payload.new as Note, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) =>
              prev.map((note) =>
                note.id === payload.new.id ? (payload.new as Note) : note
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((note) => note.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const createNote = async () => {
    router.push('/note/new')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Note[]>([])

  const handleSemanticSearch = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    try {
      const { data, error } = await supabase.functions.invoke('search-notes', {
        body: { query: searchQuery },
      })
      if (error) throw error
      setSearchResults(data.notes)
    } catch (error) {
      console.error('Search error:', error)
      alert('Semantic search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const displayNotes = searchResults.length > 0 ? searchResults : filteredNotes

  const [page, setPage] = useState(1)
  const pageRef = useRef(1)
  const [hasMore, setHasMore] = useState(initialNotes.length === 9)
  const hasMoreRef = useRef(initialNotes.length === 9)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadingRef = useRef(false)
  const loader = useRef(null)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) {
      return
    }

    loadingRef.current = true
    setLoadingMore(true)

    const currentPage = pageRef.current
    const from = currentPage * 9
    const to = from + 8

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(from, to)
      .eq('owner_id', user.id)

    if (error) {
      console.error('Error loading more notes:', error)
    } else if (data) {
      setNotes((prev) => {
        const existingIds = new Set(prev.map((n) => n.id))
        const newNotes = data.filter((n) => !existingIds.has(n.id))
        return [...prev, ...newNotes]
      })
      pageRef.current = currentPage + 1
      setPage(currentPage + 1)
      if (data.length < 9) {
        hasMoreRef.current = false
        setHasMore(false)
      }
    }
    loadingRef.current = false
    setLoadingMore(false)
  }, [supabase, user.id])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loader.current) {
      observer.observe(loader.current)
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current)
      }
    }
  }, [loadMore])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CollabNote
            </h1>
              <div className="flex items-center gap-4">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                      <p className="text-sm text-gray-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        router.push('/profile')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        handleLogout()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === '') setSearchResults([])
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSemanticSearch}
              disabled={isSearching || !searchQuery}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition disabled:opacity-50 whitespace-nowrap"
            >
              {isSearching ? 'Searching...' : 'AI Search'}
            </button>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition"
          >
            <PlusCircle className="w-5 h-5" />
            New Note
          </button>
        </div>

        {/* Note Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {searchQuery ? (
              searchResults.length > 0 ? (
                <span>Found <span className="font-semibold text-indigo-600">{searchResults.length}</span> {searchResults.length === 1 ? 'note' : 'notes'}</span>
              ) : (
                <span>Showing <span className="font-semibold text-indigo-600">{filteredNotes.length}</span> of <span className="font-semibold">{totalNotes}</span> {totalNotes === 1 ? 'note' : 'notes'}</span>
              )
            ) : (
              <span>Total: <span className="font-semibold text-indigo-600">{totalNotes}</span> {totalNotes === 1 ? 'note' : 'notes'}</span>
            )}
          </p>
        </div>

        {/* Notes Grid */}
        {displayNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={createNote}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition"
              >
                <PlusCircle className="w-5 h-5" />
                Create Note
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/note/${note.id}`)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-indigo-200 group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                     {note.similarity ? `Similarity: ${(note.similarity * 100).toFixed(1)}%` : `Updated ${new Date(note.updated_at || Date.now()).toLocaleDateString()}`}
                  </p>
                  {note.is_public && (
                    <span className="inline-block mt-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Public
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            {!searchQuery && hasMore && (
              <div ref={loader} className="mt-8 flex justify-center py-4">
                {loadingMore && (
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
