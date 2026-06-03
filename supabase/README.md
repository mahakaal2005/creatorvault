# Supabase Setup

Phase 2 expects a hosted Supabase project or a local Supabase CLI project.

## Required Environment Variables

Create `.env.local` in the app root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a legacy fallback while setting up older Supabase projects.

## Apply Migrations

With the Supabase CLI linked to your project:

```bash
supabase db push
```

The initial migration creates the CreatorVault tables, indexes, profile trigger, updated-at trigger, and Row Level Security policies.

## Auth Configuration

Enable email/password auth in the Supabase dashboard. If email confirmation is enabled, new accounts must confirm email before the first successful sign-in.
