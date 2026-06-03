# Phase 8 QA Checklist

## Automated Checks

- TypeScript compile passes.
- ESLint passes.
- Unit tests cover URL parsing, validation, route protection, analytics, chart data, environment helpers, and tag normalization.
- Production build passes.
- High-severity dependency audit passes.

## Route Smoke Checks

- Passed: signed-out `/dashboard` redirects to `/login?next=/dashboard`.
- Passed: signed-out `/content` redirects to login and preserves query parameters.
- Passed: signed-out `/api/content` returns `401 UNAUTHENTICATED`.
- Passed: signed-out `/api/content/:id/snapshots` returns `401 UNAUTHENTICATED`.
- Passed: signed-out `/api/dashboard/summary` returns `401 UNAUTHENTICATED`.

## Supabase Advisor Review

- Security advisor warning: leaked password protection is disabled in Supabase Auth. Enable before production deployment.
- Performance advisor info: several indexes are currently unused on the fresh database. Keep them for MVP because they support expected future content filtering and snapshot queries.

## UI Review Checklist

- Private app has a keyboard skip link to main content.
- Desktop and mobile navigation landmarks are labeled.
- App shell has a loading skeleton for route transitions.
- App shell has a retryable error boundary.
- Empty states exist for dashboard, content library, snapshot history, and charts.
- Destructive content actions show visible errors when API calls fail.
- Mobile layout uses single-column stacking for forms, cards, chart panels, and dashboard sections.

## Known Follow-Up

- Authenticated browser visual QA should be performed before deployment with a real account and seed content.
- Enable Supabase Auth leaked password protection before production launch.
- The existing moderate Next/PostCSS audit advisory remains until a non-breaking upstream fix is available.
