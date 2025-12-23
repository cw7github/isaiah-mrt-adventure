# Quick Start: Station Scene Images (Current)

The app displays **one background scene per station** on read pages (and shows math visuals when present). Scene images are keyed by `stationId`.

## Where images live

- ELA station scenes: `assets/station_scenes/<stationId>.png` (or `.jpeg`)
- Math station scenes: `assets/math_station_scenes/<stationId>.png` (or `.jpeg`)
- Elevator door scenes: `assets/elevator_scenes/*` (see `elevator-door-scenes.md`)
- Train scenery SVGs: `assets/taipei_*.svg` (see `taipei-backgrounds.md`)

## Generate / regenerate scenes

Prereq: set `OPENROUTER_API_KEY` in `.env.local` or your shell environment.

### ELA station scenes

- Generate missing: `node scripts/generate-station-images.mjs`
- Preview what would generate (no API calls): `node scripts/generate-station-images.mjs --dry-run`
- Regenerate everything: `node scripts/generate-station-images.mjs --force`
- Only one station: `node scripts/generate-station-images.mjs --station=rf_f1_print_concepts`

### Math station scenes

- Generate missing: `node scripts/generate-math-station-images.mjs`
- Only one station: `node scripts/generate-math-station-images.mjs --station=oa_counting_up_down`

### Elevator door scenes

- Generate missing: `node scripts/generate-elevator-scenes.mjs`
- Overwrite existing: `node scripts/generate-elevator-scenes.mjs --force`

## Quick checks

- ELA: run `node scripts/generate-station-images.mjs --dry-run` and confirm it prints `Need generation: 0`
- Math: run `node scripts/generate-math-station-images.mjs` and confirm it prints `Need generation: 0`

Next: see `scene-generation-guide.md` and `how-to-use-scenes.md`.
