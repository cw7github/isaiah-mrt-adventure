# Visual Integration Guide

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Isaiah's MRT Food Adventure               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │      station-selection.js           │
        │  stationSelection.currentSubject    │
        │        ('ela' or 'math')            │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │     getCurrentSubject()             │
        │   Returns: 'ela' or 'math'          │
        └─────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │   ELA Progress       │    │   Math Progress      │
    │   ───────────────    │    │   ───────────────    │
    │   Stickers: 10       │    │   Stickers: 5        │
    │   Pages: 15          │    │   Pages: 8           │
    │   Stations: ['...']  │    │   Stations: ['...']  │
    │   Skills: [...]      │    │   Concept: {...}     │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌───────────────────┐
                    │  Global Totals    │
                    │  ─────────────    │
                    │  Stickers: 15     │
                    │  Pages: 23        │
                    │  Stations: [all]  │
                    └───────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │  localStorage + Firebase     │
                └─────────────────────────────┘
```

## Data Flow When Completing a Page

```
1. User completes page in ELA station
   │
   ▼
2. awardStickerAndPage() called
   │
   ▼
3. awardSubjectStickerAndPage()
   │
   ├─→ getCurrentSubject() → 'ela'
   ├─→ getCurrentSubjectProgress() → state.subjectProgress.ela
   ├─→ Increment: ela.stickers++, ela.pagesCompleted++
   ├─→ Update device counters (backward compat)
   └─→ Recalculate global totals:
       state.stickers = ela.stickers + math.stickers
   │
   ▼
4. updateProgress() called
   │
   ├─→ Update UI elements
   └─→ saveProgress()
   │
   ▼
5. Save to storage
   ├─→ localStorage (immediate)
   └─→ Firebase (if authenticated)
```

## State Structure Before & After

### BEFORE (Old System)
```javascript
state = {
  stickers: 10,
  pagesCompleted: 15,
  completedStations: ['station1', 'station2'],
  // ... other fields
}
```

### AFTER (New System)
```javascript
state = {
  // Legacy fields (maintained for compatibility)
  stickers: 15,  // Sum of ELA + Math
  pagesCompleted: 23,  // Sum of ELA + Math
  completedStations: ['station1', 'station2', 'math_station1'],  // Union

  // New subject-specific tracking
  subjectProgress: {
    ela: {
      stickers: 10,
      pagesCompleted: 15,
      completedStations: ['station1', 'station2'],
      skillsMastered: []
    },
    math: {
      stickers: 5,
      pagesCompleted: 8,
      completedStations: ['math_station1'],
      skillsMastered: [],
      conceptProgress: {
        'addition': { concrete: true, pictorial: false, abstract: false }
      }
    }
  },
  // ... other fields
}
```

## UI Display in Settings Modal

```
┌────────────────────────────────────────────────┐
│               Settings                          │
├────────────────────────────────────────────────┤
│                                                 │
│  Progress                                       │
│  Pages completed today: 23                      │
│                                                 │
│  Subject Progress                               │
│  ┌────────────────────┬────────────────────┐  │
│  │   📚 Reading       │   🔢 Math          │  │
│  │                    │                    │  │
│  │   ⭐ 10           │   ⭐ 5            │  │
│  │   2 stations       │   1 station        │  │
│  └────────────────────┴────────────────────┘  │
│                                                 │
│  Words Mastered                                 │
│  25 / 50                                        │
│                                                 │
└────────────────────────────────────────────────┘
```

## File Structure

```
isaiah_school/
├── index.html ⭐ MAIN FILE TO EDIT
│   ├── State structure (line 17507) ✅ DONE
│   ├── Functions section (line 28918) ⏳ ADD FUNCTIONS HERE
│   ├── Progress tracking (various) ⏳ UPDATE CALLS
│   ├── CSS styles section ⏳ ADD STYLES
│   └── Settings modal HTML ⏳ ADD CONTAINER
│
├── station-selection.js ✅ ALREADY HAS currentSubject
│   └── Provides subject detection
│
├── subject-progress-integration.js 📄 NEW
│   └── All new functions (copy to index.html)
│
├── subject-progress-styles.css 📄 NEW
│   └── All CSS styles (copy to index.html)
│
├── docs/legacy/implementation-guides/SUBJECT-PROGRESS-INTEGRATION-GUIDE.md 📖 GUIDE
│   └── Step-by-step instructions
│
├── docs/reports/implementation-summary.md 📖 OVERVIEW
│   └── High-level summary
│
└── docs/reports/integration-visual-guide.md 📖 THIS FILE
    └── Visual diagrams and flow
```

## Function Call Chain

```
Station Completion Flow:
─────────────────────────

showComplete()
    │
    ├─→ awardStickerAndPage()
    │       └─→ awardSubjectStickerAndPage()
    │               ├─→ getCurrentSubject()
    │               ├─→ getCurrentSubjectProgress()
    │               ├─→ progress.stickers++
    │               └─→ Update global totals
    │
    ├─→ markSubjectStationComplete()
    │       ├─→ Add to subject completedStations[]
    │       └─→ Update global completedStations[]
    │
    └─→ updateProgress()
            └─→ saveProgress()
                    ├─→ Include subjectProgress in saveData
                    ├─→ Save to localStorage
                    └─→ Sync to Firebase
```

## Subject Detection Flow

```
getCurrentSubject() is called
    │
    ▼
Check: typeof stationSelection !== 'undefined'
    │
    ├─→ YES: Check stationSelection.currentSubject
    │         │
    │         ├─→ 'ela' → Return 'ela'
    │         └─→ 'math' → Return 'math'
    │
    └─→ NO: Return 'ela' (default)
```

## Migration Flow (First Load with Old Data)

```
User loads app with existing progress
    │
    ▼
loadProgress() executes
    │
    ├─→ Load saved data from localStorage
    ├─→ Apply to state via normalizeProgressData()
    ├─→ if (p.subjectProgress) → Load subject data
    └─→ migrateToSubjectProgress()
            │
            ▼
        Check: Old data exists? (stickers > 0 OR stations.length > 0)
            │
            ├─→ YES: Check: Both ELA and Math empty?
            │         │
            │         ├─→ YES: Migrate to ELA
            │         │         ├─→ ela.stickers = state.stickers
            │         │         ├─→ ela.pagesCompleted = state.pagesCompleted
            │         │         └─→ ela.completedStations = [...state.completedStations]
            │         │
            │         └─→ NO: Keep existing subject data
            │
            └─→ NO: Initialize empty subject progress
```

## CSS Class Hierarchy

```
.subject-progress-card (Container)
    │
    ├─→ .subject-progress-item (ELA)
    │       ├─→ .subject-progress-item.ela (Green gradient)
    │       │       ├─→ .progress-subject-icon
    │       │       ├─→ .progress-subject-name
    │       │       ├─→ .progress-subject-stats
    │       │       └─→ .progress-subject-detail
    │
    └─→ .subject-progress-item (Math)
            ├─→ .subject-progress-item.math (Blue gradient)
                    ├─→ .progress-subject-icon
                    ├─→ .progress-subject-name
                    ├─→ .progress-subject-stats
                    └─→ .progress-subject-detail
```

## Integration Checklist

### ✅ Completed
- [x] State structure added to index.html
- [x] Functions written in subject-progress-integration.js
- [x] CSS styles written in subject-progress-styles.css
- [x] Integration guide created
- [x] Visual diagrams created

### ⏳ Manual Steps Required
- [ ] Copy functions to index.html (after line 28918)
- [ ] Update awardStickerAndPage() function
- [ ] Update showComplete() function
- [ ] Update saveProgress() function
- [ ] Update loadProgress() function
- [ ] Update normalizeProgressData() function
- [ ] Update resetProgress() function
- [ ] Add CSS styles to style section
- [ ] Add subject progress container to settings HTML
- [ ] Test ELA progress tracking
- [ ] Test Math progress tracking
- [ ] Test data migration
- [ ] Test Firebase sync

## Color Scheme

```
ELA (Reading):
─────────────
Background: Linear gradient #e8f5e9 → #c8e6c9 (Light green)
Border: #4caf50 (Green)
Icon: 📚 (Books)

Math:
─────
Background: Linear gradient #e3f2fd → #bbdefb (Light blue)
Border: #2196f3 (Blue)
Icon: 🔢 (Numbers)
```

## Responsive Behavior

```
Desktop (> 600px):
┌────────────────────┬────────────────────┐
│   📚 Reading       │   🔢 Math          │
│   ⭐ 10           │   ⭐ 5            │
│   2 stations       │   1 station        │
└────────────────────┴────────────────────┘

Mobile (≤ 600px):
┌────────────────────┐
│   📚 Reading       │
│   ⭐ 10           │
│   2 stations       │
├────────────────────┤
│   🔢 Math          │
│   ⭐ 5            │
│   1 station        │
└────────────────────┘
```

## Key Insights

1. **Dual Tracking**: System tracks both subject-specific AND global totals
2. **Backward Compatibility**: Old data migrates seamlessly to ELA
3. **Automatic Detection**: Subject detected from stationSelection.currentSubject
4. **Data Integrity**: Global totals = sum of all subjects
5. **Visual Distinction**: Color-coded for easy identification
6. **Future-Proof**: Easy to add more subjects (Science, Art, etc.)

## Testing Scenarios Visualized

### Scenario 1: New User Completes ELA Station
```
BEFORE:
ela.stickers: 0, math.stickers: 0, global: 0

ACTION: Complete ELA station

AFTER:
ela.stickers: 1, math.stickers: 0, global: 1
```

### Scenario 2: Switch to Math, Complete Station
```
BEFORE:
ela.stickers: 1, math.stickers: 0, global: 1

ACTION: Switch to math, complete station

AFTER:
ela.stickers: 1, math.stickers: 1, global: 2
```

### Scenario 3: Old User Loads App
```
BEFORE MIGRATION:
global.stickers: 10
subjectProgress: undefined

AFTER MIGRATION:
ela.stickers: 10, math.stickers: 0, global: 10
```
