# App Integration Specification for content-pack.v1.json

## Document Purpose
This specification provides a complete technical roadmap for integrating the new content-pack.v1.json format into the existing Isaiah's MRT Food Adventure application. It analyzes the current architecture, identifies reusable components, and maps out the integration path.

---

## 1. CURRENT ARCHITECTURE ANALYSIS

### 1.1 Application Structure Overview

**Single-Page Application (SPA)**
- **File**: `index.html`
- **Architecture**: Vanilla JavaScript, no framework
- **Design Pattern**: Screen-based navigation with global state management

### 1.2 Screen System

The app uses a screen-based navigation system with the following screens:

| Screen ID | Purpose | Key Elements |
|-----------|---------|--------------|
| `welcomeScreen` | Entry point with platform theme | Station sign, board button, user profiles |
| `mrtScreen` | Station selection map | Interactive MRT network visualization |
| `skillsScreen` | Practice mode selection | Adaptive skill recommendations |
| `mrtRideScreen` | Transition animation | Animated train journey between locations |
| `elevatorScreen` | Floor navigation | Multi-floor elevator with door scenes |
| `wordWarmupScreen` | Vocabulary preview (Floor 2) | Word preview cards before lesson |
| `restaurantScreen` | Main lesson content (Floor 3+) | Reading, questions, menu choices |
| `rewardScreen` | Completion celebration | Sticker rewards, progress display |

**Navigation Function:**
```javascript
function goToScreen(screenId)
```
- Hides all screens (`.screen` class)
- Shows target screen by ID
- Updates global state (`state.currentScreen`)
- Triggers guidance audio and buddy visibility updates

### 1.3 State Management

**Global State Object** (Line 15347):
```javascript
const state = {
  // Navigation & UI
  currentScreen: 'welcomeScreen',
  currentStation: null,          // Station ID (e.g., 'fruit', 'bakery')
  currentFloor: 1,               // Elevator floor (1=lobby, 2=warmup, 3+=lesson)
  currentPage: 0,                // Page index within station
  sessionPages: null,            // Resolved pages for current session

  // Lesson Flow (Elevator-based)
  lessonElevatorPlan: null,              // Floor assignment plan
  lessonElevatorSegmentByPage: null,     // Map page→segment
  lessonElevatorVisitedSegments: null,   // Tracking visited floors
  lessonElevatorActiveSegment: 0,        // Current segment
  elevatorTripCounter: 0,                // Trip tracking

  // MRT Map State
  mapTrainStation: null,         // Current station on map
  mapTrainAtHub: false,          // Is train at central hub?

  // Progress & Rewards
  stickers: 0,
  pagesCompleted: 0,
  completedStations: [],
  masteredWords: new Set(),

  // Settings
  soundEnabled: true,
  guidanceEnabled: true,
  calmMode: false,
  fontSize: 'normal',
  highContrast: false,
  sightWordMarksEnabled: true,
  sightWordGateEnabled: true,

  // Sight Word Gate
  requiredSightWord: null,
  sightWordGateSatisfied: true,
  sightWordSkipTimeoutId: null,

  // Analytics
  analytics: {
    schemaVersion: 1,
    stations: {},           // Per-station performance
    skills: {},             // Skill practice results
    strategies: {},         // Strategy usage tracking
    recentAnswers: [],
    recentMistakes: [],
    updatedAt: 0
  },

  // Cloud Backend
  cloud: {
    enabled: false,
    ready: false,
    user: null,
    activeChildId: null,
    activeChild: null,
    children: [],
    syncing: false,
    lastSyncAt: null
  },

  // Profiles (local-first)
  localProfiles: []
}
```

**State Persistence:**
- LocalStorage key: `'isaiahProgress'` (or child-specific key)
- Cloud sync via Firebase Firestore (optional)
- Device-specific counters for multi-device tracking

### 1.4 Content Structure (Current)

**Station Content Object** (Line 17953):
```javascript
const stationContent = {
  [stationId]: {
    name: 'Station Name',          // Display name
    icon: '🍎',                     // Emoji icon
    level: 1,                       // Difficulty level (1-4)
    floor: 3,                       // Starting floor for restaurant
    stickers: ['🍎', '🍊', '🍌', '⭐'],  // Reward stickers
    sightWords: ['I', 'see', 'a'],  // High-frequency words
    previewWords: [                 // Warm-up vocabulary
      { word: 'apple', icon: '🍎', isSightWord: false, phonicsNote: 'a-p-p-le' }
    ],
    pages: [                        // Lesson pages
      {
        type: 'read',               // Page type: read | question | menu
        sentence: 'Text...',        // Main content
        image: '🚂🍎',              // Image/emoji
        targetWords: [],            // Focus words
        sightWordFocus: 'the',      // Focus sight word
        requireSightWordTap: true,  // Gate behavior
        readingTip: 'Help text',    // Instructional guidance
        variants: [...]             // Alternative versions
      },
      {
        type: 'question',
        questionType: 'comprehension',  // comprehension | sightWord
        questionMode: 'multipleChoice', // multipleChoice | fillInBlank
        question: 'Question text',
        passage: 'Reference text',      // Key sentence
        comprehensionHint: 'Help text',
        answers: [
          { name: 'Answer', icon: '🍎' }
        ],
        correctAnswerName: 'Answer',
        successMessage: 'Feedback'
      },
      {
        type: 'menu',
        menuType: 'choice',
        title: 'What do you want?',
        choices: [
          { name: 'Apple', icon: '🍎' }
        ]
      }
    ]
  }
}
```

**Current Stations (15 total)**:
- Level 1 (Red Line): fruit, drink, bakery, redbean
- Level 2 (Blue Line): pizza, bubbletea, burger, icecream
- Level 3 (Green Line): fishshop, sushi, cheese, chicken
- Level 4 (Orange Line): noodle, smoothie, teahouse

### 1.5 Page Rendering System

**Main Rendering Flow:**
1. `buildSessionPagesForStation(stationId)` → Resolves variants, adds sight word checks
2. `showPage()` → Dispatcher for page types
3. Type-specific renderers:
   - `showReadingPage(page)` → Reading passages
   - `showQuestionPage(page)` → Multiple choice & fill-in-blank
   - `showMenuPage(page)` → Choice-based interactions

**Page Flow Control:**
- `continuePage()` → Advances to next page
- `checkAnswer(selectedName)` → Validates answers
- Progress tracking via `state.currentPage`

### 1.6 Lesson Elevator System

**Elevator Floors:**
- Floor 1: Lobby (entry/exit)
- Floor 2: Word Warm-up (vocabulary preview)
- Floor 3: Restaurant (main lesson)
- Floor 4+: Additional reading passages (dynamic scenes)

**Elevator Flow Management:**
```javascript
function resetLessonElevatorFlowForStation(stationId)
// Creates a plan mapping page groups to floors

function maybeStartLessonElevatorTransitionForCurrentPage()
// Checks if page requires floor change, triggers elevator animation

function startElevatorAutoTrip(options)
// Automated elevator journey with door scenes and timing
```

**Door Scenes:**
```javascript
const elevatorDoorScenes = {
  lobby: 'assets/elevator_scenes/lobby.jpg',
  warmup: { [stationId]: 'assets/...' },
  restaurant: { [stationId]: 'assets/...' }
}
```

### 1.7 MRT Train Animation System

**Train Ride Components:**
- Animated train sprite with bobbing motion
- Scrolling background scenes (Taipei landmarks)
- Rolling track ties and wheels
- Themed floaters (food emojis)
- Duration: ~5 seconds typical

**Functions:**
```javascript
function playMRTRide(stationId, options)
// Main ride animation (hub → station)

function playReturnRideToHub(options)
// Return journey animation

function restartRideSceneAnimations({ direction })
// Restart CSS animations for smooth replay
```

**Scene Images:**
- Taipei 101, Night Market, MRT Elevated, Temple, etc.
- Station-specific themes stored in `stationThemes`

### 1.8 Progress & Reward System

**Sticker Awards:**
```javascript
function awardStickerAndPage()
// Increments stickers, updates device counters
// Triggers cloud sync if enabled
```

**Progress Bar (MRT-themed):**
- Desktop: Horizontal line with train indicator
- Mobile: Compact mini-line display
- Shows Read/Question/Menu stops
- Line colors match station level (Red/Blue/Green/Orange)

**Mastery Tracking:**
```javascript
state.analytics = {
  stations: {
    [stationId]: {
      visits: 0,
      completions: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      firstTryCorrect: 0,
      // Per-page, per-question granular tracking
    }
  },
  skills: { /* skill practice results */ },
  strategies: { /* hint usage, evidence tapping */ }
}
```

---

## 2. CONTENT INTEGRATION POINTS

### 2.1 Content Loading Strategy

**Target File:** `content/cpa-grade1-ela/content-pack.v1.json`

**Loading Location:**
Add to initialization section (~line 29000, before `init()` call):

```javascript
// ===== CONTENT PACK LOADING =====
let contentPack = null;
let contentPackStations = {};

async function loadContentPack(url = 'content/cpa-grade1-ela/content-pack.v1.json') {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pack = await response.json();

    if (pack.schemaVersion !== 1) {
      console.warn('Unknown content pack schema version:', pack.schemaVersion);
    }

    contentPack = pack;
    contentPackStations = pack.stations || {};

    console.log('Content pack loaded:', Object.keys(contentPackStations).length, 'stations');
    return pack;
  } catch (err) {
    console.error('Failed to load content pack:', err);
    return null;
  }
}

function getContentSource() {
  // Return 'contentPack' if loaded, else fall back to 'legacy'
  return contentPack ? 'contentPack' : 'legacy';
}

function getStationData(stationId) {
  const source = getContentSource();
  if (source === 'contentPack') {
    return contentPackStations[stationId] || null;
  } else {
    return stationContent[stationId] || null;
  }
}
```

**Initialization Timing:**
Call in `init()` function:
```javascript
async function init() {
  // Existing initialization...
  state.deviceId = getOrCreateDeviceId();
  loadServerTimeOffsetFromStorage();

  // NEW: Load content pack
  await loadContentPack();

  // Existing initialization continues...
  loadProgress();
  bindEventHandlers();
  // ...
}
```

### 2.2 Station Mapping to MRT Lines

**Content Pack Line System:**
```json
"line": "RF"   // Reading Foundations
"line": "RL"   // Reading Literature
"line": "RI"   // Reading Informational
"line": "L"    // Language
```

**Current MRT Line System:**
- Level 1 → Red Line
- Level 2 → Blue Line
- Level 3 → Green Line
- Level 4 → Orange Line

**Mapping Strategy:**

```javascript
function getLineFromContentStation(station) {
  // Map educational standards to MRT lines
  const lineMap = {
    'RF': 1,  // Red Line - Foundational Skills
    'RL': 2,  // Blue Line - Literature
    'RI': 3,  // Green Line - Informational Text
    'L': 4    // Orange Line - Language Standards
  };
  return lineMap[station.line] || 1;
}

function normalizeStationForRendering(stationId) {
  const source = getContentSource();

  if (source === 'contentPack') {
    const cpStation = contentPackStations[stationId];
    if (!cpStation) return null;

    // Transform content pack format to legacy format
    return {
      name: cpStation.name,
      icon: cpStation.icon || '📚',
      level: getLineFromContentStation(cpStation),
      floor: 3,  // Default restaurant floor
      stickers: cpStation.stickers || ['⭐', '🎓', '📖', '✨'],
      sightWords: cpStation.sightWords || [],
      previewWords: cpStation.previewWords || [],
      pages: cpStation.pages || [],
      checklistTargets: cpStation.checklistTargets || [],
      audio: cpStation.audio || {}
    };
  } else {
    return stationContent[stationId] || null;
  }
}
```

### 2.3 Page Rendering Integration

**Modify `buildSessionPagesForStation`:**

```javascript
function buildSessionPagesForStation(stationId) {
  const station = normalizeStationForRendering(stationId);
  if (!station || !Array.isArray(station.pages)) return null;

  // Existing variant resolution logic...
  const resolved = station.pages.map(page => {
    if (!page || !Array.isArray(page.variants) || page.variants.length === 0) return page;
    const variant = pickRandom(page.variants);
    if (!variant) return page;
    const merged = { ...page, ...variant };
    delete merged.variants;
    return merged;
  });

  // Continue with existing logic...
  // (sight word checks, question generation, etc.)
}
```

**Update `showPage()` to handle new UI hints:**

```javascript
function showPage() {
  stopGuidanceAudioOnNavigation({ fadeMs: 120 });
  const pages = getCurrentStationPages();
  const page = pages[state.currentPage];
  if (!page) return;

  // NEW: Apply content pack UI defaults
  if (contentPack && contentPack.uiDefaults) {
    applyContentPackUIDefaults(page, contentPack.uiDefaults);
  }

  // Existing elevator transition check...
  if (maybeStartLessonElevatorTransitionForCurrentPage()) return;

  // Continue with existing rendering...
}

function applyContentPackUIDefaults(page, uiDefaults) {
  // Apply voice preference
  if (page.audio && page.audio.voice) {
    // Store for TTS system
    page._preferredVoice = page.audio.voice;
  } else if (uiDefaults.voice) {
    page._preferredVoice = uiDefaults.voice;
  }

  // Apply highlight policy
  if (page.ui && page.ui.keySentenceHighlightPolicy) {
    page._highlightPolicy = page.ui.keySentenceHighlightPolicy;
  } else if (uiDefaults.keySentenceHighlightPolicy) {
    page._highlightPolicy = uiDefaults.keySentenceHighlightPolicy;
  }

  // Apply evidence requirement
  if (page.ui && typeof page.ui.evidenceTapRequired === 'boolean') {
    page._evidenceRequired = page.ui.evidenceTapRequired;
  } else if (typeof uiDefaults.evidenceTapRequired === 'boolean') {
    page._evidenceRequired = uiDefaults.evidenceTapRequired;
  }
}
```

### 2.4 Station Order & Progression

**Content Pack Station Order:**
The content pack defines a linear progression in `stationOrder` array.

**Current System:**
- Uses MRT map with unlocking logic
- Stations unlock based on completion of previous stations
- TEST_MODE bypasses unlocking

**Integration Approach:**

```javascript
function getStationOrder() {
  if (contentPack && Array.isArray(contentPack.stationOrder)) {
    return contentPack.stationOrder;
  } else {
    // Legacy order (current hardcoded stations)
    return ['fruit', 'drink', 'bakery', 'pizza', 'icecream',
            'fishshop', 'cheese', 'noodle', /* ... */];
  }
}

function getNextStation(currentStationId) {
  const order = getStationOrder();
  const currentIndex = order.indexOf(currentStationId);
  if (currentIndex === -1) return null;
  return order[currentIndex + 1] || null;
}

function unlockNextStation() {
  const currentStation = state.currentStation;
  if (!currentStation) return;

  const nextStation = getNextStation(currentStation);
  if (!nextStation) return;

  // Mark as unlocked (if not already completed)
  if (!state.completedStations.includes(nextStation)) {
    // Station becomes available on map
    // Existing logic handles this via generateMRTMap()
  }
}
```

**Map Generation Update:**

Modify `generateMRTMap()` to use content pack stations:

```javascript
function generateMRTMap() {
  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer) return;

  mapContainer.innerHTML = '';

  const allStations = getStationOrder();
  const stationData = {};

  allStations.forEach(stationId => {
    const station = normalizeStationForRendering(stationId);
    if (!station) return;

    stationData[stationId] = {
      name: station.name,
      icon: station.icon,
      level: station.level,
      checklistTargets: station.checklistTargets || []
    };
  });

  // Continue with existing map rendering logic...
  // Use stationData instead of stationContent
}
```

---

## 3. EXISTING COMPONENTS TO REUSE

### 3.1 Reading Page Components

**FULLY REUSABLE** - Already supports content pack format:

```javascript
function showReadingPage(page)
```

**Features:**
- Word-by-word rendering with sight word highlighting
- Sight word focus chip (interactive button)
- Reading tip box (collapsible help)
- Tap-to-speak functionality
- Sight word gate (optional requirement)
- Read-to-me button (full sentence audio)

**Content Pack Fields Supported:**
- `sentence` → Main text
- `targetWords` → Focus vocabulary
- `sightWordFocus` → Highlighted sight word
- `readingTip` → Instructional help
- `requireSightWordTap` → Gate behavior (if enabled in settings)

**Additional Fields to Support:**
- `ui.scene` → Could influence background styling
- `ui.imagePrompt` → Not needed (text-only app)
- `ui.backgroundImageSuggested` → Could set theme class

### 3.2 Question/Answer Components

**FULLY REUSABLE** - Already handles multiple question types:

```javascript
function showQuestionPage(page)
```

**Supported Question Types:**
- `questionType: 'comprehension'` → Evidence-based answering
- `questionType: 'sightWord'` → Sight word recognition
- `questionMode: 'multipleChoice'` → Button choices
- `questionMode: 'fillInBlank'` → Word bank dragging

**Features:**
- Passage display with sentence segmentation
- Evidence tapping system (tap words in passage)
- Hint ladder (3-level progressive hints)
- Answer validation with feedback
- Key sentence highlighting
- Error explanations

**Content Pack Fields Supported:**
- `question` → Question text
- `passage` → Reference text (key sentence)
- `comprehensionHint` → Help text (becomes Level 1 hint)
- `answers[]` → Choice array
- `correctAnswerName` → Validation key
- `successMessage` → Feedback on correct answer

**Enhancement Needed:**
Support `variants` array for question variety (already exists in legacy):
```javascript
// In buildSessionPagesForStation, variant resolution already handles this
```

### 3.3 Menu/Choice Components

**FULLY REUSABLE** - Handles interactive choices:

```javascript
function showMenuPage(page)
```

**Features:**
- Large choice buttons with icons
- Remembers user selection (stores in `state.currentOrder`)
- Animates selection confirmation
- Automatically advances on selection

**Content Pack Fields:**
Not extensively used in content pack (only 1 example), but supported:
- `title` → Menu heading
- `choices[]` → Options with name + icon

### 3.4 Progress Indicators

**MRT Progress Bar** - FULLY REUSABLE:

```javascript
function updateMRTProgressBar()
```

**Features:**
- Desktop: Horizontal track with labeled stops
- Mobile: Compact mini-line with train icon
- Color-coded by line (Red/Blue/Green/Orange)
- Animated train arrival on current stop
- Shows page types (Read/Q/Pick)

**Works with any page array** - no changes needed.

### 3.5 Audio Playback System

**Text-to-Speech Engine** - FULLY REUSABLE:

**ElevenLabs TTS Integration:**
```javascript
async function speak(text, playbackRate = 1.0, options = {})
function stopSpeech(options = {})
```

**Features:**
- Cloud-based TTS via API (`/api/tts`)
- Voice: Angela (warm, calm teacher)
- Intelligent audio caching (prebuilt clips + in-memory cache)
- Preloading system for upcoming content
- Fallback to browser SpeechSynthesis
- Audio context management (iOS compatibility)

**Content Pack Voice Support:**

```javascript
// Modify speak() to use page._preferredVoice
async function speak(text, playbackRate = 1.0, options = {}) {
  const page = getCurrentPage();
  const voice = options.voice || (page && page._preferredVoice) ||
                (contentPack && contentPack.uiDefaults && contentPack.uiDefaults.voice) ||
                'elevenlabs:angela';

  // Continue with existing TTS logic...
  // Parse voice string: "elevenlabs:angela" → provider + voiceId
}
```

**Audio Preloading:**
Already preloads upcoming page audio:
```javascript
function preloadUpcomingLessonAudio({ pages = null, currentIndex = null } = {})
function preloadStationAudio(stationId, pagesOverride = null)
```

**Guidance Audio:**
Screen-level narration for navigation support (can remain unchanged or be enhanced with content pack guidance text):
```javascript
function playScreenGuidance(screenId)
function playLessonGuidanceForPage(page)
```

---

## 4. GAPS TO FILL

### 4.1 Missing Components for Full Lesson Flow

#### 4.1.1 Multi-Variant Support

**Current State:** Legacy stations use `variants` array for variety.

**Gap:** Content pack extensively uses variants (3-5 per page).

**Solution:** Already implemented in `buildSessionPagesForStation()`. No action needed.

#### 4.1.2 Checklist Target Tracking

**Current State:** No tracking of educational standards.

**Gap:** Content pack includes `checklistTargets` (e.g., `["RF.1.1", "RF.1.1.A"]`).

**Solution Required:**

```javascript
// Add to state
state.checklistProgress = {
  // { [target]: { introduced: Date, practiced: count, mastered: boolean } }
};

function recordChecklistProgress(targets = []) {
  if (!Array.isArray(targets) || targets.length === 0) return;

  const now = Date.now();

  targets.forEach(target => {
    if (!state.checklistProgress[target]) {
      state.checklistProgress[target] = {
        introduced: now,
        practiced: 0,
        mastered: false
      };
    }
    state.checklistProgress[target].practiced += 1;
  });

  saveProgress();
}

// Call in showReward() after station completion
function showReward() {
  const station = normalizeStationForRendering(state.currentStation);
  // ... existing reward logic ...

  // NEW: Record checklist progress
  if (station && station.checklistTargets) {
    recordChecklistProgress(station.checklistTargets);
  }
}
```

**Checklist Report UI:**

Add to dashboard (existing `renderDashboardModal()`):

```javascript
function renderChecklistReport() {
  const targets = Object.entries(state.checklistProgress || {})
    .map(([target, data]) => ({ target, ...data }))
    .sort((a, b) => b.practiced - a.practiced);

  const html = targets.map(item => `
    <div class="checklist-item ${item.mastered ? 'mastered' : ''}">
      <span class="checklist-target">${item.target}</span>
      <span class="checklist-count">${item.practiced} times</span>
      ${item.mastered ? '<span class="checklist-badge">Mastered</span>' : ''}
    </div>
  `).join('');

  return `
    <div class="checklist-report">
      <h3>Grade 1 ELA Standards Progress</h3>
      ${html}
    </div>
  `;
}
```

#### 4.1.3 Review Sprint Support

**Gap:** Content pack includes review stations (e.g., `review_sprint_1`).

**Current State:** No concept of review/assessment stations.

**Solution Required:**

```javascript
function buildReviewStationPages(stationId) {
  // Review stations pull questions from completed stations
  const reviewConfig = {
    review_sprint_1: ['rf_f1_print_concepts', 'rf_f2_blend_and_segment', /* ... */],
    review_sprint_2: [/* next set */],
    // etc.
  };

  const sourceStations = reviewConfig[stationId];
  if (!sourceStations) return [];

  const reviewPages = [];

  sourceStations.forEach(sourceId => {
    const sourceStation = normalizeStationForRendering(sourceId);
    if (!sourceStation) return;

    // Extract 2-3 questions from each source station
    const questionPages = sourceStation.pages.filter(p => p.type === 'question');
    const selected = questionPages.slice(0, 3);
    reviewPages.push(...selected);
  });

  // Shuffle for variety
  return reviewPages.sort(() => Math.random() - 0.5);
}

// Modify buildSessionPagesForStation to detect review stations
function buildSessionPagesForStation(stationId) {
  if (stationId.startsWith('review_')) {
    return buildReviewStationPages(stationId);
  }

  // Existing logic for normal stations...
}
```

#### 4.1.4 Background Image Support

**Gap:** Content pack includes `ui.backgroundImageSuggested` and `ui.imagePrompt`.

**Current State:** Emoji-based images only (`page.image`).

**Solution:** Enhance reading page to support background scenes.

```javascript
function showReadingPage(page) {
  // Existing word rendering...

  // NEW: Apply scene background if suggested
  const restaurantScreen = document.getElementById('restaurantScreen');
  if (page.ui && page.ui.backgroundImageSuggested && page.ui.scene) {
    const sceneClass = `scene-${page.ui.scene}`;  // e.g., scene-arrival, scene-explore
    restaurantScreen.classList.add(sceneClass);
  } else {
    // Clear scene classes
    restaurantScreen.className = 'screen';
  }

  // Continue with existing rendering...
}
```

**CSS for Scene Backgrounds:**
```css
.screen.scene-arrival {
  background-image: linear-gradient(rgba(253, 249, 243, 0.9), rgba(253, 249, 243, 0.9)),
                    url('assets/scenes/arrival.jpg');
  background-size: cover;
  background-position: center;
}

.screen.scene-explore {
  background-image: linear-gradient(rgba(253, 249, 243, 0.85), rgba(253, 249, 243, 0.85)),
                    url('assets/scenes/explore.jpg');
  background-size: cover;
}
```

### 4.2 New Screens/Components Needed

#### 4.2.1 Content Pack Selector (Optional)

**Purpose:** Allow switching between content packs (Grade 1 ELA, Grade 2, etc.).

**Location:** Welcome screen or settings modal.

```javascript
function renderContentPackSelector() {
  const packs = [
    { id: 'cpa-grade1-ela', name: 'Grade 1 ELA', path: 'content/cpa-grade1-ela/content-pack.v1.json' },
    { id: 'cpa-grade2-ela', name: 'Grade 2 ELA', path: 'content/cpa-grade2-ela/content-pack.v1.json' }
  ];

  const currentPackId = localStorage.getItem('selectedContentPack') || 'cpa-grade1-ela';

  const html = packs.map(pack => `
    <button
      class="content-pack-btn ${pack.id === currentPackId ? 'active' : ''}"
      onclick="switchContentPack('${pack.id}', '${pack.path}')">
      ${pack.name}
    </button>
  `).join('');

  return `<div class="content-pack-selector">${html}</div>`;
}

async function switchContentPack(packId, packPath) {
  localStorage.setItem('selectedContentPack', packId);
  await loadContentPack(packPath);

  // Reset station progress (or keep separate per pack)
  state.currentStation = null;
  state.completedStations = [];

  generateMRTMap();
  goToScreen('mrtScreen');
}
```

#### 4.2.2 Standards Progress Dashboard

**Purpose:** Visualize checklist standard progress for parents/teachers.

**Location:** Add tab to existing dashboard modal.

```javascript
// Add to renderDashboardModal()
function renderDashboardModal() {
  // Existing tabs: Overview, Skills

  // NEW: Add Standards tab
  const tabs = `
    <div class="dashboard-tabs">
      <button onclick="showDashboardTab('overview')">Overview</button>
      <button onclick="showDashboardTab('skills')">Skills</button>
      <button onclick="showDashboardTab('standards')">Standards</button>
    </div>
  `;

  const standardsTab = `
    <div id="dashboardStandards" class="dashboard-tab" style="display:none;">
      ${renderChecklistReport()}
      ${renderStandardsBreakdown()}
    </div>
  `;

  // ... existing modal rendering
}

function renderStandardsBreakdown() {
  // Group by category: RF (Foundational), RL (Literature), RI (Informational), L (Language)
  const groups = {
    RF: { name: 'Foundational Skills', targets: [] },
    RL: { name: 'Reading Literature', targets: [] },
    RI: { name: 'Reading Informational', targets: [] },
    L: { name: 'Language', targets: [] }
  };

  Object.entries(state.checklistProgress || {}).forEach(([target, data]) => {
    const category = target.split('.')[0];
    if (groups[category]) {
      groups[category].targets.push({ target, ...data });
    }
  });

  const html = Object.entries(groups).map(([key, group]) => `
    <div class="standards-group">
      <h4>${group.name}</h4>
      <div class="standards-list">
        ${group.targets.map(t => `
          <div class="standard-item">
            <span>${t.target}</span>
            <div class="standard-progress">
              <div class="progress-bar" style="width: ${Math.min(100, t.practiced * 10)}%"></div>
            </div>
            <span>${t.practiced}x</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `<div class="standards-breakdown">${html}</div>`;
}
```

### 4.3 Mastery Tracking Enhancements

**Current System:**
```javascript
state.masteredWords = new Set();  // Simple set of mastered words
```

**Enhanced System for Content Pack:**

```javascript
state.masteryTracking = {
  sightWords: {},  // { word: { exposures: 0, correct: 0, mastered: false } }
  phonicsPatterns: {},  // { pattern: { exposures: 0, correct: 0, mastered: false } }
  comprehensionSkills: {}  // { skill: { exposures: 0, correct: 0, mastered: false } }
};

function recordMasteryEvent(category, item, correct = true) {
  if (!state.masteryTracking[category]) {
    state.masteryTracking[category] = {};
  }

  if (!state.masteryTracking[category][item]) {
    state.masteryTracking[category][item] = {
      exposures: 0,
      correct: 0,
      mastered: false,
      firstSeen: Date.now(),
      lastSeen: null
    };
  }

  const record = state.masteryTracking[category][item];
  record.exposures += 1;
  if (correct) record.correct += 1;
  record.lastSeen = Date.now();

  // Mastery criteria: 5+ exposures, 80%+ accuracy
  if (record.exposures >= 5 && (record.correct / record.exposures) >= 0.8) {
    record.mastered = true;
  }

  saveProgress();
}

// Hook into answer checking
function checkAnswer(selectedName) {
  const page = getCurrentPage();
  const isCorrect = selectedName === page.correctAnswerName;

  // Existing analytics...

  // NEW: Mastery tracking
  if (page.sightWordFocus) {
    recordMasteryEvent('sightWords', page.sightWordFocus.toLowerCase(), isCorrect);
  }

  if (page.questionType === 'comprehension') {
    recordMasteryEvent('comprehensionSkills', 'key-details', isCorrect);
  }

  // Continue with existing answer handling...
}
```

---

## 5. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP INITIALIZATION                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   init()         │
                    │   - Device ID    │
                    │   - Load Content │◄───── content-pack.v1.json
                    │   - Load Progress│
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NAVIGATION FLOW                              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   welcomeScreen         mrtScreen            skillsScreen
   (Platform)            (Station Map)        (Practice)
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    selectStation(stationId)
                              │
                              ▼
                    ┌──────────────────────┐
                    │ normalizeStationFor  │
                    │ Rendering(stationId) │◄─── contentPackStations
                    │                      │     or stationContent
                    └──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LESSON FLOW                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              mrtRideScreen      elevatorScreen
              (Train Journey)    (Floor 1 → 2 → 3)
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌──────────────────┐
                    │ wordWarmupScreen │ (Floor 2)
                    │ - Preview Words  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ restaurantScreen │ (Floor 3+)
                    └──────────────────┘
                              │
                    ┌─────────┴─────────────────────┐
                    ▼                               ▼
        buildSessionPagesForStation()    showPage() [dispatcher]
                    │                               │
                    │                     ┌─────────┼─────────┐
                    │                     ▼         ▼         ▼
                    │              showReadingPage  │  showQuestionPage
                    │              - Words          │  - Evidence
                    │              - Sight word     │  - Hints
                    │              - TTS            │  - Validate
                    │                               │
                    │              showMenuPage     │
                    │              - Choices        │
                    │              - Store order    │
                    │                               │
                    └───────────────────┬───────────┘
                                        ▼
                              ┌──────────────────┐
                              │ continuePage()   │
                              │ - Advance page   │
                              │ - Check elevator │
                              └──────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                        More Pages           Last Page
                              │                   │
                              └─────────┬─────────┘
                                        ▼
                              ┌──────────────────┐
                              │  showReward()    │
                              │  - Award sticker │
                              │  - Mark complete │
                              │  - Record targets│
                              └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ returnToMapAfter │
                              │ StationCompletion│
                              │ - Elevator down  │
                              │ - Train to hub   │
                              └──────────────────┘
                                        │
                                        ▼
                                   mrtScreen
                                 (Select Next)
```

---

## 6. FUNCTION SIGNATURES NEEDED

### 6.1 Content Loading

```typescript
async function loadContentPack(url: string): Promise<ContentPack | null>
// Fetches and parses content pack JSON
// Returns: ContentPack object or null on error

function getContentSource(): 'contentPack' | 'legacy'
// Determines which content source is active
// Returns: 'contentPack' if loaded, else 'legacy'

function getStationData(stationId: string): Station | null
// Retrieves station from active source
// Returns: Station object or null if not found

function normalizeStationForRendering(stationId: string): LegacyStation | null
// Transforms content pack station to legacy format
// Returns: Normalized station object compatible with existing renderers
```

### 6.2 Station Navigation

```typescript
function getStationOrder(): string[]
// Returns ordered list of station IDs
// Source: contentPack.stationOrder or legacy array

function getNextStation(currentStationId: string): string | null
// Finds next station in progression
// Returns: Next station ID or null if at end

function getLineFromContentStation(station: ContentPackStation): number
// Maps content pack line to MRT level (1-4)
// Returns: Level number for map rendering
```

### 6.3 Mastery Tracking

```typescript
function recordMasteryEvent(
  category: 'sightWords' | 'phonicsPatterns' | 'comprehensionSkills',
  item: string,
  correct: boolean
): void
// Records student performance for mastery tracking

function getMasteryStatus(category: string, item: string): MasteryRecord
// Retrieves mastery data for an item
// Returns: { exposures, correct, mastered, firstSeen, lastSeen }

function getMasteredItems(category: string): string[]
// Gets list of mastered items in category
// Returns: Array of item identifiers
```

### 6.4 Checklist Progress

```typescript
function recordChecklistProgress(targets: string[]): void
// Records practice of educational standards
// Stores in state.checklistProgress

function getChecklistSummary(): ChecklistSummary
// Aggregates checklist progress by category
// Returns: { RF: {...}, RL: {...}, RI: {...}, L: {...} }

function renderChecklistReport(): string
// Generates HTML for standards dashboard
// Returns: HTML string
```

### 6.5 UI Enhancements

```typescript
function applyContentPackUIDefaults(
  page: Page,
  uiDefaults: UIDefaults
): void
// Applies content pack UI preferences to page
// Sets: _preferredVoice, _highlightPolicy, _evidenceRequired

function renderContentPackSelector(): string
// Generates content pack switcher UI
// Returns: HTML string

async function switchContentPack(packId: string, packPath: string): Promise<void>
// Switches active content pack and reloads map
```

### 6.6 Review Station Support

```typescript
function buildReviewStationPages(stationId: string): Page[]
// Generates review questions from completed stations
// Returns: Array of mixed question pages

function getReviewStationSources(reviewStationId: string): string[]
// Gets list of source stations for review
// Returns: Array of station IDs to pull from
```

---

## 7. INTEGRATION ROADMAP WITH PRIORITIES

### PHASE 1: FOUNDATION (Priority: CRITICAL)
**Goal:** Basic content pack loading and rendering

**Tasks:**
1. ✅ Add content pack loading function
   - Create `loadContentPack(url)`
   - Add to `init()` sequence
   - Error handling for missing files

2. ✅ Implement station normalization
   - Create `normalizeStationForRendering()`
   - Map content pack fields to legacy format
   - Handle line mapping (RF→Red, RL→Blue, etc.)

3. ✅ Update station retrieval
   - Modify `buildSessionPagesForStation()` to use `normalizeStationForRendering()`
   - Update `getCurrentStationPages()` if needed
   - Ensure page rendering works unchanged

4. ✅ Test with sample content pack
   - Load `content-pack.v1.json`
   - Render one complete station (e.g., `rf_f1_print_concepts`)
   - Verify all page types work (read, question)

**Estimated Time:** 4-6 hours

**Success Criteria:**
- Content pack loads without errors
- First station renders correctly
- Read pages show text with sight words
- Question pages validate answers
- Progress bar updates normally

---

### PHASE 2: NAVIGATION (Priority: HIGH)
**Goal:** Full station map integration

**Tasks:**
1. ✅ Update station order system
   - Create `getStationOrder()`
   - Use `contentPack.stationOrder`
   - Update `getNextStation()`

2. ✅ Modify MRT map generation
   - Update `generateMRTMap()` to use content pack stations
   - Render 51 stations across 4 lines
   - Color-code by line (RF, RL, RI, L)

3. ✅ Fix station unlocking
   - Maintain sequential unlock logic
   - Show locked stations with visual indicator
   - Update `unlockNextStation()`

4. ✅ Test navigation flow
   - Complete a station
   - Verify next station unlocks
   - Check map updates correctly

**Estimated Time:** 3-4 hours

**Success Criteria:**
- Map shows all 51 stations
- Stations unlock in order
- Line colors display correctly
- Station icons render (📚, 🔤, etc.)

---

### PHASE 3: ENHANCED FEATURES (Priority: MEDIUM)
**Goal:** Support advanced content pack features

**Tasks:**
1. ✅ Implement mastery tracking
   - Add `state.masteryTracking` structure
   - Create `recordMasteryEvent()`
   - Hook into answer validation
   - Display mastery badges in dashboard

2. ✅ Add checklist progress tracking
   - Add `state.checklistProgress` structure
   - Create `recordChecklistProgress()`
   - Call on station completion
   - Build standards report UI

3. ✅ Support UI defaults
   - Implement `applyContentPackUIDefaults()`
   - Add voice preference handling
   - Support highlight policy
   - Support evidence requirement toggle

4. ✅ Review station support
   - Create `buildReviewStationPages()`
   - Define review station configs
   - Mix questions from completed stations
   - Shuffle for variety

**Estimated Time:** 6-8 hours

**Success Criteria:**
- Mastery tracking records sight word practice
- Dashboard shows checklist progress
- Voice preferences apply to TTS
- Review stations pull from completed content

---

### PHASE 4: UI POLISH (Priority: LOW)
**Goal:** Visual enhancements and optional features

**Tasks:**
1. 🔲 Add content pack selector
   - Build pack switcher UI
   - Store selection in localStorage
   - Reload map on switch
   - Handle progress per pack

2. 🔲 Implement scene backgrounds
   - Support `ui.backgroundImageSuggested`
   - Add scene CSS classes
   - Create fallback gradient overlays
   - Test with sample scenes

3. 🔲 Enhanced dashboard
   - Add standards tab
   - Visualize progress by category
   - Show mastery percentages
   - Export report feature (optional)

4. 🔲 Accessibility improvements
   - Add ARIA labels for content pack elements
   - Keyboard navigation for checklist
   - Screen reader support for progress

**Estimated Time:** 4-6 hours

**Success Criteria:**
- User can switch between content packs
- Scene backgrounds enhance reading pages
- Dashboard provides detailed insights
- Accessibility checklist passes

---

### PHASE 5: TESTING & OPTIMIZATION (Priority: HIGH)
**Goal:** Ensure stability and performance

**Tasks:**
1. ✅ Cross-browser testing
   - Safari (iOS/desktop)
   - Chrome
   - Firefox
   - Edge

2. ✅ Content pack validation
   - Test all 51 stations
   - Verify all page types render
   - Check answer validation
   - Test variant randomization

3. ✅ Performance optimization
   - Lazy load station pages
   - Optimize TTS preloading
   - Cache content pack in localStorage (optional)
   - Reduce initial load time

4. ✅ Error handling
   - Handle missing content pack gracefully
   - Fall back to legacy content if needed
   - Show user-friendly error messages
   - Log errors to console for debugging

**Estimated Time:** 6-8 hours

**Success Criteria:**
- App works on all target browsers
- No console errors during normal use
- Page transitions are smooth (<300ms)
- Audio preloading is non-blocking

---

## 8. MIGRATION STRATEGY

### 8.1 Backward Compatibility

**Approach:** Dual-mode operation

```javascript
const CONTENT_MODE = 'auto';  // 'auto', 'contentPack', 'legacy'

function getContentMode() {
  if (CONTENT_MODE === 'legacy') return 'legacy';
  if (CONTENT_MODE === 'contentPack' && contentPack) return 'contentPack';
  if (CONTENT_MODE === 'auto') {
    return contentPack ? 'contentPack' : 'legacy';
  }
  return 'legacy';
}
```

**Benefits:**
- Legacy stations continue working
- Can test content pack alongside existing content
- Easy rollback if issues arise

### 8.2 Progress Preservation

**Strategy:** Separate progress per content source

```javascript
function getProgressStorageKey(childId = null) {
  const mode = getContentMode();
  const base = childId ? `isaiahProgress_${childId}` : 'isaiahProgress';
  return mode === 'contentPack' ? `${base}_contentPack` : base;
}
```

**Benefits:**
- Legacy progress preserved
- Content pack progress tracked separately
- No data loss during migration

### 8.3 Gradual Rollout

**Phase 1: Internal Testing**
- Load content pack in TEST_MODE
- Verify rendering with family testing
- Collect feedback on UI/UX

**Phase 2: Opt-In Beta**
- Add content pack selector in settings
- Allow users to choose between modes
- Monitor analytics for completion rates

**Phase 3: Full Migration**
- Set content pack as default
- Keep legacy as fallback
- Remove legacy stations after 3-6 months

---

## 9. TESTING CHECKLIST

### 9.1 Unit Testing

- [ ] `loadContentPack()` handles valid JSON
- [ ] `loadContentPack()` handles invalid JSON
- [ ] `loadContentPack()` handles network errors
- [ ] `normalizeStationForRendering()` maps all fields correctly
- [ ] `getLineFromContentStation()` returns correct levels
- [ ] `getStationOrder()` returns correct array
- [ ] `recordMasteryEvent()` updates state correctly
- [ ] `recordChecklistProgress()` stores targets

### 9.2 Integration Testing

- [ ] Station loads from content pack
- [ ] Read page renders text correctly
- [ ] Sight words highlight properly
- [ ] Question page shows passage
- [ ] Answer validation works
- [ ] Hints display progressively
- [ ] Evidence tapping works
- [ ] Continue button advances pages
- [ ] Elevator transitions between floors
- [ ] Reward screen shows correct sticker count
- [ ] Progress bar updates with each page
- [ ] Map updates after station completion
- [ ] Next station unlocks correctly
- [ ] TTS speaks all page text
- [ ] Audio preloading doesn't block UI

### 9.3 End-to-End Testing

- [ ] Complete one full station (all pages)
- [ ] Complete review station
- [ ] Switch between content packs
- [ ] View dashboard with standards progress
- [ ] Export progress data (if implemented)
- [ ] Sign in with cloud account
- [ ] Sync progress across devices
- [ ] Reload page preserves progress
- [ ] Test with calm mode enabled
- [ ] Test with sight word gate disabled
- [ ] Test with guidance audio disabled

### 9.4 Browser/Device Testing

- [ ] Safari iOS (iPhone)
- [ ] Safari iOS (iPad Mini)
- [ ] Safari macOS
- [ ] Chrome desktop
- [ ] Chrome Android
- [ ] Firefox desktop
- [ ] Edge desktop
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Dark mode (system preference)

---

## 10. KNOWN LIMITATIONS & FUTURE WORK

### 10.1 Current Limitations

1. **Image Generation Not Supported**
   - Content pack includes `ui.imagePrompt` for AI-generated scenes
   - Current app uses emoji icons only
   - Workaround: Add placeholder images or use text descriptions

2. **Single Content Pack at a Time**
   - Cannot load multiple packs simultaneously
   - Switching packs requires page reload
   - Future: Support pack switching without reload

3. **No Content Pack Editor**
   - JSON must be edited manually
   - No visual authoring tool
   - Future: Build admin dashboard for content creation

4. **Limited Analytics Granularity**
   - Tracks station-level data, not standard-level
   - Cannot generate per-standard reports yet
   - Future: Enhanced analytics with educational insights

### 10.2 Future Enhancements

1. **Content Pack Marketplace**
   - Community-contributed content packs
   - Rating and review system
   - Auto-update notifications

2. **Adaptive Learning Engine**
   - Use mastery data to adjust difficulty
   - Skip mastered content automatically
   - Focus on struggling areas

3. **Multi-Language Support**
   - Translate content packs to other languages
   - Support for bilingual learning
   - TTS in multiple languages

4. **Parent/Teacher Dashboard**
   - Web-based reporting portal
   - Print progress reports
   - Set learning goals
   - Schedule reminders

5. **Offline Support**
   - Cache content pack in IndexedDB
   - Pre-download TTS audio
   - Sync when online

---

## 11. APPENDIX: KEY FILE LOCATIONS

### 11.1 Core Files

| File | Path | Purpose |
|------|------|---------|
| Main App | `index.html` | Entire application (HTML/CSS/JS) |
| Content Pack | `content/cpa-grade1-ela/content-pack.v1.json` | Grade 1 ELA curriculum |
| UI Styles | `ui_improvements.css` | Autism-friendly design system |

### 11.2 Key Code Sections (Line Numbers)

| Section | Lines | Description |
|---------|-------|-------------|
| State Management | 15347-15417 | Global state object |
| Content Structure | 17953-19700 | Legacy station content |
| Page Rendering | 23213-24180 | showPage(), showReadingPage(), etc. |
| Question System | 24187-24800 | Evidence-based answering, hints |
| Elevator System | 22160-22700 | Floor navigation, door scenes |
| MRT Map Generation | 28295-29000 | Station map rendering |
| Progress Tracking | 24948-25172 | Sticker rewards, analytics |
| TTS System | 19702-20785 | ElevenLabs integration |
| Cloud Backend | 15729-17400 | Firebase auth & sync |

### 11.3 Function Reference

| Function | Line | Purpose |
|----------|------|---------|
| `init()` | ~29010 | App initialization |
| `goToScreen(screenId)` | 21254 | Screen navigation |
| `buildSessionPagesForStation(stationId)` | 17781 | Variant resolution |
| `showPage()` | 23213 | Page dispatcher |
| `showReadingPage(page)` | 23258 | Read page renderer |
| `showQuestionPage(page)` | ~23600 | Question renderer |
| `checkAnswer(selectedName)` | ~24400 | Answer validation |
| `continuePage()` | ~24700 | Page advancement |
| `showReward()` | 24810 | Station completion |
| `generateMRTMap()` | ~28300 | Map rendering |
| `speak(text, rate, options)` | 19931 | TTS playback |

---

## 12. CONCLUSION

This specification provides a complete roadmap for integrating content-pack.v1.json into the existing app. The architecture is well-suited for this integration, as most components (reading, questions, progress, audio) are already reusable.

**Key Takeaways:**
1. **Minimal Breaking Changes:** Most existing code can be reused with a normalization layer.
2. **Incremental Implementation:** Phases can be completed independently.
3. **Backward Compatibility:** Legacy content continues working alongside content pack.
4. **Enhanced Tracking:** New mastery and checklist systems provide educational insights.

**Recommended Next Steps:**
1. Implement Phase 1 (Foundation) to validate basic rendering
2. Test with 3-5 sample stations from content pack
3. Gather user feedback on navigation and UI
4. Complete Phase 2 (Navigation) for full station integration
5. Add Phase 3 (Enhanced Features) based on usage data

**Estimated Total Development Time:** 25-35 hours across all phases.

**Risk Assessment:** Low - existing architecture is compatible, no major refactoring required.
