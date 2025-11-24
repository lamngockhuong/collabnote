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
- **Triggers**: Manual Dispatch only (`workflow_dispatch`).
- **Actions**:
  - Installs Vercel CLI.
  - Pulls environment info.
  - Builds project artifacts.
  - Deploys to Vercel Production.
- **Note**: Vercel automatically deploys on push to `main` via GitHub integration. This workflow is for manual deployments when needed.

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

## ⚙️ Vercel Configuration

The project uses `vercel.json` to manage deployment configuration in version control. This ensures consistent settings across all environments.

### Configuration Files

- **`vercel.json`**: Main configuration file containing:
  - Build commands and framework settings
  - Security headers (X-Frame-Options, CSP, etc.)
  - Region settings (optimized for Singapore - `sin1`)
  - Environment variable references
  - Rewrites and redirects

- **`.vercelignore`**: Specifies files to exclude from deployment (similar to `.gitignore`)

### Environment Variables

> [!IMPORTANT]
> Environment variables **CANNOT** be stored in `vercel.json` or any config files (this feature is deprecated). You **MUST** set them in the Vercel Dashboard.

**Why?**
- 🔒 **Security**: Sensitive data (API keys, secrets) should never be committed to Git
- ✅ **Best Practice**: Vercel recommends managing env vars through their dashboard
- 🔄 **Flexibility**: Easy to change without code commits

**How to set environment variables:**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (e.g., `collabnote`)

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add variables** (one by one):

   | Variable Name | Value | Where to get it |
   |--------------|-------|-----------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Project Settings → API → `anon` `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Project Settings → API → `service_role` `secret` key |

4. **Select Environments** for each variable:
   - ✅ **Production** - For main branch deployments
   - ✅ **Preview** - For pull request deployments
   - ✅ **Development** - For local development (optional)

5. **Click "Save"**

**Notes:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` should **ONLY** be added to **Production** (never Preview/Development)
- After adding variables, redeploy your project for changes to take effect

### Per-Environment Configuration

You can create environment-specific configuration files:

- `vercel.production.json` - Production only
- `vercel.preview.json` - Preview deployments only
- `vercel.development.json` - Development only

These files will override settings from the base `vercel.json` for their respective environments.
