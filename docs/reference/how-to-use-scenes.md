# How Scenes Work in the App (Current)

The app uses **per-station** background images for read pages. You typically do **not** need to wire images into lesson JSON.

## Runtime behavior

In `index.html`:

- `getStationSceneImage(stationId)` maps station ids → an image path
  - ELA: `assets/station_scenes/<stationId>.(png|jpeg)`
  - Math: `assets/math_station_scenes/<stationId>.(png|jpeg)`
- `showReadingPage(page)` attempts to load the station scene image as a background when the page does **not** provide a math `visual`.

## Adding a new station scene image

1. Pick a stable `stationId` (this is the filename base).
2. Add the image file:
   - ELA: `assets/station_scenes/<stationId>.png` (or `.jpeg`)
   - Math: `assets/math_station_scenes/<stationId>.png` (or `.jpeg`)
3. Ensure the station id prefix matches the current mapping rules in `getStationSceneImage()`.
   - If you add a new naming convention/prefix, update `getStationSceneImage()` accordingly.

## Notes on older “food stations”

Some early storyline stations use ids like `fruit`, `bakery`, etc. These do not currently match the `rf_`/`rl_`/`ri_`/`l_`/`review_` prefixes and therefore won’t auto-load from `assets/station_scenes/` unless you extend the mapping logic.

## Related scene systems

- Elevator door previews: `elevator-door-scenes.md`
- Train scenery backgrounds: `taipei-backgrounds.md`
- Legacy per-page `assets/scenes/` system (deprecated): `../legacy/food-station-scenes/README_SCENES.md`
