# Implementation Plan - CollabNote

# Goal Description
Build **CollabNote**, a realtime collaborative note-taking application using **Next.js (App Router)** and **Supabase**. The primary goal is to demonstrate and learn every core feature of Supabase in a real-world scenario.

## User Review Required
> [!IMPORTANT]
> This plan assumes we are using the hosted Supabase platform (or a local equivalent) and Next.js 16+.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, Lucide React.
- **Backend/BaaS**: Supabase (Postgres, Auth, Realtime, Storage, Edge Functions).
- **State Management**: Zustand (for local UI state) + Supabase Realtime.

## Proposed Architecture & Features

### 1. Database Schema & RLS (The Foundation)
We will design a schema that requires robust security policies.

#### Tables
- `profiles`: Extends default auth users.
    - `id` (uuid, PK, FK to auth.users)
    - `username` (text)
    - `avatar_url` (text)
- `notes`: The main content.
    - `id` (uuid, PK)
    - `title` (text)
    - `content` (jsonb/text - rich text format)
    - `owner_id` (uuid, FK to profiles)
    - `is_public` (boolean)
- `collaborators`: Many-to-many relationship for sharing.
    - `note_id` (FK)
    - `user_id` (FK)
    - `role` (view/edit)

#### RLS Policies (Security)
- **Notes**:
    - `SELECT`: Allow if `owner_id == auth.uid()` OR `is_public` is true OR user is in `collaborators`.
    - `UPDATE`: Allow if `owner_id == auth.uid()` OR (`user` in `collaborators` AND `role == 'edit'`).

### 2. Authentication (Supabase Auth)
- **Features**:
    - Email/Password Sign up & Login.
    - GitHub OAuth (Social Login).
    - **Middleware**: Protect `/dashboard` routes using Next.js Middleware + Supabase Auth Helpers.
    - **Server-Side Redirects**: Authenticated users are automatically redirected to `/dashboard` from landing/auth pages using Server Components.

### 3. Realtime Collaboration (Supabase Realtime)
This is the "Wow" factor.
- **Presence**: Show "User X is typing..." and display live cursors of other users.
- **Postgres Changes**: Subscribe to the `notes` table. When User A saves/updates, User B sees the change immediately without refreshing.

### 4. Storage (Supabase Storage)
- **Bucket**: `note-images` (Public).
- **Feature**: Users can drag & drop images into the note editor.
- **Policy**: Only authenticated users can upload. Anyone can view (if note is public).

### 5. Edge Functions (Serverless)
- **Function**: `summarize-note`.
- **Logic**: Receives note content -> Calls OpenAI API (or mock) -> Returns summary.
- **Trigger**: User clicks "Summarize with AI" button in the UI.

### 6. UI/UX Enhancements
- **Footer**: Global footer with social links and legal pages.
- **Legal Pages**: Privacy Policy and Terms of Service (`/privacy`, `/terms`).
- **Loading States**: Skeleton UI (`loading.tsx`) for improved perceived performance.
- **Markdown Editor**: Rich text editing with formatting toolbar and preview mode.

## Implementation Phases

### Phase 1: Setup & Auth
- [x] Initialize Next.js app with Tailwind.
- [x] Setup Supabase project and environment variables.
- [x] Create `profiles` table and trigger to auto-create profile on signup.
- [x] Implement Login/Signup UI.

### Phase 2: Database & CRUD
- [x] Create `notes` table with RLS policies.
- [x] Build Dashboard to list user's notes.
- [x] Implement Create/Delete note functionality.

### Phase 3: Realtime Editor
- [x] Build the Note Editor UI (Textarea or Rich Text).
- [x] Implement **Realtime Subscription** to listen for updates to the current note.
- [x] Implement **Presence** to show online users.

### Phase 4: Advanced Features (The "Pro" Supabase Features)
- [x] **AI/Vector Search (`pgvector`)**:
    - [x] Store embeddings of note content.
    - [x] Implement "Search by meaning" (Semantic Search) to find related notes even if keywords don't match.
- [x] **Scheduled Tasks (`pg_cron`)**:
    - [x] Create a cron job in Postgres to automatically "archive" notes that haven't been touched in 30 days.
- [x] **Database Webhooks**:
    - Trigger an external notification (e.g., Discord/Slack webhook) whenever a new public note is created.
- [x] **GraphQL (`pg_graphql`)**:
    - Implement one component (e.g., User Profile view) using GraphQL queries instead of the JS client, just to demonstrate support.
- [x] **Storage & Edge Functions**:
    - [x] Implement Image Upload.
    - [x] Deploy `summarize-note` Edge Function.

### Phase 5: UI/UX Improvements
- [x] **Mobile Responsiveness**:
    - [x] Responsive dropdown menus for note editor toolbar
    - [x] Responsive dashboard header menu
    - [x] Mobile-optimized layouts and touch-friendly interfaces
- [x] **Pagination & Performance**:
    - [x] Infinite scroll for dashboard with Intersection Observer
    - [x] Efficient pagination using refs to prevent stale closures
    - [x] Note count display (total and filtered)
- [x] **User Experience**:
    - [x] Deferred note creation (only save when content changes)
    - [x] Text overflow handling with word wrapping
    - [x] Loading states and skeleton UI
    - [x] Click-outside-to-close for dropdown menus

## Verification Plan

### Automated Tests
### Automated Tests
- **Unit Tests (pgTAP)**: Use `pgTAP` to test RLS policies directly in the database (Supabase Best Practice).
- **Integration Tests**: Script `scripts/test-rls.ts` for end-to-end verification.

### Manual Verification
1.  **Auth**: Login with GitHub, check `profiles` table for new entry.
2.  **Security**: Try to fetch a note ID belonging to another user via curl/Postman (should fail).
3.  **Realtime**: Open app in two different browsers (Incognito). Type in one, verify text appears in the other instantly.
4.  **Storage**: Upload an image, verify it appears in the Supabase Storage bucket dashboard.
