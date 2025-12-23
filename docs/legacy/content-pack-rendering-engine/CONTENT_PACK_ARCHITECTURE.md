# Content Pack Rendering Engine - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  (index.html - Existing UI Components)                          │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Reading   │  │    Menu     │  │  Question   │             │
│  │   Section   │  │   Section   │  │   Section   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONTENT PACK RENDERING ENGINE                       │
│  (content-pack-rendering-engine.js - New Module)                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. CONTENT LOADER                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ loadContent  │  │  getStation  │  │   getPage    │  │  │
│  │  │    Pack()    │  │     ()       │  │     ()       │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. PAGE RENDERERS                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  renderRead  │  │ renderMenu   │  │renderQuestion│  │  │
│  │  │   Page()     │  │   Page()     │  │   Page()     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐                                        │  │
│  │  │renderActivity│                                        │  │
│  │  │ SpecPage()   │                                        │  │
│  │  └──────────────┘                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. PAGE NAVIGATION                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │continueToNext│  │goToPrevious  │  │handleLesson  │  │  │
│  │  │   Page()     │  │   Page()     │  │ Complete()   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. STATE MANAGEMENT                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ saveLesson   │  │ loadLesson   │  │ clearLesson  │  │  │
│  │  │ Progress()   │  │ Progress()   │  │ Progress()   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                                │
│                                                                   │
│  ┌──────────────────────┐         ┌───────────────────────┐    │
│  │  content-pack.v1.json│         │   localStorage        │    │
│  │  ┌────────────────┐  │         │  ┌─────────────────┐  │    │
│  │  │   Stations     │  │         │  │ Current Station │  │    │
│  │  │   Pages        │  │ ◄─────► │  │ Current Page    │  │    │
│  │  │   UI Defaults  │  │         │  │ Progress Data   │  │    │
│  │  └────────────────┘  │         │  └─────────────────┘  │    │
│  └──────────────────────┘         └───────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialization Flow

```
Page Load
    │
    ▼
initializeContentPack()
    │
    ├─► loadContentPack()
    │       │
    │       ├─► fetch('content-pack.v1.json')
    │       ├─► Parse JSON
    │       ├─► Validate structure
    │       └─► Cache in contentPack object
    │
    └─► loadLessonProgress()
            │
            ├─► Read from localStorage
            └─► Set state.currentStation, state.currentPage
```

### 2. Rendering Flow

```
User clicks station
    │
    ▼
startLesson(stationId)
    │
    ├─► state.currentStation = stationId
    ├─► state.currentPage = 0
    │
    ▼
showPage()
    │
    ├─► getStationPages(state.currentStation)
    ├─► getStation(state.currentStation)
    │
    ├─► Switch on page.type:
    │   ├─► 'read' → renderReadPage(page, station)
    │   ├─► 'menu' → renderMenuPage(page, station)
    │   ├─► 'question' → renderQuestionPage(page, station)
    │   └─► 'activitySpec' → renderActivitySpecPage(page, station)
    │
    └─► saveLessonProgress()
```

### 3. Navigation Flow

```
User clicks Continue
    │
    ▼
continueToNextPage()
    │
    ├─► state.currentPage++
    │
    ├─► if (state.currentPage >= pages.length)
    │   └─► handleLessonComplete()
    │           │
    │           ├─► Mark station completed
    │           ├─► updateProgress()
    │           └─► showScreen('rewardScreen')
    │
    └─► else
        └─► showPage()
```

### 4. Page Type Rendering

#### Read Page Flow
```
renderReadPage(page, station)
    │
    ├─► Show reading section
    ├─► Hide menu/question sections
    │
    ├─► Display sentence image (if present)
    │
    ├─► Render sentence:
    │   └─► For each word:
    │       ├─► Check if sight word → add 'sight-word' class
    │       ├─► Check if focus word → add 'focus-word' class
    │       ├─► Check if target word → add 'target-word' class
    │       └─► Add click handler → tapWord()
    │
    ├─► Show reading tip
    ├─► Show sight word focus box
    │
    ├─► Determine if gated (requireSightWordTap)
    │   ├─► Yes → armSightWordGate()
    │   └─► No → clearSightWordGate()
    │
    └─► Show continue button
```

#### Menu Page Flow
```
renderMenuPage(page, station)
    │
    ├─► Show menu section
    ├─► Hide reading/question sections
    │
    ├─► Display prompt
    ├─► Display menu story (if present)
    │
    ├─► Render menu items:
    │   └─► For each item:
    │       ├─► Create button with icon, name, description
    │       └─► Add click handler → selectMenuItem()
    │
    └─► Hide continue button (until selection)
```

#### Question Page Flow
```
renderQuestionPage(page, station)
    │
    ├─► Show question section
    ├─► Hide reading/menu sections
    │
    ├─► Display question text
    │
    ├─► Display passage (if present):
    │   └─► For each word:
    │       └─► Add click handler → speak(word)
    │
    ├─► Display comprehension hint (hidden initially)
    │
    ├─► Shuffle and render answers:
    │   └─► For each answer:
    │       ├─► Create button with icon, name
    │       └─► Add click handler → handleAnswerSelection()
    │
    └─► Hide continue button (until correct answer)
```

### 5. Answer Selection Flow

```
User clicks answer
    │
    ▼
handleAnswerSelection(answer, button, page)
    │
    ├─► Check if correct (answer.name === page.correctAnswerName)
    │
    ├─► If CORRECT:
    │   ├─► Add 'correct' class to button
    │   ├─► Show success message
    │   ├─► Play celebration sound
    │   └─► Show continue button
    │
    └─► If INCORRECT:
        ├─► Add 'incorrect' class to button
        ├─► Play gentle feedback
        ├─► Show comprehension hint
        ├─► Highlight passage
        └─► Allow retry (remove classes after delay)
```

## Component Relationships

```
┌──────────────────────────────────────────────────────────┐
│                    contentPack Object                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  loaded: boolean                                    │  │
│  │  data: { schemaVersion, stations, stationOrder }   │  │
│  │  stations: { stationId: stationObject }            │  │
│  │  stationOrder: ['id1', 'id2', ...]                 │  │
│  │  uiDefaults: { voice, backgroundStyle, ... }       │  │
│  │  error: string | null                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        │
                        │ provides data to
                        ▼
┌──────────────────────────────────────────────────────────┐
│                     state Object                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  currentStation: string                            │  │
│  │  currentPage: number                               │  │
│  │  completedStations: [stationIds]                   │  │
│  │  ... (other app state)                             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        │
                        │ used by
                        ▼
┌──────────────────────────────────────────────────────────┐
│                  Rendering Functions                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │  renderReadPage()                                  │  │
│  │  renderMenuPage()                                  │  │
│  │  renderQuestionPage()                              │  │
│  │  renderActivitySpecPage()                          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        │
                        │ update
                        ▼
┌──────────────────────────────────────────────────────────┐
│                       DOM                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  #sentenceDisplay                                  │  │
│  │  #menuGrid                                         │  │
│  │  #answerGrid                                       │  │
│  │  #continueBtn                                      │  │
│  │  ... (other elements)                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Function Dependency Graph

```
initializeContentPack()
    ├── loadContentPack()
    └── loadLessonProgress()

showPage()
    ├── getStationPages()
    │   └── getStation()
    ├── getStation()
    ├── renderReadPage()
    │   ├── splitSentenceIntoWords()
    │   ├── tapWord()
    │   ├── armSightWordGate()
    │   └── clearSightWordGate()
    ├── renderMenuPage()
    │   ├── selectMenuItem()
    │   └── clearSightWordGate()
    ├── renderQuestionPage()
    │   ├── splitSentenceIntoWords()
    │   ├── speak()
    │   ├── handleAnswerSelection()
    │   └── clearSightWordGate()
    └── renderActivitySpecPage()
        └── continueToNextPage()

continueToNextPage()
    ├── getStationPages()
    ├── handleLessonComplete()
    │   ├── updateProgress()
    │   └── showScreen()
    └── showPage()

saveLessonProgress()
    └── localStorage.setItem()

loadLessonProgress()
    ├── localStorage.getItem()
    └── getStation()
```

## State Lifecycle

```
┌─────────────────┐
│   Page Load     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Initialize     │ ◄─── loadContentPack()
│  Content Pack   │ ◄─── loadLessonProgress()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ready State    │
│ (station select)│
└────────┬────────┘
         │
         │ User selects station
         ▼
┌─────────────────┐
│  Lesson Active  │ ◄─── showPage()
│  (page N)       │ ◄─── saveLessonProgress()
└────────┬────────┘
         │
         │ User clicks continue
         ▼
┌─────────────────┐
│  Page N+1       │ ◄─── continueToNextPage()
└────────┬────────┘
         │
         │ Last page?
         ▼
┌─────────────────┐
│ Lesson Complete │ ◄─── handleLessonComplete()
│ (reward screen) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ready State    │
│ (next station)  │
└─────────────────┘
```

## localStorage Structure

```
localStorage
├── isaiahCurrentStation: "rl_l1_key_details_wh"
├── isaiahCurrentPage: "3"
├── isaiahAnswersGiven: "{...}"
├── isaiahAttemptsPerQuestion: "{...}"
├── isaiahLessonStartTime: "1703123456789"
└── isaiahTimePerPage: "[120000, 95000, 180000]"
```

## Content Pack JSON Structure

```json
{
  "schemaVersion": 1,
  "source": {
    "plan": "docs/...",
    "contentStandards": "docs/..."
  },
  "uiDefaults": {
    "voice": "elevenlabs:angela",
    "backgroundStyle": "taipei-ghibli"
  },
  "stationOrder": [
    "rf_f1_print_concepts",
    "rl_l1_key_details_wh",
    ...
  ],
  "stations": {
    "rf_f1_print_concepts": {
      "name": "Library Stop",
      "icon": "📚",
      "level": 1,
      "line": "RF",
      "sightWords": ["I", "a", "the"],
      "pages": [
        {
          "type": "read",
          "sentence": "I see a book.",
          "targetWords": ["book"],
          "sightWordFocus": "I",
          "readingTip": "..."
        },
        {
          "type": "question",
          "question": "What did I see?",
          "answers": [...],
          "correctAnswerName": "..."
        }
      ]
    }
  }
}
```

## Integration Points with Existing Code

### Required from index.html:
- `state` object
- `splitSentenceIntoWords()`
- `tapWord()`
- `speak()`
- `unlockAudioContext()`
- `armSightWordGate()`
- `clearSightWordGate()`
- `satisfySightWordGate()`
- `maybeAnnounceSightWordGateSatisfied()`
- `selectMenuItem()`
- `setContinueEnabled()`
- `updateProgress()`
- `showScreen()`
- `updateMRTProgressBar()`
- `updateMRTLineIndicator()`
- `maybeStartLessonElevatorTransitionForCurrentPage()`
- `playLessonGuidanceForPage()`
- `preloadUpcomingLessonAudio()`

### Provided by rendering engine:
- Content loading and caching
- Page type detection and routing
- Rendering logic for all page types
- Navigation between pages
- Progress persistence
- State management helpers

## Performance Considerations

1. **Content Pack Caching**
   - Loaded once on app init
   - Cached in memory (contentPack object)
   - No repeated network requests

2. **Progressive Rendering**
   - Only current page is rendered
   - Previous page content is cleaned up
   - Next page is preloaded in background

3. **State Persistence**
   - Saved to localStorage after navigation
   - Minimal writes (only on page change)
   - Quick reads on app init

4. **Audio Preloading**
   - Current and next page audio preloaded
   - Uses existing preloadUpcomingLessonAudio()
   - Keeps UI responsive

## Error Handling Strategy

```
Try to load content pack
  ├─► Success → Cache and continue
  └─► Failure → Log error, set contentPack.error
                  ├─► Show error screen
                  └─► Allow retry

Try to get station/page
  ├─► Found → Return data
  └─► Not found → Log warning, return null
                    └─► Caller handles gracefully

Try to render page
  ├─► Valid type → Render
  └─► Invalid type → Log error, show fallback
                       └─► Continue button to skip

Try to save progress
  ├─► Success → Log
  └─► Failure → Log error, continue without saving
                  └─► Progress lost on reload (non-critical)
```

## Extension Points

1. **Custom Page Types**
   - Add new renderer: `renderCustomPage()`
   - Add to showPage() switch statement
   - Define page structure in content pack

2. **Analytics Integration**
   - Hook into handleAnswerSelection()
   - Track in continueToNextPage()
   - Log in saveLessonProgress()

3. **Cloud Sync**
   - Replace localStorage with cloud API
   - Keep same save/load interface
   - Add sync conflict resolution

4. **Multi-Pack Support**
   - Pass URL to loadContentPack()
   - Maintain separate cache per pack
   - Allow switching between packs

This architecture provides a solid foundation for the lesson content system while integrating cleanly with the existing index.html code.
