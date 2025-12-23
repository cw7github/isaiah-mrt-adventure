# Mobile Audio Playback (iOS Safari)

## Symptom

On iOS Safari (and some in-app browsers), tapping **Read to Me** can appear to do nothing: no narration plays.

## Root cause

iOS requires audio playback to be **unlocked by a user gesture**:

- `AudioContext.resume()` must be **initiated from a direct user action** (tap/click).
- If you only call `resume()` later (after an `await fetch(...)`, timers, etc.), the context may stay `suspended` and audio never starts.
- Awaiting `resume()` from a non-gesture context can also hang the app’s audio pipeline.

## What this repo does

- `unlockAudioContext()` (see `index.html`) is called from user-driven events and also attached to the first touch/pointer interaction on page load.
- It:
  - creates the `AudioContext` if needed
  - kicks off `ctx.resume()` **without awaiting**
  - stores the `resume()` promise (`audioResumePromise`) so later code can await the *gesture-initiated* resume (instead of calling `resume()` again outside a gesture)
  - starts a tiny silent buffer once to “unlock” audio output on iOS
- `ensureAudioContextReady()` prefers awaiting `audioResumePromise` and uses a conservative timeout so we don’t hang forever.
- Some mobile browsers also require an `<audio>` element to be unlocked; we play a tiny silent WAV once to unlock HTMLAudioElement playback.
- If WebAudio playback still fails, `speak()` falls back to **HTMLAudioElement** playback (still using the ElevenLabs audio). It only falls back to `SpeechSynthesis` if both audio paths fail.

## Rule of thumb

If you add new UI that calls `speak(...)`:

- Make sure it’s triggered by a user gesture (tap/click), or call `unlockAudioContext()` in that handler before any `await`.
