// ===== SUBJECT-AWARE PROGRESS TRACKING INTEGRATION =====
// This file contains the new functions to be integrated into index.html
// Insert these functions after `resetProgressCounters()` (around line 28918)

function createEmptyProgress() {
  return {
    stickers: 0,
    pagesCompleted: 0,
    completedStations: [],
    skillsMastered: []
  };
}

function ensureSubjectProgress() {
  if (!state.subjectProgress || typeof state.subjectProgress !== 'object') {
    state.subjectProgress = {
      ela: createEmptyProgress(),
      math: createEmptyProgress()
    };
  }
  if (!state.subjectProgress.ela) state.subjectProgress.ela = createEmptyProgress();
  if (!state.subjectProgress.math) state.subjectProgress.math = createEmptyProgress();

  // Ensure math has conceptProgress
  if (!state.subjectProgress.math.conceptProgress) {
    state.subjectProgress.math.conceptProgress = {};
  }

  return state.subjectProgress;
}

function getCurrentSubject() {
  // Get current subject from stationSelection if available
  if (typeof stationSelection !== 'undefined' && stationSelection.currentSubject) {
    return stationSelection.currentSubject;
  }
  // Default to ELA if not set
  return 'ela';
}

function getCurrentSubjectProgress() {
  ensureSubjectProgress();
  const subject = getCurrentSubject();
  return state.subjectProgress[subject];
}

function awardSubjectStickerAndPage() {
  ensureSubjectProgress();
  const progress = getCurrentSubjectProgress();

  // Award to current subject
  progress.stickers++;
  progress.pagesCompleted++;

  // Also update device counters (for backward compatibility)
  const counters = ensureProgressCountersState();
  const deviceId = (state.deviceId && typeof state.deviceId === 'string') ? state.deviceId : 'device';
  counters.stickersByDevice[deviceId] = (counters.stickersByDevice[deviceId] || 0) + 1;
  counters.pagesCompletedByDevice[deviceId] = (counters.pagesCompletedByDevice[deviceId] || 0) + 1;

  // Update global totals (sum across all subjects)
  state.stickers = (state.subjectProgress.ela?.stickers || 0) + (state.subjectProgress.math?.stickers || 0);
  state.pagesCompleted = (state.subjectProgress.ela?.pagesCompleted || 0) + (state.subjectProgress.math?.pagesCompleted || 0);
}

function markSubjectStationComplete(stationId) {
  if (!stationId) return;

  ensureSubjectProgress();
  const progress = getCurrentSubjectProgress();

  // Add to subject-specific completed stations
  if (!progress.completedStations.includes(stationId)) {
    progress.completedStations.push(stationId);
  }

  // Update global completed stations list (union of all subjects)
  const allCompleted = new Set([
    ...(state.subjectProgress.ela?.completedStations || []),
    ...(state.subjectProgress.math?.completedStations || [])
  ]);
  state.completedStations = Array.from(allCompleted);
}

function getSubjectProgressStats(subject) {
  ensureSubjectProgress();
  const progress = state.subjectProgress[subject] || createEmptyProgress();
  return {
    stickers: progress.stickers || 0,
    pagesCompleted: progress.pagesCompleted || 0,
    completedStations: (progress.completedStations || []).length,
    skillsMastered: (progress.skillsMastered || []).length
  };
}

function migrateToSubjectProgress() {
  // Migrate old progress data to subject-specific structure
  ensureSubjectProgress();

  // If we have old data but no subject-specific data, migrate it
  if (state.stickers > 0 || state.pagesCompleted > 0 || state.completedStations.length > 0) {
    const elaProgress = state.subjectProgress.ela;
    const mathProgress = state.subjectProgress.math;

    // If both subjects are empty, assume old data is ELA
    if (elaProgress.stickers === 0 && mathProgress.stickers === 0) {
      elaProgress.stickers = state.stickers;
      elaProgress.pagesCompleted = state.pagesCompleted;
      elaProgress.completedStations = [...state.completedStations];
    }
  }
}

function renderSubjectProgressCards(container) {
  if (!container) return;

  ensureSubjectProgress();

  const card = document.createElement('div');
  card.className = 'subject-progress-card';

  const subjects = [
    { key: 'ela', name: 'Reading', icon: '📚' },
    { key: 'math', name: 'Math', icon: '🔢' }
  ];

  subjects.forEach(({ key, name, icon }) => {
    const stats = getSubjectProgressStats(key);
    const item = document.createElement('div');
    item.className = `subject-progress-item ${key}`;
    item.innerHTML = `
      <div class="progress-subject-icon">${icon}</div>
      <div class="progress-subject-name">${name}</div>
      <div class="progress-subject-stats">⭐ ${stats.stickers}</div>
      <div class="progress-subject-detail">${stats.completedStations} stations</div>
    `;
    card.appendChild(item);
  });

  container.appendChild(card);
}


// ===== UPDATES TO EXISTING FUNCTIONS =====

// MODIFY awardStickerAndPage() (around line 28910):
// Change from:
//   function awardStickerAndPage() {
//     const counters = ensureProgressCountersState();
//     const deviceId = (state.deviceId && typeof state.deviceId === 'string') ? state.deviceId : 'device';
//     counters.stickersByDevice[deviceId] = (counters.stickersByDevice[deviceId] || 0) + 1;
//     counters.pagesCompletedByDevice[deviceId] = (counters.pagesCompletedByDevice[deviceId] || 0) + 1;
//     recalcProgressCountersTotals();
//   }
//
// To:
//   function awardStickerAndPage() {
//     awardSubjectStickerAndPage();
//   }

// MODIFY showComplete() (around line 28555):
// Add after line: state.completedStations.push(state.currentStation);
// Add: markSubjectStationComplete(state.currentStation);

// MODIFY loadProgress() (around line 28842):
// Add after: state.mastery = normalizeMasteryData(p.mastery);
// Add: if (p.subjectProgress) state.subjectProgress = p.subjectProgress;
// Add: migrateToSubjectProgress();

// MODIFY saveProgress() (around line 28789):
// Add to saveData object after mastery:
// Add: subjectProgress: ensureSubjectProgress(),

// MODIFY normalizeProgressData() (around line 18571):
// Add to return object after mastery:
// Add: subjectProgress: obj.subjectProgress || { ela: createEmptyProgress(), math: createEmptyProgress() },
