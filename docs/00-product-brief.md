# CreatorVault Product Brief

## One-Line Product Definition

CreatorVault is a private content portfolio and performance tracker for a solo creator who wants to save published content links, metadata, stats snapshots, and insights in one permanent library.

## Problem Statement

Solo creators often publish across YouTube and Instagram, then lose track of what they made, why it worked, how it performed over time, and which topics or hooks deserve repeating. Platform dashboards are fragmented, time-limited, and optimized for platform reporting rather than a creator's personal long-term learning system.

## Target User

The MVP is built for one private user: a solo student creator who publishes YouTube long videos, YouTube Shorts, and Instagram Reels and wants a simple personal system for tracking content performance manually.

## Why This Product Exists

CreatorVault exists to help a creator build a durable memory of their content work. It turns scattered links, notes, metrics, hooks, CTAs, and topics into a searchable personal archive that supports better creative decisions over time.

## MVP Summary

The MVP allows the user to:

- Add content by pasting a published URL.
- Auto-detect platform and content type when possible.
- Manually correct platform, type, metadata, topic, hook, CTA, and notes.
- Store content items permanently in Supabase Postgres.
- Browse, search, sort, and filter a private content library.
- Open a content detail page.
- Add manual stats snapshots over time.
- View performance history charts.
- See a dashboard with total content, total views, top content, best platform, best topic, and recent uploads.

## Non-Goals

The MVP will not include:

- AI-generated LinkedIn posts.
- AI-generated YouTube community posts.
- Social caption generation.
- Auto-posting or scheduling.
- Team collaboration.
- Public portfolio pages.
- Instagram API integration.
- Required YouTube API integration.
- Multi-user creator workspaces beyond a single private account model.
- Revenue tracking, sponsorship tracking, or content planning calendars.

## Success Criteria

- The creator can save a YouTube video, YouTube Short, or Instagram Reel in under one minute.
- The creator can manually add and update stats snapshots without API integration.
- The creator can find saved content by platform, content type, topic, tag, date, and performance.
- The dashboard gives a useful snapshot of content output and performance.
- The app remains private by default through Supabase Auth and Row Level Security.
- The MVP stays small enough to build quickly without expanding into publishing, AI generation, or collaboration.
