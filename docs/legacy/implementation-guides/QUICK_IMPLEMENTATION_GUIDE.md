# Quick Implementation Guide - Progress Tracking System

> **Legacy integration guide**: This “enhancedProgress” system is not the primary progress/masonry system used by the app today.  
> Start with `../../../AGENTS.md` and `../../student-assessment-and-adaptive-learning-plan.md`.

## Files Created

1. **progress-tracking-system.js** - All the JavaScript functions for progress tracking
2. **PROGRESS_TRACKING_IMPLEMENTATION.md** - Detailed step-by-step implementation guide
3. **QUICK_IMPLEMENTATION_GUIDE.md** - This file (quick reference)

## Quick Steps

### 1. State Object (Line ~15347)
Add to `state` object:
```javascript
enhancedProgress: {
  schemaVersion: 1,
  stationProgress: {},
  totalStarsEarned: 0,
  achievements: [],
  dailyStreak: 0,
  lastPlayDate: null,
  updatedAt: 0,
},
```

### 2. Add Functions (Line ~30286, before `// ===== INIT =====`)
Copy entire contents of `progress-tracking-system.js` file

### 3. Track Question Answers (Line ~24790)
In `selectAnswer()` function, after `recordMasteryAttempt()`, add:
```javascript
const isFirstAttempt = page._answerAttempts === 1;
recordStationProgressTracking(state.currentStation, state.currentPage, isCorrect, isFirstAttempt);
```

### 4. Track Station Completion
Where `state.completedStations.push(stationId)` is called, add:
```javascript
markStationCompletedEnhanced(stationId);
```

### 5. Update saveProgress() (Line ~25087)
Add to `saveData` object:
```javascript
enhancedProgress: state.enhancedProgress,
```

### 6. Update loadProgress()
Add after loading other data:
```javascript
if (p.enhancedProgress) {
  state.enhancedProgress = normalizeEnhancedProgressData(p.enhancedProgress);
}
```

### 7. Update resetProgress() (Line ~25063)
Add:
```javascript
state.enhancedProgress = normalizeEnhancedProgressData(null);
```

### 8. Add CSS
Copy CSS from PROGRESS_TRACKING_IMPLEMENTATION.md Step 8 to `<style>` section

### 9. Add HTML
Copy HTML from PROGRESS_TRACKING_IMPLEMENTATION.md Step 9 to settings modal

### 10. Add UI Update Functions
Copy functions from PROGRESS_TRACKING_IMPLEMENTATION.md Step 10

### 11. Initialize (in window.onload)
Add:
```javascript
ensureEnhancedProgressState();
updateDailyStreak();
checkAllAchievements();
updateProgressUI();
```

## Key Features

### Star System
- **3 stars**: ≥90% correct on first try
- **2 stars**: ≥70% correct on first try
- **1 star**: Complete station (any score)

### Achievements (6 total)
1. **First Steps** 👣 - Complete first station
2. **Sight Word Star** ⭐ - Master 20 sight words
3. **Perfect Score** 💯 - Get 3 stars on any station
4. **Week Warrior** 🔥 - Maintain 7-day streak
5. **Halfway There** 🎯 - Complete 50% of stations
6. **ELA Champion** 🏆 - Complete all stations

### Data Structure
```javascript
{
  stationProgress: {
    stationId: {
      pagesCompleted: [0, 1, 2, ...],
      questionsCorrect: 5,
      questionsTotal: 8,
      questionsFirstTryCorrect: 6,
      attempts: { page_0: 1, page_1: 2, ... },
      stars: 2,
      lastPlayed: timestamp,
      completed: true,
      bestScore: 87.5
    }
  },
  totalStarsEarned: 12,
  achievements: [
    { id: 'first-steps', unlockedAt: timestamp }
  ],
  dailyStreak: 3,
  lastPlayDate: '2025-12-22'
}
```

## Testing Commands (Browser Console)

```javascript
// Check current progress
console.log(state.enhancedProgress);

// Calculate total stars
console.log(calculateTotalStars());

// Check achievements
console.log(getAchievementProgress());

// Export progress
exportProgress();

// Check station stars
console.log(calculateStationStars('fruit'));

// Update UI
updateProgressUI();
```

## Verification

After implementation, verify:
- ✓ Stars appear on station cards
- ✓ Achievements unlock with notifications
- ✓ Daily streak increments correctly
- ✓ Progress persists after page reload
- ✓ Export downloads JSON file
- ✓ Import restores progress
- ✓ Stats display in settings modal
- ✓ Auto-save after each question

## Troubleshooting

**No stars showing:**
- Check `updateStationStars()` is called in station card generation
- Verify `ensureEnhancedProgressState()` is called on init

**Achievements not unlocking:**
- Call `checkAllAchievements()` on app load
- Check `checkAchievement(id)` is called at appropriate times

**Progress not saving:**
- Verify `saveProgress()` includes `enhancedProgress`
- Check localStorage isn't full or blocked

**Import/Export not working:**
- Check `showConfirmModal()` function exists
- Verify file input has correct accept attribute

## Integration Points

1. **Question Answer**: `selectAnswer()` → calls `recordStationProgressTracking()`
2. **Station Complete**: Where `completedStations.push()` → calls `markStationCompletedEnhanced()`
3. **Save**: `saveProgress()` → includes `enhancedProgress`
4. **Load**: `loadProgress()` → loads `enhancedProgress`
5. **Reset**: `resetProgress()` → resets `enhancedProgress`
6. **UI**: Settings modal → displays stats and achievements
7. **Map**: `generateMRTMap()` → shows stars on stations

## File Locations

- Main code: `/Users/charleswu/Desktop/+/home_school/isaiah_school/index.html`
- Functions: `/Users/charleswu/Desktop/+/home_school/isaiah_school/progress-tracking-system.js`
- Guide: `docs/legacy/implementation-guides/PROGRESS_TRACKING_IMPLEMENTATION.md`
