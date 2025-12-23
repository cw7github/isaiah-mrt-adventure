# Quick Start: Interactive Read Page Component

Get up and running with the Interactive Read Page in 5 minutes!

## What You Get

A beautiful, interactive reading component with:
- ✨ **Tap-to-hear** - Every word is tappable with audio
- 🎤 **Read-to-me** - Karaoke-style word-by-word reading
- 🎯 **Sight word highlighting** - Special styling for sight words
- 📱 **Mobile-friendly** - Perfect for tablets and phones
- ♿ **Accessible** - Keyboard navigation and screen reader support
- 🎨 **Beautiful animations** - Engaging but autism-friendly

## Files Created

✅ **index.html** - Updated with read page section and script links
✅ **read-page.css** - All styling (10KB)
✅ **read-page.js** - Interactive functionality (12KB)
✅ **read-page-demo.html** - Working demo with examples
✅ **READ-PAGE-COMPONENT.md** - Full documentation
✅ **read-page-integration-example.js** - Integration examples

## 30-Second Test

### Option 1: Run the Demo

```bash
# Open the demo in your browser
open read-page-demo.html
# or
# Just double-click read-page-demo.html
```

### Option 2: Quick Test in Browser Console

1. Open `/Users/charleswu/Desktop/+/home_school/isaiah_school/index.html` in browser
2. Open browser console (F12)
3. Paste this code:

```javascript
// Navigate to read page
document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
document.getElementById('readPageScreen').classList.add('active');

// Load example
ReadPage.init([{
  emoji: '🍎',
  tip: 'Tap each word to hear it!',
  words: [
    { text: 'I', isSightWord: true },
    { text: 'want', isSightWord: true },
    { text: 'an', isSightWord: true },
    { text: 'apple', isTargetWord: true }
  ]
}]);
```

## 2-Minute Integration

### Step 1: Prepare Your Data

```javascript
const myPages = [
  {
    emoji: '🍕',                          // Any emoji
    backgroundImage: 'path/to/image.jpg', // Optional
    tip: 'Tap each word!',               // Optional tip text
    words: [
      { text: 'The', isSightWord: true },
      { text: 'pizza', isTargetWord: true },
      { text: 'is', isSightWord: true },
      { text: 'hot', isTargetWord: true }
    ]
  }
];
```

### Step 2: Initialize

```javascript
// Show the read page screen
goToScreen('readPageScreen');

// Load your data
ReadPage.init(myPages);
```

### Done! 🎉

The component handles everything:
- Word animations
- Tap-to-hear audio
- Read-to-me button
- Speed controls
- Page navigation
- Progress dots

## Common Use Cases

### Use Case 1: Show a single sentence

```javascript
ReadPage.init([{
  emoji: '🐱',
  sentence: 'The cat is big'  // Simple string - auto-splits into words
}]);
```

### Use Case 2: Multi-page story

```javascript
ReadPage.init([
  { emoji: '🌅', sentence: 'The sun is up' },
  { emoji: '🐦', sentence: 'I hear a bird' },
  { emoji: '😊', sentence: 'I am happy' }
]);
```

### Use Case 3: With sight word focus

```javascript
ReadPage.init([{
  emoji: '🍎',
  tip: 'Find the sight words!',
  words: [
    { text: 'I', isSightWord: true },
    { text: 'see', isSightWord: true },
    { text: 'a', isSightWord: true },
    { text: 'red', isTargetWord: true },
    { text: 'apple', isTargetWord: true }
  ]
}]);
```

## Integration with Existing App

If you have existing station data:

```javascript
function showReadPageForStation(station) {
  // Convert station sentence to words
  const words = station.sentence.split(' ').map((word, index) => ({
    text: word,
    isSightWord: word.toLowerCase() === station.sightWordFocus?.toLowerCase(),
    isTargetWord: station.targetWords?.includes(word.toLowerCase()),
    index: index
  }));

  // Show read page
  goToScreen('readPageScreen');
  ReadPage.init([{
    emoji: station.image,
    backgroundImage: station.ui?.imagePrompt,
    tip: station.readingTip,
    words: words
  }]);
}
```

## Keyboard Shortcuts

When on read page:
- **Tab** - Navigate between words and buttons
- **Enter/Space** - Activate word or button
- **Arrow keys** - Navigate (when focused on buttons)

## Customization

### Change Colors

Add to your CSS:

```css
:root {
  --mrt-blue: #your-color;
  --accent-golden: #your-color;
}
```

### Change Font Size

```css
.read-sentence {
  font-size: 3rem; /* Make bigger */
}
```

### Disable Animations (Calm Mode)

```css
body.calm-mode .read-word {
  animation: none;
}
```

## Troubleshooting

### Words not showing?
- Check browser console for errors
- Make sure `ReadPage.init()` was called
- Verify page data structure

### Audio not working?
- Check browser audio permissions
- Try clicking anywhere on page first (some browsers require user interaction)
- Check if Web Speech API is supported: `console.log(window.speechSynthesis)`

### Animations too much?
- Add `calm-mode` class to body: `document.body.classList.add('calm-mode')`
- Or customize animations in CSS

## Next Steps

1. **Try the demo**: Open `read-page-demo.html`
2. **Read full docs**: See `READ-PAGE-COMPONENT.md`
3. **Check examples**: Look at `read-page-integration-example.js`
4. **Customize**: Edit `read-page.css` for your style

## Need Help?

- 📚 Full documentation: `READ-PAGE-COMPONENT.md`
- 💡 Examples: `read-page-integration-example.js`
- 🎮 Live demo: `read-page-demo.html`

## API Quick Reference

```javascript
// Initialize with pages
ReadPage.init(pages);

// Create single word element
ReadPage.createInteractiveWord('hello', {
  isSightWord: true,
  index: 0
});

// Load specific page
ReadPage.loadPage(pageData);

// Navigate
ReadPage.next();      // Next page
ReadPage.previous();  // Previous page

// Trigger read-to-me
ReadPage.readToMe();
```

## File Locations

All files are in: `/Users/charleswu/Desktop/+/home_school/isaiah_school/`

```
.
├── index.html                          ← Updated with integration
├── read-page.css                       ← Styles
├── read-page.js                        ← Functionality
├── read-page-demo.html                 ← Working demo
├── READ-PAGE-COMPONENT.md              ← Full docs
├── read-page-integration-example.js    ← Examples
└── QUICK-START-READ-PAGE.md           ← This file
```

## That's It!

You now have a fully functional, beautiful interactive read page component. Start by running the demo, then integrate it into your app using the examples provided.

Happy reading! 📚✨
