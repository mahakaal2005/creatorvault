# Security and Privacy

## Private App Assumptions

CreatorVault MVP is a private personal app. It is not a public portfolio, social network, team workspace, or publishing tool. All content records, notes, and performance snapshots are private to the authenticated user.

## Auth Requirements

- Require authentication for all app pages except login and signup if enabled.
- Use Supabase Auth for email and password login.
- Use server-side session checks for API routes.
- Do not trust client-supplied user IDs.
- Sign out should clear the active session and return the user to login.

## Supabase Row Level Security Plan

Enable Row Level Security on all application tables:

- `profiles`
- `content_items`
- `stat_snapshots`
- `tags`
- `content_tags`
- `platform_accounts` if added later

Policy principles:

- Users can select, insert, update, and delete only their own profile record.
- Users can select, insert, update, and delete only content where `content_items.user_id = auth.uid()`.
- Users can access snapshots only when the parent content item belongs to them.
- Users can access tags only when `tags.user_id = auth.uid()`.
- Users can create content tag joins only between their own content and their own tags.
- Future platform accounts must be accessible only to the owning user, with token fields protected from client exposure.

## API Key Handling

- Store Supabase URL and anon key in environment variables.
- The Supabase anon key may be used in frontend-safe contexts with RLS enabled.
- Never expose Supabase service role keys to the browser.
- Never commit `.env` files.
- Any future YouTube API credentials must be stored server-side only.
- Any future OAuth tokens must be encrypted or stored using a secure secrets strategy.

## Data Ownership

- Every content item belongs to exactly one authenticated user.
- Every tag belongs to exactly one authenticated user.
- Every snapshot belongs to a content item and inherits ownership through that item.
- Export features, if added later, should export only the authenticated user's own data.

## Backup Considerations

- Supabase project backups should be enabled for production use.
- The creator should be able to export core records later as CSV or JSON.
- Manual backups should include content items, snapshots, tags, and content tag joins.
- Backup plans should avoid exporting secrets or OAuth tokens.

## Avoid Storing Unnecessary Personal Data

The MVP should store only data needed for the product:

- Account identifier from Supabase Auth.
- Optional display name.
- Content URLs and metadata.
- Creator-entered notes and performance snapshots.

Do not store:

- Browser activity.
- Contact lists.
- Private messages.
- Unrelated social profile data.
- Platform OAuth tokens in MVP.

## Future OAuth Risk Notes

Future YouTube API integration introduces additional risk:

- OAuth scopes must be minimal and read-only.
- Tokens must never be exposed in frontend code.
- Token refresh failures need safe error handling.
- API quota limits may affect refresh reliability.
- API-derived metrics may differ from manually entered snapshots.

Instagram API integration is outside MVP and should be treated as high-friction due to permissions, account requirements, review processes, and metric availability constraints.

## Privacy UX Requirements

- Make it clear that the app is private.
- Do not create public URLs for content library or detail pages.
- Do not include social sharing buttons in MVP.
- Do not add public portfolio pages without a separate product decision.
