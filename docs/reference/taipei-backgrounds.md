# Taipei Scenery Backgrounds for MRT Train Scene

## Overview

The train scene backgrounds have been redesigned to showcase iconic Taipei city scenery instead of generic landscapes. Each station now displays a different recognizable Taipei landmark or scene, creating a more culturally authentic and engaging experience for the child.

## Generated Backgrounds

Six unique Taipei-themed SVG backgrounds were generated using the OpenRouter API with Google's Gemini 2.0 Flash model:

### 1. **Taipei 101 Skyline** (`taipei_101_skyline.svg`)
- **Stations**: Fruit Stand, Cheese Shop
- **Features**: Taipei 101 tower with surrounding modern buildings, soft sky gradient, simple clouds
- **Style**: Flat geometric shapes, clean lines, minimalist design

### 2. **Traditional Temple** (`taipei_temple.svg`)
- **Station**: Bakery
- **Features**: Traditional Taiwanese temple with curved roofs, incense smoke, lanterns, trees
- **Style**: Simplified temple architecture, warm reds and golden yellows
- **Cultural Element**: Evokes Longshan Temple or similar traditional sites

### 3. **Night Market Scene** (`taipei_night_market.svg`)
- **Stations**: Pizza, Noodle House
- **Features**: Colorful food stalls with awnings, hanging red lanterns, evening purple sky
- **Style**: Simple geometric stalls, warm orange/red/yellow colors
- **Cultural Element**: Captures the vibrant atmosphere of Taiwan's famous night markets

### 4. **Riverside Park** (`taipei_riverside.svg`)
- **Station**: Drink Bar
- **Features**: Gentle river, bike path, trees, distant city skyline, bridge
- **Style**: Calm water with horizontal waves, clean modern bridge
- **Cultural Element**: Represents Taipei's riverside parks and bike culture

### 5. **Mountain Backdrop** (`taipei_mountain.svg`)
- **Station**: Ice Cream Shop
- **Features**: Layered mountain silhouettes (Yangmingshan-inspired), trees on slopes, clear sky
- **Style**: Simple mountain shapes with parallax layers, peaceful natural scenery
- **Cultural Element**: References Yangmingshan, the mountain range north of Taipei

### 6. **MRT Elevated Tracks** (`taipei_mrt_elevated.svg`)
- **Station**: Fish Shop
- **Features**: Elevated track structure with pillars, modern buildings, urban environment
- **Style**: Clean geometric architecture, simple track structure
- **Cultural Element**: Showcases Taipei's modern MRT infrastructure

## Animated Elements

To bring the scenes to life, several animated elements were added:

### Birds (🐦 🕊️)
- **Scenes**: Mountain, Riverside, Skyline
- **Animation**: Fly across the screen with gentle vertical bobbing
- **Duration**: 15 seconds per cycle
- **Stagger**: 3 birds with 5-second delays

### Hot Air Balloon (🎈)
- **Scene**: Mountain backdrop only
- **Animation**: Gentle floating motion
- **Duration**: 20 seconds per cycle
- **Movement**: Subtle horizontal and vertical drift

### Lanterns (🏮)
- **Scenes**: Night Market
- **Animation**: Gentle swaying motion
- **Duration**: 3 seconds per cycle
- **Count**: 3 lanterns at different positions with staggered timing

### Distant MRT Train
- **Scene**: MRT Elevated Tracks only
- **Animation**: Passes across the background on elevated tracks
- **Duration**: 12 seconds per cycle
- **Style**: Small blue train silhouette

## Design Principles

1. **Child-Friendly**: Simple, colorful, not overwhelming
2. **Cultural Authenticity**: Each scene represents a real Taipei landmark or experience
3. **Performance**: SVG format ensures small file sizes and crisp scaling
4. **Variety**: Different scenes for different stations keep the experience fresh
5. **Focus**: Backgrounds are calm enough that the main train remains the focal point
6. **Accessibility**: High contrast, clear shapes work well for young readers

## Technical Implementation

### CSS Classes
- `.scenery-container` - Main container with background image
- `.theme-{station}` - Station-specific theme classes
- Individual background images applied via `background-image: url()`
- Old parallax layers (mountains, hills, trees) are hidden for Taipei themes

### Background Positioning
```css
background-size: cover;
background-position: center;
background-repeat: repeat-x;
```

### Animated Elements
- Position: Absolute within `.scenery-container`
- Z-index: Layered appropriately (birds above background, below train)
- Display: Controlled by theme classes (only shown for relevant stations)

## Generation Process

The backgrounds were generated using `generate_taipei_backgrounds.js`:

1. **API**: OpenRouter with Google Gemini 2.0 Flash
2. **Prompts**: Detailed descriptions specifying:
   - Viewport size (1200x400)
   - Child-friendly flat design style
   - Specific color palettes
   - Key features for each scene
3. **Output**: Clean SVG code extracted from API response
4. **Delay**: 2-second pause between generations to respect rate limits

## Future Enhancements

Potential additions to consider:

1. **More Variety**: Create additional backgrounds for station-specific rotation
2. **Interactive Elements**: Click-to-reveal cultural facts about each scene
3. **Seasonal Variations**: Different versions for holidays or seasons
4. **Sound Effects**: Ambient sounds matching each scene (temple bells, market chatter, etc.)
5. **Parallax Scrolling**: Layer backgrounds for depth effect
6. **Weather Effects**: Rain, sunshine variations
7. **Time of Day**: Day/night variations for same locations

## File Structure

```
assets/
├── taipei_101_skyline.svg
├── taipei_temple.svg
├── taipei_night_market.svg
├── taipei_riverside.svg
├── taipei_mountain.svg
└── taipei_mrt_elevated.svg
```

## Credits

- **Generation Tool**: Google Gemini 2.0 Flash via OpenRouter API
- **Design Concept**: Taipei cultural landmarks and experiences
- **Implementation**: Custom CSS and HTML integration
- **Animation**: CSS keyframe animations with emoji elements
