# Scene Generation Guide (Current)

This repo generates **per-station** background images that the app loads automatically.

## Style constraints (important)

- No text in images
- No people/characters
- Calm, kid-friendly compositions
- Horizontal/landscape orientation
- Consistent “Ghibli watercolor” look across stations

## ELA station scenes (`assets/station_scenes/`)

- Generator: `node scripts/generate-station-images.mjs`
- Prompts live in: `scripts/generate-station-images.mjs` → `STATION_SCENES`
- Station list is derived from: `content/cpa-grade1-ela/content-pack.v1.json`

Useful flags:
- `--dry-run` prints prompts and counts missing images
- `--force` regenerates even if files exist
- `--station=<substring>` filters station ids

## Math station scenes (`assets/math_station_scenes/`)

- Generator: `node scripts/generate-math-station-images.mjs`
- Prompts live in: `scripts/generate-math-station-images.mjs` → `MATH_STATION_SCENES`
- (Optional) filter: `--station=<substring>`

## Elevator door scenes (`assets/elevator_scenes/`)

- Generator: `node scripts/generate-elevator-scenes.mjs`
- Details: `elevator-door-scenes.md`

## Environment variables

Required:
- `OPENROUTER_API_KEY`

Optional (varies by script):
- `OPENROUTER_IMAGE_MODEL`
- `OPENROUTER_IMAGE_ASPECT`
- `OPENROUTER_IMAGE_SIZE`
- `OPENROUTER_IMAGE_QUALITY`

## Editing prompts safely

When you update prompts:
1. Keep the **same filename convention** (`<stationId>.<ext>`) so the app can find the image.
2. Preserve “no text” and “no people” constraints.
3. Prefer small, incremental prompt tweaks to keep the art style consistent.
