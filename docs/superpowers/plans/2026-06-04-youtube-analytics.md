# YouTube Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manual YouTube Analytics refresh so imported YouTube videos and Shorts can store watch time, average view duration, shares, and subscriber gain snapshots.

**Architecture:** Extend the existing YouTube sync workflow instead of creating a second connection flow. The existing `platform_accounts`, `content_items`, and `stat_snapshots` tables already hold the needed account, content, and metric fields, so Phase 14 uses the current database model.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Postgres/Auth, YouTube Data API, YouTube Analytics API, Vitest.

---

### Task 1: OAuth Permission Upgrade

**Files:**
- Modify: `src/lib/youtube/oauth.ts`
- Test: `src/lib/youtube/oauth.test.ts`

- [ ] Write failing tests proving the OAuth scope list includes both YouTube Data read access and YouTube Analytics read access.
- [ ] Implement exported `YOUTUBE_DATA_SCOPE`, `YOUTUBE_ANALYTICS_SCOPE`, `YOUTUBE_SCOPES`, and `hasRequiredYouTubeScopes`.
- [ ] Store the full scope list when saving a YouTube account.
- [ ] Show existing connections as needing reconnect when they do not have the analytics scope.

### Task 2: Analytics API Client

**Files:**
- Create: `src/lib/youtube/analytics.ts`
- Test: `src/lib/youtube/analytics.test.ts`

- [ ] Write failing tests for date range selection, report query parameters, response row mapping, and snapshot payload creation.
- [ ] Query `https://youtubeanalytics.googleapis.com/v2/reports` with `ids=channel==MINE`, `dimensions=video`, `filters=video==...`, and non-monetary metrics.
- [ ] Batch video IDs because YouTube Analytics supports up to 500 IDs in one video filter.
- [ ] Map analytics rows into snapshot fields already present in `stat_snapshots`.

### Task 3: Sync Route And UI

**Files:**
- Modify: `src/lib/youtube/validation.ts`
- Modify: `src/app/api/youtube/sync/route.ts`
- Modify: `src/app/api/youtube/status/route.ts`
- Modify: `src/components/youtube/youtube-sync-panel.tsx`

- [ ] Add `refresh_analytics` as a sync mode.
- [ ] For analytics refresh, load existing imported YouTube content after applying type/date/max filters.
- [ ] If the account lacks the analytics scope, return a reconnect-needed error.
- [ ] Add a settings-panel option labeled `Refresh analytics`.
- [ ] Show a clear reconnect action when analytics permission is missing.

### Task 4: Documentation And Shipping

**Files:**
- Modify: `CHANGELOG.md`
- Add: `docs/17-phase-14-youtube-analytics.md`

- [ ] Document what Phase 14 adds, how to reconnect YouTube, and what Google Cloud API must be enabled.
- [ ] Run targeted tests, full checks, and production build.
- [ ] Commit, push, deploy, and verify production routes still respond.
