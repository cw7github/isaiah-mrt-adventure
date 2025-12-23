# Enhanced Progress Tracking Implementation Guide

> **Legacy integration guide**: This is a historical “how to add” document. The current app already has a different progress + mastery system in `index.html`.  
> Start with `../../student-assessment-and-adaptive-learning-plan.md` and `../../../AGENTS.md`.

This guide contains all the code and instructions needed to add comprehensive progress tracking to the Isaiah School app.

## Overview

The implementation adds:
1. Station-level progress tracking (pages completed, stars, attempts)
2. Star system (1-3 stars based on first-try performance: 90%+ = 3⭐, 70%+ = 2⭐, complete = 1⭐)
3. Achievements system with 6 unlockable badges
4. Daily streak tracking
5. Progress export/import functionality
6. Enhanced UI components
7. Auto-save after each question

## Step 1: Add Enhanced Progress to State Object

**Location**: Find the `state` object initialization (around line 15347)

**Action**: Add this property to the state object:

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

Insert it after the `mastery` property and before the `cloud` property.

## Step 2: Add Progress Tracking Functions

**Location**: Insert before `// ===== INIT =====` section (around line 30288)

**Action**: Copy the entire content from `progress-tracking-system.js` and paste it there.

This includes:
- `normalizeEnhancedProgressData()` - Data normalization
- `ensureEnhancedProgressState()` - State initialization
- `calculateStationStars()` - Star calculation (90% = 3⭐, 70% = 2⭐, complete = 1⭐)
- `recordStationProgressTracking()` - Track progress per station
- `updateDailyStreak()` - Track daily play streaks
- `calculateTotalStars()` - Sum all stars
- `markStationCompletedEnhanced()` - Mark station completion
- `ACHIEVEMENT_DEFINITIONS` - 6 achievements
- `checkAchievement()` - Unlock achievements
- `showAchievementNotification()` - Display achievement popup
- `exportProgress()` - Export progress as JSON
- `importProgress()` - Import progress from JSON

## Step 3: Integrate Progress Tracking with Question Answers

**Location**: Find the `selectAnswer()` function (around line 24765)

**Action**: Add this code after the existing `recordMasteryAttempt()` call (around line 24790):

```javascript
// Record enhanced progress tracking
const isFirstAttempt = page._answerAttempts === 1;
recordStationProgressTracking(
  state.currentStation,
  state.currentPage,
  isCorrect,
  isFirstAttempt
);
```

## Step 4: Integrate with Station Completion

**Location**: Find where stations are marked as completed (search for `state.completedStations.push`)

**Action**: Add this call immediately after:

```javascript
markStationCompletedEnhanced(stationId);
```

## Step 5: Update Save Progress Function

**Location**: Find the `saveProgress()` function (around line 25087)

**Action**: Add `enhancedProgress` to the saveData object:

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
  updatedAt,
  resetAt,
  lastPosition: {
    stationId: state.currentStation || null,
    pageIndex: Number.isFinite(state.currentPage) ? state.currentPage : 0,
  },
  analytics: normalizeAnalyticsData(state.analytics),
  mastery: state.mastery,  // Existing
  enhancedProgress: state.enhancedProgress,  // ADD THIS LINE
};
```

## Step 6: Update Load Progress Function

**Location**: Find the `loadProgress()` function

**Action**: Add loading of enhanced progress:

```javascript
if (p.enhancedProgress) {
  state.enhancedProgress = normalizeEnhancedProgressData(p.enhancedProgress);
}
```

## Step 7: Update Reset Progress Function

**Location**: Find the `resetProgress()` function (around line 25063)

**Action**: Add reset of enhanced progress:

```javascript
async function resetProgress() {
  const ok = await showConfirmModal({
    title: 'Reset all progress?',
    message: 'This cannot be undone.',
    confirmText: 'Reset',
    cancelText: 'Cancel',
    danger: true,
  });
  if (ok) {
    const key = getProgressStorageKey();
    try { localStorage.removeItem(key); } catch (e) { }
    resetProgressCounters();
    state.completedStations = [];
    state.masteredWords = new Set();
    state.analytics = normalizeAnalyticsData(null);
    state.mastery = normalizeMasteryData(null);  // Existing
    state.enhancedProgress = normalizeEnhancedProgressData(null);  // ADD THIS LINE
    state.progressResetAt = getSyncNowMs();
    logCloudEvent('progress_reset', { storageKey: key });
    updateProgress({ save: true });
    generateMRTMap();
    closeSettings();
    goToScreen('welcomeScreen');
  }
}
```

## Step 8: Add UI Components - Progress Display CSS

**Location**: Add to the `<style>` section before the closing `</style>` tag

```css
/* Achievement Notification */
.achievement-notification {
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10000;
  transition: top 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  max-width: 400px;
}

.achievement-notification.show {
  top: 24px;
}

.achievement-icon {
  font-size: 48px;
  animation: achievement-bounce 0.6s ease-out;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.achievement-name {
  font-size: 20px;
  font-weight: 700;
  margin: 4px 0;
}

.achievement-desc {
  font-size: 14px;
  opacity: 0.85;
}

@keyframes achievement-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* Progress Stats Display */
.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--mrt-blue);
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Star Display */
.star-display {
  display: inline-flex;
  gap: 4px;
  font-size: 20px;
}

.star {
  color: #ffd700;
  filter: drop-shadow(0 2px 4px rgba(255,215,0,0.3));
}

.star.empty {
  color: #ddd;
  filter: none;
}

/* Streak Indicator */
.streak-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(238,90,36,0.3);
}

.streak-icon {
  font-size: 20px;
  animation: flame 1s ease-in-out infinite;
}

@keyframes flame {
  0%, 100% { transform: scale(1) rotate(-5deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

/* Achievement Badge Grid */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.achievement-badge {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.achievement-badge:hover {
  transform: translateY(-4px);
}

.achievement-badge.locked {
  opacity: 0.4;
  filter: grayscale(100%);
}

.achievement-badge-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.achievement-badge-name {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.achievement-badge-desc {
  font-size: 11px;
  color: #666;
}

/* Progress Bar Enhanced */
.progress-bar-enhanced {
  background: #e0e0e0;
  border-radius: 12px;
  height: 24px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
}

.progress-fill-enhanced {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  transition: width 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
}
```

## Step 9: Add UI Components - HTML Elements

**Location**: Add to the Parent Settings modal (find the settings modal section)

Add these sections inside the settings modal:

```html
<!-- Progress Stats Section -->
<div class="settings-section">
  <h3 class="settings-section-title">Progress Overview</h3>

  <div class="progress-stats">
    <div class="stat-card">
      <span class="stat-value" id="totalStarsDisplay">0</span>
      <span class="stat-label">Total Stars</span>
    </div>
    <div class="stat-card">
      <span class="stat-value" id="dailyStreakDisplay">0</span>
      <span class="stat-label">Day Streak</span>
    </div>
    <div class="stat-card">
      <span class="stat-value" id="achievementsDisplay">0/6</span>
      <span class="stat-label">Achievements</span>
    </div>
  </div>
</div>

<!-- Achievements Section -->
<div class="settings-section">
  <h3 class="settings-section-title">Achievements</h3>
  <div class="achievement-grid" id="achievementGrid">
    <!-- Populated by JavaScript -->
  </div>
</div>

<!-- Export/Import Section -->
<div class="settings-section">
  <h3 class="settings-section-title">Backup & Restore</h3>

  <button class="btn-primary" onclick="exportProgress()">
    Export Progress
  </button>

  <input type="file" id="importFileInput" accept=".json" style="display: none;"
         onchange="if(this.files[0]) importProgress(this.files[0])">
  <button class="btn-secondary" onclick="document.getElementById('importFileInput').click()">
    Import Progress
  </button>
</div>
```

## Step 10: Add UI Update Functions

Add these functions to update the UI:

```javascript
function updateProgressUI() {
  const enhanced = ensureEnhancedProgressState();

  // Update stats
  const totalStars = calculateTotalStars();
  const totalStarsEl = document.getElementById('totalStarsDisplay');
  if (totalStarsEl) totalStarsEl.textContent = totalStars;

  const streakEl = document.getElementById('dailyStreakDisplay');
  if (streakEl) streakEl.textContent = enhanced.dailyStreak;

  const achievementsProgress = getAchievementProgress();
  const achievementsEl = document.getElementById('achievementsDisplay');
  if (achievementsEl) achievementsEl.textContent = `${achievementsProgress.unlocked}/${achievementsProgress.total}`;

  // Update achievement grid
  updateAchievementGrid();
}

function updateAchievementGrid() {
  const enhanced = ensureEnhancedProgressState();
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;

  grid.innerHTML = '';

  for (const [id, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    const unlocked = enhanced.achievements.some(a => a.id === id);

    const badge = document.createElement('div');
    badge.className = `achievement-badge ${unlocked ? '' : 'locked'}`;
    badge.innerHTML = `
      <span class="achievement-badge-icon">${definition.icon}</span>
      <div class="achievement-badge-name">${definition.title}</div>
      <div class="achievement-badge-desc">${definition.description}</div>
    `;

    grid.appendChild(badge);
  }
}

function updateStationStars(stationId, starsContainer) {
  const enhanced = ensureEnhancedProgressState();
  const progress = enhanced.stationProgress[stationId];
  const stars = progress ? progress.stars : 0;

  if (!starsContainer) return;

  starsContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('span');
    star.className = `star ${i < stars ? '' : 'empty'}`;
    star.textContent = '⭐';
    starsContainer.appendChild(star);
  }
}
```

## Step 11: Initialize on App Load

**Location**: Inside `window.onload` function

Add this after loading progress:

```javascript
// Initialize enhanced progress
ensureEnhancedProgressState();
updateDailyStreak();
checkAllAchievements();
updateProgressUI();
```

## Step 12: Update MRT Map to Show Stars

**Location**: Find the `generateMRTMap()` function or where station cards are generated

Add star display to each station card:

```javascript
// For each station, add a star container
const starsContainer = document.createElement('div');
starsContainer.className = 'star-display';
updateStationStars(stationId, starsContainer);
// Append starsContainer to the station card
```

## Testing Checklist

After implementation, test:

1. Complete a station - verify 1 star is awarded
2. Answer 70%+ questions correct on first try - verify 2 stars
3. Answer 90%+ questions correct on first try - verify 3 stars
4. Complete first station - verify "First Steps" achievement unlocks
5. Play on consecutive days - verify streak increments
6. Export progress - verify JSON file downloads
7. Import progress - verify data restores correctly
8. Check all achievements unlock properly
9. Verify progress UI updates in settings
10. Verify auto-save after each question

## Summary

This implementation provides:

- **Star System**: 1-3 stars per station based on first-try performance
- **Achievements**: 6 unlockable badges with visual notifications
- **Daily Streaks**: Track consecutive days of play
- **Station Progress**: Detailed tracking per station (pages, questions, attempts)
- **Export/Import**: Backup and restore functionality
- **Auto-save**: Progress saved after each question
- **Enhanced UI**: Stats display, achievement grid, progress bars

All mastery calculations leverage the existing BKT (Bayesian Knowledge Tracing) system while adding user-friendly visualizations and gamification elements.
