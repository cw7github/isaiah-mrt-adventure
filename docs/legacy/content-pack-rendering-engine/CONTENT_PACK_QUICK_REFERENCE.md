# Content Pack Rendering Engine - Quick Reference

## Quick Start

```javascript
// 1. Initialize on page load
await initializeContentPack();

// 2. Get station data
const station = getStation('rl_l1_key_details_wh');

// 3. Get page data
const page = getPage('rl_l1_key_details_wh', 0);

// 4. Render the page
if (page.type === 'read') renderReadPage(page, station);
if (page.type === 'menu') renderMenuPage(page, station);
if (page.type === 'question') renderQuestionPage(page, station);
if (page.type === 'activitySpec') renderActivitySpecPage(page, station);

// 5. Navigate
continueToNextPage(); // or goToPreviousPage();
```

## Function Reference

### Content Loaders

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `loadContentPack()` | `url?` | `Promise<data>` | Loads and caches content pack |
| `getStation()` | `stationId` | `Object\|null` | Gets station by ID |
| `getPage()` | `stationId, pageIndex` | `Object\|null` | Gets specific page |
| `getStationPages()` | `stationId` | `Array` | Gets all pages for station |
| `getStationCount()` | - | `Number` | Gets total station count |
| `getStationByIndex()` | `index` | `Object\|null` | Gets station by order index |

### Page Renderers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `renderReadPage()` | `page, stationContext` | `void` | Renders a reading page |
| `renderMenuPage()` | `page, stationContext` | `void` | Renders a menu/choice page |
| `renderQuestionPage()` | `page, stationContext` | `void` | Renders a question page |
| `renderActivitySpecPage()` | `page, stationContext` | `void` | Renders an activity page |
| `handleAnswerSelection()` | `answer, button, page` | `void` | Handles answer clicks |

### Navigation

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `continueToNextPage()` | - | `void` | Advances to next page |
| `goToPreviousPage()` | - | `void` | Goes back one page |
| `handleLessonComplete()` | - | `void` | Handles lesson completion |

### State Management

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `saveLessonProgress()` | - | `void` | Saves progress to localStorage |
| `loadLessonProgress()` | - | `Boolean` | Loads progress from localStorage |
| `clearLessonProgress()` | - | `void` | Clears saved progress |
| `initializeContentPack()` | - | `Promise<Boolean>` | Initializes system |

## Page Type Specifications

### Read Page

```javascript
{
  type: 'read',
  sentence: 'I see a big red apple.',
  targetWords: ['big', 'red', 'apple'],
  sightWordFocus: 'I',
  readingTip: 'Point to each word as you read.',
  image: '🍎',
  requireSightWordTap: true
}
```

**Renders:**
- Sentence with clickable words
- Sight word highlighting
- Target word emphasis
- Reading tip in help box
- "Read to Me" button
- "Next" button (gated if requireSightWordTap)

### Menu Page

```javascript
{
  type: 'menu',
  prompt: 'What would you like?',
  menuStory: 'Think about the story: colors, sizes, tastes.',
  items: [
    { name: 'Red Apple', icon: '🍎', description: 'Sweet and crispy' },
    { name: 'Green Apple', icon: '🍏', description: 'Sour and crunchy' },
    { name: 'Yellow Banana', icon: '🍌', description: 'Soft and sweet' }
  ]
}
```

**Renders:**
- Prompt text
- Story context box
- 3 large tappable item cards
- Continue button (appears after selection)

### Question Page

```javascript
{
  type: 'question',
  question: 'What color was the apple?',
  passage: 'I see a big red apple.',
  questionType: 'comprehension',
  questionMode: 'multipleChoice',
  answers: [
    { name: 'Red', icon: '🔴' },
    { name: 'Green', icon: '🟢' },
    { name: 'Yellow', icon: '🟡' }
  ],
  correctAnswerName: 'Red',
  successMessage: 'Yes! The apple was red!',
  comprehensionHint: 'Look for the color word in the sentence.'
}
```

**Renders:**
- Question text
- Passage box (initially hidden for comprehension)
- 3 shuffled answer buttons
- Success feedback (on correct)
- Comprehension hint (on incorrect)
- Continue button (appears when correct)

### Activity Page

```javascript
{
  type: 'activitySpec',
  prompt: 'Match the pictures to the words!'
}
```

**Renders:**
- Coming soon placeholder
- Continue button

## State Structure

```javascript
// Global state object
state = {
  currentStation: 'rl_l1_key_details_wh',
  currentPage: 0,
  completedStations: [],
  // ... other properties
}

// Content pack state
contentPack = {
  loaded: true,
  data: { /* content pack JSON */ },
  stations: { /* indexed by ID */ },
  stationOrder: ['id1', 'id2', ...],
  uiDefaults: { /* global settings */ },
  error: null
}
```

## LocalStorage Keys

```javascript
STATE_KEYS = {
  CURRENT_STATION: 'isaiahCurrentStation',
  CURRENT_PAGE: 'isaiahCurrentPage',
  ANSWERS_GIVEN: 'isaiahAnswersGiven',
  ATTEMPTS_PER_QUESTION: 'isaiahAttemptsPerQuestion',
  LESSON_START_TIME: 'isaiahLessonStartTime',
  TIME_PER_PAGE: 'isaiahTimePerPage'
}
```

## Console Log Prefixes

| Prefix | Component |
|--------|-----------|
| `[ContentPack]` | Content loading |
| `[Render]` | Page rendering |
| `[Navigation]` | Page navigation |
| `[State]` | State management |
| `[Analytics]` | Analytics tracking |

## Common Patterns

### Starting a Lesson

```javascript
// 1. Set current station
state.currentStation = 'rl_l1_key_details_wh';
state.currentPage = 0;

// 2. Load the first page
const pages = getStationPages(state.currentStation);
const firstPage = pages[0];
const station = getStation(state.currentStation);

// 3. Render it
if (firstPage.type === 'read') {
  renderReadPage(firstPage, station);
}

// 4. Save progress
saveLessonProgress();
```

### Continuing to Next Page

```javascript
// Just call this - handles everything
continueToNextPage();

// It will:
// - Increment state.currentPage
// - Check if lesson is complete
// - Render next page OR show reward screen
// - Save progress
```

### Checking Completion

```javascript
const pages = getStationPages(state.currentStation);
const isComplete = state.currentPage >= pages.length - 1;

if (isComplete) {
  handleLessonComplete();
}
```

### Resuming from Saved Progress

```javascript
// On page load
const hasProgress = loadLessonProgress();

if (hasProgress) {
  // state.currentStation and state.currentPage are now set
  showPage(); // Render the saved page
} else {
  // Show welcome screen or station selector
  showScreen('welcomeScreen');
}
```

## Error Handling

All functions log errors to console and return safe defaults:

```javascript
// Returns null if not found
const station = getStation('invalid_id'); // null

// Returns empty array if not found
const pages = getStationPages('invalid_id'); // []

// Returns null if index out of bounds
const page = getPage('station_id', 999); // null

// Logs error but doesn't throw
try {
  await loadContentPack();
} catch (error) {
  // Error is logged, contentPack.error is set
  console.log(contentPack.error);
}
```

## Integration Checklist

- [ ] Add content-pack-rendering-engine.js to index.html
- [ ] Call `await initializeContentPack()` on page load
- [ ] Update `getCurrentStationPages()` to use `getStationPages()`
- [ ] Update `showPage()` to dispatch to new renderers
- [ ] Connect continue button to `continueToNextPage()`
- [ ] Verify content pack path is correct
- [ ] Test in browser console
- [ ] Check localStorage persistence
- [ ] Verify all page types render correctly

## File Locations

```
/Users/charleswu/Desktop/+/home_school/isaiah_school/
├── index.html (integrate engine here)
├── content-pack-rendering-engine.js (source code)
├── CONTENT_PACK_INTEGRATION_GUIDE.md (detailed guide)
├── CONTENT_PACK_QUICK_REFERENCE.md (this file)
└── content/
    └── cpa-grade1-ela/
        └── content-pack.v1.json (data source)
```

## Performance Tips

1. Content pack is cached - only loads once
2. Use `getStationPages()` instead of direct access
3. Preload next page's audio in background
4. Save progress after page changes, not on every interaction
5. Use console logs to debug, remove in production

## Next Steps

1. Read CONTENT_PACK_INTEGRATION_GUIDE.md for full details
2. Copy content-pack-rendering-engine.js into index.html
3. Test with a single station first
4. Expand to all stations
5. Add analytics tracking
6. Implement cloud sync
