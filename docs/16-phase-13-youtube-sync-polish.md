# Phase 13 YouTube Sync Polish

## Goal

Make YouTube sync safer and easier to operate after the first working integration.

## Changes

- Show connected channel status in Settings.
- Show the latest YouTube sync timestamp.
- Add sync modes:
  - Sync all
  - Only new uploads
  - Refresh stats only
- Keep optional filters for content type, date range, and max results.
- Show clearer sync summary counts.
- Add a visible YouTube sync badge in the Content Library.
- Require typed confirmation before bulk deleting imported YouTube content.

## Manual QA Checklist

1. Sign in to the deployed app.
2. Open Settings.
3. Confirm the YouTube panel shows the connected channel and latest sync time.
4. Run Sync all.
5. Run Only new uploads.
6. Run Refresh stats only.
7. Confirm Content Library shows YouTube sync badges on imported items.
8. Confirm bulk delete rejects anything except `DELETE IMPORTED`.
9. Confirm a filtered delete removes only imported YouTube content.

## Deferred

- Scheduled background sync.
- Per-item manual refresh button.
- YouTube Analytics API metrics.
