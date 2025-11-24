'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import {
  ArrowLeft,
  Save,
  Trash2,
  Users,
  Upload,
  Sparkles,
  Globe,
  Lock,
  Database,
  Eye,
  Edit3
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useConfirm } from '@/lib/use-confirm'

interface Note {
  id: string
  title: string
  content: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

interface Props {
  note: Note
  user: User
}

interface PresenceState {
  user_id: string
  email: string
  online_at: string
}

export default function NoteEditor({ note: initialNote, user }: Props) {
  const [note, setNote] = useState(initialNote)
  const [title, setTitle] = useState(initialNote.title)
  const [content, setContent] = useState(initialNote.content || '')
  const [saving, setSaving] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([])
  const [uploading, setUploading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { confirm, ConfirmDialog } = useConfirm()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const titleRef = useRef(initialNote.title)

  const contentRef = useRef(initialNote.content || '')

  const isOwner = user.id === note.owner_id
  const [isPreview, setIsPreview] = useState(true)

  useEffect(() => {
    // Subscribe to note changes
    const channel = supabase
      .channel(`note:${note.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${note.id}`,
        },
        (payload) => {
          const updated = payload.new as Note
          setNote(updated)
          setTitle(updated.title)
          setContent(updated.content || '')
          titleRef.current = updated.title
          contentRef.current = updated.content || ''
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as unknown as PresenceState[]
        setOnlineUsers(users.filter((u) => u.user_id !== user.id))
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [note.id, supabase, user.id, user.email])

  const saveNote = async () => {
    if (!isOwner) return
    setSaving(true)
    await supabase
      .from('notes')
      .update({
        title: titleRef.current,
        content: contentRef.current,
      })
      .eq('id', note.id)
    setSaving(false)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    contentRef.current = newContent

    // Auto-save after 1 second of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote()
    }, 500)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    titleRef.current = newTitle

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote()
    }, 500)
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${title || 'Untitled Note'}"? This will permanently remove the note and all its content.`,
      confirmText: 'Delete',
      variant: 'danger'
    })

    if (confirmed) {
      const { error } = await supabase.from('notes').delete().eq('id', note.id)

      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete note: ${error.message}`)
      } else {
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
      }
    }
  }

  const togglePublic = async () => {
    const newPublicState = !note.is_public
    await supabase
      .from('notes')
      .update({ is_public: newPublicState })
      .eq('id', note.id)
    setNote({ ...note, is_public: newPublicState })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      setUploading(false)
      return
    }

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('note-images')
        .getPublicUrl(data.path)

      const newContent = contentRef.current + `\n\n![Image](${publicUrl})\n`
      setContent(newContent)
      contentRef.current = newContent
      saveNote()
    }

    setUploading(false)
  }

  const summarizeNote = async () => {
    setSummarizing(true)
    try {
      const { data, error } = await supabase.functions.invoke('summarize-note', {
        body: { noteId: note.id },
      })

      if (error) throw error

      const summaryText = `\n\n---\n${data.summary}\n`
      const newContent = contentRef.current + summaryText
      setContent(newContent)
      contentRef.current = newContent
      saveNote()
    } catch (error) {
      console.error('Error summarizing note:', error)
      alert('Failed to summarize note. Make sure the function is deployed/serving.')
    } finally {
      setSummarizing(false)
    }
  }

  const handleGenerateEmbedding = async () => {
    const confirmed = await confirm({
      title: 'Generate Embedding',
      message: 'Generate embedding for this note? This will enable semantic search.',
      confirmText: 'Generate',
      variant: 'info'
    })

    if (confirmed) {
      const { error } = await supabase.functions.invoke('generate-embedding', {
        body: { noteId: note.id, content: content },
      })
      if (error) alert('Failed to index note')
      else alert('Note indexed successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={isOwner ? saveNote : undefined}
                readOnly={!isOwner}
                className={`text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 ${!isOwner ? 'cursor-default focus:ring-0' : ''}`}
                placeholder="Note title..."
              />
              {!isOwner && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  View Only
                </span>
              )}
              {saving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Online Users */}
              {onlineUsers.length > 0 && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                  <Users className="w-4 h-4" />
                  <span>{onlineUsers.length} online</span>
                </div>
              )}

              <div className="h-6 w-px bg-gray-200 mx-2" />

              {/* View Toggle */}
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`p-2 rounded-lg transition ${
                  isPreview
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={isPreview ? "Switch to Edit Mode" : "Switch to Preview Mode"}
              >
                {isPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {isOwner && <div className="h-6 w-px bg-gray-200 mx-2" />}

              {/* Media */}
              {isOwner && (
                <label className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition cursor-pointer" title="Upload Image">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              {/* AI Tools Group */}
              {isOwner && (
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={summarizeNote}
                    disabled={summarizing}
                    className="p-2 text-gray-500 hover:bg-white hover:text-indigo-600 rounded-md transition disabled:opacity-50"
                    title="AI Summarize"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleGenerateEmbedding}
                    className="p-2 text-gray-500 hover:bg-white hover:text-blue-600 rounded-md transition"
                    title="Index for Search"
                  >
                    <Database className="w-5 h-5" />
                  </button>
                </div>
              )}

              {isOwner && <div className="h-6 w-px bg-gray-200 mx-2" />}

              {/* Actions */}
              {isOwner && (
                <>
                  <button
                    onClick={togglePublic}
                    className={`p-2 rounded-lg transition ${
                      note.is_public
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={note.is_public ? "Public Note" : "Private Note"}
                  >
                    {note.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={saveNote}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {isPreview ? (
            <div className="prose prose-lg max-w-none min-h-[600px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={handleContentChange}
              onBlur={isOwner ? saveNote : undefined}
              readOnly={!isOwner}
              className={`w-full min-h-[600px] text-gray-800 text-lg leading-relaxed resize-none focus:outline-none ${!isOwner ? 'cursor-default' : ''}`}
              placeholder={isOwner ? "Start writing your note..." : "This note is read-only."}
            />
          )}
        </div>

        {/* Online Users List */}
        {onlineUsers.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Currently viewing:
            </h3>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {u.email}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  )
}
