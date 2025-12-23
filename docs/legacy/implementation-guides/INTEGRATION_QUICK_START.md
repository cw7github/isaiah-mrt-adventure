# Quick Start Guide - Isaiah School Integration Testing

## 1-Minute Setup

### Start the Server
```bash
cd /Users/charleswu/Desktop/+/home_school/isaiah_school
python3 -m http.server 8765
```

### Open the App
```
http://localhost:8765
```

### Test the Flow
1. Click "Board the Train" on welcome screen
2. Click RF tab
3. Click first station (Library Stop - 📚)
4. Click "Start Lesson"
5. Tap words, click "Read to Me"
6. Answer questions
7. Check console: `state.completedStations`

---

## Quick Debug Commands

### Browser Console (F12)

```javascript
// Check content loaded
Object.keys(stationContent).length  // Should be 78+ (70 content pack + 8 hardcoded)

// Check stations by line
stationSelection.stationsByLine.RF.length  // Should be 12
stationSelection.stationsByLine.RL.length  // Should be 9

// Check progress
state.completedStations
state.stickers
state.pagesCompleted

// Reset progress
localStorage.clear()
location.reload()

// View saved progress
JSON.parse(localStorage.getItem('appState'))

// Test mode status
TEST_MODE  // Should be true

// Load specific station
selectStation('rf_f1_print_concepts')
```

---

## File Locations

- **Main App**: `index.html` (30,755 lines)
- **Station Selection**: `station-selection.js` (430 lines)
- **Content Pack**: `content/cpa-grade1-ela/content-pack.v1.json`
- **Test Checklist**: `TEST_CHECKLIST.md`
- **Integration Summary**: `INTEGRATION_SUMMARY.md`

---

## Key Integration Point

**File**: `station-selection.js` (Lines 51-75)

This is where content pack stations get merged into the global `stationContent` object:

```javascript
// INTEGRATION: Populate global stationContent object from content pack
if (typeof stationContent !== 'undefined' && stationSelection.contentPack.stations) {
  Object.assign(stationContent, stationSelection.contentPack.stations);
  console.log('Merged content pack stations into stationContent:',
    Object.keys(stationContent).length, 'stations');
}
```

---

## Station ID Format

### Content Pack Stations
- `rf_f1_print_concepts` - Reading Foundation, Foundational 1
- `rl_l1_key_details_wh` - Reading Literature, Lesson 1
- `ri_n1_key_details_wh` - Reading Information, Nonfiction 1
- `l_g1_capitals_endmarks` - Language, Grammar 1
- `review_sprint_1` - Review Sprint 1

### Legacy Stations (still work)
- `fruit`, `drink`, `bakery`, `pizza`, etc.

---

## Common Issues & Fixes

### Issue: "Content pack failed to load"
**Fix**: Server not running or path wrong
```bash
# Check server
curl http://localhost:8765/content/cpa-grade1-ela/content-pack.v1.json

# Should return JSON, not 404
```

### Issue: "Stations not appearing"
**Fix**: JavaScript error preventing initialization
```javascript
// Check console for errors
// Look for "Content pack loaded:" message
```

### Issue: "Station won't start"
**Fix**: Station ID mismatch
```javascript
// Check station exists
stationContent['rf_f1_print_concepts']  // Should return object

// Check if it's in the list
stationSelection.stationsByLine.RF.map(s => s.id)
```

### Issue: "Audio not playing"
**Fix**: Browser restrictions or muted
- Check speaker icon (top right)
- On iOS, tap screen first to unlock audio
- Try Web Speech API test:
  ```javascript
  speechSynthesis.speak(new SpeechSynthesisUtterance('test'))
  ```

---

## Testing Checklist (5 minutes)

- [ ] Server running on port 8765
- [ ] Welcome screen loads
- [ ] Station selection shows 5 line tabs
- [ ] RF tab shows 12 stations
- [ ] Click first station shows intro
- [ ] Start lesson loads MRT ride
- [ ] Elevator doors open
- [ ] Read page shows interactive words
- [ ] Words speak when tapped
- [ ] "Read to Me" highlights words
- [ ] Questions accept answers
- [ ] Progress saves to localStorage
- [ ] Refresh maintains progress

---

## Advanced Testing

### Load Test Data
```javascript
// Simulate completed stations
state.completedStations = ['rf_f1_print_concepts', 'rf_f2_blend_and_segment']
saveProgress()
location.reload()

// Simulate stickers
state.stickers = 10
updateProgress()

// Clear everything
localStorage.clear()
location.reload()
```

### Test Specific Features
```javascript
// Test audio
speak('This is a test')

// Test page navigation
state.currentPage = 2
showPage()

// Test reward screen
showReward()

// Test station intro
showStationIntro('rf_f1_print_concepts')
```

---

## Production Checklist

Before deploying:

- [ ] Set `TEST_MODE = false` (line 16280 in index.html)
- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Verify all 70 stations load
- [ ] Check localStorage quota (should be <5MB)
- [ ] Test offline behavior
- [ ] Verify no console errors
- [ ] Test audio on mobile (requires user interaction)
- [ ] Check performance (should load <3 seconds)

---

## Useful Links

- **Local Server**: http://localhost:8765
- **Content Pack**: http://localhost:8765/content/cpa-grade1-ela/content-pack.v1.json
- **Test Checklist**: TEST_CHECKLIST.md (comprehensive 60+ checkpoints)
- **Integration Summary**: INTEGRATION_SUMMARY.md (detailed architecture)

---

**Ready to test! Good luck!**
