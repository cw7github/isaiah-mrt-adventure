# Quick Start Integration Checklist

> **Legacy checklist**: Subject-aware progress tracking is already implemented in `index.html`.  
> Kept for reference only. See `../../README.md` and `../`.

Use this checklist to quickly integrate subject-aware progress tracking. Check off each item as you complete it.

## Pre-Integration Checklist

- [ ] Backup `index.html` before making changes
- [ ] Review `SUBJECT-PROGRESS-INTEGRATION-GUIDE.md` for details
- [ ] Have `subject-progress-integration.js` open for reference
- [ ] Have `subject-progress-styles.css` open for reference

## Part 1: State Structure (ALREADY DONE ✅)

- [x] State structure updated at line 17507
- [x] `subjectProgress` object added with ELA and Math

## Part 2: Add Functions (10 minutes)

Location: After line 28918 in `index.html`

- [ ] Find `function resetProgressCounters()`
- [ ] After its closing `}`, insert ALL functions from `subject-progress-integration.js` lines 6-147:
  - [ ] `createEmptyProgress()`
  - [ ] `ensureSubjectProgress()`
  - [ ] `getCurrentSubject()`
  - [ ] `getCurrentSubjectProgress()`
  - [ ] `awardSubjectStickerAndPage()`
  - [ ] `markSubjectStationComplete()`
  - [ ] `getSubjectProgressStats()`
  - [ ] `migrateToSubjectProgress()`
  - [ ] `renderSubjectProgressCards()`

## Part 3: Update Existing Functions (15 minutes)

### 3.1 Update `awardStickerAndPage()` (Line ~28910)

- [ ] Find function `awardStickerAndPage()`
- [ ] Replace entire function body with: `awardSubjectStickerAndPage();`

### 3.2 Update `showComplete()` (Line ~28364)

- [ ] Find: `state.completedStations.push(state.currentStation);`
- [ ] Add AFTER it: `markSubjectStationComplete(state.currentStation);`

### 3.3 Update `saveProgress()` (Line ~28789)

- [ ] Find the `saveData` object
- [ ] Find line: `mastery: normalizeMasteryData(state.mastery),`
- [ ] Add AFTER it: `subjectProgress: ensureSubjectProgress(),`

### 3.4 Update `loadProgress()` - First Block (Line ~28675)

- [ ] Find: `state.mastery = normalizeMasteryData(p.mastery);`
- [ ] Add AFTER it:
  ```javascript
  if (p.subjectProgress) state.subjectProgress = p.subjectProgress;
  migrateToSubjectProgress();
  ```

### 3.5 Update `loadProgress()` - Else Block (Line ~28695)

- [ ] Find the else block: `state.mastery = normalizeMasteryData(p.mastery);`
- [ ] Add AFTER it: `migrateToSubjectProgress();`

### 3.6 Update `normalizeProgressData()` (Line ~18571)

- [ ] Find the return statement
- [ ] Find line: `mastery: normalizeMasteryData(obj.mastery),`
- [ ] Add AFTER it:
  ```javascript
  subjectProgress: obj.subjectProgress && typeof obj.subjectProgress === 'object'
    ? obj.subjectProgress
    : { ela: createEmptyProgress(), math: createEmptyProgress() },
  ```

### 3.7 Update `resetProgress()` (Line ~28552)

- [ ] Find: `state.masteredWords = new Set();`
- [ ] Add AFTER it:
  ```javascript
  state.subjectProgress = {
    ela: createEmptyProgress(),
    math: createEmptyProgress()
  };
  ```

## Part 4: Add CSS Styles (5 minutes)

- [ ] Find the `<style>` section in `index.html`
- [ ] Scroll to bottom (before `</style>` tag)
- [ ] Copy ALL styles from `subject-progress-styles.css`
- [ ] Paste before `</style>`

## Part 5: Add UI Container (2 minutes)

- [ ] Find the settings modal (search for "Progress")
- [ ] Find line with: `<label class="setting-label">Progress</label>`
- [ ] After that setting-group, add:
  ```html
  <div class="setting-group">
    <label class="setting-label">Subject Progress</label>
    <div id="subjectProgressContainer"></div>
  </div>
  ```

## Part 6: Render Progress Cards (3 minutes)

Choose ONE of these options:

### Option A: Update `updateProgress()` function
- [ ] Find `function updateProgress()`
- [ ] Add before the final `saveProgress()` call:
  ```javascript
  const container = document.getElementById('subjectProgressContainer');
  if (container) {
    container.innerHTML = '';
    renderSubjectProgressCards(container);
  }
  ```

### Option B: Update `openSettings()` or similar
- [ ] Find function that opens settings modal
- [ ] Add this code:
  ```javascript
  const container = document.getElementById('subjectProgressContainer');
  if (container) {
    container.innerHTML = '';
    renderSubjectProgressCards(container);
  }
  ```

## Part 7: Testing (10 minutes)

### Test Basic Functionality
- [ ] Open app in browser
- [ ] Check console for errors
- [ ] Open settings modal
- [ ] Verify subject progress cards display

### Test ELA Progress
- [ ] Select an ELA station
- [ ] Complete a page
- [ ] Check ELA stickers increased
- [ ] Check Math stickers unchanged

### Test Math Progress
- [ ] Switch to Math subject
- [ ] Select a Math station
- [ ] Complete a page
- [ ] Check Math stickers increased
- [ ] Check ELA stickers unchanged

### Test Persistence
- [ ] Refresh page
- [ ] Verify progress persists
- [ ] Check localStorage has `subjectProgress`

### Test Migration
If you have old progress:
- [ ] Clear localStorage
- [ ] Manually add old-format data
- [ ] Refresh page
- [ ] Verify data migrated to ELA

### Test Reset
- [ ] Click "Reset All" in settings
- [ ] Verify both ELA and Math reset to 0
- [ ] Verify global totals also reset

## Part 8: Verification (5 minutes)

- [ ] No console errors
- [ ] Subject cards render correctly
- [ ] Colors are correct (Green for ELA, Blue for Math)
- [ ] Icons display (📚 for ELA, 🔢 for Math)
- [ ] Numbers update correctly
- [ ] Progress persists across refresh
- [ ] Firebase sync works (if enabled)
- [ ] Mobile responsive (test on small screen)

## Troubleshooting

### Progress not tracking?
- [ ] Check `getCurrentSubject()` returns correct value
- [ ] Verify `stationSelection.currentSubject` is set
- [ ] Check console for errors in `awardSubjectStickerAndPage()`

### Cards not displaying?
- [ ] Check `#subjectProgressContainer` exists in HTML
- [ ] Verify CSS styles were added
- [ ] Check `renderSubjectProgressCards()` is called

### Data not saving?
- [ ] Verify `subjectProgress` added to `saveData`
- [ ] Check localStorage in browser DevTools
- [ ] Verify `ensureSubjectProgress()` is called

### Migration not working?
- [ ] Check `migrateToSubjectProgress()` is called in `loadProgress()`
- [ ] Verify old data exists before migration
- [ ] Check console for migration logs

## Post-Integration Cleanup

- [ ] Remove `subject-progress-integration.js` (already integrated)
- [ ] Remove `subject-progress-styles.css` (already integrated)
- [ ] Keep documentation files for reference
- [ ] Commit changes to version control
- [ ] Test on production environment

## Estimated Time

- Part 1: Already done ✅
- Part 2: 10 minutes
- Part 3: 15 minutes
- Part 4: 5 minutes
- Part 5: 2 minutes
- Part 6: 3 minutes
- Part 7: 10 minutes
- Part 8: 5 minutes

**Total: ~50 minutes**

## Success Criteria

✅ All checkboxes completed
✅ No console errors
✅ Subject progress cards display
✅ ELA and Math tracked separately
✅ Progress persists after refresh
✅ Old data migrates to ELA
✅ Reset clears both subjects
✅ Firebase sync works (if configured)

## Need Help?

1. Check `SUBJECT-PROGRESS-INTEGRATION-GUIDE.md` for detailed steps
2. Check `INTEGRATION-VISUAL-GUIDE.md` for diagrams
3. Check `IMPLEMENTATION-SUMMARY.md` for overview
4. Review `subject-progress-integration.js` for function definitions
5. Review `subject-progress-styles.css` for CSS

---

**Last Updated:** 2025-12-22
**Version:** 1.0
**Status:** Ready for integration
