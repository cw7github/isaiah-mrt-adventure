# Voice Guidance (Auto “What To Do” Prompts)

This app can automatically play short, friendly **audio instructions** when the learner switches screens or lesson cards (read/menu/question). The guidance audio is generated with **ElevenLabs** and played via the existing `speak()` pipeline.

## Where prompts live

- `index.html` contains a single source of truth for guidance strings:
  - `// ===== VOICE GUIDANCE PROMPTS =====`
  - `const guidancePrompts = { ... }`
  - `// ===== END GUIDANCE PROMPTS =====`

Edit the strings in this object to change what gets spoken.

## When guidance plays

- Screen changes: `goToScreen(screenId)` calls `playScreenGuidance(screenId)`
  - `restaurantScreen` is skipped to avoid double narration (lesson-card guidance handles it instead).
- Lesson cards: `showPage()` calls `playLessonGuidanceForPage(page)` (only when `state.currentScreen === 'restaurantScreen'`)

Guidance is debounced and only plays once per unique page instance (to prevent repeating on UI re-renders).

## Preventing overlap (important)

Voice guidance should never keep playing after the learner navigates to a different screen/card.

This repo handles it by:

- Tagging guidance audio: `scheduleGuidancePlayback()` calls `speak(text, 1.0, { kind: 'guidance' })`
- Stopping guidance on navigation:
  - `goToScreen()` calls `stopGuidanceAudioOnNavigation({ fadeMs: 140 })` before switching screens
  - `showPage()` calls `stopGuidanceAudioOnNavigation({ fadeMs: 120 })` before rendering the next card
- `stopGuidanceAudioOnNavigation()` does two things:
  - cancels any pending guidance timers (`cancelGuidancePlayback()`)
  - if the currently-playing audio is guidance, stops it (with a short fade via `stopSpeech({ fadeMs })`)

This keeps guidance prompts “one at a time” and prevents multiple prompts from stacking when learners tap quickly.

## Settings / persistence

- Parent Settings → Sound → **Voice guidance** toggle
  - Stored in progress as `guidanceEnabled`
  - Synced with Firebase cloud progress (so it follows the child profile across devices)

## Pre-generating the audio files (recommended)

Guidance clips should be prebuilt into `assets/tts/` so they play instantly without runtime API calls.

- Generate (local): `node scripts/generate-tts-assets.mjs`
  - Output:
    - `assets/tts/manifest.json`
    - `assets/tts/*.mp3`
  - The generator automatically extracts `guidancePrompts` (using the markers above) and includes every string in the build.

At runtime, `speak()` checks `assets/tts/manifest.json` first, and only falls back to `POST /api/tts` if a clip is missing.

Note: `/api/tts` requires a signed-in parent (Firebase ID token). If the learner isn’t signed in, missing clips will fall back to browser SpeechSynthesis.

## Mobile autoplay note

On iOS Safari, audio can’t start until after a user gesture. The app unlocks audio on the first touch/pointer interaction; after that, guidance and narration can play normally.
