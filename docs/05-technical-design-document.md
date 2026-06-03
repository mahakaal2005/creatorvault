# Technical Design Document

## Architecture Overview

CreatorVault will use a Next.js TypeScript application with Supabase for authentication and Postgres storage. The frontend renders authenticated app screens, while server-side API routes handle validation, authorization checks, dashboard aggregation, URL parsing, and database operations.

```text
Browser
  |
  v
Next.js App Router UI
  |
  v
Next.js API Routes
  |
  v
Supabase Auth + Postgres
```

## Frontend Structure

Recommended top-level app areas:

- Auth pages for login and sign up if enabled.
- Dashboard route for summary analytics.
- Content library route for browsing and filtering.
- Add content route or modal.
- Content detail route for metadata, snapshots, and charts.
- Settings route for profile and account controls.

The UI should use shadcn/ui primitives for forms, dialogs, buttons, menus, tables, cards, tabs, badges, and alerts. Recharts should be used for line charts and simple comparison charts.

## Backend/API Route Structure

The MVP should expose API routes for:

- Content CRUD.
- Snapshot CRUD creation and reads.
- Dashboard summary.
- URL parsing.

API routes should validate request data with Zod before calling Supabase. Routes should use the authenticated user's session and should never trust a `user_id` supplied by the client.

## Database Usage

Supabase Postgres stores:

- User profiles linked to Supabase Auth users.
- Content items owned by a user.
- Stats snapshots linked to content items.
- Tags owned by a user.
- Join records between content items and tags.
- Optional future platform accounts for API integrations.

The app should query the latest snapshot per content item for dashboard cards and library performance filters.

## Auth Strategy

- Use Supabase Auth for email and password login.
- Protect all app routes except auth screens.
- Use server-side session checks in API routes.
- Use Row Level Security on all user-owned tables.
- Create profiles automatically after signup or lazily on first login.

## State Management Strategy

- Use server data fetching for initial page loads where practical.
- Use local component state for forms, filters, dialogs, and temporary UI state.
- Use URL query parameters for library filters and sorts so filtered views are shareable within the private app.
- Consider React Query or SWR only if repeated cache management becomes painful. It is not required for the initial MVP.

## Validation Strategy

- Define shared Zod schemas for content item input, snapshot input, filter input, and URL parse input.
- Validate on the client for fast feedback.
- Validate again in API routes as the source of truth.
- Use explicit enums for platform, content type, hook type, and status.
- Treat numeric metrics as non-negative integers unless a metric requires decimals.

## Error Handling Strategy

- API routes return consistent error shapes.
- Validation errors return field-level details.
- Authorization failures return 401 or 403.
- Missing resources return 404.
- Unexpected errors return a generic message and should be logged server-side.
- UI screens should provide retry actions for transient load failures.

## Future API Integration Plan

YouTube API integration can be added later by:

- Adding platform account OAuth records to `platform_accounts`.
- Storing provider access metadata securely server-side.
- Creating a background or manual refresh action for YouTube metadata and stats.
- Preserving manual snapshot entry as a fallback.
- Mapping API responses into the existing `content_items` and `stat_snapshots` model.

Instagram API integration is not part of MVP and should not be planned as an immediate follow-up because it adds permission and data availability complexity.

## Deployment Plan

- Deploy the Next.js app to Vercel or another Next.js-compatible host.
- Use Supabase hosted Postgres and Auth.
- Store Supabase project URL and keys in environment variables.
- Use only the public anon key in frontend-safe contexts.
- Keep service role keys server-only and avoid them unless necessary.
- Run database migrations before production deployment.

## Folder Structure

```text
creatorvault/
  app/
    (auth)/
      login/
    (app)/
      dashboard/
      content/
      content/[id]/
      settings/
    api/
      content/
      dashboard/
      metadata/
  components/
    content/
    dashboard/
    forms/
    layout/
    ui/
  lib/
    supabase/
    validation/
    url-parsing/
    analytics/
  docs/
  supabase/
    migrations/
    seed/
  tests/
```

## Key Design Decisions

- Manual stats entry is the MVP source of truth.
- API integrations are optional future enhancements.
- Dashboard metrics use the latest snapshot per content item.
- Private access is enforced in both application logic and database Row Level Security.
- Archive is preferred over permanent deletion for historical content records.
