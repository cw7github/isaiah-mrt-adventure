# Visual Scenes / Background Art

This repo supports generating and managing background images for stations, elevator scenes, and other UI elements.

## Common asset folders

- Station scenes (ELA/Math “line” artwork): `assets/station_scenes/`
- Math station scenes: `assets/math_station_scenes/`
- Elevator door scenes: `assets/elevator_scenes/`
- Train scenery scenes: `assets/train_scenes/` and `assets/taipei_*.svg`
- Pre-generated TTS audio (not images): `assets/tts/`

## How to generate/update scenes

There are two paths:

1. Manual generation (prompt-based)
2. Scripted generation (Node/Python helpers in `scripts/` and top-level generators)

Start with these references:
- Station + math scene generation: `../reference/scenes-quick-start.md`, `../reference/scene-generation-guide.md`
- Runtime integration notes: `../reference/how-to-use-scenes.md`
- Coverage checklist: `../reference/scene-checklist.md`
- Elevator door scenes: `../reference/elevator-door-scenes.md`
- Train scene backgrounds: `../reference/taipei-backgrounds.md`
- Legacy (deprecated) food-station per-page backgrounds: `../legacy/food-station-scenes/README_SCENES.md`

## Notes

- Keep images text-free (no embedded words).
- Prefer calm, bright, kid-friendly compositions.
- Use consistent aspect ratios per UI surface (station cards vs backgrounds vs elevator doors).
