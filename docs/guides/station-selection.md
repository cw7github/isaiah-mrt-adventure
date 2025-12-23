# Station Selection UI (Lines/Stations)

The station selection screen is the main “map” UI. It loads ELA/Math content packs and presents stations grouped by “line” (RF/RL/RI/L/Review for ELA; OA/NBT/MD/G/Review for Math).

## Key files

- UI logic: `station-selection.js`
- Styles: `station-selection.css`
- Main app: `index.html`
- Content packs:
  - `content/cpa-grade1-ela/content-pack.v1.json`
  - `content/cpa-grade1-math/content-pack.v1.json`

## How it works

1. `station-selection.js` fetches the active content pack (`CONTENT_PACKS[subject].path`).
2. It merges `contentPack.stations` into the global `stationContent` object.
3. The UI groups stations by `station.line`.
4. Starting a station routes into the lesson engine (`index.html`) using the selected `stationId`.

## Adding / changing lines

Edit `station-selection.js`:
- ELA lines: `ELA_LINE_CONFIG`
- Math lines: `MATH_LINE_CONFIG`
- Pack wiring: `CONTENT_PACKS`

Each station in a pack should set `line` consistently (e.g., `RF`, `RL`, `RI`, `L`, `Review`).

## Debugging tips

In the browser console:

- Confirm packs merged: `Object.keys(stationContent).length`
- Confirm active subject: `stationSelection.currentSubject`
- Confirm load path: `stationSelection.loadedFromPath`

If stations don’t show:
- Check network tab for a failed fetch to the content pack path.
- Validate the JSON pack: `node scripts/validate-content-pack.mjs` or `node scripts/validate-math-content-pack.mjs`.

