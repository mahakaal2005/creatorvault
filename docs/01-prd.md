# CreatorVault PRD

## Product Overview

CreatorVault is a private web app for a solo creator to preserve a personal archive of published content and track its performance over time. The MVP focuses on YouTube long videos, YouTube Shorts, and Instagram Reels. The user adds a content item by pasting a URL, confirms or edits metadata, adds manual performance snapshots, and reviews trends through library filters, detail pages, charts, and dashboard summaries.

## Goals

- Provide a permanent private archive of published content items.
- Support manual tracking of performance metrics over time.
- Help the creator compare performance across platforms, content types, topics, hooks, and tags.
- Keep the first version small, understandable, and fast to build.
- Design the system so future YouTube API support can be added without changing core data ownership or manual entry flows.

## Non-Goals

- Do not generate LinkedIn posts, YouTube community posts, captions, scripts, or social copy.
- Do not auto-post, schedule, or publish content.
- Do not include team collaboration or shared workspaces.
- Do not include public portfolio pages.
- Do not require YouTube API integration for MVP.
- Do not include Instagram API integration for MVP.
- Do not build a full content calendar, task manager, or CRM.

## User Stories

- As a solo creator, I want to paste a content URL so I can save it quickly.
- As a solo creator, I want the app to detect the platform and content type so I do not have to classify every item from scratch.
- As a solo creator, I want to edit metadata so my archive reflects the way I think about the content.
- As a solo creator, I want to add stats snapshots over time so I can see how content performs after publishing.
- As a solo creator, I want to filter my library so I can find similar content quickly.
- As a solo creator, I want to compare topics and platforms so I can decide what to make next.
- As a solo creator, I want private login so my analytics and notes are not public.

## Functional Requirements

### Authentication

- The system shall require login before app access.
- The system shall associate all content, tags, and snapshots with the authenticated user.
- The system shall prevent one user from reading or modifying another user's records.

### Content Creation

- The user shall be able to paste a URL for a supported content item.
- The system shall attempt to parse and classify the URL.
- The user shall be able to manually correct platform and content type.
- The user shall be able to enter or edit title, thumbnail URL, published date, topic, hook text, hook type, CTA keyword, notes, tags, and status.
- The system shall reject unsupported URLs unless the user manually enters a supported platform and type.

### Content Library

- The user shall be able to view all saved content items.
- The user shall be able to search by title, URL, topic, notes, hook text, and CTA keyword.
- The user shall be able to filter by platform, content type, topic, tag, status, date range, and performance range.
- The user shall be able to sort by published date, created date, latest views, latest engagement rate, and latest snapshot date.

### Content Detail

- The user shall be able to open a content detail page.
- The detail page shall show metadata, tags, notes, link, latest stats, snapshot history, and charts.
- The user shall be able to edit content metadata from the detail page.
- The user shall be able to archive or delete a content item.

### Stats Snapshots

- The user shall be able to add manual stats snapshots.
- A snapshot shall include snapshot date, views, likes, comments, shares, saves, followers or subscribers gained, average view duration, watch time, and notes.
- The system shall support multiple snapshots per content item.
- The system shall show performance changes over time.

### Dashboard

- The dashboard shall show total content count, total latest views, top content, best platform, best topic, and recent uploads.
- The dashboard shall calculate metrics using the latest snapshot per content item unless another rule is specified.
- The dashboard shall include simple charts for performance and distribution.

## Non-Functional Requirements

- The app shall be responsive on mobile, tablet, and desktop.
- The app shall use TypeScript with strict typing.
- The app shall validate input on both client and server boundaries.
- The app shall use accessible UI components and keyboard-friendly controls.
- The app shall load common library and dashboard views quickly for a personal-size dataset.
- The app shall keep private data protected through authentication and database-level access rules.
- The app shall be deployable to a standard Next.js hosting environment with Supabase as the backend service.

## Acceptance Criteria

WHEN the user visits the app without being signed in  
THE SYSTEM SHALL redirect or present the user with a login page.

WHEN the user signs in successfully  
THE SYSTEM SHALL show the dashboard for that user's private data.

WHEN the user pastes a valid YouTube long video URL  
THE SYSTEM SHALL auto-detect platform as YouTube and content type as YouTube Video.

WHEN the user pastes a valid YouTube Shorts URL  
THE SYSTEM SHALL auto-detect platform as YouTube and content type as Short.

WHEN the user pastes a valid Instagram Reel URL  
THE SYSTEM SHALL auto-detect platform as Instagram and content type as Instagram Reel.

WHEN URL detection is uncertain  
THE SYSTEM SHALL allow the user to manually select platform and content type before saving.

WHEN required content fields are missing  
THE SYSTEM SHALL show validation errors and prevent saving until the fields are valid.

WHEN the user saves a content item  
THE SYSTEM SHALL persist the item and make it visible in the content library.

WHEN the user adds a stats snapshot  
THE SYSTEM SHALL associate the snapshot with the selected content item and update detail charts.

WHEN the user filters by platform  
THE SYSTEM SHALL show only matching content items.

WHEN the user filters by topic or tag  
THE SYSTEM SHALL show only content items matching the selected topic or tag.

WHEN the user opens the dashboard  
THE SYSTEM SHALL calculate summary cards from the authenticated user's records only.

WHEN a user attempts to access another user's content item  
THE SYSTEM SHALL deny access.

## MVP Scope

The MVP includes private auth, content URL capture, manual metadata editing, permanent storage, library browsing, filtering, content details, manual stats snapshots, charts, and dashboard summaries.

## V1 Later Scope

- Optional YouTube API integration for metadata and stats refresh.
- Optional scheduled reminder prompts to collect manual snapshots.
- Import or export content data as CSV.
- Richer topic and hook analytics.
- Saved filter views.
- Basic backup and restore workflow.
- Additional platforms after the core workflow proves useful.

## Risks and Constraints

- Instagram metadata and stats are not reliably available without complex API access, so MVP must rely on manual entry.
- YouTube API integration may introduce quotas, OAuth complexity, and secret management risk, so it is deferred.
- URL parsing can be imperfect because platforms have multiple URL formats.
- Dashboard metrics can be misleading if snapshots are stale, so the UI should show latest snapshot dates.
- Scope creep into AI writing, scheduling, and public portfolio features would delay the core tracking product.
