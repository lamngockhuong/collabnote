# CI/CD Setup Guide 🔄

CollabNote uses GitHub Actions for Continuous Integration and Deployment.

## 🛠️ Workflows

### 1. CI Check (`ci.yml`)
- **Triggers**: Push to `main`, Pull Requests.
- **Actions**:
  - Installs dependencies.
  - Runs Linting (`pnpm lint`).
  - Runs Type Checking (`tsc`).
  - Runs Build Check (`pnpm build`).

### 2. Database Tests (`test-db.yml`)
- **Triggers**: Changes in `supabase/**`.
- **Actions**:
  - Sets up Supabase CLI.
  - Starts a local Supabase instance.
  - Runs pgTAP tests (`supabase test db`).

### 3. Deploy Database (`deploy-db.yml`)
- **Triggers**: Push to `main` (only if `supabase/migrations/**` changes) or Manual Dispatch.
- **Actions**:
  - Pushes migrations to Supabase Production (`supabase db push`).
  - Deploys Edge Functions.

## 🔑 Setup Secrets

To make the **Deploy Database** workflow work, you need to add the following secrets to your GitHub Repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Add these secrets:

| Secret Name | Description | How to get it |
| :--- | :--- | :--- |
| `SUPABASE_ACCESS_TOKEN` | Your Supabase Personal Access Token | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) > Access Tokens |
| `SUPABASE_DB_PASSWORD` | Production Database Password | You set this when creating the project |
| `SUPABASE_PROJECT_ID` | Project Reference ID | Project Settings > General > Reference ID |

## 🚀 Vercel Deployment (Frontend)

The frontend deployment is handled automatically by Vercel's GitHub Integration.

1. Connect your GitHub repo to Vercel.
2. Vercel will automatically deploy on push to `main`.
3. Ensure you have set the Environment Variables in Vercel Project Settings (see `DEPLOYMENT.md`).
