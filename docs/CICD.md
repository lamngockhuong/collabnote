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

### 4. Deploy to Vercel (`deploy-vercel.yml`)
- **Triggers**: Push to `main`.
- **Actions**:
  - Installs Vercel CLI.
  - Pulls environment info.
  - Builds project artifacts.
  - Deploys to Vercel Production.

## 🔑 Setup Secrets

To make the **Deploy Database** and **Deploy to Vercel** workflows work, you need to add the following secrets to your GitHub Repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Add these secrets:

### Supabase Secrets
| Secret Name | Description | How to get it |
| :--- | :--- | :--- |
| `SUPABASE_ACCESS_TOKEN` | Your Supabase Personal Access Token | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) > Access Tokens |
| `SUPABASE_DB_PASSWORD` | Production Database Password | You set this when creating the project |
| `SUPABASE_PROJECT_ID` | Project Reference ID | Project Settings > General > Reference ID |

### Vercel Secrets
| Secret Name | Description | How to get it |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Vercel Account Token | [Vercel Account Settings](https://vercel.com/account/tokens) > Tokens |
| `VERCEL_ORG_ID` | Vercel Organization ID | Found in `.vercel/project.json` after running `vercel link` locally, or in Vercel Project Settings |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Found in `.vercel/project.json` after running `vercel link` locally, or in Vercel Project Settings |

## 🚀 Vercel Deployment (Frontend)

You can choose between two methods:

1.  **Automatic Integration (Recommended)**: Connect your GitHub repo to Vercel directly via the Vercel Dashboard. This is the easiest way and doesn't require the `deploy-vercel.yml` workflow.
2.  **GitHub Actions (Custom)**: Use the provided `deploy-vercel.yml` workflow for more control. Requires setting the secrets above.
