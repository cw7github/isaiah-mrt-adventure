# Ghibli Scene Backgrounds for Isaiah's MRT Food Adventure

## Project Summary

This project provides everything needed to generate and integrate 24 unique Miyazaki/Ghibli-style background images for Isaiah's reading app. Each of the 8 food stations has 3 beautiful watercolor scenes that create an immersive, calming reading experience.

## Files Created

### 📘 Documentation

1. **QUICK_START.md** - Start here! Quick overview and fastest paths to generate images
2. **SCENE_GENERATION_GUIDE.md** - Complete prompts for all 24 scenes with detailed style guidelines
3. **HOW_TO_USE_SCENES.md** - Step-by-step integration guide for the HTML app
4. **README_SCENES.md** - This file - project overview

### 💻 Code Files

5. **generate_scenes_openai.py** - Python script for automated image generation (experimental)
6. **generate_scenes.js** - Node.js alternative for image generation
7. **EXAMPLE_STATION_WITH_SCENES.js** - Code example showing before/after integration

### 📁 Directories

8. **assets/scenes/** - Directory where generated images should be saved (currently empty)

## Quick Overview

### What You're Creating

24 Studio Ghibli-style watercolor backgrounds for:
- 🍎 Fruit Stand (3 scenes)
- 🥤 Drink Bar (3 scenes)
- 🧁 Bakery (3 scenes)
- 🍕 Pizza Place (3 scenes)
- 🍦 Ice Cream Shop (3 scenes)
- 🐟 Fish Shop (3 scenes)
- 🧀 Cheese Shop (3 scenes)
- 🍜 Noodle House (3 scenes)

### Scene Types

Each station has 3 scene types:

1. **Arrival** - Entrance/exterior when first arriving
2. **Exploring** - Interior showing food displays
3. **Enjoying** - Close-up of food service area

## Workflow

### Step 1: Generate Images (Choose One Method)

#### Method A: Bing Image Creator (Free & Easy) ⭐ RECOMMENDED
1. Go to https://www.bing.com/create
2. Copy prompts from `SCENE_GENERATION_GUIDE.md`
3. Generate each image (takes ~1 minute per image)
4. Download and save to `assets/scenes/`

**Time:** 30-60 minutes for all 24 images

#### Method B: ChatGPT Plus (Paid)
1. Use ChatGPT Plus (has DALL-E 3)
2. Paste prompts from `SCENE_GENERATION_GUIDE.md`
3. Download generated images
4. Save to `assets/scenes/`

**Time:** 20-40 minutes for all 24 images

#### Method C: Automated Script (Experimental)
```bash
# See all prompts
python3 generate_scenes_openai.py --list

# Try automated generation
python3 generate_scenes_openai.py
```

**Note:** May not work with free API tiers

### Step 2: Verify Images

Check that each image:
- ✅ Has Ghibli/Miyazaki watercolor style
- ✅ Uses soft pastel colors
- ✅ Is landscape/horizontal orientation
- ✅ Contains NO text or words
- ✅ Contains NO people or characters
- ✅ Is saved with correct filename

### Step 3: Integrate into App

Follow the detailed guide in `HOW_TO_USE_SCENES.md`:

1. Update `showReadingPage()` function to handle backgrounds
2. Add CSS for background image display
3. Update each station's `pages` array with new image paths
4. Add `backgroundImage: true` flag to scene pages
5. Test in browser

See `EXAMPLE_STATION_WITH_SCENES.js` for code examples.

## File Naming Convention

All files must be named exactly as specified:

```
assets/scenes/
├── fruit_arrival.png
├── fruit_exploring.png
├── fruit_enjoying.png
├── drink_arrival.png
├── drink_exploring.png
├── drink_enjoying.png
├── bakery_arrival.png
├── bakery_exploring.png
├── bakery_enjoying.png
├── pizza_arrival.png
├── pizza_exploring.png
├── pizza_enjoying.png
├── icecream_arrival.png
├── icecream_exploring.png
├── icecream_enjoying.png
├── fishshop_arrival.png
├── fishshop_exploring.png
├── fishshop_enjoying.png
├── cheese_arrival.png
├── cheese_exploring.png
├── cheese_enjoying.png
├── noodle_arrival.png
├── noodle_exploring.png
└── noodle_enjoying.png
```

## Style Guidelines

All images should follow these specifications:

### Visual Style
- Studio Ghibli/Hayao Miyazaki aesthetic
- Watercolor illustration technique
- Soft, pastel color palette
- Warm, gentle lighting
- Whimsical and magical atmosphere
- Child-friendly and calming

### Technical Specs
- **Format:** PNG or JPG
- **Orientation:** Horizontal/Landscape
- **Aspect Ratio:** 16:9 recommended
- **Resolution:** Minimum 1280x720, ideally 1920x1080
- **File Size:** Optimize to 100-300KB each for web performance

### Content Requirements
- ✅ Food environments (shops, cafes, markets)
- ✅ Food displays and ingredients
- ✅ Atmospheric details (steam, light, colors)
- ❌ NO text, words, or labels
- ❌ NO people or characters
- ❌ NO modern technology (phones, screens)

## Example Prompts

### Fruit Station - Arrival
```
Studio Ghibli style watercolor illustration of a charming outdoor
fruit stand at a train station platform. Wooden crates overflowing
with colorful fruits - red apples, orange oranges, yellow bananas.
Soft warm sunlight filtering through a canvas awning. Whimsical,
magical atmosphere with pastel colors. Horizontal landscape
orientation. No text, no people. Child-friendly and calming aesthetic.
```

### Ice Cream Station - Exploring
```
Studio Ghibli style watercolor scene of the inside of a magical
ice cream shop. Display freezers with colorful ice cream tubs -
pink, brown, white, rainbow. Cool pastel colors. Dreamy, sweet
atmosphere with soft lighting. Horizontal landscape. No text,
no people. Miyazaki-inspired whimsy.
```

## Progress Tracking

Use this checklist to track your progress:

### Generation Progress
- [ ] Fruit: arrival, exploring, enjoying (0/3)
- [ ] Drink: arrival, exploring, enjoying (0/3)
- [ ] Bakery: arrival, exploring, enjoying (0/3)
- [ ] Pizza: arrival, exploring, enjoying (0/3)
- [ ] Ice Cream: arrival, exploring, enjoying (0/3)
- [ ] Fish Shop: arrival, exploring, enjoying (0/3)
- [ ] Cheese: arrival, exploring, enjoying (0/3)
- [ ] Noodle: arrival, exploring, enjoying (0/3)

Total: 0/24 complete

### Integration Progress
- [ ] Updated `showReadingPage()` function
- [ ] Added background image CSS
- [ ] Updated fruit station pages
- [ ] Updated drink station pages
- [ ] Updated bakery station pages
- [ ] Updated pizza station pages
- [ ] Updated ice cream station pages
- [ ] Updated fish shop station pages
- [ ] Updated cheese station pages
- [ ] Updated noodle station pages
- [ ] Tested in browser
- [ ] Optimized images for web

## Tips for Success

### During Generation
1. **Be patient** - Each image takes 1-2 minutes to generate
2. **Review carefully** - Regenerate if text appears or style is off
3. **Save originals** - Keep high-resolution versions
4. **Stay consistent** - Use the same generator for all scenes

### During Integration
1. **Test incrementally** - Update one station at a time
2. **Keep backups** - Save original HTML before editing
3. **Check mobile** - Verify backgrounds work on smaller screens
4. **Optimize performance** - Compress images if page loads slowly

### For Best Results
1. Use **Bing Image Creator** for free, high-quality results
2. Generate all 24 at once in one session for consistency
3. Download at highest resolution available
4. Use image optimization tools (TinyPNG, Squoosh) before deploying

## Troubleshooting

### Image Generation Issues

**"Generated image has text/words"**
- Regenerate and emphasize "no text, no letters, no words" in prompt

**"Style doesn't look like Ghibli"**
- Add more style keywords: "Hayao Miyazaki", "Studio Ghibli", "watercolor"

**"Image has people/characters"**
- Regenerate and emphasize "no people, no characters"

**"Image is portrait/vertical"**
- Specify "horizontal landscape 16:9" more prominently

### Integration Issues

**"Images don't load"**
- Check file paths match exactly
- Verify files are in `assets/scenes/` directory
- Check browser console for 404 errors

**"Text is hard to read over background"**
- Adjust CSS overlay opacity
- Add text shadows
- Consider lightening the images

**"Page loads slowly"**
- Compress images to 100-200KB each
- Use WebP format for better compression
- Implement lazy loading

## Resources

### Image Generation Tools
- **Bing Image Creator:** https://www.bing.com/create (Free)
- **ChatGPT Plus:** https://chat.openai.com (Paid - $20/month)
- **Midjourney:** https://midjourney.com (Paid)
- **Stable Diffusion:** Various free/paid options

### Image Optimization
- **TinyPNG:** https://tinypng.com
- **Squoosh:** https://squoosh.app
- **ImageOptim:** https://imageoptim.com (Mac)

### Inspiration
- Studio Ghibli films (especially food scenes from Spirited Away, Kiki's Delivery Service)
- Hayao Miyazaki background art
- The Art of Studio Ghibli books

## Support

For questions or issues:

1. **Generation help:** See `SCENE_GENERATION_GUIDE.md`
2. **Integration help:** See `HOW_TO_USE_SCENES.md`
3. **Code examples:** See `EXAMPLE_STATION_WITH_SCENES.js`
4. **Quick reference:** See `QUICK_START.md`

## License & Usage

These generated images are for personal use in Isaiah's educational reading app. When using AI image generators:

- Review the specific terms of service for your chosen tool
- Bing/DALL-E: Generally allows personal use
- Midjourney: Check subscription tier rights
- Commercial use may require different licensing

---

**Created for:** Isaiah's MRT Food Adventure Reading App
**Purpose:** Enhance reading experience for children with autism
**Style:** Studio Ghibli/Miyazaki watercolor backgrounds
**Total Scenes:** 24 unique backgrounds across 8 food stations

**Last Updated:** December 20, 2024
