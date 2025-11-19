# 🚀 Deployment Guide: Supabase + Vercel

This guide will walk you through deploying **CollabNote** to production using **Supabase** (Backend) and **Vercel** (Frontend).

## 📋 Prerequisites

1.  **GitHub Account**: Your code must be pushed to GitHub (you've already done this!).
2.  **Supabase Account**: [Sign up here](https://supabase.com).
3.  **Vercel Account**: [Sign up here](https://vercel.com).
4.  **Supabase CLI**: Installed locally.
    ```bash
    npm install -g supabase
    ```

---

## ☁️ Part 1: Supabase Setup (Backend)

### 1. Create a Project
1.  Go to [database.new](https://database.new) and create a new project.
2.  Give it a name (e.g., `collabnote-prod`).
3.  Set a strong database password (save this!).
4.  Choose a region close to your users (e.g., Singapore `ap-southeast-1`).

### 2. Link CLI to Remote Project
In your terminal, run:

```bash
# Login to Supabase CLI
supabase login

# Link your project (get Reference ID from Project Settings > General)
# The ID looks like: abcdefghijklmnopqrst
supabase link --project-ref <your-project-id>
```

You will be asked for your database password.

### 3. Push Database Schema
This will apply all your local migrations to the production database.

```bash
supabase db push
```

### 4. Deploy Edge Functions
Deploy the AI summarization function.

```bash
supabase functions deploy summarize-note --no-verify-jwt
```

> **Note**: We use `--no-verify-jwt` because our function handles CORS and Auth verification internally or is called from the client which passes the JWT. If you encounter 401 errors, check the function's auth logic.

### 5. Set Edge Function Secrets (If using OpenAI)
If you are using OpenAI in your Edge Function, set the API key:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

### 6. Configure Storage
1.  Go to **Storage** in the Supabase Dashboard.
2.  Create a new bucket named `note-images`.
3.  Toggle **"Public bucket"** to ON.
4.  (Optional) The RLS policies for storage should have been applied via `supabase db push` if they were in migrations. If not, you may need to add them manually in the Storage Policy editor.

### 7. Enable Realtime
1.  Go to **Database** > **Replication**.
2.  Click the toggle to **Enable** replication for the `notes` table.

### 8. Configure Auth (OAuth)
1.  Go to **Authentication** > **Providers**.
2.  Enable **Google** and/or **GitHub**.
3.  **IMPORTANT**: You need to add the Vercel production URL to the **Redirect URLs**. We will get this URL in Part 2.
    *   For now, add: `http://localhost:3000/auth/callback` (for local testing with prod DB).

---

## ▲ Part 2: Vercel Setup (Frontend)

### 1. Import Project
1.  Go to [vercel.com/new](https://vercel.com/new).
2.  Select your `collabnote` repository.
3.  Click **Import**.

### 2. Configure Project
1.  **Framework Preset**: Next.js (should be auto-detected).
2.  **Root Directory**: `./` (default).
3.  **Environment Variables**:
    Expand the section and add the following (get these from Supabase Project Settings > API):

    | Name | Value |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project-id>.supabase.co` |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |
    | `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-project.vercel.app` (You'll know this after deploy, or set a custom domain) |

    > **Tip**: For `NEXT_PUBLIC_SITE_URL`, you can initially set it to `http://localhost:3000` or leave it blank, then update it and redeploy once Vercel assigns a domain.

### 3. Deploy
Click **Deploy**. Vercel will build your app.

### 4. Final Configuration
Once deployed, Vercel will give you a domain (e.g., `collabnote-xyz.vercel.app`).

1.  **Update Supabase Auth**:
    *   Go back to Supabase Dashboard > Authentication > URL Configuration.
    *   Add your Vercel URL to **Site URL**.
    *   Add `https://collabnote-xyz.vercel.app/auth/callback` to **Redirect URLs**.

2.  **Update Vercel Env**:
    *   Go to Vercel Project Settings > Environment Variables.
    *   Update `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL.
    *   Redeploy (Deployment > Redeploy) to apply changes.

---

## 🎉 Done!

Your app is now live!

- **Frontend**: `https://collabnote-xyz.vercel.app`
- **Backend**: Supabase Cloud

### Verification Checklist
- [ ] Sign up works (creates user in Supabase Auth & `profiles` table).
- [ ] Creating a note works.
- [ ] Realtime updates work (try two windows).
- [ ] Image upload works (check Storage bucket).
- [ ] AI Summary works (check Edge Function logs).
