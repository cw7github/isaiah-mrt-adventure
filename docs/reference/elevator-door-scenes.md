# Elevator Door Reveal Scenes

The elevator screen has a “door window” that shows a destination preview image behind the doors.

For each station, there are two images:

- **Warm-Up room** (floor 2)
- **Restaurant** (floor 3)

These are used by `setElevatorDoorScene()` in `index.html`.

## Where the images live

- `assets/elevator_scenes/lobby.jpg`
- `assets/elevator_scenes/<stationId>_warmup.jpg`
- `assets/elevator_scenes/<stationId>_restaurant.jpg`

Station IDs: `fruit`, `drink`, `bakery`, `pizza`, `icecream`, `fishshop`, `cheese`, `noodle`.

## How to regenerate images (OpenRouter “Nano Banana Pro”)

This repo includes a generator script:

- `node scripts/generate-elevator-scenes.mjs`

Environment variables:

- `OPENROUTER_API_KEY` (required)
- `OPENROUTER_IMAGE_MODEL` (optional, default: `google/gemini-3-pro-image-preview`)
- `OPENROUTER_IMAGE_ASPECT` (optional, default: `Landscape 4:3 aspect ratio`) – prompt hint to reduce cropping
- `OPENROUTER_IMAGE_SIZE` (optional, default: `1400`) – max dimension (prevents downscaling)
- `OPENROUTER_IMAGE_QUALITY` (optional, default: `84`) – JPEG quality

Notes:

- On macOS the script uses `sips` to resize + convert the returned PNG into a smaller JPEG.
- The prompts ask for **no text** and a consistent “POV from inside an elevator” style so the door opening feels coherent.
- To overwrite existing images, run: `node scripts/generate-elevator-scenes.mjs --force`
