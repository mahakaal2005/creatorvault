# AI Coding Rules for CreatorVault

These rules are mandatory for Cursor or any AI coding assistant working on CreatorVault.

## Documentation First

- Always read the `/docs` folder before implementation.
- Start with `00-product-brief.md`, `01-prd.md`, `05-technical-design-document.md`, `06-data-model.md`, and `11-implementation-plan.md`.
- Follow the current phase in `11-implementation-plan.md`.
- Maintain a changelog after each meaningful change.

## Scope Control

- Do not add features outside the MVP without explicit approval.
- Do not introduce AI post generation.
- Do not generate LinkedIn posts.
- Do not generate YouTube community posts.
- Do not generate social captions.
- Do not add auto-posting.
- Do not add team collaboration.
- Do not add public portfolio pages.
- Do not add Instagram API integration in MVP.
- Do not require YouTube API integration in MVP.

## Technical Rules

- Use Next.js with TypeScript.
- Use TypeScript strictly.
- Use Tailwind CSS for styling.
- Use shadcn/ui for UI primitives.
- Use Supabase Postgres for storage.
- Use Supabase Auth for private login.
- Use Recharts for charts.
- Use Zod for validation.
- Use React Hook Form for forms.
- Prefer server-side API routes for sensitive operations.
- Do not put secrets in frontend code.
- Do not commit `.env` files.

## Validation Rules

- Do not skip validation.
- Validate forms on the client for user feedback.
- Validate all API inputs on the server with Zod.
- Never trust client-supplied `user_id`.
- Enforce enum compatibility between platform and content type.
- Reject negative metric values.
- Handle duplicate content URLs clearly.
- Handle duplicate snapshot dates clearly.

## Database Rules

- Ask before changing database schema after initial schema approval.
- Use migrations for schema changes.
- Enable Row Level Security on all user-owned tables.
- Write and test RLS policies.
- Keep manual stats snapshots as the MVP source of truth.
- Do not add OAuth token storage unless a future API integration phase is explicitly approved.

## Code Quality Rules

- Keep components small and focused.
- Keep files understandable.
- Avoid unnecessary abstractions.
- Prefer clear names over clever names.
- Keep business logic out of UI components when practical.
- Put analytics calculations in reusable utility functions.
- Put URL parsing in a dedicated utility.
- Keep API error responses consistent.
- Write clean, understandable code.

## UI Rules

- Build the actual private app experience, not a marketing landing page.
- Use work-focused layouts suitable for a personal analytics tool.
- Include empty, loading, and error states.
- Keep mobile layouts usable.
- Use accessible form labels and keyboard-friendly controls.
- Do not add visible feature explanations where normal labels are enough.

## Testing and Verification Rules

- After each phase, run tests and build.
- Add unit tests for URL parsing, validation, and analytics calculations.
- Add integration tests for authenticated API behavior.
- Add database permission tests for RLS.
- Manually test the primary user flow after each phase.
- Do not claim a phase is complete until verification passes or failures are documented.

## Change Management Rules

- Maintain a changelog.
- Keep commits focused by phase or feature.
- Do not silently expand MVP scope.
- Document any accepted deviation from the docs.
- If a requirement seems unclear, ask before implementing.
