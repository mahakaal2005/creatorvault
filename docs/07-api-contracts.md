# API Contracts

## Shared Conventions

- All API routes require an authenticated Supabase session unless explicitly stated.
- The server derives `user_id` from the session and ignores any client-supplied `user_id`.
- All responses use JSON.
- Validation errors return `400`.
- Unauthenticated requests return `401`.
- Authorized users requesting missing resources receive `404`.
- Forbidden access returns `403` if the app can distinguish it from missing data without leaking ownership.

## Error Response Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": {
      "title": ["Title is required."]
    }
  }
}
```

## POST /api/content

### Purpose

Create a new content item.

### Request Body

```json
{
  "title": "How I Plan a Study Week",
  "url": "https://www.youtube.com/watch?v=abc123xyz00",
  "platform": "youtube",
  "content_type": "youtube_video",
  "external_id": "abc123xyz00",
  "thumbnail_url": "https://img.youtube.com/vi/abc123xyz00/hqdefault.jpg",
  "published_at": "2026-05-30T12:00:00Z",
  "topic": "study planning",
  "hook_text": "Most study plans fail because they ignore your real week.",
  "hook_type": "problem_solution",
  "cta_keyword": "download planner",
  "notes": "Strong intro retention.",
  "status": "active",
  "tags": ["productivity", "study"]
}
```

### Response Body

```json
{
  "content": {
    "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
    "title": "How I Plan a Study Week",
    "url": "https://www.youtube.com/watch?v=abc123xyz00",
    "platform": "youtube",
    "content_type": "youtube_video",
    "status": "active",
    "created_at": "2026-06-03T09:00:00Z"
  }
}
```

### Validation Rules

- `title` is required and must be non-empty.
- `url` is required and must be a valid URL.
- `platform` must be `youtube` or `instagram`.
- `content_type` must match the selected platform.
- `published_at` must be a valid ISO datetime when provided.
- Metric fields are not accepted in this endpoint.
- `tags` must be an array of non-empty strings when provided.

### Error Responses

- `400 VALIDATION_ERROR` for invalid input.
- `401 UNAUTHENTICATED` for missing session.
- `409 DUPLICATE_CONTENT` when the same user already saved the URL.

## GET /api/content

### Purpose

Return a paginated content library list with filters, sorting, and latest snapshot summary.

### Query Parameters

```text
search=study
platform=youtube
content_type=youtube_short
topic=study planning
tag=productivity
status=active
published_from=2026-05-01
published_to=2026-06-01
min_views=1000
max_views=50000
sort=published_at_desc
page=1
page_size=25
```

### Response Body

```json
{
  "items": [
    {
      "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
      "title": "How I Plan a Study Week",
      "platform": "youtube",
      "content_type": "youtube_video",
      "topic": "study planning",
      "published_at": "2026-05-30T12:00:00Z",
      "status": "active",
      "tags": ["productivity", "study"],
      "latest_snapshot": {
        "snapshot_date": "2026-06-01",
        "views": 1250,
        "likes": 108,
        "comments": 14
      }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total": 1
  }
}
```

### Validation Rules

- Filters must match allowed enum values.
- Dates must use ISO date format.
- Numeric ranges must be non-negative.
- `page_size` should have a reasonable maximum such as 100.

### Error Responses

- `400 VALIDATION_ERROR` for invalid filters.
- `401 UNAUTHENTICATED` for missing session.

## GET /api/content/:id

### Purpose

Return one content item with tags and latest snapshot.

### Response Body

```json
{
  "content": {
    "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
    "title": "How I Plan a Study Week",
    "url": "https://www.youtube.com/watch?v=abc123xyz00",
    "platform": "youtube",
    "content_type": "youtube_video",
    "external_id": "abc123xyz00",
    "thumbnail_url": "https://img.youtube.com/vi/abc123xyz00/hqdefault.jpg",
    "published_at": "2026-05-30T12:00:00Z",
    "topic": "study planning",
    "hook_text": "Most study plans fail because they ignore your real week.",
    "hook_type": "problem_solution",
    "cta_keyword": "download planner",
    "notes": "Strong intro retention.",
    "status": "active",
    "tags": ["productivity", "study"],
    "latest_snapshot": {
      "snapshot_date": "2026-06-01",
      "views": 1250
    }
  }
}
```

### Validation Rules

- `id` must be a valid UUID.
- The content item must belong to the authenticated user.

### Error Responses

- `400 VALIDATION_ERROR` for invalid ID.
- `401 UNAUTHENTICATED` for missing session.
- `404 NOT_FOUND` for missing content.

## PATCH /api/content/:id

### Purpose

Update content item metadata and tags.

### Request Body

```json
{
  "title": "Updated title",
  "topic": "exam prep",
  "notes": "Updated notes.",
  "tags": ["study", "planning"],
  "status": "active"
}
```

### Response Body

```json
{
  "content": {
    "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
    "title": "Updated title",
    "topic": "exam prep",
    "updated_at": "2026-06-03T10:00:00Z"
  }
}
```

### Validation Rules

- `id` must be a valid UUID.
- At least one updatable field must be provided.
- If `platform` or `content_type` changes, the pair must remain compatible.
- `status` must be `active` or `archived`.
- `tags` replaces the tag set when provided.

### Error Responses

- `400 VALIDATION_ERROR` for invalid input.
- `401 UNAUTHENTICATED` for missing session.
- `404 NOT_FOUND` for missing content.
- `409 DUPLICATE_CONTENT` if URL is changed to a duplicate URL.

## DELETE /api/content/:id

### Purpose

Delete or archive a content item. MVP should prefer archive through PATCH. If DELETE exists, it should permanently remove the record and its snapshots after explicit UI confirmation.

### Response Body

```json
{
  "deleted": true
}
```

### Validation Rules

- `id` must be a valid UUID.
- The content item must belong to the authenticated user.

### Error Responses

- `400 VALIDATION_ERROR` for invalid ID.
- `401 UNAUTHENTICATED` for missing session.
- `404 NOT_FOUND` for missing content.

## POST /api/content/:id/snapshots

### Purpose

Create a manual stats snapshot for a content item.

### Request Body

```json
{
  "snapshot_date": "2026-06-01",
  "views": 1250,
  "likes": 108,
  "comments": 14,
  "shares": 9,
  "saves": 27,
  "followers_or_subscribers_gained": 12,
  "average_view_duration_seconds": 132.5,
  "watch_time_minutes": 2760.4,
  "notes": "Day 3 lift after sharing in story."
}
```

### Response Body

```json
{
  "snapshot": {
    "id": "45bc4a40-3333-4444-9999-6a1e3c872002",
    "content_item_id": "1fa74d30-2222-4444-9999-6a1e3c872001",
    "snapshot_date": "2026-06-01",
    "views": 1250,
    "created_at": "2026-06-03T09:15:00Z"
  }
}
```

### Validation Rules

- `id` must be a valid content item UUID.
- `snapshot_date` is required.
- Numeric metrics must be non-negative unless the field allows signed values.
- At least one metric or notes field should be provided.
- Duplicate snapshot dates for the same content item should be rejected or treated as an update only if explicitly designed.

### Error Responses

- `400 VALIDATION_ERROR` for invalid input.
- `401 UNAUTHENTICATED` for missing session.
- `404 NOT_FOUND` for missing content.
- `409 DUPLICATE_SNAPSHOT_DATE` for duplicate content item and date.

## GET /api/content/:id/snapshots

### Purpose

Return all snapshots for a content item in chronological order.

### Response Body

```json
{
  "snapshots": [
    {
      "id": "45bc4a40-3333-4444-9999-6a1e3c872002",
      "snapshot_date": "2026-06-01",
      "views": 1250,
      "likes": 108,
      "comments": 14,
      "shares": 9,
      "saves": 27
    }
  ]
}
```

### Validation Rules

- `id` must be a valid UUID.
- The content item must belong to the authenticated user.

### Error Responses

- `400 VALIDATION_ERROR` for invalid ID.
- `401 UNAUTHENTICATED` for missing session.
- `404 NOT_FOUND` for missing content.

## GET /api/dashboard/summary

### Purpose

Return dashboard metrics and summary lists for the authenticated user.

### Response Body

```json
{
  "summary": {
    "total_content": 32,
    "total_latest_views": 184500,
    "best_platform": "youtube",
    "best_topic": "study planning",
    "recent_uploads_count": 5
  },
  "top_content": [
    {
      "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
      "title": "How I Plan a Study Week",
      "views": 1250,
      "engagement_rate": 0.1264
    }
  ],
  "recent_uploads": [],
  "platform_performance": [],
  "topic_performance": []
}
```

### Validation Rules

- Optional date filters must be valid ISO dates if supported.
- All metrics must be calculated from the authenticated user's content only.

### Error Responses

- `401 UNAUTHENTICATED` for missing session.
- `500 DASHBOARD_QUERY_FAILED` for unexpected aggregation failure.

## GET /api/metadata/parse-url

### Purpose

Parse a pasted URL and return detected platform, content type, external ID, and thumbnail suggestion when possible.

### Query Parameters

```text
url=https%3A%2F%2Fwww.youtube.com%2Fshorts%2Fabc123xyz00
```

### Response Body

```json
{
  "parsed": {
    "url": "https://www.youtube.com/shorts/abc123xyz00",
    "platform": "youtube",
    "content_type": "youtube_short",
    "external_id": "abc123xyz00",
    "thumbnail_url": "https://img.youtube.com/vi/abc123xyz00/hqdefault.jpg",
    "confidence": "high"
  }
}
```

### Validation Rules

- `url` is required and must be a valid URL.
- Supported YouTube formats include `youtube.com/watch?v=`, `youtu.be/`, and `youtube.com/shorts/`.
- Supported Instagram format includes `instagram.com/reel/`.
- Unknown supported-looking URLs can return `confidence: low`.

### Error Responses

- `400 VALIDATION_ERROR` for missing or invalid URL.
- `422 UNSUPPORTED_URL` for unsupported platforms.
