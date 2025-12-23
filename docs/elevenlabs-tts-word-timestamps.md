# ElevenLabs TTS (Word Timestamps)

This app uses **ElevenLabs** narration so the UI can highlight words in sync with the spoken audio.

## Setup (env vars)

The serverless endpoint `api/tts.js` requires:

- `ELEVENLABS_API_KEY` (required)
 - `FIREBASE_PROJECT_ID` (required for Firebase ID-token verification)

Optional:

- `ELEVENLABS_VOICE_ID` (defaults to `lqydY2xVUkg9cEIFmFMU` – “Angela”, clear educational US voice)
- `ELEVENLABS_MODEL_ID` (defaults to `eleven_v3`)
- `ELEVENLABS_OUTPUT_FORMAT` (optional, e.g. `mp3_44100_128` or `pcm_24000`)

Set these in Vercel project environment variables (recommended for deploy) or your local environment.

## Security / quota protection (important)

`POST /api/tts` is locked down to prevent ElevenLabs quota abuse:

- Requires `Authorization: Bearer <Firebase ID token>` (a signed-in parent via Google auth).
- Enforces an Origin allowlist (`TTS_ALLOWED_ORIGINS` or `TTS_ALLOWED_ORIGIN_REGEX`).
- Best-effort per-user rate limiting and warm-instance caching.

If a request is blocked or the learner isn’t signed in, the client falls back to prebuilt clips (if available) or browser SpeechSynthesis.

## What the API returns

`POST /api/tts` → JSON:

- `audio`: base64 audio (default output is MP3 unless `ELEVENLABS_OUTPUT_FORMAT` is set)
- `mimeType`: mime type the client should decode/play
- `wordTimings`: `{ words[], startMs[], endMs[] }` derived from ElevenLabs alignment

## How word timings are computed

ElevenLabs `with-timestamps` returns **character-level** alignment:

- `alignment.characters[]`
- `alignment.character_start_times_seconds[]`
- `alignment.character_end_times_seconds[]`

In `api/tts.js`, we convert characters → words by:

1. Group consecutive non-whitespace characters into a “word” (punctuation stays attached, e.g. `pizzas.`).
2. Word start = start time of the first character in that group.
3. Word end = end time of the last character in that group.
4. Convert seconds → milliseconds and enforce monotonic ordering.

This matches how the UI tokenizes sentences (`page.words` is whitespace-separated tokens with punctuation attached).

## How the UI stays in sync

The client highlights words using the **audio hardware clock** rather than `setTimeout`:

- `playTtsAudio()` schedules WebAudio playback at a known `startTime`.
- `playFullSentence()` uses `result.wordTimings.startMs[]` to decide which word is “current”.
- Highlight progress is driven by `AudioContext.getOutputTimestamp()` when available, otherwise by `AudioContext.currentTime` + an output-latency estimate.

### MP3 padding / leading silence

Some devices introduce a small constant offset (encoder delay / padding) between:

- the decoded audio samples, and
- the timestamp alignment.

When `{ analyze: true }` is used, `playTtsAudio()` estimates leading silence from the decoded audio and computes a small `timingOffsetMs` to shift the word timings into better alignment.

## Optional: pre-generate audio files (no runtime API calls)

If you want the app to run without hitting ElevenLabs at runtime, you can generate a static cache:

- Run: `node scripts/generate-tts-assets.mjs`
- Output:
  - `assets/tts/manifest.json`
  - `assets/tts/*.mp3`

The generator includes:

- Station `read` sentences (and all `variants`)
- Individual words (so tapping a word is instant)
- Question passages (`page.passage`) for the “Reading Passage → Read” button
- Dynamically generated sight-word check passages (the `____` blank pages inserted after the first appearance of a focus sight word)

At runtime, `speak()` checks `assets/tts/manifest.json` first and plays the prebuilt MP3 if present; it only falls back to `/api/tts` when the manifest is missing or doesn’t contain the requested text.

## Is “perfect” sync possible?

This is the highest-fidelity approach available without doing forced alignment yourself.

In practice it can be extremely close, but it still may not be mathematically perfect on every device because of:

- audio output latency differences by browser/device
- MP3 encoder delay/padding (partially compensated)
- small inaccuracies in the provider’s alignment for fast/blurred phonemes

If a sentence ever fails to match (word count/tokenization mismatch), the app falls back to the heuristic sync described in `docs/audio-word-highlight-sync.md`.
