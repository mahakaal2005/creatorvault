# Testing Plan

## Testing Goals

- Confirm the app stores and protects private creator data correctly.
- Confirm URL parsing and manual correction work for supported platforms.
- Confirm forms validate user input before saving.
- Confirm library filters and dashboard calculations are accurate.
- Confirm the MVP works without YouTube or Instagram API integration.

## Unit Tests

### URL Parsing Tests

- Parses `https://www.youtube.com/watch?v=VIDEO_ID` as `youtube_video`.
- Parses `https://youtu.be/VIDEO_ID` as `youtube_video`.
- Parses `https://www.youtube.com/shorts/VIDEO_ID` as `youtube_short`.
- Parses `https://www.instagram.com/reel/REEL_ID/` as `instagram_reel`.
- Handles query parameters without breaking external ID extraction.
- Rejects unsupported platforms.
- Returns low confidence when URL is valid but type is uncertain.

### Validation Tests

- Rejects content without title.
- Rejects invalid URL.
- Rejects incompatible platform and content type combinations.
- Rejects negative snapshot metrics.
- Allows optional metric fields to remain blank.
- Rejects invalid snapshot dates.
- Rejects duplicate snapshot date for the same content item.

### Analytics Calculation Tests

- Calculates engagement count from likes, comments, shares, and saves.
- Calculates engagement rate from engagement count divided by views.
- Returns null engagement rate when views are zero or missing.
- Calculates growth velocity from two snapshots.
- Selects latest snapshot by snapshot date.
- Ranks top content by latest views.
- Groups topic performance case-insensitively.

## Integration Tests

- Authenticated user can create content.
- Authenticated user can list only their own content.
- Authenticated user can update their own content.
- Authenticated user can archive their own content.
- Authenticated user can delete their own content when deletion is enabled.
- Authenticated user can add snapshots to their own content.
- User cannot add snapshots to another user's content.
- Dashboard summary only includes authenticated user's data.
- Tag creation and content tag associations are saved correctly.

## UI Tests

- Login page shows validation and authentication errors.
- Add Content form auto-fills platform/type after supported URL paste.
- User can manually correct platform/type before saving.
- Content Library filters by platform, type, topic, tag, date, and performance.
- Empty library state shows Add Content action.
- Content Detail shows metadata and no-snapshot empty state.
- Stats Snapshot form saves valid metrics and updates chart data.
- Dashboard loads summary cards and top content.
- Mobile layout keeps forms readable and actions accessible.

## Manual Test Checklist

- Sign up or sign in with a test account.
- Add a YouTube long video URL.
- Add a YouTube Short URL.
- Add an Instagram Reel URL.
- Add a content item with manual platform/type correction.
- Try adding a duplicate URL and confirm duplicate handling.
- Edit metadata, topic, hook, CTA, notes, and tags.
- Add Day 0, Day 1, and Day 3 snapshots.
- Confirm charts update after snapshots.
- Filter library by platform.
- Filter library by content type.
- Filter library by topic.
- Filter library by tag.
- Filter library by latest views range.
- Archive content and confirm it leaves default active views.
- Sign out and confirm private routes require login.

## Edge Cases

- URL has trailing slash.
- URL has extra query parameters.
- URL is shortened.
- URL is valid but unsupported.
- Content item has no published date.
- Content item has no thumbnail.
- Snapshot has views but no likes.
- Snapshot has likes but views are zero.
- Multiple snapshots are entered out of chronological order.
- Topic casing differs across content items.
- Tags have extra whitespace.
- User session expires while submitting a form.

## Database Permission Tests

- RLS blocks selecting another user's `content_items`.
- RLS blocks updating another user's `content_items`.
- RLS blocks deleting another user's `content_items`.
- RLS blocks selecting snapshots for another user's content.
- RLS blocks inserting snapshots for another user's content.
- RLS blocks selecting another user's tags.
- RLS blocks associating own content with another user's tag.

## Dashboard Calculation Tests

- Total content excludes archived records by default.
- Total views sums latest snapshot views only once per content item.
- Best platform uses latest snapshots.
- Best topic ignores blank topics.
- Recent uploads sort by published date, then created date.
- Top content handles ties by engagement rate.

## Build and Regression Checks

After each implementation phase:

- Run TypeScript checks.
- Run linting.
- Run unit tests.
- Run relevant integration tests.
- Run production build.
- Manually test the primary changed flow.
