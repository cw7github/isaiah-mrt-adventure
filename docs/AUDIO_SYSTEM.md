# Audio / TTS System (Current)

This app uses ElevenLabs for high-quality narration (Angela voice by default), with word-level timestamps for word highlighting.

The goal is: **no “generic computer voice”** in normal play.

## Runtime pipeline (`speak()`)

All narration goes through `index.html` → `speak(text, playbackRate, options)`:

1. **Prebuilt clip** (preferred)
   - Looks up `text.toLowerCase().trim()` in `assets/tts/manifest.json`
   - Plays `assets/tts/<sha256>.mp3` with optional word timings
2. **On-demand clip** (optional)
   - Calls `POST /api/tts` (ElevenLabs) when available
   - Requires `ELEVENLABS_API_KEY` and (by default) a signed-in parent (Firebase ID token)
3. **Fallback**
   - Uses browser SpeechSynthesis (this is the “computer voice”)

If you want consistent Angela voice **even when not signed in**, you must rely on **prebuilt clips**.

## Prebuilt assets (`assets/tts/`)

- Manifest: `assets/tts/manifest.json`
- Audio files: `assets/tts/*.mp3` (hash filenames)
- Each entry includes:
  - original `text`
  - `file` path
  - `mimeType` / output format
  - optional `wordTimings` for word highlighting

### Generate / update prebuilt assets

```bash
# Verify what’s missing (no API calls)
node scripts/generate-tts-assets.mjs --check

# Generate missing clips (requires ELEVENLABS_API_KEY)
node scripts/generate-tts-assets.mjs
```

Environment variables (supported by both the generator + `/api/tts`):
- `ELEVENLABS_API_KEY` (required to generate)
- `ELEVENLABS_VOICE_ID` (defaults to Angela)
- `ELEVENLABS_MODEL_ID` (defaults to `eleven_v3`)
- `ELEVENLABS_OUTPUT_FORMAT` (defaults to `mp3_44100_128`)

## What the generator includes

`scripts/generate-tts-assets.mjs` collects all learner-facing text that the app may speak, including:

- ELA + Math content packs: `content/cpa-grade1-ela/content-pack.v1.json`, `content/cpa-grade1-math/content-pack.v1.json`
- Built-in stations in `index.html` (`stationContent`)
- Skill-practice generated pages (`generateSkillPages()`)
- Voice guidance prompts (`guidancePrompts` in `index.html`)
- Common UI strings used by scaffolds/feedback (e.g., “Try again…”, hint ladder prompts)
- Dynamic templates that would otherwise cause fallback (e.g., `All aboard! Next stop: {Station Name}.`)

## Voice guidance

Auto “what to do” prompts are defined in `index.html` under:
- `// ===== VOICE GUIDANCE PROMPTS =====`

See: `docs/voice-guidance.md`

## Word highlighting

ElevenLabs “with timestamps” returns character-level alignment which is converted to word timings and stored in the prebuilt manifest.

Related docs:
- `docs/elevenlabs-tts-word-timestamps.md`
- `docs/audio-word-highlight-sync.md`

## Common issues

### I hear a generic computer voice

That means `speak()` did not find a prebuilt clip and could not (or did not) use `/api/tts`.

Fix:
1. Run `node scripts/generate-tts-assets.mjs --check`
2. Generate missing clips: `node scripts/generate-tts-assets.mjs`
3. Avoid small text mismatches (extra spaces/newlines/punctuation/emoji) because the cache key is exact: `text.toLowerCase().trim()`

### Mobile audio won’t autoplay

iOS Safari requires a user gesture before audio can start. The app unlocks audio on first interaction.

See: `docs/mobile-audio-playback.md`

