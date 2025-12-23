// ===== CONTENT PACK RENDERING ENGINE - EXAMPLE USAGE =====
// This file demonstrates how to use the content pack rendering engine
// Copy the relevant parts into your index.html

// ========================================
// EXAMPLE 1: Initialize on Page Load
// ========================================

async function initApp() {
  console.log('App starting...');

  // Initialize the content pack system
  const success = await initializeContentPack();

  if (!success) {
    console.error('Failed to load content pack!');
    // Show error screen to user
    document.body.innerHTML = '<h1>Error loading lessons. Please refresh.</h1>';
    return;
  }

  console.log('Content pack loaded!');
  console.log('Total stations:', getStationCount());

  // Try to resume from saved progress
  const hasProgress = loadLessonProgress();

  if (hasProgress) {
    console.log('Resuming from:', state.currentStation, 'page', state.currentPage);
    // Jump directly to the saved lesson
    showScreen('restaurantScreen');
    showPage();
  } else {
    console.log('No saved progress - starting fresh');
    // Show welcome screen
    showScreen('welcomeScreen');
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', initApp);

// ========================================
// EXAMPLE 2: Starting a Lesson
// ========================================

function startLesson(stationId) {
  // Get the station data
  const station = getStation(stationId);

  if (!station) {
    console.error('Station not found:', stationId);
    return;
  }

  console.log('Starting lesson:', station.name);

  // Set the current station
  state.currentStation = stationId;
  state.currentPage = 0;

  // Save progress
  saveLessonProgress();

  // Show the lesson screen
  showScreen('restaurantScreen');

  // Render the first page
  showPage();
}

// Example: Start the first station
// startLesson('rf_f1_print_concepts');

// ========================================
// EXAMPLE 3: Custom showPage() Implementation
// ========================================

function showPage() {
  // Stop any playing guidance audio
  stopGuidanceAudioOnNavigation({ fadeMs: 120 });

  // Get current page data from content pack
  const pages = getStationPages(state.currentStation);
  const page = pages[state.currentPage];

  if (!page) {
    console.error('Page not found:', state.currentPage);
    return;
  }

  console.log('Showing page:', state.currentPage, 'type:', page.type);

  // Handle elevator transitions between passages
  if (maybeStartLessonElevatorTransitionForCurrentPage()) {
    return; // Elevator is transitioning, wait for it
  }

  // Scroll to top on mobile
  const restaurantScreen = document.getElementById('restaurantScreen');
  if (restaurantScreen) restaurantScreen.scrollTop = 0;

  // Update UI indicators
  updateMRTProgressBar();
  updateMRTLineIndicator();

  // Get station context
  const station = getStation(state.currentStation);

  // Dispatch to appropriate renderer based on page type
  switch (page.type) {
    case 'read':
      renderReadPage(page, station);
      break;

    case 'menu':
      renderMenuPage(page, station);
      break;

    case 'question':
      renderQuestionPage(page, station);
      break;

    case 'activitySpec':
      renderActivitySpecPage(page, station);
      break;

    default:
      console.error('Unknown page type:', page.type);
  }

  // Play voice guidance for this page
  if (state.currentScreen === 'restaurantScreen') {
    playLessonGuidanceForPage(page);
  }

  // Preload audio for next pages
  preloadUpcomingLessonAudio({
    pages,
    currentIndex: state.currentPage
  });

  // Save progress after showing page
  saveLessonProgress();
}

// ========================================
// EXAMPLE 4: Handling Continue Button
// ========================================

// Hook up continue button to use the new navigation
document.getElementById('continueBtn').onclick = function() {
  console.log('Continue button clicked');

  // Track interaction
  markUserInteraction();

  // Use the content pack navigation
  continueToNextPage();
};

// Alternative: Custom continue with analytics
function handleContinue() {
  // Log analytics
  const page = getPage(state.currentStation, state.currentPage);
  console.log('[Analytics] Completed page:', {
    station: state.currentStation,
    pageIndex: state.currentPage,
    pageType: page?.type,
    timestamp: Date.now()
  });

  // Continue to next page
  continueToNextPage();
}

// ========================================
// EXAMPLE 5: Building Station Selector
// ========================================

function buildStationSelector() {
  const container = document.getElementById('stationList');
  if (!container) return;

  container.innerHTML = '';

  // Get all stations in order
  const stationCount = getStationCount();

  for (let i = 0; i < stationCount; i++) {
    const station = getStationByIndex(i);
    if (!station) continue;

    // Create station button
    const button = document.createElement('button');
    button.className = 'station-btn';
    button.innerHTML = `
      <span class="station-icon">${station.icon || '📚'}</span>
      <span class="station-name">${station.name}</span>
      <span class="station-level">Level ${station.level || 1}</span>
    `;

    // Check if completed
    if (state.completedStations.includes(contentPack.stationOrder[i])) {
      button.classList.add('completed');
    }

    // Handle click
    button.onclick = () => startLesson(contentPack.stationOrder[i]);

    container.appendChild(button);
  }

  console.log('Built station selector with', stationCount, 'stations');
}

// Call after content pack loads
// buildStationSelector();

// ========================================
// EXAMPLE 6: Progress Tracking
// ========================================

function showLessonProgress() {
  if (!state.currentStation) {
    console.log('No active lesson');
    return;
  }

  const pages = getStationPages(state.currentStation);
  const station = getStation(state.currentStation);

  console.log('=== Lesson Progress ===');
  console.log('Station:', station?.name);
  console.log('Current Page:', state.currentPage + 1, 'of', pages.length);
  console.log('Progress:', Math.round((state.currentPage / pages.length) * 100) + '%');

  // Update progress bar
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const percent = (state.currentPage / pages.length) * 100;
    progressBar.style.width = percent + '%';
  }

  // Update page counter
  const pageCounter = document.getElementById('pageCounter');
  if (pageCounter) {
    pageCounter.textContent = `${state.currentPage + 1} / ${pages.length}`;
  }
}

// ========================================
// EXAMPLE 7: Debugging Helpers
// ========================================

// Add to window for console access
window.debugContentPack = {
  // Show content pack info
  info() {
    console.log('=== Content Pack Info ===');
    console.log('Loaded:', contentPack.loaded);
    console.log('Schema Version:', contentPack.data?.schemaVersion);
    console.log('Station Count:', getStationCount());
    console.log('Station Order:', contentPack.stationOrder);
    console.log('Current Station:', state.currentStation);
    console.log('Current Page:', state.currentPage);
  },

  // List all stations
  listStations() {
    const count = getStationCount();
    console.log('=== All Stations ===');
    for (let i = 0; i < count; i++) {
      const station = getStationByIndex(i);
      const id = contentPack.stationOrder[i];
      console.log(`${i + 1}. ${station?.name} (${id}) - ${station?.pages?.length || 0} pages`);
    }
  },

  // Show current page
  showCurrentPage() {
    const page = getPage(state.currentStation, state.currentPage);
    console.log('=== Current Page ===');
    console.log('Type:', page?.type);
    console.log('Content:', page);
  },

  // Jump to station
  jumpTo(stationId, pageIndex = 0) {
    state.currentStation = stationId;
    state.currentPage = pageIndex;
    showPage();
  },

  // Skip to next page
  skip() {
    continueToNextPage();
  },

  // Go back
  back() {
    goToPreviousPage();
  },

  // Clear all progress
  reset() {
    clearLessonProgress();
    state.currentStation = null;
    state.currentPage = 0;
    console.log('Progress reset!');
  }
};

// Use in console:
// debugContentPack.info()
// debugContentPack.listStations()
// debugContentPack.showCurrentPage()
// debugContentPack.jumpTo('rl_l1_key_details_wh', 0)
// debugContentPack.skip()
// debugContentPack.back()
// debugContentPack.reset()

// ========================================
// EXAMPLE 8: Custom Page Renderers
// ========================================

// Extend the system with custom rendering
function renderCustomActivityPage(page, station) {
  console.log('Rendering custom activity:', page.activityType);

  // Example: Drag and drop matching
  if (page.activityType === 'matching') {
    const container = document.getElementById('questionSection');
    container.style.display = 'block';
    container.innerHTML = `
      <div class="matching-activity">
        <h2>Match the items!</h2>
        <div class="matching-items">
          ${page.matchPairs.map(pair => `
            <div class="match-item" data-id="${pair.id}">
              <span>${pair.icon}</span>
              <span>${pair.word}</span>
            </div>
          `).join('')}
        </div>
        <button id="checkMatchingBtn">Check Answers</button>
      </div>
    `;

    // Add matching logic here
    setupMatchingActivity(page);
  }
}

// Add to the showPage() switch statement:
// case 'activitySpec':
//   if (page.activityType === 'matching') {
//     renderCustomActivityPage(page, station);
//   } else {
//     renderActivitySpecPage(page, station);
//   }
//   break;

// ========================================
// EXAMPLE 9: Analytics Integration
// ========================================

function trackPageView(page, station) {
  const analytics = {
    event: 'page_view',
    station_id: state.currentStation,
    station_name: station?.name,
    page_index: state.currentPage,
    page_type: page?.type,
    timestamp: Date.now(),
    user_id: state.deviceId
  };

  console.log('[Analytics]', analytics);

  // Send to analytics service
  // Example: Google Analytics
  // gtag('event', 'page_view', analytics);

  // Example: Custom endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(analytics)
  // });
}

// Add to showPage() after rendering:
// trackPageView(page, station);

// ========================================
// EXAMPLE 10: Content Pack Validation
// ========================================

function validateContentPack() {
  console.log('=== Validating Content Pack ===');

  const errors = [];
  const warnings = [];

  // Check schema version
  if (!contentPack.data?.schemaVersion) {
    errors.push('Missing schemaVersion');
  }

  // Check all stations
  const stationCount = getStationCount();
  for (let i = 0; i < stationCount; i++) {
    const stationId = contentPack.stationOrder[i];
    const station = getStation(stationId);

    if (!station) {
      errors.push(`Station not found: ${stationId}`);
      continue;
    }

    // Check required fields
    if (!station.name) warnings.push(`Station ${stationId} missing name`);
    if (!station.icon) warnings.push(`Station ${stationId} missing icon`);
    if (!station.pages || station.pages.length === 0) {
      errors.push(`Station ${stationId} has no pages`);
      continue;
    }

    // Check each page
    station.pages.forEach((page, pageIndex) => {
      if (!page.type) {
        errors.push(`Station ${stationId} page ${pageIndex} missing type`);
      }

      // Type-specific validation
      if (page.type === 'read' && !page.sentence) {
        warnings.push(`Station ${stationId} page ${pageIndex} read page missing sentence`);
      }

      if (page.type === 'menu' && (!page.items || page.items.length === 0)) {
        errors.push(`Station ${stationId} page ${pageIndex} menu page has no items`);
      }

      if (page.type === 'question') {
        if (!page.question) warnings.push(`Station ${stationId} page ${pageIndex} missing question`);
        if (!page.answers || page.answers.length === 0) {
          errors.push(`Station ${stationId} page ${pageIndex} question has no answers`);
        }
        if (!page.correctAnswerName) {
          errors.push(`Station ${stationId} page ${pageIndex} missing correctAnswerName`);
        }
      }
    });
  }

  console.log('Errors:', errors.length);
  console.log('Warnings:', warnings.length);

  if (errors.length > 0) {
    console.error('ERRORS:', errors);
  }

  if (warnings.length > 0) {
    console.warn('WARNINGS:', warnings);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ Content pack is valid!');
  }

  return { errors, warnings };
}

// Run validation after loading
// const validation = validateContentPack();

// ========================================
// SUMMARY
// ========================================

/*
This file demonstrates:

1. How to initialize the content pack system
2. How to start a lesson
3. How to implement showPage() with the new renderers
4. How to handle navigation
5. How to build a station selector
6. How to track progress
7. How to add debugging helpers
8. How to extend with custom renderers
9. How to integrate analytics
10. How to validate content pack structure

Copy the relevant code into your index.html and adapt as needed.

Key integration points:
- Call initializeContentPack() on page load
- Update showPage() to use the new renderers
- Connect continueBtn to continueToNextPage()
- Use getStation() and getStationPages() instead of direct access
- Save progress after page changes

For full documentation, see:
- CONTENT_PACK_INTEGRATION_GUIDE.md
- CONTENT_PACK_QUICK_REFERENCE.md
*/
