# Quick Start: Generating Ghibli Scene Backgrounds

> Legacy: This doc describes an older per-page `assets/scenes/` approach. For the current per-station scene system, see `../../reference/scenes-quick-start.md`.

For the legacy workflow overview, see `README_SCENES.md`.

## TL;DR

You need **24 Miyazaki/Ghibli-style background images** for Isaiah's reading app.

## Fastest Options

### Option 1: Use ChatGPT Plus (Recommended)
1. Subscribe to ChatGPT Plus (has DALL-E 3)
2. Copy prompts from `SCENE_GENERATION_GUIDE.md`
3. Paste each prompt into ChatGPT
4. Download generated images
5. Save to `assets/scenes/` with correct filenames

### Option 2: Use Bing Image Creator (Free!)
1. Go to https://www.bing.com/create
2. Sign in with Microsoft account
3. Copy prompts from `SCENE_GENERATION_GUIDE.md`
4. Generate and download images
5. Save to `assets/scenes/`

### Option 3: Try Automated Script
```bash
# List all prompts
python3 generate_scenes_openai.py --list

# Try automated generation (may not work with free tier)
python3 generate_scenes_openai.py
```

## What You Need

### 8 Stations × 3 Scenes Each = 24 Images

| Station | Arrival | Exploring | Enjoying |
|---------|---------|-----------|----------|
| Fruit | fruit_arrival.png | fruit_exploring.png | fruit_enjoying.png |
| Drink | drink_arrival.png | drink_exploring.png | drink_enjoying.png |
| Bakery | bakery_arrival.png | bakery_exploring.png | bakery_enjoying.png |
| Pizza | pizza_arrival.png | pizza_exploring.png | pizza_enjoying.png |
| Ice Cream | icecream_arrival.png | icecream_exploring.png | icecream_enjoying.png |
| Fish Shop | fishshop_arrival.png | fishshop_exploring.png | fishshop_enjoying.png |
| Cheese | cheese_arrival.png | cheese_exploring.png | cheese_enjoying.png |
| Noodle | noodle_arrival.png | noodle_exploring.png | noodle_enjoying.png |

## Style Requirements

All images should be:
- ✅ Studio Ghibli/Miyazaki watercolor style
- ✅ Soft pastel colors, warm lighting
- ✅ Whimsical, magical, child-friendly
- ✅ Horizontal landscape (16:9 ratio)
- ❌ NO text or words
- ❌ NO people or characters

## Example Prompt

```
Studio Ghibli style watercolor illustration of a charming outdoor
fruit stand at a train station platform. Wooden crates overflowing
with colorful fruits - red apples, orange oranges, yellow bananas.
Soft warm sunlight filtering through a canvas awning. Whimsical,
magical atmosphere with pastel colors. Horizontal landscape
orientation. No text, no people. Child-friendly and calming aesthetic.
```

## After Generating

1. Save all images to: `assets/scenes/`
2. Follow instructions in `HOW_TO_USE_SCENES.md` to integrate
3. Update the HTML to use backgrounds instead of emojis

## Files Reference

- 📄 **SCENE_GENERATION_GUIDE.md** - Complete prompts for all scenes
- 📄 **HOW_TO_USE_SCENES.md** - How to integrate into the app
- 🐍 **generate_scenes_openai.py** - Automated generation script
- 📁 **assets/scenes/** - Where to save generated images

## Questions?

See the detailed guides:
1. Generation: `SCENE_GENERATION_GUIDE.md`
2. Integration: `HOW_TO_USE_SCENES.md`

---

**Estimated time:**
- Manual (Bing): ~30-60 minutes for all 24 images
- Automated (if it works): ~5-10 minutes
