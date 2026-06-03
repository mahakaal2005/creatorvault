# Changelog

## 2026-06-03

- Created the CreatorVault Next.js TypeScript foundation.
- Added Tailwind CSS, shadcn/ui base configuration, Zod, React Hook Form, Recharts, and Lucide dependencies.
- Added route skeletons for login, dashboard, content library, add content, and settings.
- Copied the pre-development documentation pack into the app.
- Added Supabase Auth SSR dependencies, initial database migration, RLS policies, protected routes, login/signup actions, and sign-out handling.
- Applied the CreatorVault Supabase migrations to project `lcfczbtdibwtzgirorls` through Supabase MCP.
- Added a follow-up migration to harden trigger functions and optimize RLS policy auth checks.
- Added Phase 3 content CRUD API routes, URL parsing, Zod content validation, live content library, add/edit content forms, detail page, archive, and delete actions.
- Added Phase 4 content library filters, URL-backed search state, sorting, pagination, latest snapshot summaries, and API query validation.
- Added Phase 5 manual stats snapshots with validation, snapshot API routes, latest snapshot summary, detail-page snapshot form, and chronological snapshot history.
- Added Phase 6 dashboard aggregation, private dashboard summary API, live summary cards, top content ranking, recent uploads, and empty dashboard state.
- Added Phase 7 chart data utilities, content detail performance charts, dashboard platform/topic charts, and sparse chart empty states.
- Added Phase 8 QA coverage, tag normalization tests, app loading/error states, accessibility landmarks, skip link, content action error handling, and a manual QA checklist.
- Added Phase 9 deployment notes, Vercel deployment checklist, Supabase production status notes, and tightened MVP environment variable guidance.
