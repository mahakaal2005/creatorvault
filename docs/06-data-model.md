# Data Model

## Enums

Recommended Postgres enums:

```sql
platform: youtube, instagram
content_type: youtube_video, youtube_short, instagram_reel
content_status: active, archived
hook_type: curiosity, problem_solution, story, listicle, challenge, educational, other
platform_provider: youtube, instagram
```

## profiles

Stores user profile metadata linked to Supabase Auth.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | Primary key, references auth.users(id) on delete cascade |
| display_name | text | Nullable |
| created_at | timestamptz | Not null, default now() |
| updated_at | timestamptz | Not null, default now() |

### Relationships

- `profiles.id` maps one-to-one with `auth.users.id`.
- `profiles.id` is referenced by user-owned records through `user_id`.

### Indexes

- Primary key index on `id`.

### Example Row

```json
{
  "id": "8fb30c0b-1111-4444-9999-6a1e3c872000",
  "display_name": "Aarav Creator",
  "created_at": "2026-06-03T09:00:00Z",
  "updated_at": "2026-06-03T09:00:00Z"
}
```

## content_items

Stores one published content item.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | Primary key, default gen_random_uuid() |
| user_id | uuid | Not null, references profiles(id) on delete cascade |
| title | text | Not null |
| url | text | Not null |
| platform | platform enum | Not null |
| content_type | content_type enum | Not null |
| external_id | text | Nullable |
| thumbnail_url | text | Nullable |
| published_at | timestamptz | Nullable |
| topic | text | Nullable |
| hook_text | text | Nullable |
| hook_type | hook_type enum | Nullable |
| cta_keyword | text | Nullable |
| notes | text | Nullable |
| status | content_status enum | Not null, default active |
| created_at | timestamptz | Not null, default now() |
| updated_at | timestamptz | Not null, default now() |

### Relationships

- Belongs to one profile through `user_id`.
- Has many `stat_snapshots`.
- Has many tags through `content_tags`.

### Indexes

- `content_items_user_id_idx` on `user_id`.
- `content_items_user_platform_idx` on `(user_id, platform)`.
- `content_items_user_content_type_idx` on `(user_id, content_type)`.
- `content_items_user_published_at_idx` on `(user_id, published_at desc)`.
- `content_items_user_status_idx` on `(user_id, status)`.
- `content_items_user_topic_idx` on `(user_id, topic)`.
- Unique partial or compound index on `(user_id, url)` to prevent duplicates per user.

### Example Row

```json
{
  "id": "1fa74d30-2222-4444-9999-6a1e3c872001",
  "user_id": "8fb30c0b-1111-4444-9999-6a1e3c872000",
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
  "notes": "Strong intro retention, needs tighter ending.",
  "status": "active",
  "created_at": "2026-06-03T09:00:00Z",
  "updated_at": "2026-06-03T09:00:00Z"
}
```

## stat_snapshots

Stores manual performance snapshots over time.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | Primary key, default gen_random_uuid() |
| content_item_id | uuid | Not null, references content_items(id) on delete cascade |
| snapshot_date | date | Not null |
| views | integer | Nullable, check >= 0 |
| likes | integer | Nullable, check >= 0 |
| comments | integer | Nullable, check >= 0 |
| shares | integer | Nullable, check >= 0 |
| saves | integer | Nullable, check >= 0 |
| followers_or_subscribers_gained | integer | Nullable |
| average_view_duration_seconds | numeric | Nullable, check >= 0 |
| watch_time_minutes | numeric | Nullable, check >= 0 |
| notes | text | Nullable |
| created_at | timestamptz | Not null, default now() |

### Relationships

- Belongs to one `content_items` record.
- Access is indirectly owned through the parent content item.

### Indexes

- `stat_snapshots_content_item_id_idx` on `content_item_id`.
- `stat_snapshots_content_date_idx` on `(content_item_id, snapshot_date desc)`.
- Unique index on `(content_item_id, snapshot_date)` to prevent duplicate daily snapshots.

### Example Row

```json
{
  "id": "45bc4a40-3333-4444-9999-6a1e3c872002",
  "content_item_id": "1fa74d30-2222-4444-9999-6a1e3c872001",
  "snapshot_date": "2026-06-01",
  "views": 1250,
  "likes": 108,
  "comments": 14,
  "shares": 9,
  "saves": 27,
  "followers_or_subscribers_gained": 12,
  "average_view_duration_seconds": 132.5,
  "watch_time_minutes": 2760.4,
  "notes": "Day 3 lift after sharing in story.",
  "created_at": "2026-06-03T09:15:00Z"
}
```

## tags

Stores reusable tags for the authenticated user.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | Primary key, default gen_random_uuid() |
| user_id | uuid | Not null, references profiles(id) on delete cascade |
| name | text | Not null |
| slug | text | Not null |
| created_at | timestamptz | Not null, default now() |

### Relationships

- Belongs to one profile.
- Has many content items through `content_tags`.

### Indexes

- `tags_user_id_idx` on `user_id`.
- Unique index on `(user_id, slug)`.

### Example Row

```json
{
  "id": "c43c3140-4444-4444-9999-6a1e3c872003",
  "user_id": "8fb30c0b-1111-4444-9999-6a1e3c872000",
  "name": "Productivity",
  "slug": "productivity",
  "created_at": "2026-06-03T09:20:00Z"
}
```

## content_tags

Join table between content items and tags.

| Column | Type | Constraints |
| --- | --- | --- |
| content_item_id | uuid | References content_items(id) on delete cascade |
| tag_id | uuid | References tags(id) on delete cascade |
| created_at | timestamptz | Not null, default now() |

### Relationships

- Belongs to one content item.
- Belongs to one tag.

### Indexes

- Primary key on `(content_item_id, tag_id)`.
- `content_tags_tag_id_idx` on `tag_id`.

### Example Row

```json
{
  "content_item_id": "1fa74d30-2222-4444-9999-6a1e3c872001",
  "tag_id": "c43c3140-4444-4444-9999-6a1e3c872003",
  "created_at": "2026-06-03T09:25:00Z"
}
```

## platform_accounts Optional Future Table

Stores future OAuth account connections. This table is not required for MVP.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | Primary key, default gen_random_uuid() |
| user_id | uuid | Not null, references profiles(id) on delete cascade |
| provider | platform_provider enum | Not null |
| provider_account_id | text | Nullable |
| account_name | text | Nullable |
| scopes | text[] | Nullable |
| access_token_encrypted | text | Nullable, server-only access |
| refresh_token_encrypted | text | Nullable, server-only access |
| token_expires_at | timestamptz | Nullable |
| created_at | timestamptz | Not null, default now() |
| updated_at | timestamptz | Not null, default now() |

### Relationships

- Belongs to one profile.

### Indexes

- `platform_accounts_user_provider_idx` on `(user_id, provider)`.
- Unique index on `(user_id, provider, provider_account_id)` where `provider_account_id` is not null.

### Example Row

```json
{
  "id": "b98f3075-5555-4444-9999-6a1e3c872004",
  "user_id": "8fb30c0b-1111-4444-9999-6a1e3c872000",
  "provider": "youtube",
  "provider_account_id": "UC_example",
  "account_name": "Aarav Creator",
  "scopes": ["youtube.readonly"],
  "access_token_encrypted": null,
  "refresh_token_encrypted": null,
  "token_expires_at": null,
  "created_at": "2026-06-03T09:30:00Z",
  "updated_at": "2026-06-03T09:30:00Z"
}
```
