# Implementation Plan

## Phase 1: Project Setup

### Goal

Create the Next.js TypeScript foundation with styling, UI primitives, validation, and project conventions.

### Tasks

- Initialize Next.js with TypeScript.
- Configure Tailwind CSS.
- Install and configure shadcn/ui.
- Add base layout, app shell, and protected route structure.
- Add linting, formatting, and TypeScript strict mode.
- Add environment variable examples without real secrets.
- Create a changelog file.

### Files Likely Touched

- `package.json`
- `next.config.*`
- `tsconfig.json`
- `tailwind.config.*`
- `app/layout.tsx`
- `app/globals.css`
- `components/ui/*`
- `.env.example`
- `CHANGELOG.md`

### Completion Criteria

- App starts locally.
- TypeScript strict mode is enabled.
- Tailwind styles load.
- shadcn/ui components can be generated and imported.
- No app-specific features beyond foundation are implemented.

## Phase 2: Supabase Schema and Auth

### Goal

Set up Supabase Auth, database tables, Row Level Security, and authenticated routing.

### Tasks

- Create Supabase project configuration.
- Add database migrations for enums and tables.
- Add RLS policies.
- Configure Supabase client helpers for browser and server usage.
- Build login page.
- Protect app routes.
- Create or load user profile after authentication.

### Files Likely Touched

- `supabase/migrations/*`
- `lib/supabase/*`
- `app/(auth)/login/*`
- `app/(app)/layout.tsx`
- `middleware.ts`
- `docs/CHANGELOG.md` if changelog is placed under docs, otherwise `CHANGELOG.md`

### Completion Criteria

- User can sign in.
- Unauthenticated users cannot access app pages.
- Authenticated user can load a private app shell.
- RLS policies are tested.

## Phase 3: Content CRUD

### Goal

Allow the user to create, read, update, archive, and delete content records.

### Tasks

- Define Zod schemas for content input and updates.
- Build URL parsing utility for YouTube videos, YouTube Shorts, and Instagram Reels.
- Implement `GET /api/metadata/parse-url`.
- Implement content API routes.
- Build Add Content form.
- Build Edit Content form.
- Implement archive-first status behavior.
- Add duplicate URL handling.

### Files Likely Touched

- `lib/validation/content.ts`
- `lib/url-parsing/*`
- `app/api/metadata/parse-url/route.ts`
- `app/api/content/route.ts`
- `app/api/content/[id]/route.ts`
- `components/content/*`
- `app/(app)/content/new/*`
- `app/(app)/content/[id]/*`

### Completion Criteria

- User can add supported content URLs.
- Platform/type detection works for supported MVP formats.
- User can manually correct detection.
- User can edit content metadata.
- User can archive or delete content.
- Duplicate URLs are handled clearly.

## Phase 4: Content Library and Filters

### Goal

Build the searchable and filterable library view.

### Tasks

- Implement library query parameters.
- Add filters for platform, content type, topic, tag, status, date, and performance.
- Add sorting.
- Include latest snapshot summary in list rows.
- Build desktop table and mobile card layouts.
- Add empty and filtered-empty states.

### Files Likely Touched

- `app/(app)/content/page.tsx`
- `components/content/content-library.tsx`
- `components/content/content-filters.tsx`
- `components/content/content-list.tsx`
- `lib/validation/filters.ts`
- `app/api/content/route.ts`

### Completion Criteria

- User can search and filter saved content.
- Filter state is reflected in the URL.
- Mobile layout remains usable.
- Library only shows the authenticated user's records.

## Phase 5: Stats Snapshots

### Goal

Allow manual snapshot entry and display snapshot history.

### Tasks

- Define Zod schema for snapshot input.
- Implement snapshot API routes.
- Build Stats Snapshot form.
- Add snapshot history to content detail page.
- Add duplicate date handling.
- Add validation for non-negative metrics.

### Files Likely Touched

- `lib/validation/snapshots.ts`
- `app/api/content/[id]/snapshots/route.ts`
- `components/content/stats-snapshot-form.tsx`
- `components/content/snapshot-history.tsx`
- `app/(app)/content/[id]/page.tsx`

### Completion Criteria

- User can add snapshots manually.
- Snapshot history displays in chronological order.
- Latest snapshot summary updates after save.
- Invalid metric values are rejected.

## Phase 6: Dashboard

### Goal

Build dashboard summary cards and lists from content and latest snapshots.

### Tasks

- Implement dashboard aggregation utilities.
- Implement `GET /api/dashboard/summary`.
- Build summary cards.
- Build recent uploads list.
- Build top content list.
- Add empty dashboard state.

### Files Likely Touched

- `lib/analytics/*`
- `app/api/dashboard/summary/route.ts`
- `app/(app)/dashboard/page.tsx`
- `components/dashboard/*`

### Completion Criteria

- Dashboard shows total content, total latest views, top content, best platform, best topic, and recent uploads.
- Metrics use latest snapshot per content item.
- Empty state is useful for a new user.

## Phase 7: Charts

### Goal

Add performance history and summary charts.

### Tasks

- Install and configure Recharts.
- Build content detail charts for views, engagement, engagement rate, and audience gained.
- Build dashboard charts for platform and topic performance.
- Handle missing or sparse data.
- Verify chart responsiveness on mobile.

### Files Likely Touched

- `components/charts/*`
- `components/content/content-performance-charts.tsx`
- `components/dashboard/dashboard-charts.tsx`
- `lib/analytics/chart-data.ts`

### Completion Criteria

- Charts render with real snapshot data.
- Charts handle empty and one-snapshot states.
- Charts do not overflow mobile screens.

## Phase 8: Polish and Testing

### Goal

Improve usability, reliability, and confidence before deployment.

### Tasks

- Add unit tests for URL parsing, validation, and analytics.
- Add integration tests for API routes and RLS-sensitive flows.
- Add UI tests for core flows.
- Review loading, empty, and error states.
- Improve mobile layout issues.
- Confirm accessibility basics.
- Update changelog.

### Files Likely Touched

- `tests/*`
- `components/*`
- `app/*`
- `lib/*`
- `CHANGELOG.md`

### Completion Criteria

- Tests cover core MVP flows.
- Build passes.
- Manual checklist passes.
- No known MVP-blocking UI issues remain.

## Phase 9: Deployment

### Goal

Deploy the private MVP safely.

### Tasks

- Configure production Supabase environment.
- Apply migrations.
- Configure hosting environment variables.
- Deploy Next.js app.
- Verify auth in production.
- Verify RLS in production.
- Run smoke tests.
- Document deployment notes.

### Files Likely Touched

- Hosting project settings.
- Supabase project settings.
- `.env.example`
- `docs/deployment-notes.md` if created later.
- `CHANGELOG.md`

### Completion Criteria

- Production app is accessible only after login.
- Content CRUD works in production.
- Snapshot entry works in production.
- Dashboard loads production data correctly.
- No secrets are exposed in client code or committed files.
