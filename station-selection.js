/**
 * Station Selection UI - MRT Line Map Concept
 * Provides beautiful interface for selecting stations organized by line (RF/RL/RI/L/Review)
 */

// Station selection state
const stationSelection = {
  currentSubject: 'ela', // 'ela' or 'math'
  currentLine: 'RF',
  contentPack: null,
  stationsByLine: {},
  loadedFromPath: '/content/cpa-grade1-ela/content-pack.v1.json'
};

// Line display configuration - ELA Lines
const ELA_LINE_CONFIG = {
  'RF': {
    name: 'Reading Foundation',
    shortName: 'RF',
    color: 'var(--line-red)',
    className: 'line-rf'
  },
  'RL': {
    name: 'Reading Literature',
    shortName: 'RL',
    color: 'var(--line-green)',
    className: 'line-rl'
  },
  'RI': {
    name: 'Reading Information',
    shortName: 'RI',
    color: 'var(--line-blue)',
    className: 'line-ri'
  },
  'L': {
    name: 'Language',
    shortName: 'L',
    color: 'var(--line-purple)',
    className: 'line-l'
  },
  'Review': {
    name: 'Review Sprints',
    shortName: 'Review',
    color: '#DAA520',
    className: 'line-review'
  }
};

// Line display configuration - Math Lines
const MATH_LINE_CONFIG = {
  'OA': {
    name: 'Operations & Algebraic Thinking',
    shortName: 'OA',
    color: '#E74C3C', // Red-Orange
    className: 'line-oa'
  },
  'NBT': {
    name: 'Numbers & Base Ten',
    shortName: 'NBT',
    color: '#3498DB', // Blue
    className: 'line-nbt'
  },
  'MD': {
    name: 'Measurement & Data',
    shortName: 'MD',
    color: '#27AE60', // Green
    className: 'line-md'
  },
  'G': {
    name: 'Geometry',
    shortName: 'G',
    color: '#9B59B6', // Purple
    className: 'line-g'
  },
  'Review': {
    name: 'Review Sprints',
    shortName: 'Review',
    color: '#DAA520',
    className: 'line-review'
  }
};

// Content pack configurations
const CONTENT_PACKS = {
  'ela': {
    name: 'English Language Arts',
    icon: '📚',
    path: '/content/cpa-grade1-ela/content-pack.v1.json',
    lines: ELA_LINE_CONFIG,
    defaultLine: 'RF'
  },
  'math': {
    name: 'Mathematics',
    icon: '🔢',
    path: '/content/cpa-grade1-math/content-pack.v1.json',
    lines: MATH_LINE_CONFIG,
    defaultLine: 'OA'
  }
};

// Active line config (set dynamically based on subject)
let LINE_CONFIG = ELA_LINE_CONFIG;

/**
 * Switch to a different subject (ELA or Math)
 */
async function switchSubject(subjectKey) {
  const pack = CONTENT_PACKS[subjectKey];
  if (!pack) {
    console.error('Unknown subject:', subjectKey);
    return false;
  }

  // Validate pack structure
  if (!pack.path || !pack.lines || !pack.defaultLine) {
    console.error('Invalid content pack configuration for subject:', subjectKey);
    return false;
  }

  stationSelection.currentSubject = subjectKey;
  stationSelection.loadedFromPath = pack.path;
  stationSelection.currentLine = pack.defaultLine;
  LINE_CONFIG = pack.lines;

  const success = await loadContentPack();
  if (success) {
    renderSubjectSelector();
    renderLineSelector();
    renderStationList(stationSelection.currentLine);
  }
  return success;
}

/**
 * Render subject selector (ELA / Math toggle)
 */
function renderSubjectSelector() {
  const container = document.getElementById('subjectSelector');
  if (!container) return;

  container.innerHTML = '';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Subject selection');

  Object.entries(CONTENT_PACKS).forEach(([key, pack]) => {
    const btn = document.createElement('button');
    btn.className = `subject-btn ${key === stationSelection.currentSubject ? 'active' : ''}`;
    btn.setAttribute('data-subject', key);
    btn.setAttribute('type', 'button');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', key === stationSelection.currentSubject ? 'true' : 'false');
    btn.setAttribute('aria-label', `${pack.name} - ${pack.icon}`);

    btn.innerHTML = `
      <span class="subject-icon">${pack.icon}</span>
      <span class="subject-name">${pack.name}</span>
    `;

    btn.addEventListener('click', () => {
      if (key !== stationSelection.currentSubject) {
        switchSubject(key);
      }
    });

    container.appendChild(btn);
  });
}

/**
 * Load content pack and organize stations by line
 */
async function loadContentPack() {
  try {
    const response = await fetch(stationSelection.loadedFromPath);
    if (!response.ok) {
      throw new Error(`Failed to load content pack: ${response.status} ${response.statusText}`);
    }

    const contentPack = await response.json();

    // Validate content pack structure
    if (!contentPack || typeof contentPack !== 'object') {
      throw new Error('Invalid content pack: not an object');
    }
    if (!contentPack.stations || typeof contentPack.stations !== 'object') {
      throw new Error('Invalid content pack: missing or invalid stations');
    }
    if (!Array.isArray(contentPack.stationOrder)) {
      throw new Error('Invalid content pack: missing or invalid stationOrder');
    }

    stationSelection.contentPack = contentPack;

    // INTEGRATION: Populate global stationContent object from content pack
    // This allows the existing lesson engine to work with content pack stations
    if (typeof stationContent !== 'undefined' && stationSelection.contentPack.stations) {
      Object.assign(stationContent, stationSelection.contentPack.stations);
      console.log('Merged content pack stations into stationContent:', Object.keys(stationContent).length, 'stations');
    }

    organizeStationsByLine();

    console.log('Content pack loaded:', stationSelection.stationsByLine);
    return true;
  } catch (error) {
    console.error('Error loading content pack:', error);
    // Show user-friendly error message
    const container = document.getElementById('stationListContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <p style="font-size: 3rem; margin-bottom: 16px;">⚠️</p>
          <p style="font-size: 1.2rem; font-family: var(--font-display); font-weight: 600; color: var(--danger-red);">Failed to load content</p>
          <p style="margin-top: 8px; color: var(--text-secondary);">${error.message}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: var(--success-green); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;">Reload Page</button>
        </div>
      `;
    }
    return false;
  }
}

/**
 * Organize stations into line groups
 */
function organizeStationsByLine() {
  const { stationOrder, stations } = stationSelection.contentPack;
  stationSelection.stationsByLine = {};

  // Initialize line arrays
  Object.keys(LINE_CONFIG).forEach(line => {
    stationSelection.stationsByLine[line] = [];
  });

  // Group stations by line
  stationOrder.forEach(stationId => {
    const station = stations[stationId];
    if (station && station.line) {
      const lineKey = station.line.toUpperCase();
      if (stationSelection.stationsByLine[lineKey]) {
        stationSelection.stationsByLine[lineKey].push({
          id: stationId,
          ...station
        });
      }
    } else if (stationId.startsWith('review_') || stationId.startsWith('review-')) {
      // Review stations - handle both review_ and review- prefixes
      if (stationSelection.stationsByLine['Review']) {
        stationSelection.stationsByLine['Review'].push({
          id: stationId,
          ...station,
          line: 'Review'
        });
      }
    }
  });
}

/**
 * Initialize station selection UI
 */
async function initStationSelection() {
  const success = await loadContentPack();
  if (!success) {
    console.error('Failed to initialize station selection');
    return;
  }

  renderSubjectSelector();
  renderLineSelector();
  renderStationList(stationSelection.currentLine);
  attachStationSelectionListeners();
}

/**
 * Render line selector tabs
 */
function renderLineSelector() {
  const selector = document.getElementById('lineSelector');
  if (!selector) return;

  selector.setAttribute('role', 'tablist');
  selector.setAttribute('aria-label', 'MRT line selection');
  selector.innerHTML = '';

  Object.entries(LINE_CONFIG).forEach(([lineKey, lineConfig]) => {
    const stations = stationSelection.stationsByLine[lineKey] || [];
    if (stations.length === 0) return; // Skip empty lines

    // Calculate progress first
    const completedCount = stations.filter(s => isStationCompleted(s.id)).length;
    const progressPercent = stations.length > 0 ? (completedCount / stations.length) * 100 : 0;

    const tab = document.createElement('button');
    tab.className = `line-tab ${lineConfig.className}`;
    tab.setAttribute('data-line', lineKey);
    tab.setAttribute('type', 'button');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-label', `${lineConfig.name} line - ${completedCount} of ${stations.length} stations completed`);
    tab.setAttribute('aria-selected', lineKey === stationSelection.currentLine ? 'true' : 'false');

    if (lineKey === stationSelection.currentLine) {
      tab.classList.add('active');
    }

    tab.innerHTML = `
      <div>${lineConfig.shortName}</div>
      <div class="line-progress-bar" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        <div class="line-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    `;

    tab.addEventListener('click', () => switchToLine(lineKey));
    tab.addEventListener('keydown', (e) => handleTabKeydown(e, lineKey));
    selector.appendChild(tab);
  });
}

/**
 * Handle keyboard navigation for line tabs
 */
function handleTabKeydown(event, lineKey) {
  const tabs = Array.from(document.querySelectorAll('.line-tab'));
  const currentIndex = tabs.findIndex(tab => tab.dataset.line === lineKey);

  let targetIndex = currentIndex;

  switch(event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      targetIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      targetIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      event.preventDefault();
      break;
    case 'Home':
      targetIndex = 0;
      event.preventDefault();
      break;
    case 'End':
      targetIndex = tabs.length - 1;
      event.preventDefault();
      break;
    default:
      return;
  }

  const targetTab = tabs[targetIndex];
  if (targetTab) {
    switchToLine(targetTab.dataset.line);
    targetTab.focus();
  }
}

/**
 * Switch to a different line
 */
function switchToLine(lineKey) {
  stationSelection.currentLine = lineKey;

  // Update tab states
  document.querySelectorAll('.line-tab').forEach(tab => {
    const isActive = tab.dataset.line === lineKey;
    if (isActive) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    }
  });

  // Render stations for this line
  renderStationList(lineKey);
}

/**
 * Render station list for selected line
 */
function renderStationList(lineKey) {
  const container = document.getElementById('stationListContainer');
  if (!container) {
    console.error('stationListContainer element not found');
    return;
  }

  const stations = stationSelection.stationsByLine[lineKey] || [];
  const lineConfig = LINE_CONFIG[lineKey];

  if (!lineConfig) {
    console.error('Line configuration not found for:', lineKey);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 3rem; margin-bottom: 16px;">⚠️</p>
        <p style="font-size: 1.2rem; font-family: var(--font-display); font-weight: 600;">Invalid line selected</p>
      </div>
    `;
    return;
  }

  if (stations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 3rem; margin-bottom: 16px;">🚇</p>
        <p style="font-size: 1.2rem; font-family: var(--font-display); font-weight: 600;">No stations on this line yet</p>
      </div>
    `;
    return;
  }

  const stationCards = stations.map((station, index) => {
    const isLocked = isStationLocked(station.id, index, stations);
    const isCompleted = isStationCompleted(station.id);
    const isInProgress = !isCompleted && !isLocked && station.id === getCurrentStationId();

    let statusClass = '';
    if (isLocked) statusClass = 'locked';
    else if (isCompleted) statusClass = 'completed';
    else if (isInProgress) statusClass = 'in-progress';

    // Calculate progress dots (based on skills/pages)
    const totalSkills = 5; // Default estimate
    const completedSkills = isCompleted ? totalSkills : (isInProgress ? Math.floor(totalSkills / 2) : 0);
    const progressDots = Array.from({ length: totalSkills }, (_, i) => {
      const dotClass = i < completedSkills ? 'completed' : '';
      return `<div class="progress-dot ${dotClass}"></div>`;
    }).join('');

    // Get actual star rating from progress tracking system
    let stars = '';
    let starCount = 0;
    if (isCompleted && typeof getStationProgress === 'function') {
      const progress = getStationProgress(station.id);
      starCount = progress?.stars || 0;
      stars = '⭐'.repeat(starCount);
    }

    // Status text for accessibility
    let statusText = '';
    if (isLocked) statusText = 'Locked - complete previous station to unlock';
    else if (isCompleted) statusText = `Completed with ${starCount} star${starCount !== 1 ? 's' : ''}`;
    else if (isInProgress) statusText = 'In progress';
    else statusText = 'Ready to start';

    return `
      <div class="station-card ${lineConfig.className} ${statusClass}"
           data-station-id="${station.id}"
           role="${isLocked ? 'article' : 'button'}"
           tabindex="${isLocked ? '-1' : '0'}"
           aria-label="${station.name || station.id} - ${statusText}. Skills: ${(station.checklistTargets || []).join(', ')}"
           ${isLocked ? 'aria-disabled="true"' : ''}>
        <div class="station-icon" aria-hidden="true">
          ${station.icon || '🚇'}
        </div>
        <div class="station-info">
          <div class="station-name">${station.name || station.id}</div>
          <div class="station-targets">${(station.checklistTargets || []).join(', ')}</div>
          <div class="station-progress" role="progressbar" aria-valuenow="${completedSkills}" aria-valuemin="0" aria-valuemax="${totalSkills}" aria-label="Progress: ${completedSkills} of ${totalSkills} skills">
            ${progressDots}
          </div>
        </div>
        <div class="station-stars" aria-hidden="true">
          ${stars}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="station-list">${stationCards}</div>`;

  // Attach event listeners after rendering
  container.querySelectorAll('.station-card').forEach(card => {
    const stationId = card.dataset.stationId;
    const isLocked = card.classList.contains('locked');

    if (!isLocked) {
      card.addEventListener('click', () => showStationIntro(stationId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showStationIntro(stationId);
        }
      });
    }
  });
}

/**
 * Show station intro screen
 */
function showStationIntro(stationId) {
  const station = findStationById(stationId);
  if (!station) {
    console.error('Station not found:', stationId);
    return;
  }

  // Get line config with fallback based on current subject
  const lineKey = station.line ? station.line.toUpperCase() : null;
  const defaultLineKey = stationSelection.currentSubject === 'math' ? 'OA' : 'RF';
  const lineConfig = (lineKey && LINE_CONFIG[lineKey]) || LINE_CONFIG[defaultLineKey];
  const isMath = stationSelection.currentSubject === 'math';

  // Build preview content (words for ELA, concepts for Math)
  let previewHTML = '';
  if (isMath && station.previewConcepts) {
    previewHTML = (station.previewConcepts || []).map(concept => `
      <div class="preview-word-card">
        <div class="preview-word-icon">${concept.icon || '📐'}</div>
        <div class="preview-word-text">${concept.concept}</div>
        <div class="preview-word-phonics">${concept.example || ''}</div>
      </div>
    `).join('');
  } else if (station.previewWords) {
    previewHTML = (station.previewWords || []).map(word => `
      <div class="preview-word-card">
        <div class="preview-word-icon">${word.icon || '📝'}</div>
        <div class="preview-word-text">${word.word}</div>
        <div class="preview-word-phonics">${word.phonicsNote || ''}</div>
      </div>
    `).join('');
  }

  // Build focus content (sight words for ELA, math focus for Math)
  let focusHTML = '';
  if (isMath && station.mathFocus) {
    focusHTML = (station.mathFocus || []).map(topic => `
      <div class="sight-word-chip">${topic}</div>
    `).join('');
  } else if (station.sightWords) {
    focusHTML = (station.sightWords || []).map(word => `
      <div class="sight-word-chip">${word}</div>
    `).join('');
  }

  // Estimate pages
  const pageCount = (station.pages || []).length || 10;
  const estimatedTime = Math.ceil(pageCount * 0.5); // 30 seconds per page average

  const previewSectionTitle = isMath ? '📐 Key Concepts' : '📝 Key Words';
  const focusSectionTitle = isMath ? '🎯 Math Focus' : '⭐ Sight Words';

  const introHTML = `
    <div class="station-intro-header">
      <div class="station-intro-icon">${station.icon || '🚇'}</div>
      <div class="station-intro-title">${station.name || stationId}</div>
      <div class="station-intro-line ${lineConfig.className}" style="background: ${lineConfig.color}">
        ${lineConfig.name}
      </div>
    </div>

    <div class="station-intro-content">
      ${previewHTML ? `
        <div class="intro-section ${lineConfig.className}">
          <div class="intro-section-title">${previewSectionTitle}</div>
          <div class="preview-words">${previewHTML}</div>
        </div>
      ` : ''}

      ${focusHTML ? `
        <div class="intro-section ${lineConfig.className}">
          <div class="intro-section-title">${focusSectionTitle}</div>
          <div class="sight-words-grid">${focusHTML}</div>
        </div>
      ` : ''}

      <div class="intro-section ${lineConfig.className}">
        <div class="intro-section-title">ℹ️ Lesson Info</div>
        <div class="station-info-badges ${lineConfig.className}">
          <div class="info-badge">
            <span class="info-badge-icon">📄</span>
            <span>${pageCount} pages</span>
          </div>
          <div class="info-badge">
            <span class="info-badge-icon">⏱️</span>
            <span>~${estimatedTime} min</span>
          </div>
          <div class="info-badge">
            <span class="info-badge-icon">🎯</span>
            <span>${(station.checklistTargets || []).length} skills</span>
          </div>
        </div>
      </div>
    </div>

    <div class="station-intro-footer">
      <button class="back-to-list-btn" type="button" aria-label="Go back to station list">
        ← Back
      </button>
      <button class="start-lesson-btn" type="button" aria-label="Start lesson: ${station.name || stationId}">
        Start Lesson 🚀
      </button>
    </div>
  `;

  const introScreen = document.getElementById('stationIntroScreen');
  if (introScreen) {
    introScreen.innerHTML = introHTML;

    // Attach event listeners
    const backBtn = introScreen.querySelector('.back-to-list-btn');
    const startBtn = introScreen.querySelector('.start-lesson-btn');

    if (backBtn) {
      backBtn.addEventListener('click', closeStationIntro);
    }
    if (startBtn) {
      startBtn.addEventListener('click', () => startStation(stationId));
    }

    if (typeof goToScreen === 'function') {
      goToScreen('stationIntroScreen');
    } else {
      console.error('goToScreen function not found');
      introScreen.style.display = 'flex';
    }
  }
}

/**
 * Close station intro and return to list
 */
function closeStationIntro() {
  if (typeof goToScreen === 'function') {
    goToScreen('stationSelectScreen');
  } else {
    console.error('goToScreen function not found');
    const introScreen = document.getElementById('stationIntroScreen');
    const selectScreen = document.getElementById('stationSelectScreen');
    if (introScreen) introScreen.style.display = 'none';
    if (selectScreen) selectScreen.style.display = 'flex';
  }
}

/**
 * Start a station (integrate with existing selectStation function)
 */
function startStation(stationId) {
  if (typeof selectStation === 'function') {
    selectStation(stationId);
  } else {
    console.error('selectStation function not found');
  }
}

/**
 * Helper: Find station by ID
 */
function findStationById(stationId) {
  for (const line of Object.values(stationSelection.stationsByLine)) {
    const station = line.find(s => s.id === stationId);
    if (station) return station;
  }
  return null;
}

/**
 * Helper: Check if station is locked
 */
function isStationLocked(stationId, index, lineStations) {
  // Check if "Unlock All Stations" setting is enabled
  if (typeof state !== 'undefined' && state.unlockAllStations) {
    return false; // All stations unlocked
  }

  // First station is always unlocked
  if (index === 0) return false;

  // Check if previous station is completed
  if (index > 0) {
    const prevStation = lineStations[index - 1];
    return !isStationCompleted(prevStation.id);
  }

  return false;
}

/**
 * Helper: Check if station is completed
 */
function isStationCompleted(stationId) {
  // Check against state.completedStations if available
  if (typeof state !== 'undefined' && state.completedStations) {
    return state.completedStations.includes(stationId);
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('appState');
    if (saved) {
      const savedState = JSON.parse(saved);
      return (savedState.completedStations || []).includes(stationId);
    }
  } catch (e) {
    console.error('Error checking completion:', e);
  }

  return false;
}

/**
 * Helper: Get current station ID
 */
function getCurrentStationId() {
  if (typeof state !== 'undefined' && state.currentStation) {
    return state.currentStation;
  }

  try {
    const saved = localStorage.getItem('appState');
    if (saved) {
      const savedState = JSON.parse(saved);
      return savedState.currentStation || null;
    }
  } catch (e) {
    console.error('Error getting current station:', e);
  }

  return null;
}

/**
 * Attach event listeners
 */
function attachStationSelectionListeners() {
  // Line tabs are already handled in renderLineSelector
  console.log('Station selection listeners attached');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStationSelection);
} else {
  // DOM already loaded
  initStationSelection();
}

// Expose to window for testing
if (typeof window !== 'undefined') {
  window.stationSelection = stationSelection;
  window.switchSubject = switchSubject;
  window.MATH_LINE_CONFIG = MATH_LINE_CONFIG;
}
