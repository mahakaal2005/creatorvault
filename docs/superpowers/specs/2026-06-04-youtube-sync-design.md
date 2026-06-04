# YouTube Sync Design

## Goal

Add a YouTube account sync phase that lets the signed-in creator connect a YouTube account and import uploaded long videos and Shorts into CreatorVault.

## Product Behavior

- The default sync imports every fetchable YouTube upload.
- The user may narrow import by content type, date range, and max results.
- Existing imported YouTube items are updated, not duplicated.
- Each imported item gets a latest stats snapshot with available YouTube Data API metrics.
- Imported items remain editable and deletable like manually added content.
- The content library can filter imported YouTube items separately from manual items.
- Bulk deletion is available for imported YouTube items through a filtered delete action.

## OAuth and API Scope

- Use Google OAuth 2.0 web server flow.
- Request `https://www.googleapis.com/auth/youtube.readonly`.
- Request offline access so the app can refresh expired access tokens.
- Store tokens server-side only.
- Never expose Google client secrets, refresh tokens, or encrypted token values to the browser.

## YouTube Data Flow

1. User opens Settings and clicks Connect YouTube.
2. App redirects to Google OAuth with a CSRF `state`.
3. Google redirects back to `/api/youtube/callback`.
4. App exchanges the code for tokens.
5. App calls `channels.list` with `mine=true` to identify the connected channel and uploads playlist.
6. App stores or updates a `platform_accounts` row for the YouTube account.
7. User triggers sync.
8. App fetches uploads from `playlistItems.list`.
9. App fetches video details in batches from `videos.list`.
10. App upserts `content_items` and inserts or upserts same-day `stat_snapshots`.

## Database Changes

Existing `platform_accounts` supports OAuth connection records. Add import-tracking fields to `content_items`:

- `source`: `manual` or `youtube_sync`
- `source_account_id`: nullable reference to `platform_accounts`
- `last_synced_at`: nullable timestamp

These fields enable import filters and bulk deletion without changing the MVP content model.

## Routes

- `GET /api/youtube/connect`: starts OAuth.
- `GET /api/youtube/callback`: handles OAuth callback and stores the account.
- `POST /api/youtube/sync`: imports or refreshes YouTube uploads.
- `POST /api/youtube/disconnect`: revokes local connection by deleting the stored account.
- `GET /api/youtube/status`: returns connection status for Settings.
- `DELETE /api/youtube/imported`: deletes imported YouTube content matching optional filters.

## Settings UI

The Settings page gains a YouTube Sync section:

- Connection status.
- Connect YouTube button.
- Disconnect button.
- Sync controls for content type, date range, max results, and include already imported.
- Sync summary after completion.
- Imported-content cleanup controls.

## Non-Goals

- No Instagram sync.
- No auto-posting.
- No YouTube upload or write permissions.
- No scheduled background sync.
- No YouTube Analytics API.
- No public portfolio behavior.

## Security Notes

- Use a server-only encryption key for OAuth tokens.
- Token encryption uses authenticated encryption.
- Use OAuth state validation to reduce CSRF risk.
- Use only the connected user's Supabase session for all sync actions.
- RLS remains enabled on all user tables.

## External References

- YouTube OAuth web server flow: `https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps`
- YouTube uploads playlist flow: `https://developers.google.com/youtube/v3/docs/playlistItems/list`
- YouTube video details and statistics: `https://developers.google.com/youtube/v3/docs/videos/list`
