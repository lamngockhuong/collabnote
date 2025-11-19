# CollabNote - Realtime Collaborative Note Taking 📝

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Full--Stack-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A powerful realtime collaborative note-taking app showcasing the complete Supabase ecosystem**

[Live Demo](#) • [Documentation](./docs/) • [Report Bug](https://github.com/lamngockhuong/collabnote/issues) • [Request Feature](https://github.com/lamngockhuong/collabnote/issues)

</div>

---

## 🎯 About The Project

CollabNote is a **production-ready** collaborative note-taking application that demonstrates **every major feature** of Supabase integrated with Next.js. Built as a comprehensive learning resource and reference implementation for developers.

### ✨ Key Highlights

- 🔄 **Realtime Collaboration** - See changes instantly as others edit
- 🤖 **AI-Powered** - Automatic summaries and semantic search
- 🔒 **Secure** - Row Level Security with automated tests
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 📱 **PWA Ready** - Installable as a progressive web app
- 🚀 **SEO Optimized** - Full metadata, sitemap, and structured data

## 🎯 Purpose

This project is a **learning reference** to demonstrate every core Supabase feature in a real-world application. Perfect for developers who want to understand how to build production-ready apps with Supabase.

## ✨ Supabase Features Demonstrated

### 1. **Authentication** 🔐
- ✅ Email/Password authentication
- ✅ OAuth (GitHub, Google)
- ✅ Session management with middleware
- ✅ Protected routes
- ✅ Auto-profile creation on signup

**Files**: `app/login/`, `app/signup/`, `middleware.ts`

### 2. **Database (PostgreSQL)** 🗄️
- ✅ Relational schema design
- ✅ Foreign keys and relationships
- ✅ Triggers for auto-updates
- ✅ JSONB for flexible content storage

**Files**: `supabase/schema.sql`

### 3. **Row Level Security (RLS)** 🛡️
- ✅ User-specific data access
- ✅ Shared note permissions
- ✅ Public/private note visibility
- ✅ Collaborator-based access control

**Files**: `supabase/schema.sql` (policies section)

### 4. **Realtime** ⚡
- ✅ Live note updates (Postgres Changes)
- ✅ Presence (see who's online)
- ✅ Broadcast (future: cursor positions)
- ✅ Channel subscriptions

**Files**: `app/dashboard/dashboard-client.tsx`, `app/note/[id]/note-editor.tsx`

### 5. **Storage** 📁
- ✅ Image uploads
- ✅ Public bucket configuration
- ✅ RLS policies for storage
- ✅ File serving via CDN

**Files**: `app/note/[id]/note-editor.tsx` (image upload), `supabase/README.md` (storage policies)

### 6. **Edge Functions** 🚀
- ✅ Serverless Deno runtime
- ✅ AI summarization endpoint
- ✅ Secure API with auth headers

**Files**: `supabase/functions/summarize-note/index.ts`

### 7. **Vector Search (pgvector)** 🤖
- ✅ Semantic search setup
- ✅ Embedding storage
- ✅ Similarity queries

**Files**: `supabase/vector-search.sql`

### 8. **Scheduled Tasks (pg_cron)** ⏰
- ✅ Automated note archiving
- ✅ Database-level cron jobs

**Files**: `supabase/cron-jobs.sql`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <your-repo>
cd collabnote
pnpm install
```

### 2. Setup Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these files in order:

1. `supabase/schema.sql` - Core tables and RLS
2. `supabase/vector-search.sql` - Vector search (optional)
3. `supabase/cron-jobs.sql` - Scheduled tasks (optional)

### 4. Enable Realtime

Dashboard → Database → Replication → Enable for `notes` table

### 5. Setup Storage

Dashboard → Storage → Create bucket `note-images` (Public)

Then run the storage policies from `supabase/README.md`

### 6. Configure OAuth (Optional)

Dashboard → Authentication → Providers → Enable GitHub/Google

Add redirect URL: `http://localhost:3000/auth/callback`

### 7. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── dashboard/               # Notes dashboard
│   ├── note/[id]/               # Note editor
│   └── auth/callback/           # OAuth callback
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   └── utils.ts                 # Utilities
├── supabase/
│   ├── schema.sql               # Database schema
│   ├── vector-search.sql        # Vector search setup
│   ├── cron-jobs.sql            # Scheduled tasks
│   └── functions/               # Edge Functions
└── middleware.ts                # Next.js middleware
```

## 🎓 Learning Path

Follow this order to understand the codebase:

1. **Auth Flow**: `app/login/` → `middleware.ts` → `lib/supabase/`
2. **Database**: `supabase/schema.sql` (understand RLS policies)
3. **Realtime**: `app/dashboard/dashboard-client.tsx` (subscriptions)
4. **Storage**: `app/note/[id]/note-editor.tsx` (image upload)
5. **Edge Functions**: `supabase/functions/summarize-note/`

## 🔥 Key Features to Try

1. **Realtime Collaboration**: Open the same note in two browsers
2. **Presence**: See who's online in a note
3. **Image Upload**: Drag and drop images
4. **Public Notes**: Toggle note visibility
5. **Auto-save**: Type and watch it save automatically

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Icons**: Lucide React
- **State**: Zustand (minimal usage, mostly Supabase Realtime)

## 📚 Documentation

For more detailed information about the project architecture, features, and verification steps, please refer to the `docs/` directory:

- [**Architecture & Implementation Plan**](docs/architecture.md): Detailed breakdown of the project structure, database schema, and implementation phases.
- [**Features & Verification**](docs/features_and_verification.md): Comprehensive list of implemented features and verification results (including screenshots).
- [**Setup Guide**](SETUP.md): Step-by-step instructions to get the project running locally.

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## 📝 License

MIT

---

**Built with ❤️ to learn Supabase**
