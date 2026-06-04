# YouTube Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build YouTube OAuth connection, auto-import, filtering, and imported-content cleanup for CreatorVault.

**Architecture:** Server-only OAuth and YouTube API modules handle tokens and API calls. API route handlers authenticate the Supabase user, call focused service functions, and upsert into the existing content and snapshot tables. The Settings UI provides connection, sync filters, and cleanup controls.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Postgres/Auth, Node crypto, YouTube Data API v3, Zod, Vitest.

---

### Task 1: Schema and Types

**Files:**
- Create: `supabase/migrations/202606040001_youtube_sync_import_tracking.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `.env.example`

- [ ] Add `content_source` enum and import tracking columns.
- [ ] Add server-only Google OAuth and token secret env examples.
- [ ] Update generated database types manually to match the migration.

### Task 2: Token Encryption and YouTube API Units

**Files:**
- Create: `src/lib/youtube/crypto.ts`
- Create: `src/lib/youtube/oauth.ts`
- Create: `src/lib/youtube/api.ts`
- Test: `src/lib/youtube/crypto.test.ts`
- Test: `src/lib/youtube/api.test.ts`

- [ ] Write failing tests for token encryption round-trip and wrong-secret rejection.
- [ ] Write failing tests for YouTube duration/type mapping and sync filter behavior.
- [ ] Implement encryption, OAuth URL/token exchange helpers, YouTube fetch helpers, and mapping utilities.

### Task 3: YouTube Sync Repository and Service

**Files:**
- Create: `src/lib/youtube/sync.ts`
- Test: `src/lib/youtube/sync.test.ts`

- [ ] Write failing tests for import summary calculations and duplicate matching.
- [ ] Implement focused service helpers for deciding create vs update and snapshot payloads.

### Task 4: API Routes

**Files:**
- Create: `src/app/api/youtube/connect/route.ts`
- Create: `src/app/api/youtube/callback/route.ts`
- Create: `src/app/api/youtube/status/route.ts`
- Create: `src/app/api/youtube/sync/route.ts`
- Create: `src/app/api/youtube/disconnect/route.ts`
- Create: `src/app/api/youtube/imported/route.ts`

- [ ] Add authenticated route handlers.
- [ ] Store OAuth state in an httpOnly cookie.
- [ ] Exchange callback codes, encrypt tokens, and store account records.
- [ ] Sync uploads with optional filters.
- [ ] Delete imported YouTube items with optional filters.

### Task 5: Settings UI and Library Filters

**Files:**
- Modify: `src/app/(app)/settings/page.tsx`
- Create: `src/components/youtube/youtube-sync-panel.tsx`
- Modify: `src/components/content/content-filters.tsx`
- Modify: `src/lib/validation/filters.ts`
- Modify: `src/lib/content/repository.ts`
- Test: `src/lib/validation/filters.test.ts`

- [ ] Add Settings panel for connect, sync, disconnect, and imported cleanup.
- [ ] Add content source filter to the content library.
- [ ] Add repository support for source filtering.

### Task 6: Verification and Deployment Notes

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/14-deployment-notes.md`
- Modify: `docs/15-phase-10-production-handoff.md`

- [ ] Document Google Cloud setup and required Vercel env vars.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Apply Supabase migration.
- [ ] Add Vercel env vars after the user provides Google credentials.
- [ ] Deploy after env vars are configured.
