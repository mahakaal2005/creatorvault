# CreatorVault

CreatorVault is a private content portfolio and analytics tracker for a solo creator. It stores YouTube long videos, YouTube Shorts, and Instagram Reels, then lets the creator track metadata, topics, hooks, CTAs, notes, manual stats snapshots, charts, and dashboard summaries.

## Getting Started

Create a local environment file:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run check
npm run build
```

## Production

- GitHub: `https://github.com/mahakaal2005/creatorvault`
- Vercel: `https://creatorvault-eight.vercel.app`
- Supabase project ref: `lcfczbtdibwtzgirorls`

Production Supabase Auth settings should include:

- Site URL: `https://creatorvault-eight.vercel.app`
- Redirect URL: `https://creatorvault-eight.vercel.app/**`
- Local redirect URL: `http://localhost:3000/**`

Leaked password protection is accepted as disabled for the free-plan MVP because it is a paid-plan Supabase Auth hardening feature for this project.

## Documentation

The product, technical, testing, security, deployment, and production handoff docs live in `docs/`.
