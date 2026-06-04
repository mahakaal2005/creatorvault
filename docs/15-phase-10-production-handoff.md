# Phase 10 Production Handoff

## Goal

Phase 10 prepares CreatorVault for real personal use after deployment. It does not add new MVP features. It closes the loop on launch readiness, production verification, and operating notes.

## Production Links

- GitHub repository: `https://github.com/mahakaal2005/creatorvault`
- Vercel production app: `https://creatorvault-eight.vercel.app`
- Supabase project ref: `lcfczbtdibwtzgirorls`

## Current Production Status

- App is deployed on Vercel.
- Supabase production URL and publishable key are configured in Vercel.
- Signed-out `/dashboard` redirects to `/login?next=%2Fdashboard`.
- Supabase migrations are applied.
- Supabase security advisor reports leaked password protection disabled.

## Accepted MVP Limitations

- Leaked password protection is not enabled because it is a paid-plan Supabase Auth feature for this project.
- Instagram API sync is intentionally not part of MVP.
- YouTube API sync is intentionally a later enhancement.
- Users still add content URLs manually in MVP.
- Manual stats snapshots remain the source of truth for MVP analytics.

## First Real Account Checklist

1. Open `https://creatorvault-eight.vercel.app`.
2. Sign in with the private creator account.
3. Add one YouTube long video URL.
4. Add one YouTube Shorts URL.
5. Add one Instagram Reel URL.
6. Confirm each item appears in the content library.
7. Open one content detail page.
8. Add a Day 0 stats snapshot.
9. Confirm the snapshot appears in history.
10. Confirm the dashboard updates totals, top content, platform chart, and topic chart.
11. Archive one test content item.
12. Confirm archived content no longer appears in default dashboard totals.

## Supabase Auth Settings

Recommended dashboard settings:

- Site URL: `https://creatorvault-eight.vercel.app`
- Redirect URL: `https://creatorvault-eight.vercel.app/**`
- Local redirect URL: `http://localhost:3000/**`
- Email/password auth: enabled
- Leaked password protection: disabled for free-plan MVP, revisit after plan upgrade

## Operational Checklist

- Run `npm run check` before every commit.
- Run `npm run build` before every production deployment.
- Keep `.env.local` out of git.
- Do not add service-role keys unless a future server-only admin workflow requires them.
- Keep Row Level Security enabled on all public tables.
- Add schema changes through migrations and document them in the changelog.
- After deployment, verify signed-out app routes still redirect to login.

## Recommended Next Product Phase

The next product phase should be a carefully scoped V1 planning phase for optional account-based import:

- YouTube OAuth connection.
- Read-only YouTube channel content import.
- Manual review before saving imported videos.
- Refresh latest YouTube stats on demand.

Instagram auto-import should remain out of scope until API access and permissions are confirmed.
