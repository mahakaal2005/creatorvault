# App Screens and UI Spec

## UI Principles

- Use a quiet, work-focused interface optimized for repeated personal tracking.
- Prioritize clear forms, dense but readable tables, useful filters, and quick actions.
- Use shadcn/ui components for consistency.
- Use Recharts for simple trend and comparison charts.
- Keep the first screen after login as the actual dashboard, not a marketing page.
- Avoid UI copy that explains obvious features; labels should be direct and functional.

## Login Page

### Purpose

Allow the creator to privately access their personal CreatorVault account.

### Main Components

- CreatorVault wordmark or simple title.
- Email and password fields.
- Sign in button.
- Optional sign up link if self-registration is enabled.
- Forgot password link if Supabase password reset is enabled.

### Empty State

The login page itself is the default unauthenticated state.

### Loading State

- Disable form fields and submit button.
- Show a small loading indicator inside or next to the submit button.

### Error State

- Show a concise message for invalid credentials, expired session, or network failure.
- Do not reveal whether an email exists.

### Primary Actions

- Sign in.

### Secondary Actions

- Sign up, if enabled.
- Reset password, if enabled.

### Mobile Responsiveness Notes

- Center the form vertically with enough top padding for mobile browsers.
- Keep fields full width.
- Avoid side-by-side layout on small screens.

## Dashboard

### Purpose

Give the creator a fast overview of output, performance, and recent content.

### Main Components

- Summary cards:
  - Total content.
  - Total latest views.
  - Top content.
  - Best platform.
  - Best topic.
  - Recent uploads count.
- Recent uploads list.
- Top content table.
- Platform performance chart.
- Topic performance chart.
- Snapshot freshness indicator.
- Add Content button.

### Empty State

- Show a clear first-use dashboard with an Add Content action.
- Hide charts that require data.
- Show zero-state summary cards with helpful labels.

### Loading State

- Skeleton cards for dashboard metrics.
- Skeleton rows for recent uploads and top content.
- Chart placeholders with fixed heights.

### Error State

- Show a dashboard-level error message with retry action.
- Keep navigation available.

### Primary Actions

- Add Content.
- Open a content item.

### Secondary Actions

- Go to Content Library.
- Filter by a dashboard insight such as best topic or best platform.

### Mobile Responsiveness Notes

- Summary cards should stack in one column on small screens and use two or three columns on wider screens.
- Tables should become compact lists on mobile.
- Charts should keep readable labels and avoid horizontal overflow.

## Content Library

### Purpose

Let the creator browse, search, filter, sort, and open all saved content.

### Main Components

- Search input.
- Filter controls:
  - Platform.
  - Content type.
  - Topic.
  - Tag.
  - Status.
  - Published date range.
  - Latest views range.
  - Latest engagement range.
- Sort menu.
- Content table or card list.
- Add Content button.
- Clear filters action.

### Empty State

- If no content exists, show an Add Content action.
- If filters return no matches, show Clear Filters and keep Add Content visible.

### Loading State

- Skeleton list rows.
- Disabled filters until options load.

### Error State

- Show load failure message with retry action.
- Preserve current filter controls when possible.

### Primary Actions

- Add Content.
- Open content detail.

### Secondary Actions

- Edit item quick action.
- Archive quick action.
- Clear filters.

### Mobile Responsiveness Notes

- Use a filter drawer or collapsible filter section on mobile.
- Cards are preferred over dense tables on narrow screens.
- Keep Add Content reachable as a top action.

## Add Content Page or Modal

### Purpose

Capture a new content item from a URL and metadata form.

### Main Components

- URL input.
- Parse URL button or automatic parse on paste.
- Platform select.
- Content type select.
- Title field.
- Thumbnail URL field.
- Published date field.
- Topic field.
- Hook text field.
- Hook type field.
- CTA keyword field.
- Notes textarea.
- Tag input.
- Status select.
- Save button.
- Cancel button.

### Empty State

- URL field is empty and focused.
- Platform and type are blank until parsed or manually selected.

### Loading State

- Show parsing status after paste.
- Disable Save while parsing or submitting.

### Error State

- Inline validation for missing or invalid fields.
- URL parse errors should allow manual correction.
- Duplicate URL warning should link to the existing item.

### Primary Actions

- Save Content.

### Secondary Actions

- Parse URL.
- Cancel.
- Clear form.

### Mobile Responsiveness Notes

- Use a single-column form.
- Keep field labels visible.
- Use sticky bottom action bar only if it does not cover form fields.

## Content Detail Page

### Purpose

Show one content item's full metadata, notes, latest stats, performance history, and actions.

### Main Components

- Title and platform/type badge.
- Original URL button.
- Thumbnail preview.
- Metadata panel:
  - Published date.
  - Topic.
  - Hook text.
  - Hook type.
  - CTA keyword.
  - Tags.
  - Status.
- Notes section.
- Latest snapshot summary.
- Snapshot history table.
- Performance charts:
  - Views over time.
  - Engagement over time.
  - Growth over time where data exists.
- Add Snapshot button.
- Edit Content button.
- Archive/Delete actions.

### Empty State

- If no snapshots exist, show Add Snapshot action in the stats section.

### Loading State

- Skeleton title, metadata, chart, and snapshot rows.

### Error State

- Show not found if the item does not exist or the user lacks access.
- Show retry action for transient load failures.

### Primary Actions

- Add Snapshot.
- Edit Content.
- Open Original URL.

### Secondary Actions

- Archive.
- Delete.
- Return to Library.

### Mobile Responsiveness Notes

- Stack metadata, snapshot summary, and charts vertically.
- Keep charts at fixed readable heights.
- Avoid wide tables; use snapshot cards on mobile.

## Stats Snapshot Form

### Purpose

Allow the creator to manually record performance metrics at a point in time.

### Main Components

- Snapshot date.
- Views.
- Likes.
- Comments.
- Shares.
- Saves.
- Followers or subscribers gained.
- Average view duration in seconds.
- Watch time in minutes.
- Notes.
- Save Snapshot button.

### Empty State

- Default snapshot date to today's date.
- Numeric fields start blank, not zero, unless the user enters zero intentionally.

### Loading State

- Disable fields during submission.
- Show a saving indicator.

### Error State

- Show validation for negative numbers, invalid dates, or missing content item.
- Show duplicate date warning if a snapshot already exists for the same content item and date.

### Primary Actions

- Save Snapshot.

### Secondary Actions

- Cancel.
- Clear optional fields.

### Mobile Responsiveness Notes

- Use numeric keyboards for metric fields.
- Group related metrics to reduce scrolling.
- Keep labels short but unambiguous.

## Settings Page

### Purpose

Give the creator basic account and app preferences without expanding MVP scope.

### Main Components

- Profile email display.
- Display name field.
- Default snapshot schedule reference.
- Data export placeholder for later scope.
- Sign out button.

### Empty State

- Settings can show current account details even if no profile metadata exists.

### Loading State

- Skeleton profile fields.

### Error State

- Show profile load or update errors.

### Primary Actions

- Save profile settings.

### Secondary Actions

- Sign out.

### Mobile Responsiveness Notes

- Use one-column layout.
- Keep destructive or account actions visually separated from profile settings.
