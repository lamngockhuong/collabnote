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

### 9. **Database Webhooks** 🪝
- ✅ Trigger external services on DB changes
- ✅ HTTP callbacks
- ✅ Payload security

**Files**: `supabase/migrations/20251119081238_setup_webhook_trigger.sql`

### 10. **GraphQL (pg_graphql)** 🕸️
- ✅ Query database via GraphQL
- ✅ Auto-generated schema
- ✅ Integrated with RLS

**Files**: `docs/features_and_verification.md` (usage examples)

### 11. **Automated Tests** 🧪
- ✅ Integration Tests (RLS verification)
- ✅ Unit Tests (pgTAP database tests)
- ✅ CI/CD ready

**Files**: `scripts/test-rls.ts`, `supabase/tests/database/`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))
- Supabase CLI (optional, for local dev)

### 1. Clone and Install

```bash
git clone https://github.com/lamngockhuong/collabnote.git
cd collabnote
pnpm install
```

### 2. Setup Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Setup Database

You can either use the Supabase CLI (recommended) or the Dashboard.

**Option A: Supabase CLI (Local Dev)**
```bash
supabase start
supabase db reset
```

**Option B: Supabase Dashboard (Cloud)**
Go to SQL Editor and run the migrations from `supabase/migrations/` in order.

### 4. Run the App

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
│   ├── supabase/                # Supabase clients
│   ├── use-confirm.tsx          # Custom confirm hook
│   └── utils.ts                 # Utilities
├── supabase/
│   ├── migrations/              # Database migrations
│   ├── functions/               # Edge Functions
│   └── tests/                   # pgTAP tests
├── scripts/                     # Utility scripts
└── docs/                        # Documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest features.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by Lam Ngoc Khuong**
