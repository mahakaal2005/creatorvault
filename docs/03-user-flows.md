# User Flows

## Add Content Flow

1. User opens the dashboard or content library.
2. User selects Add Content.
3. User pastes a published content URL.
4. System parses the URL.
5. System suggests platform, content type, and external ID when possible.
6. User reviews and corrects platform or content type if needed.
7. User enters title, published date, topic, hook, CTA, notes, thumbnail URL, and tags.
8. User saves the content item.
9. System validates input and creates the record.
10. System redirects to the content detail page or returns to the library.

```text
Paste URL
   |
   v
Parse URL -> Detection confident? -> Yes -> Pre-fill platform/type
   |                              |
   |                              No
   v                              v
Show form <---------------- Manual correction
   |
   v
Validate -> Save -> Detail page
```

## Edit Content Flow

1. User opens a content detail page.
2. User selects Edit.
3. System displays editable metadata.
4. User changes fields.
5. User saves changes.
6. System validates input.
7. System updates the content item.
8. System returns to the updated detail view.

```text
Detail page -> Edit -> Validate changes -> Save -> Updated detail page
```

## Add Stats Snapshot Flow

1. User opens a content detail page.
2. User selects Add Snapshot.
3. System displays the stats snapshot form.
4. User enters snapshot date and available metrics.
5. User optionally adds snapshot notes.
6. User submits the form.
7. System validates metric values.
8. System creates the snapshot.
9. System refreshes latest stats and performance charts.

```text
Detail page
   |
   v
Add Snapshot -> Enter metrics -> Validate -> Save snapshot -> Refresh charts
```

## View Dashboard Flow

1. User signs in.
2. System loads dashboard summary data for the authenticated user.
3. User reviews summary cards.
4. User reviews recent uploads and top content.
5. User selects a content item or filter shortcut when they want more detail.

```text
Login -> Dashboard -> Summary cards
                    -> Top content
                    -> Recent uploads
                    -> Platform/topic summaries
```

## Filter Content Library Flow

1. User opens Content Library.
2. System loads saved content items.
3. User enters search text or selects filters.
4. System applies filters to the list.
5. User sorts results if needed.
6. User opens a matching content item.

```text
Library -> Search/filter controls -> Filtered results -> Open detail
```

## View Content Detail Flow

1. User opens a content item from the dashboard or library.
2. System loads content metadata and snapshots.
3. User reviews metadata, notes, latest stats, and charts.
4. User can add a snapshot, edit metadata, open original URL, archive, or delete.

```text
Content card -> Detail page -> Metadata
                         -> Latest snapshot
                         -> Charts
                         -> Actions
```

## Delete or Archive Content Flow

1. User opens a content detail page.
2. User selects Archive or Delete.
3. System shows a confirmation prompt.
4. If archive is selected, system changes status to archived and keeps data.
5. If delete is selected, system permanently deletes or soft-deletes the content item according to implementation policy.
6. System returns user to the library.

```text
Detail page -> Archive/Delete -> Confirm?
                              -> No -> Stay on page
                              -> Yes -> Update status or delete -> Library
```

## Recommended MVP Behavior

Archive should be the default safe action. Permanent delete should require explicit confirmation because content records and snapshots are historical data.
