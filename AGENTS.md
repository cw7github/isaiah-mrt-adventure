# Agents Guide (Isaiah School)

This repo is a static, kid-facing learning app (ELA + Math) with optional cloud save + TTS. Most behavior lives in a single `index.html`, plus a handful of supporting JS/CSS files and JSON “content packs”.

## Quick Start

- Run locally: `./start.sh` → open `http://localhost:8080`
- Main app entry: `index.html`
- Station UI + content pack loading: `station-selection.js`

## Where Content Lives (Source of Truth)

- **ELA content pack**: `content/cpa-grade1-ela/content-pack.v1.json`
- **Math content pack**: `content/cpa-grade1-math/content-pack.v1.json`
- **Skill practice generator** (auto-generated questions): `index.html` → search `generateSkillPages(` and `skillsCatalog`
- **Content quality bar**: `docs/content-standards.md` (follow this for every story/question/answer edit)

`station-selection.js` loads a content pack and merges stations into the runtime `stationContent` object so the lesson engine can render them.

## Audio / TTS (Current System)

- Runtime entry point: `index.html` → `speak(text, ...)`
- Prebuilt audio assets:
  - `assets/tts/manifest.json`
  - `assets/tts/*.mp3` (hash-based filenames)
- Generator: `node scripts/generate-tts-assets.mjs`
  - Use `--check` to see missing clips without generating.
- Fallbacks:
  - If a clip is missing, the app calls `POST /api/tts` (ElevenLabs) when cloud auth is available.
  - If that’s unavailable, it falls back to browser SpeechSynthesis (the “generic computer voice”).

If you change learner-facing strings (questions, hints, guidance, etc.), re-run `node scripts/generate-tts-assets.mjs --check` to avoid fallback voices.

## Cloud Save (Optional)

- Overview: `docs/firebase-backend.md`
- Serverless endpoints: `api/` (Vercel)
- Firestore rules: `firebase/firestore.rules`

## Progress + Assessment

- Mastery/proficiency model: `index.html` → search `MASTERY MODEL (v2)`
- Parent dashboard: `index.html` → search `showDashboardChildDetail`
- High-level assessment plan doc: `docs/student-assessment-and-adaptive-learning-plan.md` (may include both implemented + future items)

## Common Workflows

### Edit lesson content
1. Edit `content/cpa-grade1-*/content-pack.v1.json`
2. Run validators:
   - `node scripts/validate-content-pack.mjs`
   - `node scripts/validate-math-content-pack.mjs`
3. Verify in browser via `./start.sh`
4. Rebuild TTS assets if text changed: `node scripts/generate-tts-assets.mjs`

### Edit question scaffolds / UI behavior
1. Update logic in `index.html`
2. Sanity-check the inline script compiles (optional but recommended):
   - `node -e "new Function(require('fs').readFileSync('index.html','utf8').split('<script>')[1].split('</script>')[0])"`

## Guardrails (Content + UX)

- Keep **3 choices** for multiple-choice questions.
- Keep **one job per page** (one primary skill/behavior).
- For comprehension questions: the answer must be supported by a **specific sentence** the child can find.
- Avoid trick wording; keep instructions short; autism-friendly tone.
- Don’t “hard gate” evidence tapping unless explicitly desired; scaffolds should help without blocking answering.

## Docs Map

- Start here: `README.md` and `docs/README.md`
- Content authoring: `docs/content-standards.md`
- Voice guidance: `docs/voice-guidance.md`
- Audio/TTS details: `docs/AUDIO_SYSTEM.md`
- Deployment: `docs/guides/deployment.md`
- Firebase/cloud: `docs/firebase-backend.md`
- CPA plans: `docs/cpa-grade1-ela-checklist-plan.md`, `docs/cpa-grade1-math-checklist-plan.md`
