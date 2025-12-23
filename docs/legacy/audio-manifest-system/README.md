# Legacy: Audio Manifest System (`assets/audio/ela/`)

This folder archives the earlier “audio manifest” approach:

- Extract strings from a content pack → `content/cpa-grade1-ela/audio-manifest.json`
- Generate audio into `assets/audio/ela/`
- Play via `lib/audio-player.js` + `lib/ela-audio-helper.js`

The current app runtime uses a different pipeline:

- Prebuilt clips: `assets/tts/manifest.json` + `assets/tts/*.mp3`
- Runtime playback: `index.html` → `speak()`

Current docs:
- `docs/AUDIO_SYSTEM.md`
- `docs/voice-guidance.md`

