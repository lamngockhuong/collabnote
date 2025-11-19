export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string | null
          owner_id: string
          is_public: boolean
          created_at: string
          updated_at: string
          embedding: number[] | null
        }
        Insert: {
          id?: string
          title?: string
          content?: string | null
          owner_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          embedding?: number[] | null
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          owner_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          embedding?: number[] | null
        }
      }
      collaborators: {
        Row: {
          id: string
          note_id: string
          user_id: string
          role: 'view' | 'edit'
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          role?: 'view' | 'edit'
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          role?: 'view' | 'edit'
          created_at?: string
        }
      }
    }
    Functions: {
      match_notes: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          title: string
          content: string | null
          similarity: number
        }[]
      }
    }
  }
}
