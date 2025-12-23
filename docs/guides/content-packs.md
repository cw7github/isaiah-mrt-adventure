# Content Packs (ELA + Math)

The lesson content lives in JSON “content packs” and is loaded at runtime by `station-selection.js`.

## Where the content lives

- ELA: `content/cpa-grade1-ela/content-pack.v1.json`
- Math: `content/cpa-grade1-math/content-pack.v1.json`
- Schema/reference:
  - ELA: `content/cpa-grade1-ela/SCHEMA.md`
  - Content quality bar: `../content-standards.md`

## How the app loads packs

`station-selection.js` fetches the active pack and merges its `stations` into the global `stationContent` object used by the lesson engine in `index.html`.

That means:
- Editing the JSON updates the app immediately (no rebuild step).
- The lesson engine still reads `stationContent[stationId]` + `pages`.

## Authoring workflow

1. Edit the JSON pack (keep “one job per page”, 3-choice discipline, evidence-first).
2. Validate:
   - ELA: `node scripts/validate-content-pack.mjs`
   - Math: `node scripts/validate-math-content-pack.mjs`
3. Run locally: `./start.sh`
4. If you changed learner-facing text, check TTS coverage:
   - `node scripts/generate-tts-assets.mjs --check`

## “Skill IDs” for assessment (recommended)

For accurate mastery + teacher reporting, scored pages should eventually include:
- `skillId` (one primary atomic skill for the page)
- `itemId` (stable unique id for deduping/analytics)
- optional `difficulty`

See: `../student-assessment-and-adaptive-learning-plan.md`
