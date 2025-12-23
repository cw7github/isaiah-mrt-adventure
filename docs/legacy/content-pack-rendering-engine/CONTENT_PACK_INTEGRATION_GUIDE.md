# Content Pack Rendering Engine - Integration Guide

## Overview

The Content Pack Rendering Engine is a modular system for loading and rendering lesson content from `content-pack.v1.json`. This document explains how to integrate it into `index.html`.

## Files Created

1. **content-pack-rendering-engine.js** - The complete rendering engine
2. **This guide** - Integration instructions

## System Components

### 1. CONTENT LOADER

Functions for fetching and parsing content-pack.v1.json:

- `loadContentPack(url)` - Loads and caches the content pack
- `getStation(stationId)` - Gets a station by ID
- `getPage(stationId, pageIndex)` - Gets a specific page
- `getStationPages(stationId)` - Gets all pages for a station
- `getStationCount()` - Gets total station count
- `getStationByIndex(index)` - Gets station by order index

### 2. PAGE RENDERERS

Render functions for each page type:

#### a) renderReadPage(page, stationContext)
- Displays sentence with tap-to-hear words
- Highlights targetWords differently
- Shows sightWordFocus prominently
- Displays readingTip
- Shows image/emoji
- "Read to Me" button for full sentence audio
- "Next" button when ready

#### b) renderMenuPage(page, stationContext)
- Displays prompt and menuStory
- Shows 3 items as large tappable cards
- Icons and descriptions
- Tracks selection for analytics

#### c) renderQuestionPage(page, stationContext)
- Shows question text
- Displays passage (key sentence)
- Shows 3 answer buttons
- Handles answer selection:
  - Correct: celebration animation, show successMessage, advance
  - Incorrect: gentle feedback, show comprehensionHint, highlight passage, retry
- Tracks attempts for mastery

#### d) renderActivitySpecPage(page, stationContext)
- Placeholder for future activity types
- Shows prompt and "Coming Soon" for now

### 3. PAGE NAVIGATION

- `continueToNextPage()` - Advances to next page
- `goToPreviousPage()` - Goes back if allowed
- `handleLessonComplete()` - Detects lesson completion and triggers transitions

### 4. STATE MANAGEMENT

- `saveLessonProgress()` - Saves current station/page to localStorage
- `loadLessonProgress()` - Restores progress from localStorage
- `clearLessonProgress()` - Clears saved progress
- `initializeContentPack()` - Initialize on page load

State tracked:
- currentStation
- currentPageIndex
- answersGiven
- attemptsPerQuestion
- lessonStartTime
- timePerPage

## Integration Steps

### Step 1: Add the Script to index.html

Add the content pack rendering engine right after the `<script>` tag, before the `// ===== GAME STATE =====` section:

```html
<script>
  // ===== CONTENT PACK RENDERING ENGINE =====
  [Insert entire content from content-pack-rendering-engine.js here]
  // ===== END CONTENT PACK RENDERING ENGINE =====

  // ===== GAME STATE =====
  // ... existing code continues
</script>
```

### Step 2: Initialize on Page Load

Find the existing window.onload or DOMContentLoaded handler and add:

```javascript
// Initialize content pack
await initializeContentPack();
```

### Step 3: Update Existing Functions

The rendering engine provides new implementations that can replace or supplement existing functions:

#### Replace getCurrentStationPages()

```javascript
// OLD
function getCurrentStationPages() {
  const station = stationContent[state.currentStation];
  return station?.pages || [];
}

// NEW - uses content pack
function getCurrentStationPages() {
  return getStationPages(state.currentStation);
}
```

#### Update showPage()

The existing `showPage()` function should dispatch to the new renderers:

```javascript
function showPage() {
  stopGuidanceAudioOnNavigation({ fadeMs: 120 });
  const pages = getCurrentStationPages();
  const page = pages[state.currentPage];
  if (!page) return;

  // Between passages, ride the elevator to a new floor + new scene.
  if (maybeStartLessonElevatorTransitionForCurrentPage()) return;

  // Mobile UX: always start each page at the top
  const restaurantScreen = document.getElementById('restaurantScreen');
  if (restaurantScreen) restaurantScreen.scrollTop = 0;

  // Update MRT lesson progress bar
  updateMRTProgressBar();

  // Update MRT line indicator
  updateMRTLineIndicator();

  // Use new rendering engine
  const station = getStation(state.currentStation);

  if (page.type === 'read') {
    renderReadPage(page, station);
  } else if (page.type === 'menu') {
    renderMenuPage(page, station);
  } else if (page.type === 'question') {
    renderQuestionPage(page, station);
  } else if (page.type === 'activitySpec') {
    renderActivitySpecPage(page, station);
  }

  if (state.currentScreen === 'restaurantScreen') {
    playLessonGuidanceForPage(page);
  }

  // Keep the next step snappy: warm audio for the current page + the next page.
  preloadUpcomingLessonAudio({ pages, currentIndex: state.currentPage });
}
```

### Step 4: Update Continue Button Handler

Make sure the continue button uses the new navigation:

```javascript
// Find the continueBtn onclick handler and update it:
document.getElementById('continueBtn').onclick = () => {
  continueToNextPage();
};
```

## Key Features

### Caching
- Content pack is loaded once and cached in memory
- Subsequent calls return cached data instantly

### Error Handling
- All functions include try-catch blocks
- Console logging for debugging
- Graceful fallbacks for missing data

### State Persistence
- Progress saved to localStorage automatically
- Resume from where you left off on page reload
- Clear progress when needed

### Analytics Ready
- All render functions log key events
- Track answer attempts, time per page, etc.
- Easy to integrate with cloud sync

## Content Pack Structure

The engine expects content-pack.v1.json with this structure:

```json
{
  "schemaVersion": 1,
  "source": { ... },
  "uiDefaults": { ... },
  "stationOrder": ["station_id_1", "station_id_2", ...],
  "stations": {
    "station_id_1": {
      "name": "Station Name",
      "icon": "🎯",
      "level": 1,
      "sightWords": ["I", "see", "a"],
      "pages": [
        {
          "type": "read",
          "sentence": "I see a cat.",
          "targetWords": ["cat"],
          "sightWordFocus": "I",
          "readingTip": "Point to each word.",
          "image": "🐱"
        },
        {
          "type": "question",
          "question": "What did I see?",
          "passage": "I see a cat.",
          "answers": [
            { "name": "A cat", "icon": "🐱" },
            { "name": "A dog", "icon": "🐶" }
          ],
          "correctAnswerName": "A cat",
          "successMessage": "Yes! You saw a cat!",
          "comprehensionHint": "Look at the sentence again."
        }
      ]
    }
  }
}
```

## Helper Functions Required

The rendering engine depends on these existing functions from index.html:

- `splitSentenceIntoWords(sentence)` - Splits sentence into word array
- `tapWord(word, element)` - Handles word tap
- `speak(text, rate)` - TTS function
- `unlockAudioContext()` - Audio unlock for iOS
- `armSightWordGate(word)` - Gates continue button
- `clearSightWordGate()` - Clears gate
- `satisfySightWordGate()` - Satisfies gate requirement
- `maybeAnnounceSightWordGateSatisfied()` - Announces satisfaction
- `selectMenuItem(item, button)` - Handles menu selection
- `setContinueEnabled(enabled)` - Enables/disables continue button
- `updateProgress()` - Updates global progress
- `showScreen(screenId)` - Shows a screen
- `updateMRTProgressBar()` - Updates progress bar
- `updateMRTLineIndicator()` - Updates line indicator
- `maybeStartLessonElevatorTransitionForCurrentPage()` - Elevator transitions
- `playLessonGuidanceForPage(page)` - Plays guidance audio
- `preloadUpcomingLessonAudio(options)` - Preloads audio

All of these already exist in index.html and don't need changes.

## Testing

1. Load index.html in browser
2. Open developer console
3. Check for `[ContentPack] Loading from:` log
4. Check for `[ContentPack] Loaded successfully:` log
5. Click a station to start a lesson
6. Verify pages render correctly
7. Check navigation between pages
8. Test localStorage persistence (reload page)

## Troubleshooting

### Content Pack Won't Load
- Check file path: `content/cpa-grade1-ela/content-pack.v1.json`
- Check console for fetch errors
- Verify JSON is valid

### Pages Don't Render
- Check `[Render]` console logs
- Verify page type matches renderer (read, menu, question, activitySpec)
- Check that required HTML elements exist (sentenceDisplay, menuGrid, answerGrid, etc.)

### Navigation Broken
- Verify `continueToNextPage()` is called on continue button
- Check `state.currentStation` is set
- Verify `state.currentPage` is incrementing

### State Not Persisting
- Check localStorage quota
- Verify `saveLessonProgress()` is called
- Check console for save errors

## Future Enhancements

1. **Activity Renderer** - Implement full activitySpec rendering
2. **Animation System** - Add page transition animations
3. **Prefetching** - Preload next station's content
4. **Offline Mode** - Cache content pack in IndexedDB
5. **Multiple Content Packs** - Support switching between different curricula
6. **Progress Analytics** - Detailed tracking of time, attempts, mastery
7. **Cloud Sync** - Integrate with Firebase for multi-device sync

## API Reference

### Content Pack API

```javascript
// Load content pack (async)
const data = await loadContentPack('path/to/content-pack.json');

// Get station
const station = getStation('rl_l1_key_details_wh');

// Get specific page
const page = getPage('rl_l1_key_details_wh', 0);

// Get all pages
const pages = getStationPages('rl_l1_key_details_wh');

// Get station count
const count = getStationCount();

// Get station by index
const station = getStationByIndex(0);
```

### Rendering API

```javascript
// Render a read page
renderReadPage(page, station);

// Render a menu page
renderMenuPage(page, station);

// Render a question page
renderQuestionPage(page, station);

// Render an activity page
renderActivitySpecPage(page, station);
```

### Navigation API

```javascript
// Go to next page
continueToNextPage();

// Go to previous page
goToPreviousPage();

// Handle lesson completion
handleLessonComplete();
```

### State API

```javascript
// Save progress
saveLessonProgress();

// Load progress
const hasProgress = loadLessonProgress();

// Clear progress
clearLessonProgress();

// Initialize on load
await initializeContentPack();
```

## Summary

The Content Pack Rendering Engine provides a clean, modular way to:

1. Load lesson content from JSON
2. Render different page types consistently
3. Handle navigation and state management
4. Save and restore progress

It's designed to work with the existing index.html code while providing a foundation for future enhancements and content management.
