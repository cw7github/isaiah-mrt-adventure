# Audio / Word Highlight Sync

## Why the highlight drifted

The old `playFullSentence()` implementation highlighted words by dividing the total audio duration by the number of words and stepping through them with `setInterval`.

That drifts because:

- Words have different spoken lengths (e.g., “I” vs “chopsticks”).
- Punctuation creates real pauses in the audio, but the UI treated every word equally.
- `setInterval` / `setTimeout` timing drifts relative to the audio hardware clock.
- On iOS, `AudioContext` can be `suspended`; if you don’t wait for `resume()`, audio can start late while the highlight starts “on time”.

## What we do in this repo now

The “Read to Me” path is now driven off the **audio clock** instead of wall-clock timers, and prefers **real word timestamps** when available.

- `api/tts.js` uses **ElevenLabs** `.../with-timestamps` and returns `{ audio, wordTimings }` (see `docs/elevenlabs-tts-word-timestamps.md`).
- `playTtsAudio()` schedules playback slightly in the future (`startTime = ctx.currentTime + …`) and returns `startTime` + `duration`.
- When requested (`{ analyze: true }`), it also analyzes the decoded samples to estimate:
  - `leadingSilenceMs` / `trailingSilenceMs`
  - `silenceSegmentsMs` (used by the heuristic fallback)
  - `timingOffsetMs` (small shift to compensate MP3 padding/encoder delay on some devices)
- Highlight timing uses the WebAudio output clock when possible (`AudioContext.getOutputTimestamp()`), with a fallback to `outputLatency`/`baseLatency` (and a small default delay when unavailable), to avoid the UI running ahead of what the learner hears.
- `playFullSentence()` uses word timestamps (`wordTimings.startMs[]`) when present, otherwise falls back to a heuristic per-word timeline built from audio energy.

In the heuristic fallback, `playFullSentence()` treats long silent gaps as pauses (so multi-sentence prompts don’t slowly drift), and it also tries to snap `. ! ?` boundaries to the strongest detected pauses.

With real timestamps this can be extremely close, but it may still not be mathematically perfect on every device (output latency differences, MP3 padding, alignment edge cases).

## How to do this “properly” (frame-perfect karaoke sync)

This repo now does the “proper” thing by using **word-level timestamps from the speech engine** (ElevenLabs). See `docs/elevenlabs-tts-word-timestamps.md`.

Recommended options:

- Use a TTS provider that returns timepoints for SSML marks / word boundaries (e.g., Google Cloud Text-to-Speech SSML `<mark>` timepoints, Amazon Polly Speech Marks, Azure Speech word boundary events).
- Or do forced-alignment / speech-to-text with `wordTimeOffsets` on the generated audio server-side and return those timestamps.

Then the UI is straightforward:

1. Request audio + timestamps: `{ text } → { audio, mimeType, wordStartMs[] }`
2. Schedule audio with a known `startTime`.
3. On each animation frame, compute `elapsedMs` from the same `AudioContext` clock and highlight the word whose time window contains `elapsedMs`.

## Practical rules of thumb

- Always schedule audio with a known `startTime` (`source.start(ctx.currentTime + smallLead)`), then sync UI from that same clock.
- Don’t use `setInterval` for sync; prefer `AudioContext.currentTime` + `requestAnimationFrame`.
- If you change `playbackRate`, scale all timestamps by `1 / playbackRate`.
