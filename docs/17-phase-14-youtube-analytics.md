# Phase 14: YouTube Analytics Refresh

## What Changed

Phase 14 adds a manual YouTube Analytics refresh mode to the existing YouTube sync panel.

CreatorVault can now refresh deeper metrics for imported YouTube videos and Shorts:

- Watch time minutes.
- Average view duration seconds.
- Shares.
- Subscribers gained.

These values are saved into the existing `stat_snapshots` table, so no Supabase schema change is required.

## User Flow

1. Open Settings.
2. If CreatorVault says YouTube needs reconnecting, click Reconnect.
3. Approve the extra YouTube Analytics permission.
4. Return to Settings.
5. Choose `Refresh analytics` in the sync mode dropdown.
6. Optionally apply type, date, and max-result filters.
7. Click Sync now.

## Google Cloud Requirement

The Google Cloud project used by CreatorVault must have both APIs enabled:

- YouTube Data API v3.
- YouTube Analytics API.

The same OAuth client can be used. The app requests read-only YouTube Data access and read-only YouTube Analytics access. It does not request monetary analytics access.

## Reconnect Requirement

Existing YouTube connections created before Phase 14 only have the YouTube Data permission. Those accounts must reconnect once so Google issues a token with the analytics permission.

CreatorVault detects this state from the stored account scopes and shows a Reconnect button in Settings.

## Analytics Query Behavior

CreatorVault queries the YouTube Analytics `reports` endpoint with:

- `ids=channel==MINE`
- `dimensions=video`
- `filters=video==...`
- Metrics: `estimatedMinutesWatched`, `averageViewDuration`, `averageViewPercentage`, `subscribersGained`, and `shares`

For each imported content item, the app uses the publish date through the current day when available. If a publish date is unavailable, it uses the last 30 days.

## UI Impact

- Settings now includes `Refresh analytics` as a YouTube sync mode.
- Snapshot history already displays watch time, average view duration, shares, and audience gained.
- Content detail charts already include watch time and audience gained.
- Dashboard now includes total watch time and best retention cards.

## Non-Goals

- No automatic/scheduled refresh.
- No YouTube revenue metrics.
- No YouTube monetary scope.
- No Instagram API integration in this phase.
- No retention heatmaps.

## Verification

Run:

```bash
npm run check
npm run build
```

After deployment, verify:

- Signed-out dashboard traffic still redirects to login.
- `/api/youtube/status` returns `401` when signed out.
- A connected account without analytics scope shows the reconnect state.
