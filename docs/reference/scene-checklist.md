# Scene Coverage Checklist (Current)

The app expects a station-scene image to exist for most CPA stations.

## ELA station scenes

Folder: `assets/station_scenes/`

Check coverage:
- Run: `node scripts/generate-station-images.mjs --dry-run`
- Confirm it reports: `Need generation: 0`

## Math station scenes

Folder: `assets/math_station_scenes/`

Check coverage:
- Run: `node scripts/generate-math-station-images.mjs`
- Confirm it reports: `Need generation: 0`

## Elevator door scenes (optional)

Folder: `assets/elevator_scenes/`

Check coverage:
- Verify you have `lobby.jpg` and per-station `*_warmup.jpg` / `*_restaurant.jpg`.
- Regenerate if needed: `node scripts/generate-elevator-scenes.mjs`
