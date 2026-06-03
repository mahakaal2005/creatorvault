# Analytics and Metrics Spec

## Metrics Tracked

CreatorVault stores manual snapshot metrics at a specific date for each content item:

- Views.
- Likes.
- Comments.
- Shares.
- Saves.
- Followers or subscribers gained.
- Average view duration in seconds.
- Watch time in minutes.
- Snapshot notes.

## Derived Metrics

Derived metrics are calculated from the latest available snapshot unless a chart or trend explicitly uses multiple snapshots.

### Engagement Count

```text
engagement_count = likes + comments + shares + saves
```

Missing values should be treated as zero for calculations, but the UI should avoid implying that a missing value was manually recorded as zero.

### Engagement Rate

```text
engagement_rate = engagement_count / views
```

If views are missing or zero, engagement rate should be null and displayed as unavailable.

### Growth Velocity

```text
growth_velocity = (latest_views - previous_views) / days_between_snapshots
```

Growth velocity should be calculated only when at least two snapshots with views exist.

### View Delta

```text
view_delta = latest_views - previous_views
```

### Follower or Subscriber Growth

Use `followers_or_subscribers_gained` from snapshots. For mixed platforms, label the metric as audience gained.

## Dashboard Cards

### Total Content

Count active content items owned by the user. Archived content can be excluded by default and included through filters later.

### Total Views

Sum the latest snapshot `views` value for each active content item.

### Top Content

Default logic:

1. Use latest snapshot per content item.
2. Rank by latest views descending.
3. Break ties by engagement rate descending.
4. Break remaining ties by published date descending.

### Best Platform

Default logic:

1. Group active content by platform.
2. Sum latest views per platform.
3. Select the platform with the highest total latest views.
4. Show item count and average engagement rate as supporting context.

### Best Topic

Default logic:

1. Group active content by normalized topic.
2. Exclude blank topics.
3. Sum latest views per topic.
4. Select the topic with the highest total latest views.
5. Show item count and average engagement rate as supporting context.

### Recent Uploads

Show active content ordered by `published_at desc`, falling back to `created_at desc` when `published_at` is missing.

## Best-Performing Content Logic

The MVP should support three ranking modes:

- Most views: latest views descending.
- Highest engagement rate: engagement rate descending with a minimum views threshold.
- Fastest growth: growth velocity descending when at least two snapshots exist.

Default dashboard top content should use most views because it is easiest to understand.

## Topic Performance Logic

Topic performance should normalize by trimming whitespace and comparing case-insensitively. MVP can store topic as text and calculate grouping at query time. Later versions may introduce a dedicated topics table if topic management becomes important.

Topic summary fields:

- Topic name.
- Content count.
- Total latest views.
- Average latest views.
- Average engagement rate.
- Best content item.

## Platform Performance Logic

Platform summary fields:

- Platform.
- Content count.
- Total latest views.
- Average latest views.
- Average engagement rate.
- Top content item.

For content type comparison, group by `content_type` rather than `platform`.

## Snapshot Schedule Recommendation

Recommended manual snapshot schedule:

- Day 0: Record launch-day baseline after publishing.
- Day 1: Capture first full-day performance.
- Day 3: Capture early trend and platform distribution effects.
- Day 7: Capture first-week performance.
- Day 14: Capture medium-term momentum.
- Day 30: Capture long-tail performance.

The MVP does not need automated reminders, but UI copy can reference this schedule in the snapshot area or settings.

## Chart Requirements

### Content Detail Charts

- Views over time.
- Engagement count over time.
- Engagement rate over time.
- Audience gained over time when data exists.

### Dashboard Charts

- Platform performance bar chart.
- Topic performance bar chart.
- Content type distribution chart.
- Recent snapshot trend if enough data exists.

## Handling Missing Data

- Missing metric values should remain null in storage.
- Calculations may coalesce null to zero only when the formula requires additive behavior.
- UI should show unavailable when the denominator is missing or zero.
- Dashboard should show latest snapshot date or freshness status to avoid stale interpretation.
