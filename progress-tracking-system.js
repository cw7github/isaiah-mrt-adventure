// ===== ENHANCED PROGRESS TRACKING SYSTEM =====
// Comprehensive progress tracking with stations, skills, achievements, and daily streaks
// INSERT THIS CODE IN index.html BEFORE THE "// ===== INIT =====" SECTION
//
// INTEGRATION REQUIREMENTS:
// 1. This module depends on a global 'state' object being defined
// 2. Optional dependencies: getSyncNowMs(), speak(), showConfirmModal()
// 3. For analytics/mastery: normalizeAnalyticsData(), normalizeMasteryData()
// 4. For UI updates: updateProgress(), generateMRTMap()
// 5. For achievements: stationContent object (optional, falls back gracefully)
//
// IMPORTANT: This module has its own saveProgress/loadProgress functions that are
// DIFFERENT from the main system's functions. They are renamed to saveEnhancedProgress
// and loadEnhancedProgress but have legacy aliases for backwards compatibility.
//
// RECOMMENDED INTEGRATION:
// - The main system's saveProgress() should include state.enhancedProgress in saveData
// - The main system's loadProgress() should restore state.enhancedProgress
// - Or call saveEnhancedProgress()/loadEnhancedProgress() in sync with main save/load

// Initialize enhanced progress data structure
function normalizeEnhancedProgressData(raw) {
  const obj = raw && typeof raw === 'object' ? raw : {};

  const normalizeStationProgress = (stationId, value) => {
    const v = value && typeof value === 'object' ? value : {};
    return {
      pagesCompleted: Array.isArray(v.pagesCompleted) ? v.pagesCompleted : [],
      questionsCorrect: Number.isFinite(v.questionsCorrect) ? Math.max(0, v.questionsCorrect) : 0,
      questionsTotal: Number.isFinite(v.questionsTotal) ? Math.max(0, v.questionsTotal) : 0,
      questionsFirstTryCorrect: Number.isFinite(v.questionsFirstTryCorrect) ? Math.max(0, v.questionsFirstTryCorrect) : 0,
      attempts: v.attempts && typeof v.attempts === 'object' ? v.attempts : {},
      stars: Number.isFinite(v.stars) ? Math.max(0, Math.min(3, v.stars)) : 0,
      lastPlayed: Number.isFinite(v.lastPlayed) ? v.lastPlayed : null,
      completed: !!v.completed,
      bestScore: Number.isFinite(v.bestScore) ? Math.max(0, Math.min(100, v.bestScore)) : 0,
    };
  };

  const stationProgress = {};
  if (obj.stationProgress && typeof obj.stationProgress === 'object') {
    for (const [stationId, value] of Object.entries(obj.stationProgress)) {
      const id = String(stationId || '').trim();
      if (!id) continue;
      stationProgress[id] = normalizeStationProgress(id, value);
    }
  }

  const achievements = Array.isArray(obj.achievements) ? obj.achievements : [];
  const validAchievements = achievements.filter(a =>
    a && typeof a === 'object' &&
    typeof a.id === 'string' &&
    Number.isFinite(a.unlockedAt)
  );

  return {
    stationProgress,
    totalStarsEarned: Number.isFinite(obj.totalStarsEarned) ? Math.max(0, obj.totalStarsEarned) : 0,
    achievements: validAchievements,
    dailyStreak: Number.isFinite(obj.dailyStreak) ? Math.max(0, obj.dailyStreak) : 0,
    lastPlayDate: typeof obj.lastPlayDate === 'string' ? obj.lastPlayDate : null,
    updatedAt: Number.isFinite(obj.updatedAt) ? obj.updatedAt : 0,
  };
}

function ensureEnhancedProgressState() {
  if (!state.enhancedProgress || typeof state.enhancedProgress !== 'object') {
    state.enhancedProgress = normalizeEnhancedProgressData(null);
  }
  return state.enhancedProgress;
}

// Calculate stars for a station based on performance
function calculateStationStars(stationId) {
  const enhanced = ensureEnhancedProgressState();
  const progress = enhanced.stationProgress[stationId];

  if (!progress || progress.questionsTotal === 0) return 0;

  const firstTryPercent = (progress.questionsFirstTryCorrect / progress.questionsTotal) * 100;

  // Star thresholds based on first-try performance
  if (firstTryPercent >= 90) return 3;  // 3 stars: ≥90% correct on first try
  if (firstTryPercent >= 70) return 2;  // 2 stars: ≥70% correct on first try
  if (progress.completed) return 1;      // 1 star: Complete station (any score)
  return 0;
}

// Record station progress
function recordStationProgressTracking(stationId, pageIndex, correct, isFirstTry) {
  if (!stationId) {
    console.warn('[Progress] recordStationProgressTracking called with invalid stationId');
    return;
  }

  // Validate pageIndex is a valid number
  if (!Number.isFinite(pageIndex) || pageIndex < 0) {
    console.warn('[Progress] recordStationProgressTracking called with invalid pageIndex:', pageIndex);
    return;
  }

  const enhanced = ensureEnhancedProgressState();
  const now = typeof getSyncNowMs === 'function' ? getSyncNowMs() : Date.now();

  if (!enhanced.stationProgress[stationId]) {
    enhanced.stationProgress[stationId] = {
      pagesCompleted: [],
      questionsCorrect: 0,
      questionsTotal: 0,
      questionsFirstTryCorrect: 0,
      attempts: {},
      stars: 0,
      lastPlayed: now,
      completed: false,
      bestScore: 0,
    };
  }

  const progress = enhanced.stationProgress[stationId];
  progress.lastPlayed = now;

  // Track page completion
  if (!progress.pagesCompleted.includes(pageIndex)) {
    progress.pagesCompleted.push(pageIndex);
  }

  // Track question performance
  if (isFirstTry) {
    progress.questionsTotal++;
    if (correct) {
      progress.questionsCorrect++;
      progress.questionsFirstTryCorrect++;
    }
  } else if (correct) {
    // Retries: increment correct count but not total or first-try
    progress.questionsCorrect++;
  }

  // Track attempts per question
  const questionKey = `page_${pageIndex}`;
  progress.attempts[questionKey] = (progress.attempts[questionKey] || 0) + 1;

  // Calculate current score based on first-try performance
  // This ensures star ratings reflect actual first-try accuracy
  const currentScore = progress.questionsTotal > 0
    ? (progress.questionsFirstTryCorrect / progress.questionsTotal) * 100
    : 0;
  progress.bestScore = Math.max(progress.bestScore, currentScore);

  // Update stars
  progress.stars = calculateStationStars(stationId);

  enhanced.updatedAt = now;
  updateDailyStreak();

  // Auto-save progress after each question
  saveProgress();
}

// Update daily streak
function updateDailyStreak() {
  const enhanced = ensureEnhancedProgressState();
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

  if (enhanced.lastPlayDate === today) {
    return; // Already played today
  }

  if (!enhanced.lastPlayDate) {
    // First time playing
    enhanced.dailyStreak = 1;
    enhanced.lastPlayDate = today;
    return;
  }

  // Validate lastPlayDate format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(enhanced.lastPlayDate)) {
    console.warn('[Streak] Invalid lastPlayDate format:', enhanced.lastPlayDate);
    // Reset streak with current date
    enhanced.dailyStreak = 1;
    enhanced.lastPlayDate = today;
    return;
  }

  // Calculate day difference using UTC to avoid timezone issues
  const lastDate = new Date(enhanced.lastPlayDate + 'T00:00:00Z');
  const todayDate = new Date(today + 'T00:00:00Z');

  // Validate that dates are valid
  if (isNaN(lastDate.getTime()) || isNaN(todayDate.getTime())) {
    console.warn('[Streak] Invalid date detected');
    enhanced.dailyStreak = 1;
    enhanced.lastPlayDate = today;
    return;
  }

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    enhanced.dailyStreak++;
    enhanced.lastPlayDate = today;
    checkAchievement('week-warrior');
  } else if (diffDays > 1) {
    // Streak broken
    enhanced.dailyStreak = 1;
    enhanced.lastPlayDate = today;
  } else if (diffDays < 0) {
    // Future date detected - system clock issue or corruption
    console.warn('[Streak] Future date detected, resetting streak');
    enhanced.dailyStreak = 1;
    enhanced.lastPlayDate = today;
  }
  // diffDays === 0 is already handled at the start of the function
}

// Calculate total stars earned
function calculateTotalStars() {
  const enhanced = ensureEnhancedProgressState();
  let total = 0;

  for (const [stationId, progress] of Object.entries(enhanced.stationProgress)) {
    total += progress.stars || 0;
  }

  enhanced.totalStarsEarned = total;
  return total;
}

// Mark station as completed
function markStationCompletedEnhanced(stationId) {
  if (!stationId) return;

  const enhanced = ensureEnhancedProgressState();

  if (!enhanced.stationProgress[stationId]) {
    recordStationProgressTracking(stationId, 0, false, false);
  }

  const progress = enhanced.stationProgress[stationId];
  progress.completed = true;
  progress.stars = calculateStationStars(stationId);

  calculateTotalStars();
  enhanced.updatedAt = typeof getSyncNowMs === 'function' ? getSyncNowMs() : Date.now();

  // Check achievements
  checkAchievement('first-steps');
  checkAchievement('halfway-there');
  checkAchievement('ela-champion');

  if (progress.stars === 3) {
    checkAchievement('perfect-score');
  }

  saveProgress();
}

// ===== ACHIEVEMENTS SYSTEM =====

const ACHIEVEMENT_DEFINITIONS = {
  'first-steps': {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first station',
    icon: '👣',
    check: () => {
      const enhanced = ensureEnhancedProgressState();
      const completed = Object.values(enhanced.stationProgress).filter(p => p.completed);
      return completed.length >= 1;
    }
  },
  'sight-word-star': {
    id: 'sight-word-star',
    title: 'Sight Word Star',
    description: 'Master 20 sight words',
    icon: '⭐',
    check: () => {
      // Check legacy masteredWords if available
      const mastered = (typeof state !== 'undefined' && state.masteredWords) ? state.masteredWords : new Set();
      return mastered.size >= 20;
    }
  },
  'perfect-score': {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 3 stars on any station',
    icon: '💯',
    check: () => {
      const enhanced = ensureEnhancedProgressState();
      for (const progress of Object.values(enhanced.stationProgress)) {
        if (progress.stars === 3) return true;
      }
      return false;
    }
  },
  'week-warrior': {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    check: () => {
      const enhanced = ensureEnhancedProgressState();
      return enhanced.dailyStreak >= 7;
    }
  },
  'halfway-there': {
    id: 'halfway-there',
    title: 'Halfway There',
    description: 'Complete 50% of stations',
    icon: '🎯',
    check: () => {
      const enhanced = ensureEnhancedProgressState();
      const completed = Object.values(enhanced.stationProgress).filter(p => p.completed);
      let totalStations;

      if (typeof stationContent !== 'undefined' && stationContent !== null) {
        totalStations = Object.keys(stationContent).filter(id => {
          const station = stationContent[id];
          return station && !station.isPractice;
        }).length;
      } else {
        totalStations = Object.keys(enhanced.stationProgress).length;
      }

      return totalStations > 0 && completed.length >= Math.ceil(totalStations / 2);
    }
  },
  'ela-champion': {
    id: 'ela-champion',
    title: 'ELA Champion',
    description: 'Complete all stations',
    icon: '🏆',
    check: () => {
      const enhanced = ensureEnhancedProgressState();
      const completed = Object.values(enhanced.stationProgress).filter(p => p.completed);
      let totalStations;

      if (typeof stationContent !== 'undefined' && stationContent !== null) {
        totalStations = Object.keys(stationContent).filter(id => {
          const station = stationContent[id];
          return station && !station.isPractice;
        }).length;
      } else {
        totalStations = Object.keys(enhanced.stationProgress).length;
      }

      return totalStations > 0 && completed.length >= totalStations;
    }
  }
};

// Check and unlock achievement
function checkAchievement(achievementId) {
  const enhanced = ensureEnhancedProgressState();
  const definition = ACHIEVEMENT_DEFINITIONS[achievementId];

  if (!definition) return false;

  // Check if already unlocked
  if (enhanced.achievements.some(a => a.id === achievementId)) {
    return false;
  }

  // Check if criteria met
  if (definition.check()) {
    const now = typeof getSyncNowMs === 'function' ? getSyncNowMs() : Date.now();
    enhanced.achievements.push({
      id: achievementId,
      unlockedAt: now,
    });
    enhanced.updatedAt = now;

    // Show achievement notification
    showAchievementNotification(definition);
    return true;
  }

  return false;
}

// Check all achievements
function checkAllAchievements() {
  for (const achievementId of Object.keys(ACHIEVEMENT_DEFINITIONS)) {
    checkAchievement(achievementId);
  }
}

// Show achievement notification
function showAchievementNotification(definition) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${definition.icon}</div>
    <div class="achievement-content">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${definition.title}</div>
      <div class="achievement-desc">${definition.description}</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);

  // Play celebration sound
  if (typeof speak === 'function') {
    speak('Achievement unlocked! ' + definition.title, 1.0, { kind: 'feedback' });
  }

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// Get achievement progress summary
function getAchievementProgress() {
  const enhanced = ensureEnhancedProgressState();
  const total = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const unlocked = enhanced.achievements.length;
  const remaining = total - unlocked;

  return {
    total,
    unlocked,
    remaining,
    percentage: total > 0 ? (unlocked / total) * 100 : 0,
  };
}

// ===== PROGRESS SAVE/LOAD =====

// Save enhanced progress to localStorage with error handling
// NOTE: This integrates with the main saveProgress() function in index.html
// The main saveProgress() should call this or include enhancedProgress in its saveData
function saveEnhancedProgress() {
  try {
    const enhanced = ensureEnhancedProgressState();

    // Save to global state if available
    if (typeof state !== 'undefined' && state !== null) {
      state.enhancedProgress = enhanced;
    }

    // Save to localStorage
    const dataToSave = {
      enhancedProgress: enhanced,
      version: 1,
      savedAt: typeof getSyncNowMs === 'function' ? getSyncNowMs() : Date.now()
    };

    localStorage.setItem('isaiahEnhancedProgress', JSON.stringify(dataToSave));
    console.log('[Progress] Enhanced progress saved to localStorage');
    return true;
  } catch (error) {
    console.error('[Progress] Failed to save enhanced progress to localStorage:', error);

    // If localStorage fails, ensure data is still in memory
    if (typeof state !== 'undefined' && state !== null) {
      state.enhancedProgress = ensureEnhancedProgressState();
    }

    return false;
  }
}

// Load enhanced progress from localStorage with error handling
// NOTE: This should be called after the main loadProgress() or integrated into it
function loadEnhancedProgress() {
  try {
    const saved = localStorage.getItem('isaiahEnhancedProgress');
    if (!saved) {
      console.log('[Progress] No enhanced progress data found');
      return false;
    }

    const data = JSON.parse(saved);
    if (!data || !data.enhancedProgress) {
      console.warn('[Progress] Invalid enhanced progress data structure');
      return false;
    }

    // Normalize and restore
    const normalized = normalizeEnhancedProgressData(data.enhancedProgress);

    if (typeof state !== 'undefined' && state !== null) {
      state.enhancedProgress = normalized;
    }

    console.log('[Progress] Enhanced progress loaded from localStorage:', {
      stations: Object.keys(normalized.stationProgress).length,
      totalStars: normalized.totalStarsEarned,
      streak: normalized.dailyStreak
    });

    return true;
  } catch (error) {
    console.error('[Progress] Failed to load enhanced progress from localStorage:', error);

    // Initialize empty progress state on error
    if (typeof state !== 'undefined' && state !== null) {
      state.enhancedProgress = normalizeEnhancedProgressData(null);
    }

    return false;
  }
}

// Legacy function names for backwards compatibility
// These now call the renamed functions
function saveProgress() {
  return saveEnhancedProgress();
}

function loadProgress() {
  return loadEnhancedProgress();
}

// Get station progress for external API access
function getStationProgress(stationId) {
  const enhanced = ensureEnhancedProgressState();
  return enhanced.stationProgress[stationId] || null;
}

// Get all station progress data
function getAllStationProgress() {
  const enhanced = ensureEnhancedProgressState();
  return { ...enhanced.stationProgress };
}

// Get achievement data
function getAchievements() {
  const enhanced = ensureEnhancedProgressState();
  return [...enhanced.achievements];
}

// Get daily streak info
function getDailyStreak() {
  const enhanced = ensureEnhancedProgressState();
  return {
    streak: enhanced.dailyStreak,
    lastPlayDate: enhanced.lastPlayDate
  };
}

// ===== MASTERY CRITERIA =====

// Check if a station meets mastery criteria
// Mastery: 10+ items, ≥80% overall correct, ≥60% first-try correct
function checkStationMastery(stationId) {
  const enhanced = ensureEnhancedProgressState();
  const progress = enhanced.stationProgress[stationId];

  if (!progress) return false;

  // Criteria 1: At least 10 questions attempted
  if (progress.questionsTotal < 10) return false;

  // Criteria 2: ≥80% overall correct
  const overallPercent = (progress.questionsCorrect / progress.questionsTotal) * 100;
  if (overallPercent < 80) return false;

  // Criteria 3: ≥60% first-try correct
  const firstTryPercent = (progress.questionsFirstTryCorrect / progress.questionsTotal) * 100;
  if (firstTryPercent < 60) return false;

  return true;
}

// Get all mastered stations
function getMasteredStations() {
  const enhanced = ensureEnhancedProgressState();
  const mastered = [];

  for (const [stationId, progress] of Object.entries(enhanced.stationProgress)) {
    if (checkStationMastery(stationId)) {
      mastered.push(stationId);
    }
  }

  return mastered;
}

// ===== PROGRESS EXPORT/IMPORT =====

function exportProgress() {
  // Validate state object exists
  if (typeof state === 'undefined' || state === null) {
    console.error('[Export] Cannot export: state object is undefined');
    if (typeof speak === 'function') {
      speak('Export failed: no progress data available', 1.0, { kind: 'feedback' });
    }
    return;
  }

  const exportData = {
    version: 1,
    exportedAt: typeof getSyncNowMs === 'function' ? getSyncNowMs() : Date.now(),
    studentName: typeof getActiveProfileDisplay === 'function' ? getActiveProfileDisplay().name : 'Student',
    progress: {
      stickers: state.stickers || 0,
      pagesCompleted: state.pagesCompleted || 0,
      completedStations: state.completedStations || [],
      masteredWords: state.masteredWords ? Array.from(state.masteredWords) : [],
      analytics: state.analytics || {},
      mastery: state.mastery || {},
      enhancedProgress: state.enhancedProgress || normalizeEnhancedProgressData(null),
    }
  };

  try {
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `isaiah-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof speak === 'function') {
      speak('Progress exported successfully', 1.0, { kind: 'feedback' });
    }
  } catch (error) {
    console.error('[Export] Failed to export progress:', error);
    if (typeof speak === 'function') {
      speak('Export failed', 1.0, { kind: 'feedback' });
    }
  }
}

async function importProgress(file) {
  // Validate state object exists
  if (typeof state === 'undefined' || state === null) {
    console.error('[Import] Cannot import: state object is undefined');
    if (typeof speak === 'function') {
      speak('Import failed: system not ready', 1.0, { kind: 'feedback' });
    }
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || data.version !== 1) {
      throw new Error('Invalid or incompatible backup file');
    }

    // Check if showConfirmModal is available
    if (typeof showConfirmModal !== 'function') {
      console.error('[Import] showConfirmModal is not available');
      if (!confirm('Import Progress? This will replace all current progress. This cannot be undone.')) {
        return;
      }
    } else {
      const ok = await showConfirmModal({
        title: 'Import Progress?',
        message: 'This will replace all current progress. This cannot be undone.',
        confirmText: 'Import',
        cancelText: 'Cancel',
        danger: true,
      });

      if (!ok) return;
    }

    // Import data
    if (data.progress) {
      state.stickers = Number.isFinite(data.progress.stickers) ? data.progress.stickers : 0;
      state.pagesCompleted = Number.isFinite(data.progress.pagesCompleted) ? data.progress.pagesCompleted : 0;
      state.completedStations = Array.isArray(data.progress.completedStations) ? data.progress.completedStations : [];
      state.masteredWords = new Set(Array.isArray(data.progress.masteredWords) ? data.progress.masteredWords : []);

      if (data.progress.analytics) {
        if (typeof normalizeAnalyticsData === 'function') {
          state.analytics = normalizeAnalyticsData(data.progress.analytics);
        } else {
          state.analytics = data.progress.analytics;
        }
      }

      if (data.progress.mastery) {
        if (typeof normalizeMasteryData === 'function') {
          state.mastery = normalizeMasteryData(data.progress.mastery);
        } else {
          state.mastery = data.progress.mastery;
        }
      }

      if (data.progress.enhancedProgress) {
        state.enhancedProgress = normalizeEnhancedProgressData(data.progress.enhancedProgress);
      }
    }

    if (typeof updateProgress === 'function') {
      updateProgress({ save: true });
    }
    if (typeof generateMRTMap === 'function') {
      generateMRTMap();
    }

    if (typeof speak === 'function') {
      speak('Progress imported successfully', 1.0, { kind: 'feedback' });
    }
  } catch (e) {
    console.error('[Import] Import failed:', e);

    // Fallback to alert if showConfirmModal is not available
    if (typeof showConfirmModal !== 'function') {
      alert('Import Failed: Could not read the backup file. Please make sure it is a valid export file.');
    } else {
      await showConfirmModal({
        title: 'Import Failed',
        message: 'Could not read the backup file. Please make sure it is a valid export file.',
        confirmText: 'OK',
        cancelText: null,
      });
    }
  }
}

// ===== EXPORTED FUNCTIONS =====
// Make functions available globally for use by other parts of the system

if (typeof window !== 'undefined') {
  // Core progress tracking functions
  window.normalizeEnhancedProgressData = normalizeEnhancedProgressData;
  window.ensureEnhancedProgressState = ensureEnhancedProgressState;
  window.recordStationProgressTracking = recordStationProgressTracking;
  window.markStationCompletedEnhanced = markStationCompletedEnhanced;
  window.calculateStationStars = calculateStationStars;
  window.calculateTotalStars = calculateTotalStars;

  // Streak tracking
  window.updateDailyStreak = updateDailyStreak;
  window.getDailyStreak = getDailyStreak;

  // Achievement functions
  window.checkAchievement = checkAchievement;
  window.checkAllAchievements = checkAllAchievements;
  window.getAchievementProgress = getAchievementProgress;
  window.getAchievements = getAchievements;
  window.ACHIEVEMENT_DEFINITIONS = ACHIEVEMENT_DEFINITIONS;

  // Progress save/load
  window.saveEnhancedProgress = saveEnhancedProgress;
  window.loadEnhancedProgress = loadEnhancedProgress;
  // Note: saveProgress and loadProgress are legacy aliases - be careful about conflicts

  // Progress query functions
  window.getStationProgress = getStationProgress;
  window.getAllStationProgress = getAllStationProgress;

  // Mastery functions
  window.checkStationMastery = checkStationMastery;
  window.getMasteredStations = getMasteredStations;

  // Export/Import
  window.exportProgress = exportProgress;
  window.importProgress = importProgress;
}

// ===== END ENHANCED PROGRESS TRACKING SYSTEM =====
