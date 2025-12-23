# How to Use Generated Scene Backgrounds

## Overview
This guide explains how to integrate the Ghibli-style background images into Isaiah's MRT Food Adventure app.

## Current vs. New Structure

### Current (Emoji-based):
```javascript
{
  type: 'read',
  image: '🚂🍎',  // Simple emoji
  sentence: 'I am at the fruit stand.',
  words: ['I', 'am', 'at', 'the', 'fruit', 'stand.'],
  // ... other properties
}
```

### New (Scene Background):
```javascript
{
  type: 'read',
  image: 'assets/scenes/fruit_arrival.png',  // Path to scene image
  backgroundImage: true,  // Flag to indicate this is a background
  sentence: 'I am at the fruit stand.',
  words: ['I', 'am', 'at', 'the', 'fruit', 'stand.'],
  // ... other properties
}
```

## Scene Mapping by Page Type

Each station has 3 types of scenes that correspond to different reading pages:

### 1. Arrival Scene (`*_arrival.png`)
Use for the **first reading page** where Isaiah arrives at the station.

**Example stations:**
- `fruit_arrival.png` - "I am at the fruit stand."
- `drink_arrival.png` - "I am at the drink bar."
- `bakery_arrival.png` - "I am at the bakery."

### 2. Exploring Scene (`*_exploring.png`)
Use for **middle reading pages** where Isaiah looks at the food options.

**Example stations:**
- `fruit_exploring.png` - "I see red apples. I see big oranges..."
- `drink_exploring.png` - "I see cold drinks..."
- `bakery_exploring.png` - "I see a big cake..."

### 3. Enjoying Scene (`*_enjoying.png`)
Use for the **final reading page** after making a choice.

**Example stations:**
- `fruit_enjoying.png` - "My fruit is so good! I like it a lot."
- `drink_enjoying.png` - "My drink is so good! I like it a lot."
- `bakery_enjoying.png` - "My cake is so good! I like it a lot."

## Step-by-Step Integration

### Step 1: Update HTML Structure

Find the `showReadingPage` function in `index.html` and modify it to handle background images:

```javascript
function showReadingPage(page) {
  const sentenceImage = document.getElementById('sentenceImage');

  // Check if this is a background image or emoji
  if (page.backgroundImage) {
    // Set as background image
    sentenceImage.style.backgroundImage = `url('${page.image}')`;
    sentenceImage.style.backgroundSize = 'cover';
    sentenceImage.style.backgroundPosition = 'center';
    sentenceImage.style.fontSize = '0'; // Hide emoji text
    sentenceImage.textContent = ''; // Clear emoji
  } else {
    // Use as emoji (legacy)
    sentenceImage.style.backgroundImage = 'none';
    sentenceImage.textContent = page.image;
  }

  // ... rest of function
}
```

### Step 2: Update CSS

Add these styles to make the background images display nicely:

```css
.sentence-image {
  min-height: 300px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Add a subtle overlay to ensure text readability */
.sentence-image.has-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
  pointer-events: none;
}
```

### Step 3: Update Station Content

Update each station's pages array in `stationContent`. Here's an example for the **fruit station**:

```javascript
fruit: {
  name: 'Fruit Stand',
  icon: '🍎',
  level: 1,
  floor: 3,
  // ... other properties ...
  pages: [
    {
      type: 'read',
      image: 'assets/scenes/fruit_arrival.png',  // ← CHANGED
      backgroundImage: true,                      // ← NEW
      sentence: 'I am at the fruit stand.',
      words: ['I', 'am', 'at', 'the', 'fruit', 'stand.'],
      targetWords: ['I', 'am', 'at', 'the', 'fruit'],
      sightWordFocus: 'the',
      readingTip: 'Point to each word as you read. "The" is a tricky word - we just remember it!'
    },
    {
      type: 'read',
      image: 'assets/scenes/fruit_exploring.png', // ← CHANGED
      backgroundImage: true,                       // ← NEW
      sentence: 'I see red apples. I see big oranges. I see yellow bananas.',
      words: ['I', 'see', 'red', 'apples.', 'I', 'see', 'big', 'oranges.', 'I', 'see', 'yellow', 'bananas.'],
      targetWords: ['see', 'red', 'apples', 'big', 'oranges', 'yellow', 'bananas'],
      sightWordFocus: 'see',
      readingTip: 'Notice the pattern: I see [color] [fruit]. This helps us read faster!'
    },
    {
      type: 'read',
      image: '👦🤔',  // This could stay emoji (it's about Isaiah thinking)
      backgroundImage: false,
      sentence: 'I want a fruit. What do I want?',
      // ... rest of page
    },
    {
      type: 'menu',
      // Menu page - keep as is
    },
    {
      type: 'question',
      // Question page - keep as is
    },
    {
      type: 'read',
      image: 'assets/scenes/fruit_enjoying.png',  // ← CHANGED
      backgroundImage: true,                       // ← NEW
      sentence: 'My fruit is so good! I like it a lot.',
      words: ['My', 'fruit', 'is', 'so', 'good!', 'I', 'like', 'it', 'a', 'lot.'],
      targetWords: ['My', 'is', 'good', 'like', 'lot'],
      sightWordFocus: 'my',
      readingTip: '"My" tells us it belongs to you. My fruit. My food. My book!'
    }
  ]
}
```

## Complete Scene Reference

### Fruit Station
- Page 1 (arrival): `assets/scenes/fruit_arrival.png`
- Page 2 (exploring): `assets/scenes/fruit_exploring.png`
- Page 6 (enjoying): `assets/scenes/fruit_enjoying.png`

### Drink Station
- Page 1 (arrival): `assets/scenes/drink_arrival.png`
- Page 2 (exploring): `assets/scenes/drink_exploring.png`
- Page 6 (enjoying): `assets/scenes/drink_enjoying.png`

### Bakery Station
- Page 1 (arrival): `assets/scenes/bakery_arrival.png`
- Page 2 (exploring): `assets/scenes/bakery_exploring.png`
- Page 6 (enjoying): `assets/scenes/bakery_enjoying.png`

### Pizza Station
- Page 1 (arrival): `assets/scenes/pizza_arrival.png`
- Page 2 (exploring): `assets/scenes/pizza_exploring.png`
- Page 6 (enjoying): `assets/scenes/pizza_enjoying.png`

### Ice Cream Station
- Page 1 (arrival): `assets/scenes/icecream_arrival.png`
- Page 2 (exploring): `assets/scenes/icecream_exploring.png`
- Page 6 (enjoying): `assets/scenes/icecream_enjoying.png`

### Fish Shop Station
- Page 1 (arrival): `assets/scenes/fishshop_arrival.png`
- Page 2 (exploring): `assets/scenes/fishshop_exploring.png`
- Page 6 (enjoying): `assets/scenes/fishshop_enjoying.png`

### Cheese Station
- Page 1 (arrival): `assets/scenes/cheese_arrival.png`
- Page 2 (exploring): `assets/scenes/cheese_exploring.png`
- Page 6 (enjoying): `assets/scenes/cheese_enjoying.png`

### Noodle Station
- Page 1 (arrival): `assets/scenes/noodle_arrival.png`
- Page 2 (exploring): `assets/scenes/noodle_exploring.png`
- Page 6 (enjoying): `assets/scenes/noodle_enjoying.png`

## Mixed Approach (Recommended)

You don't have to replace ALL emojis. A good approach is:

1. **Use scene backgrounds for:**
   - Arrival pages (setting the scene)
   - Exploring pages (showing the food environment)
   - Enjoying pages (final satisfaction moment)

2. **Keep emojis for:**
   - Character emotion pages (e.g., '👦🤔')
   - Simple interactive pages
   - Menu/question pages

This creates a nice balance between immersive backgrounds and quick visual cues.

## Testing

After integration:

1. Open `index.html` in a browser
2. Select a station (e.g., Fruit Stand)
3. Verify backgrounds load properly
4. Check that text is still readable over backgrounds
5. Test on mobile/tablet if applicable

## Troubleshooting

**Images don't load:**
- Check file paths are correct
- Ensure images are in `assets/scenes/` directory
- Check browser console for errors

**Text is hard to read:**
- Adjust the overlay opacity in CSS
- Consider adding text shadows
- May need to lighten/adjust background images

**Images look stretched:**
- Verify `background-size: cover` is set
- Check image aspect ratio (should be 16:9 landscape)

**Performance issues:**
- Optimize image file sizes (use WebP format if possible)
- Consider lazy loading for better performance
- Compress images to 100-200KB each

## Future Enhancements

Consider adding:
- Fade-in transitions when backgrounds load
- Parallax effects for depth
- Seasonal variations (Christmas, Halloween themes)
- Night/day mode variants
