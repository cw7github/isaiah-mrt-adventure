# Subject-Aware Progress Tracking Integration Guide

> **Legacy integration guide**: This is a historical “how to add” document. Subject progress is already implemented in `index.html`.  
> Start with `../../../AGENTS.md` and `../../README.md`.

This guide provides step-by-step instructions for integrating subject-specific (ELA/Math) progress tracking into Isaiah's MRT Food Adventure.

## Overview

The implementation separates progress tracking by subject (ELA and Math), allowing parents to see:
- Separate sticker counts for Reading and Math
- Subject-specific stations completed
- Individual progress cards for each subject
- Automatic migration of existing data

## Files Created

1. `subject-progress-integration.js` - New functions to add
2. `subject-progress-styles.css` - CSS styles for progress cards
3. This guide document

## Integration Steps

### STEP 1: Add Subject Progress to State Structure

**Location:** Around line 17505 in `index.html`

**Find:**
```javascript
progressUpdatedAt: 0,
progressResetAt: 0,
soundEnabled: true,
```

**Already Added** (verified in state structure):
```javascript
progressUpdatedAt: 0,
progressResetAt: 0,
// Subject-specific progress tracking (ELA and Math separated)
subjectProgress: {
  ela: {
    stickers: 0,
    pagesCompleted: 0,
    completedStations: [],
    skillsMastered: []
  },
  math: {
    stickers: 0,
    pagesCompleted: 0,
    completedStations: [],
    skillsMastered: [],
    conceptProgress: {} // Track CPA progression per concept
  }
},
soundEnabled: true,
```

### STEP 2: Add Subject-Aware Functions

**Location:** After `resetProgressCounters()` function (around line 28918)

**Insert:** All functions from `subject-progress-integration.js` (lines 6-147):
- createEmptyProgress()
- ensureSubjectProgress()
- getCurrentSubject()
- getCurrentSubjectProgress()
- awardSubjectStickerAndPage()
- markSubjectStationComplete()
- getSubjectProgressStats()
- migrateToSubjectProgress()
- renderSubjectProgressCards()

### STEP 3: Update awardStickerAndPage()

**Location:** Around line 28910

**Find:**
```javascript
function awardStickerAndPage() {
  const counters = ensureProgressCountersState();
  const deviceId = (state.deviceId && typeof state.deviceId === 'string') ? state.deviceId : 'device';
  counters.stickersByDevice[deviceId] = (counters.stickersByDevice[deviceId] || 0) + 1;
  counters.pagesCompletedByDevice[deviceId] = (counters.pagesCompletedByDevice[deviceId] || 0) + 1;
  recalcProgressCountersTotals();
}
```

**Replace with:**
```javascript
function awardStickerAndPage() {
  awardSubjectStickerAndPage();
}
```

### STEP 4: Update Station Completion Tracking

**Location:** Around line 28364 in `showComplete()` function

**Find:**
```javascript
if (!state.completedStations.includes(state.currentStation)) {
  state.completedStations.push(state.currentStation);
  unlockNextStation();
}
```

**Replace with:**
```javascript
if (!state.completedStations.includes(state.currentStation)) {
  state.completedStations.push(state.currentStation);
  markSubjectStationComplete(state.currentStation); // NEW LINE
  unlockNextStation();
}
```

### STEP 5: Update saveProgress() Function

**Location:** Around line 28789

**Find:**
```javascript
const saveData = {
  counters,
  stickers: state.stickers,
  pagesCompleted: state.pagesCompleted,
  completedStations: state.completedStations,
  masteredWords: Array.from(state.masteredWords),
  soundEnabled: state.soundEnabled,
  guidanceEnabled: state.guidanceEnabled,
  calmMode: state.calmMode,
  sightWordMarksEnabled: state.sightWordMarksEnabled,
  sightWordGateEnabled: state.sightWordGateEnabled,
  unlockAllStations: state.unlockAllStations,
  updatedAt,
  resetAt,
  lastPosition: {
    stationId: state.currentStation || null,
    pageIndex: Number.isFinite(state.currentPage) ? state.currentPage : 0,
  },
  analytics: normalizeAnalyticsData(state.analytics),
  mastery: normalizeMasteryData(state.mastery),
};
```

**Add after mastery line:**
```javascript
const saveData = {
  counters,
  stickers: state.stickers,
  pagesCompleted: state.pagesCompleted,
  completedStations: state.completedStations,
  masteredWords: Array.from(state.masteredWords),
  soundEnabled: state.soundEnabled,
  guidanceEnabled: state.guidanceEnabled,
  calmMode: state.calmMode,
  sightWordMarksEnabled: state.sightWordMarksEnabled,
  sightWordGateEnabled: state.sightWordGateEnabled,
  unlockAllStations: state.unlockAllStations,
  updatedAt,
  resetAt,
  lastPosition: {
    stationId: state.currentStation || null,
    pageIndex: Number.isFinite(state.currentPage) ? state.currentPage : 0,
  },
  analytics: normalizeAnalyticsData(state.analytics),
  mastery: normalizeMasteryData(state.mastery),
  subjectProgress: ensureSubjectProgress(), // NEW LINE
};
```

### STEP 6: Update loadProgress() Function

**Location:** Around line 28675

**Find (in the section that loads saved progress):**
```javascript
state.analytics = normalizeAnalyticsData(p.analytics);
state.mastery = normalizeMasteryData(p.mastery);

// Restore UI state
updateProgress({ save: false });
```

**Add after state.mastery line:**
```javascript
state.analytics = normalizeAnalyticsData(p.analytics);
state.mastery = normalizeMasteryData(p.mastery);
if (p.subjectProgress) state.subjectProgress = p.subjectProgress; // NEW LINE
migrateToSubjectProgress(); // NEW LINE

// Restore UI state
updateProgress({ save: false });
```

**And also find the else block (around line 28695):**
```javascript
state.analytics = normalizeAnalyticsData(p.analytics);
state.mastery = normalizeMasteryData(p.mastery);
updateProgress({ save: false });
```

**Add after state.mastery line:**
```javascript
state.analytics = normalizeAnalyticsData(p.analytics);
state.mastery = normalizeMasteryData(p.mastery);
migrateToSubjectProgress(); // NEW LINE
updateProgress({ save: false });
```

### STEP 7: Update normalizeProgressData() Function

**Location:** Around line 18571

**Find the return statement:**
```javascript
return {
  counters: {
    stickersByDevice,
    pagesCompletedByDevice,
  },
  stickers: stickersTotal,
  pagesCompleted: pagesTotal,
  completedStations: Array.isArray(obj.completedStations) ? obj.completedStations : [],
  masteredWords: Array.isArray(obj.masteredWords) ? obj.masteredWords : [],
  soundEnabled: obj.soundEnabled !== false,
  guidanceEnabled: obj.guidanceEnabled !== false,
  calmMode: Boolean(obj.calmMode),
  sightWordMarksEnabled: obj.sightWordMarksEnabled !== false,
  sightWordGateEnabled: obj.sightWordGateEnabled !== false,
  unlockAllStations: obj.unlockAllStations !== false,
  updatedAt: Number.isFinite(obj.updatedAt) ? obj.updatedAt : 0,
  resetAt: Number.isFinite(obj.resetAt) ? obj.resetAt : 0,
  lastPosition: obj.lastPosition && typeof obj.lastPosition === 'object' ? obj.lastPosition : null,
  analytics: normalizeAnalyticsData(obj.analytics),
  mastery: normalizeMasteryData(obj.mastery),
};
```

**Add after mastery line:**
```javascript
return {
  counters: {
    stickersByDevice,
    pagesCompletedByDevice,
  },
  stickers: stickersTotal,
  pagesCompleted: pagesTotal,
  completedStations: Array.isArray(obj.completedStations) ? obj.completedStations : [],
  masteredWords: Array.isArray(obj.masteredWords) ? obj.masteredWords : [],
  soundEnabled: obj.soundEnabled !== false,
  guidanceEnabled: obj.guidanceEnabled !== false,
  calmMode: Boolean(obj.calmMode),
  sightWordMarksEnabled: obj.sightWordMarksEnabled !== false,
  sightWordGateEnabled: obj.sightWordGateEnabled !== false,
  unlockAllStations: obj.unlockAllStations !== false,
  updatedAt: Number.isFinite(obj.updatedAt) ? obj.updatedAt : 0,
  resetAt: Number.isFinite(obj.resetAt) ? obj.resetAt : 0,
  lastPosition: obj.lastPosition && typeof obj.lastPosition === 'object' ? obj.lastPosition : null,
  analytics: normalizeAnalyticsData(obj.analytics),
  mastery: normalizeMasteryData(obj.mastery),
  subjectProgress: obj.subjectProgress && typeof obj.subjectProgress === 'object'
    ? obj.subjectProgress
    : { ela: createEmptyProgress(), math: createEmptyProgress() }, // NEW LINE
};
```

### STEP 8: Add CSS Styles

**Location:** In the `<style>` section of `index.html`

**Add:** All styles from `subject-progress-styles.css` at the end of the style section (before `</style>` tag)

### STEP 9: Add Subject Progress Cards to Settings UI

**Location:** In the settings modal, around line 17361 (in the Progress section)

**Find:**
```html
<div class="setting-group">
  <label class="setting-label">Progress</label>
  <div class="setting-toggle">
    <span>Pages completed today: <strong id="pagesCompleted">0</strong></span>
  </div>
</div>
```

**Add after this block:**
```html
<div class="setting-group">
  <label class="setting-label">Subject Progress</label>
  <div id="subjectProgressContainer"></div>
</div>
```

### STEP 10: Render Subject Progress Cards

**Location:** In the `updateProgress()` function or when opening settings

**Add a call to render the cards:**
```javascript
// In openSettings() or similar function
const container = document.getElementById('subjectProgressContainer');
if (container) {
  container.innerHTML = ''; // Clear previous
  renderSubjectProgressCards(container);
}
```

### STEP 11: Update resetProgress() Function

**Location:** Around line 28552

**Find:**
```javascript
resetProgressCounters();
state.completedStations = [];
state.masteredWords = new Set();
```

**Add after:**
```javascript
resetProgressCounters();
state.completedStations = [];
state.masteredWords = new Set();
state.subjectProgress = { // NEW LINES
  ela: createEmptyProgress(),
  math: createEmptyProgress()
};
```

## Testing Checklist

After integration, test:

1. ✅ Complete an ELA station - verify ELA stickers increase
2. ✅ Complete a Math station - verify Math stickers increase
3. ✅ Check settings modal shows subject progress cards
4. ✅ Refresh page - verify progress persists
5. ✅ Switch between subjects - verify correct progress displayed
6. ✅ Reset progress - verify both subjects reset
7. ✅ Existing progress migrates to ELA automatically

## Backward Compatibility

The implementation maintains full backward compatibility:
- Old progress data is automatically migrated to ELA
- Global totals (state.stickers, state.pagesCompleted) are maintained
- Existing Firebase sync continues to work
- Device-based counters remain functional

## File Locations

- Main file: `/Users/charleswu/Desktop/+/home_school/isaiah_school/index.html`
- Station selection: `/Users/charleswu/Desktop/+/home_school/isaiah_school/station-selection.js`

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify all functions were added correctly
3. Ensure CSS styles are loaded
4. Test migration with existing data
