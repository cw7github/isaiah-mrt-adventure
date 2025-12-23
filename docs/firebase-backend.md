# Firebase Backend (Auth + Cloud Save)

This app is a static `index.html` deployed on Vercel, with serverless endpoints in `api/`. Cloud accounts + progress sync are implemented with **Firebase Auth (Google)** and **Firestore**.

## What’s implemented

- Parent signs in with **Google**.
- Parent creates/manages **child profiles** (name + avatar) under the parent account.
- Each child has separate progress (stations completed, words tapped, stickers, settings).
- Progress saves locally first, then **syncs to Firestore** when signed in + a child is selected.
- If local/offline profiles exist on a device, the app can **import local profiles + progress into cloud** on sign-in.
- Basic insights counters are recorded (sessions, question accuracy, station completions) and shown in the in-app Parent Dashboard.
- Parent Dashboard also shows **“Needs practice”** (weakest reading strategies / skills) using the per-child `progress.analytics`.

## Setup (Firebase Console)

1. Create (or choose) a Firebase project.
2. **Authentication → Sign-in method → Google**: enable it.
3. **Authentication → Settings → Authorized domains**: add:
   - `isaiah-mrt-adventure.vercel.app`
   - any other Vercel domains you use (preview URLs if desired)
   - `localhost` (for `vercel dev`)
4. **Firestore Database**: create a database (Production mode is fine).
5. **Firestore Rules**: paste rules from `firebase/firestore.rules`.

## Setup (Vercel environment variables)

The app fetches Firebase “public config” from `api/firebase-config.js` (so the static HTML doesn’t contain project identifiers).

Set these in **Vercel → Project → Settings → Environment Variables**:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_STORAGE_BUCKET` (optional)
- `FIREBASE_MESSAGING_SENDER_ID` (optional)
- `FIREBASE_MEASUREMENT_ID` (optional)

For local development, copy `.env.example` → `.env.local` and fill in the same variables.

## Data model (Firestore)

- `parents/{parentUid}`
  - Parent profile (email/name/photo, timestamps).
- `parents/{parentUid}/children/{childId}`
  - `name`, `avatar`, timestamps
  - `progress` object (stickers, pagesCompleted, completedStations, masteredWords, settings, `updatedAt`, `resetAt`)
  - `stats` counters (sessions, questionsTotal/questionsCorrect, etc.)
- `parents/{parentUid}/children/{childId}/events/{eventId}`
  - Event log (kept intentionally small): session starts, first-attempt question answers, station completions, resets.
  - Each event also includes `expiresAt` (for Firestore TTL retention).

## Local storage keys

- `isaiahProgress` — legacy single-profile progress.
- `isaiahProgress_child_{childId}` — per-child progress (used when a child profile is active).
- `isaiahActiveChildId` — last selected child profile id (for this device).
- `isaiahActiveChildSnapshot` — cached `{ id, name, avatar }` for offline-friendly welcome text.
- `isaiahLegacyProgressMigrated` — internal flag so legacy progress is only copied once into the first child profile you select.
- `isaiahDeviceId` — stable per-device id (used for additive counter merges).
- `isaiahServerTimeOffsetMs` / `isaiahServerTimeOffsetUpdatedAt` — server time offset used to reduce device clock skew.

## Sync behavior

- The app always saves progress locally first.
- When Firebase is configured **and** the parent is signed in **and** a child is selected:
  - local progress is merged with cloud progress (union for words/stations; “newer reset wins” via `resetAt`)
  - additive counters like stickers/pages are merged via per-device counters (`progress.counters.*`) to reduce multi-device loss
  - progress timestamps use server time offset (`GET /api/time`) to reduce clock skew issues across devices
  - merged progress is applied locally
  - cloud sync is debounced (~1.2s) to avoid excessive writes
  - progress also flushes on backgrounding (best-effort) to reduce lost progress on mobile

## Local → cloud import (first sign-in / offline play)

If a parent plays offline first (local child IDs) and later signs in, cloud child doc IDs might not match the existing local IDs.

This repo addresses it by prompting on sign-in:

- Detect local child profiles that are **not present in cloud** and have meaningful progress.
- Offer to import them into Firestore under `parents/{uid}/children/{childId}` **using the same `childId`**.
- Progress keys stay aligned (`isaiahProgress_child_{childId}`), so there’s no brittle ID mapping step.

## Event retention (Firestore TTL)

Events include an `expiresAt` timestamp. To actually delete old event docs automatically, enable Firestore TTL in the Firebase console:

- Firestore → Settings → TTL → add a policy for the `expiresAt` field.

The app sets `expiresAt` to ~180 days after event creation (see `CLOUD_EVENT_TTL_DAYS` in `index.html`).

## Key files

- `api/firebase-config.js` — returns `{ enabled, config }` from env vars.
- `api/time.js` — returns `{ nowMs }` (server time) to mitigate clock skew for multi-device merges.
- `index.html` — Firebase loader, Google auth, profiles UI, cloud sync + events.
- `firebase/firestore.rules` — recommended Firestore security rules.

## Assessment + mastery (current + next)

The current implementation syncs:
- `progress` (stations, counters, settings)
- lightweight `analytics`
- `progress.mastery` (per-skill BKT + forgetting state, plus bounded attempt history)

Next steps (teacher-grade reporting):
- checklist-aligned views (CPA “I Can” items mapped to mastery)
- optional teacher goals/assignments (`progress.goals`, `progress.assignments`)
- richer review routing (a dedicated `reviewQueue` if needed; today review uses per-skill `dueAt`)

Plan: `docs/student-assessment-and-adaptive-learning-plan.md`

## Troubleshooting

- **“Cloud save: not configured”**: confirm the `FIREBASE_*` env vars are set (Vercel + local).
- **Google sign-in not working on mobile**: popups are often blocked on iOS; the app falls back to redirect sign-in. Ensure the Vercel domain is listed under Firebase Authorized Domains.
- **No children show up**: create one in Settings → Account & Cloud Save → Choose → Add a child.
