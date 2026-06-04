# Deployment Notes

## Current Deployment Status

CreatorVault is deployed to Vercel and connected to the hosted Supabase production backend.

- GitHub repository: `https://github.com/mahakaal2005/creatorvault`
- Production URL: `https://creatorvault-eight.vercel.app`
- Production behavior verified: signed-out `/dashboard` redirects to `/login?next=%2Fdashboard`.

## Supabase Production Backend

- Project name: `CreatorVault`
- Project ref: `lcfczbtdibwtzgirorls`
- Region: `ap-south-1`
- Status: `ACTIVE_HEALTHY`
- Applied migrations:
  - `initial_schema`
  - `harden_rls_and_functions`
  - `youtube_sync_import_tracking`
  - `youtube_sync_advisor_cleanup`

## Required Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables for Production, Preview, and Development as needed:

```text
NEXT_PUBLIC_SUPABASE_URL=https://lcfczbtdibwtzgirorls.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
SUPABASE_SECRET_KEY=<Supabase service role key, server-only>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
YOUTUBE_SYNC_TOKEN_SECRET=<random 32+ character token encryption secret>
```

`SUPABASE_SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, and `YOUTUBE_SYNC_TOKEN_SECRET` are server-only secrets. Never prefix them with `NEXT_PUBLIC_`.

YouTube sync uses the Supabase server secret only inside authenticated API routes so OAuth token rows can stay hidden from browser-side Supabase access.

## Google Cloud OAuth Settings

Create a Google Cloud OAuth client for the YouTube sync phase:

- Enable YouTube Data API v3.
- OAuth client type: Web application.
- Authorized redirect URI: `https://creatorvault-eight.vercel.app/api/youtube/callback`.
- Local development redirect URI: `http://localhost:3000/api/youtube/callback`.
- Scope requested by the app: `https://www.googleapis.com/auth/youtube.readonly`.

## Supabase Auth Settings Before Launch

In Supabase Dashboard > Authentication:

- Set the Site URL to `https://creatorvault-eight.vercel.app`.
- Add redirect URLs for:
  - Production: `https://creatorvault-eight.vercel.app/**`
  - Local development: `http://localhost:3000/**`
- Enable leaked password protection if the project plan supports it. This is a paid-plan hardening option and is accepted as disabled for the free-plan MVP.
- Keep email/password auth enabled for the private MVP.

## Recommended Vercel Deployment Path

### Option A: Vercel Dashboard

1. Push this repository to GitHub.
2. Open Vercel and import the GitHub repository.
3. Let Vercel auto-detect Next.js.
4. Set the environment variables listed above.
5. Deploy.
6. Copy the production domain.
7. Add the production domain to Supabase Auth settings.
8. Redeploy after updating auth settings if needed.

### Option B: Vercel CLI

Install and authenticate Vercel CLI, then run:

```bash
npx vercel
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
npx vercel --prod
```

Vercel CLI deploys from the project root and writes the deployment URL to stdout. Vercel environment variables can also be managed with `vercel env`.

## Production Smoke Checklist

After deployment:

- Visit `/` and confirm it redirects appropriately.
- Visit `/dashboard` signed out and confirm it redirects to `/login?next=/dashboard`.
- Create or sign into the private account.
- Add one YouTube URL.
- Confirm the item appears in `/content`.
- Open the content detail page.
- Add one stats snapshot.
- Confirm latest snapshot, history, charts, and dashboard update.
- Confirm archived content disappears from default dashboard totals.
- Confirm `/api/content` returns `401` when signed out.
- Confirm `/api/dashboard/summary` returns `401` when signed out.
- Connect YouTube from `/settings`.
- Run a default YouTube sync and confirm videos/Shorts appear in `/content`.
- Filter `/content` by Source = YouTube sync.
- Delete imported YouTube content with a narrow filter and confirm manual content remains.

## Known Deployment Follow-Ups

- Leaked password protection remains disabled because it is only available on a paid Supabase plan for this project. Revisit before storing higher-risk personal data or sharing the app more broadly.
- The existing moderate Next/PostCSS advisory remains until a non-breaking upstream fix is available.
- Add scheduled YouTube background refresh later if manual sync proves useful.
