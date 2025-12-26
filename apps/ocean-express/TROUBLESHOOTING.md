# Ocean Floor Express - Troubleshooting Guide

## Common Issues and Solutions

### Animations Not Playing

**Problem**: Creatures not moving, bubbles not rising, or gauges not animating.

**Solutions**:
1. Check browser compatibility - use latest Chrome, Firefox, Safari, or Edge
2. Disable browser extensions that might block animations
3. Clear browser cache and reload page
4. Try opening in incognito/private mode
5. Ensure hardware acceleration is enabled in browser settings

**Test**: Open `test.html` to see if individual animations work in isolation.

---

### Fonts Not Loading

**Problem**: Text appears in default system font instead of Cinzel Decorative or Lora.

**Solutions**:
1. Check internet connection (Google Fonts requires internet)
2. Wait a few seconds for fonts to download
3. Refresh the page after fonts load
4. Check browser console for font loading errors

**Fallback**: The app will use system serif fonts if Google Fonts fail to load.

---

### Buttons Not Responding

**Problem**: Clicking buttons doesn't trigger actions.

**Solutions**:
1. Check browser JavaScript console for errors
2. Ensure `app.js` and `pilot-story.js` are in same folder as `index.html`
3. Verify file paths are correct
4. Try a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

**Debug**: Open browser developer tools (F12) and check Console tab for errors.

---

### Stories Not Appearing

**Problem**: Story panels don't show when descending to new zones.

**Solutions**:
1. Verify `pilot-story.js` is loaded (check Network tab in dev tools)
2. Check that `STORIES` object is defined (open Console and type `STORIES`)
3. Ensure story IDs match between `app.js` and `pilot-story.js`

**Workaround**: Stories are defined in `pilot-story.js` - you can read them directly in that file.

---

### Gauge Needles Stuck

**Problem**: Depth gauge needle doesn't rotate or pressure bar doesn't fill.

**Solutions**:
1. Check if CSS animations are enabled in browser
2. Verify `styles.css` loaded completely
3. Inspect element to see if transform styles are applied
4. Check for CSS syntax errors in browser console

**Manual Test**: In browser console, run:
```javascript
document.getElementById('depth-needle').style.transform = 'translate(-50%, -100%) rotate(90deg)';
```

---

### Porthole View Empty

**Problem**: No ocean background or creatures visible in porthole.

**Solutions**:
1. Check that `.ocean-background` div has correct z-index
2. Verify creature container is not hidden
3. Look for JavaScript errors preventing creature creation
4. Check if CSS classes are properly applied

**Debug**: In console, run:
```javascript
showCreatures('sunlight');
```

---

### Scene Transitions Failing

**Problem**: Stuck on surface dock or can't return from bathysphere.

**Solutions**:
1. Check JavaScript console for function errors
2. Verify both scenes have correct IDs (`surface-dock` and `bathysphere`)
3. Check CSS for `.active` class definition
4. Ensure transition delays aren't too long

**Force Reset**: Reload the page to reset all states.

---

## Browser-Specific Issues

### Safari
**Issue**: Some CSS filters might render differently.
**Solution**: Update to latest Safari version. iOS 12+ and macOS Safari 12+ fully supported.

### Firefox
**Issue**: CSS transform performance might vary.
**Solution**: Enable hardware acceleration in Firefox settings.

### Chrome
**Issue**: Font rendering might look different from other browsers.
**Solution**: This is normal - Chrome uses different font rendering engine.

### Mobile Browsers
**Issue**: Touch targets might feel small on phones.
**Solution**: App optimized for tablets/desktops. Use landscape mode on phones.

---

## Performance Issues

### Slow Animations

**Problem**: Animations stutter or lag.

**Solutions**:
1. Close other browser tabs to free up memory
2. Disable browser extensions
3. Update graphics drivers
4. Try a different browser
5. Reduce number of creatures spawning (edit `app.js`)

**Performance Tip**: The app is designed for 60fps on modern devices. Older hardware may experience some lag.

---

### High CPU Usage

**Problem**: Computer fan running loud or system slowing down.

**Solutions**:
1. This is normal for CSS animations with many elements
2. Close app when not in use
3. Limit number of simultaneous bubbles/creatures
4. Use hardware acceleration in browser settings

**Optimization**: You can reduce animation complexity by editing the bubble creation interval in `app.js`:
```javascript
// Change from 800ms to 2000ms for fewer bubbles
setInterval(() => {
  createBubble(bubblesContainer);
}, 2000);
```

---

## Educational Content Issues

### Question Not Appearing

**Problem**: Question gate doesn't show after sunlight zone.

**Solutions**:
1. Verify `QUESTIONS` array is defined in `app.js`
2. Check that question gate has correct HTML structure
3. Ensure `.active` class is being added to `#question-gate`

**Workaround**: Click lever again to advance manually.

---

### Story Text Unreadable

**Problem**: Text too small, hard to read, or poor contrast.

**Solutions**:
1. Use browser zoom (Cmd/Ctrl + +) to enlarge
2. Check that story panels have correct CSS classes
3. Verify background opacity isn't too transparent
4. Adjust monitor brightness

**Customization**: You can increase font size in `styles.css`:
```css
.story-text {
  font-size: 1.5rem; /* Changed from 1.2rem */
}
```

---

## Developer Debugging

### Enable Debug Mode

Add this to the browser console to see state changes:
```javascript
// Log all state changes
setInterval(() => {
  console.log('Current State:', state);
}, 1000);
```

### Test Individual Functions

In browser console:
```javascript
// Test descent
animateDescent(1000, () => console.log('Reached 1000m'));

// Test story
showStory('anglerfish-story');

// Test creatures
showCreatures('midnight');

// Test badge
showBadge();
```

### Inspect Animations

In browser DevTools:
1. Right-click any animated element
2. Choose "Inspect"
3. Go to "Animations" tab (in Chrome) or "Debugger" (Firefox)
4. See all running animations

---

## Getting Help

### Check Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy error text for debugging

### Verify File Structure
Ensure all files are in the same directory:
```
ocean-express/
├── index.html
├── styles.css
├── app.js
├── pilot-story.js
└── test.html
```

### Test Isolated Components
Open `test.html` to verify individual animations work before testing full app.

---

## Still Having Issues?

If problems persist:

1. **Clear All Browser Data**: Cache, cookies, and site data
2. **Try Different Browser**: Test in Chrome, Firefox, and Safari
3. **Check File Integrity**: Re-download files if needed
4. **Test Internet Connection**: Required for Google Fonts
5. **Update Browser**: Ensure you're on latest version

---

**The Ocean Floor Express should run smoothly on any modern browser. Happy deep-sea exploring!**
