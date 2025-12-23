// ===== CONTENT PACK RENDERING ENGINE =====
// System for loading and rendering lesson content from content-pack.v1.json

// Content pack state
const contentPack = {
  loaded: false,
  data: null,
  stations: {},
  stationOrder: [],
  uiDefaults: {},
  error: null
};

// ===== 1. CONTENT LOADER =====
// Fetch and parse content-pack.v1.json with caching

async function loadContentPack(url = 'content/cpa-grade1-ela/content-pack.v1.json') {
  // Return cached data if already loaded
  if (contentPack.loaded && contentPack.data) {
    return contentPack.data;
  }

  try {
    console.log('[ContentPack] Loading from:', url);
    const response = await fetch(url, { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error(`Failed to load content pack: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate basic structure
    if (!data.schemaVersion || !data.stations || !data.stationOrder) {
      throw new Error('Invalid content pack structure');
    }

    // Cache the data
    contentPack.data = data;
    contentPack.stations = data.stations || {};
    contentPack.stationOrder = data.stationOrder || [];
    contentPack.uiDefaults = data.uiDefaults || {};
    contentPack.loaded = true;
    contentPack.error = null;

    console.log('[ContentPack] Loaded successfully:', {
      schemaVersion: data.schemaVersion,
      stationCount: Object.keys(contentPack.stations).length,
      stationOrder: contentPack.stationOrder.length
    });

    return data;
  } catch (error) {
    console.error('[ContentPack] Load error:', error);
    contentPack.error = error.message;
    contentPack.loaded = false;
    throw error;
  }
}

// ===== CONTENT HELPERS =====

// Get a station by ID
function getStation(stationId) {
  if (!contentPack.loaded) {
    console.warn('[ContentPack] Not loaded yet, cannot get station:', stationId);
    return null;
  }

  const station = contentPack.stations[stationId];
  if (!station) {
    console.warn('[ContentPack] Station not found:', stationId);
    return null;
  }

  return station;
}

// Get a specific page from a station
function getPage(stationId, pageIndex) {
  const station = getStation(stationId);
  if (!station || !station.pages) {
    return null;
  }

  if (pageIndex < 0 || pageIndex >= station.pages.length) {
    console.warn('[ContentPack] Page index out of bounds:', pageIndex, 'for station:', stationId);
    return null;
  }

  return station.pages[pageIndex];
}

// Get all pages for a station
function getStationPages(stationId) {
  const station = getStation(stationId);
  return station?.pages || [];
}

// Get station count
function getStationCount() {
  return contentPack.stationOrder.length;
}

// Get station by order index
function getStationByIndex(index) {
  if (index < 0 || index >= contentPack.stationOrder.length) {
    return null;
  }
  const stationId = contentPack.stationOrder[index];
  return getStation(stationId);
}

// ===== 2. PAGE RENDERERS =====

// Main page renderer - dispatches to specific renderer based on page type
function renderPage(page, stationContext) {
  if (!page || !page.type) {
    console.error('[Render] Invalid page object:', page);
    return;
  }

  // Save progress after rendering each page
  saveLessonProgress();

  // Dispatch to appropriate renderer based on page type
  switch (page.type) {
    case 'read':
      renderReadPage(page, stationContext);
      break;
    case 'menu':
      renderMenuPage(page, stationContext);
      break;
    case 'question':
      renderQuestionPage(page, stationContext);
      break;
    case 'activitySpec':
      renderActivitySpecPage(page, stationContext);
      break;
    default:
      console.error('[Render] Unknown page type:', page.type);
      // Fallback: show error message
      const questionSection = document.getElementById('questionSection');
      if (questionSection) {
        questionSection.style.display = 'block';
        questionSection.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <h2 style="font-size: 32px; margin-bottom: 20px;">Oops!</h2>
            <p style="font-size: 20px;">This page type is not supported yet.</p>
          </div>
        `;
      }
  }
}

// Render a "read" type page
function renderReadPage(page, stationContext) {
  if (!page || page.type !== 'read') {
    console.error('[Render] Invalid read page:', page);
    return;
  }

  const station = stationContext || getStation(state.currentStation);
  const readingSection = document.querySelector('.reading-section');
  if (readingSection) readingSection.style.display = 'flex';

  // Hide other sections
  const menuSection = document.getElementById('menuSection');
  const questionSection = document.getElementById('questionSection');
  if (menuSection) menuSection.style.display = 'none';
  if (questionSection) questionSection.style.display = 'none';

  // Clear and hide sentence image (or render visual if available)
  const sentenceImageEl = document.getElementById('sentenceImage');
  if (sentenceImageEl) {
    sentenceImageEl.innerHTML = '';
    sentenceImageEl.style.display = 'none';

    // Render math visual if present
    if (page.visual && typeof renderMathVisual === 'function') {
      renderMathVisual(page.visual, sentenceImageEl);
      sentenceImageEl.style.display = 'block';
    } else if (page.image) {
      sentenceImageEl.textContent = page.image;
      sentenceImageEl.style.display = 'block';
    }
  }

  // Get sight words for highlighting
  const stationSightWords = station?.sightWords || [];
  const focusSightWord = page.sightWordFocus || null;
  const targetWords = page.targetWords || [];

  // Create clickable words
  const display = document.getElementById('sentenceDisplay');
  if (!display) {
    console.error('[Render] sentenceDisplay element not found');
    return;
  }
  display.innerHTML = '';

  let foundFocusInSentence = false;
  let wordList = [];
  if (Array.isArray(page.words)) {
    wordList = page.words;
  } else if (page.sentence) {
    if (typeof splitSentenceIntoWords === 'function') {
      wordList = splitSentenceIntoWords(page.sentence);
    } else {
      // Fallback split function
      wordList = page.sentence.trim().split(/\s+/);
    }
  }

  wordList.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';

    // Clean word for comparison (remove punctuation)
    const cleanWord = word.replace(/[.,!?"]/g, '');

    // Check if this is a target word (learning focus)
    const isTargetWord = targetWords.some(tw =>
      cleanWord.toLowerCase() === tw.toLowerCase()
    );

    // Check if this is a sight word
    const isSightWord = stationSightWords.some(sw =>
      cleanWord.toLowerCase() === sw.toLowerCase()
    );

    // Check if this is the focus sight word for this page
    const isFocusWord = focusSightWord &&
      cleanWord.toLowerCase() === focusSightWord.toLowerCase();

    // Add appropriate styling
    if (isFocusWord) {
      wordSpan.classList.add('sight-word', 'focus-word');
      foundFocusInSentence = true;
    } else if (isSightWord && state.sightWordMarksEnabled) {
      wordSpan.classList.add('sight-word');
    }

    if (isTargetWord) {
      wordSpan.classList.add('target-word');
    }

    wordSpan.textContent = word;
    wordSpan.onclick = () => {
      if (typeof tapWord === 'function') {
        tapWord(word, wordSpan);
      } else if (typeof unlockAudioContext === 'function' && typeof speak === 'function') {
        unlockAudioContext();
        const cleanWord = word.replace(/[.,!?"]/g, '');
        speak(cleanWord, 1.0);
      }
    };
    display.appendChild(wordSpan);
  });

  // Show/hide reading tip
  const readingTipBox = document.getElementById('readingTipBox');
  const tipBtn = document.getElementById('tipBtn');
  const readingTipTextEl = document.getElementById('readingTipText');

  const helpParts = [];
  if (page.readingTip) {
    helpParts.push(page.readingTip);
  }

  if (focusSightWord) {
    const cleaned = String(focusSightWord || '').replace(/[^A-Za-z']/g, '');
    const chars = cleaned.split('').filter(Boolean);
    const spellLine = chars.length
      ? `Spell it: ${chars.map(c => c.toUpperCase()).join(' ')}`
      : '';

    const gateLine = (page.requireSightWordTap && state.sightWordGateEnabled && !state.calmMode)
      ? 'To continue, tap the sight word one time.'
      : '';

    helpParts.push(
      [
        `Sight word is "${focusSightWord}".`,
        'Tap it to hear it. Then find it in the sentence.',
        spellLine,
        gateLine
      ].filter(Boolean).join('\n')
    );
  }

  if (helpParts.length === 0) {
    helpParts.push('Tap words to hear them. Use "Read to Me" for the whole sentence.');
  }

  const helpText = helpParts.filter(Boolean).join('\n\n');
  if (tipBtn) {
    tipBtn.style.display = 'flex';
    // Ensure tip button has click handler if not already set
    if (!tipBtn.onclick) {
      tipBtn.onclick = () => {
        if (readingTipBox) {
          const isHidden = readingTipBox.style.display === 'none';
          readingTipBox.style.display = isHidden ? 'block' : 'none';
        }
      };
    }
  }
  if (readingTipBox) readingTipBox.style.display = 'none';
  if (readingTipTextEl) readingTipTextEl.textContent = helpText;

  // Show sight word focus box
  const sightWordFocus = document.getElementById('sightWordFocus');
  const focusChip = document.getElementById('focusSightWord');
  const focusLabel = document.getElementById('sightWordLabel');
  const focusAction = document.getElementById('sightWordAction');

  // Determine if this is a gated (must tap) situation
  const shouldGate = typeof state !== 'undefined' && !!(
    focusSightWord &&
    page.requireSightWordTap &&
    state.sightWordGateEnabled &&
    !state.calmMode &&
    foundFocusInSentence
  );

  if (focusSightWord && sightWordFocus) {
    sightWordFocus.style.display = 'inline-flex';
    sightWordFocus.classList.toggle('gated', shouldGate);
    display.querySelectorAll('.word.focus-word').forEach(el =>
      el.classList.toggle('gate-required', shouldGate)
    );

    if (focusChip) {
      focusChip.textContent = focusSightWord;
      focusChip.setAttribute('role', 'button');
      focusChip.setAttribute('tabindex', '0');
      focusChip.setAttribute('aria-label', `Tap to hear ${focusSightWord}`);
      focusChip.onclick = () => {
        if (typeof unlockAudioContext === 'function') {
          unlockAudioContext();
        }
        let wordSpeakPromise = null;
        let wordSpeakToken = null;
        if (typeof speak === 'function') {
          wordSpeakPromise = speak(focusSightWord, 1.0);
        }
        if (typeof ttsRequestToken !== 'undefined') {
          wordSpeakToken = ttsRequestToken;
        }
        if (typeof state !== 'undefined' && state.requiredSightWord && !state.sightWordGateSatisfied &&
            focusSightWord.toLowerCase() === state.requiredSightWord) {
          if (typeof satisfySightWordGate === 'function') {
            const satisfied = satisfySightWordGate();
            if (satisfied && typeof maybeAnnounceSightWordGateSatisfied === 'function') {
              maybeAnnounceSightWordGateSatisfied({
                afterSpeakPromise: wordSpeakPromise,
                afterSpeakToken: wordSpeakToken
              });
            }
          }
        }
      };
      focusChip.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          focusChip.click();
        }
      };
    }

    if (focusLabel) focusLabel.textContent = 'Sight word';
    if (focusAction) {
      focusAction.textContent = shouldGate ? 'Tap one to continue' : 'Tap to hear';
    }
  } else if (sightWordFocus) {
    sightWordFocus.style.display = 'none';
    sightWordFocus.classList.remove('gated');
    display.querySelectorAll('.word.focus-word').forEach(el =>
      el.classList.remove('gate-required')
    );
    if (focusChip) {
      focusChip.onclick = null;
      focusChip.onkeydown = null;
    }
  }

  // Show continue button
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.style.display = 'flex';

  if (shouldGate) {
    if (typeof armSightWordGate === 'function') {
      armSightWordGate(focusSightWord);
    }
  } else {
    if (typeof clearSightWordGate === 'function') {
      clearSightWordGate();
    }
  }

  console.log('[Render] Read page rendered:', {
    sentence: page.sentence,
    focusSightWord,
    targetWords,
    shouldGate
  });
}

// Render a "menu" type page
function renderMenuPage(page, stationContext) {
  if (!page || page.type !== 'menu') {
    console.error('[Render] Invalid menu page:', page);
    return;
  }

  // Show menu section, hide others
  const menuSection = document.getElementById('menuSection');
  const questionSection = document.getElementById('questionSection');
  const readingSection = document.querySelector('.reading-section');

  if (menuSection) menuSection.style.display = 'block';
  if (questionSection) questionSection.style.display = 'none';
  if (readingSection) readingSection.style.display = 'none';

  if (typeof clearSightWordGate === 'function') {
    clearSightWordGate();
  }

  // Set prompt
  const promptEl = document.querySelector('.menu-prompt');
  if (promptEl) {
    promptEl.textContent = page.prompt || 'Choose one:';
  }

  // Show menu story if available
  const menuStoryEl = document.getElementById('menuStory');
  if (page.menuStory && menuStoryEl) {
    menuStoryEl.innerHTML = '';

    const kicker = document.createElement('div');
    kicker.className = 'menu-story-kicker';
    kicker.textContent = 'Story Check';
    menuStoryEl.appendChild(kicker);

    const subtitle = document.createElement('div');
    subtitle.className = 'menu-story-subtitle';
    subtitle.textContent = 'Use details from the story you just read.';
    menuStoryEl.appendChild(subtitle);

    const body = document.createElement('div');
    body.className = 'menu-story-body';
    body.textContent = page.menuStory;
    menuStoryEl.appendChild(body);

    menuStoryEl.style.display = 'block';
  } else if (menuStoryEl) {
    menuStoryEl.style.display = 'none';
  }

  // Render menu items as large tappable cards
  const grid = document.getElementById('menuGrid');
  if (!grid) {
    console.error('[Render] menuGrid element not found');
    return;
  }
  grid.innerHTML = '';

  if (!Array.isArray(page.items) || page.items.length === 0) {
    console.warn('[Render] No menu items to render');
    return;
  }

  page.items.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'item-icon';
    iconSpan.textContent = item.icon || '';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = item.name || `Item ${index + 1}`;

    btn.appendChild(iconSpan);
    btn.appendChild(nameSpan);

    if (item.description) {
      const descSpan = document.createElement('span');
      descSpan.className = 'item-desc';
      descSpan.textContent = item.description;
      btn.appendChild(descSpan);
    }

    btn.onclick = () => {
      if (typeof selectMenuItem === 'function') {
        selectMenuItem(item, btn);
      } else {
        // Fallback: handle menu selection inline
        console.log('[Menu] Selected item:', item.name);
        // Remove selection from other items
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('selected'));
        // Mark this item as selected
        btn.classList.add('selected');
        // Show continue button
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) continueBtn.style.display = 'flex';
      }
    };
    grid.appendChild(btn);
  });

  // Hide continue button until selection is made
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.style.display = 'none';

  console.log('[Render] Menu page rendered:', {
    prompt: page.prompt,
    itemCount: page.items.length
  });
}

// Render a "question" type page
function renderQuestionPage(page, stationContext) {
  if (!page || page.type !== 'question') {
    console.error('[Render] Invalid question page:', page);
    return;
  }

  const station = stationContext || getStation(state.currentStation);

  // Show question section, hide others
  const questionSection = document.getElementById('questionSection');
  const menuSection = document.getElementById('menuSection');
  const readingSection = document.querySelector('.reading-section');

  if (questionSection) questionSection.style.display = 'block';
  if (menuSection) menuSection.style.display = 'none';
  if (readingSection) readingSection.style.display = 'none';

  if (typeof clearSightWordGate === 'function') {
    clearSightWordGate();
  }

  // Set question text
  const questionTextEl = document.getElementById('questionText');
  if (questionTextEl) {
    questionTextEl.textContent = page.question || 'Choose the correct answer:';
  }

  // Show passage if available
  const passageBox = document.getElementById('passageBox');
  const passageText = document.getElementById('passageText');
  const passageReadBtn = document.getElementById('passageReadBtn');

  if (page.passage && passageBox && passageText) {
    passageText.innerHTML = '';

    // Split passage into clickable words
    let words = [];
    if (typeof splitSentenceIntoWords === 'function') {
      words = splitSentenceIntoWords(page.passage);
    } else {
      // Fallback split function
      words = page.passage.trim().split(/\s+/);
    }

    words.forEach(word => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'passage-word';
      wordSpan.textContent = word;
      wordSpan.onclick = () => {
        if (typeof unlockAudioContext === 'function') {
          unlockAudioContext();
        }
        const cleanWord = word.replace(/[.,!?"]/g, '');
        if (typeof speak === 'function') {
          speak(cleanWord, 1.0);
        }
      };
      passageText.appendChild(wordSpan);
    });

    passageBox.style.display = 'block';

    if (passageReadBtn) {
      const soundEnabled = typeof state !== 'undefined' ? state.soundEnabled : true;
      passageReadBtn.style.display = soundEnabled ? 'inline-flex' : 'none';
      passageReadBtn.textContent = 'Read All';
      passageReadBtn.onclick = () => {
        if (typeof unlockAudioContext === 'function') {
          unlockAudioContext();
        }
        if (typeof speak === 'function') {
          speak(page.passage, 1.0);
        }
      };
    }
  } else if (passageBox) {
    passageBox.style.display = 'none';
    if (passageReadBtn) passageReadBtn.onclick = null;
  }

  // Show comprehension hint (hidden initially, shown after wrong answer)
  const hintElement = document.getElementById('questionHint');
  if (hintElement) {
    if (page.comprehensionHint) {
      hintElement.textContent = page.comprehensionHint;
      hintElement.style.display = 'none'; // Hidden until needed
    } else {
      hintElement.style.display = 'none';
    }
  }

  // Hide success feedback initially
  const successFeedback = document.getElementById('successFeedback');
  if (successFeedback) {
    successFeedback.style.display = 'none';
  }

  // Render answer options
  const grid = document.getElementById('answerGrid');
  if (!grid) {
    console.error('[Render] answerGrid element not found');
    return;
  }
  grid.innerHTML = '';

  if (!Array.isArray(page.answers) || page.answers.length === 0) {
    console.warn('[Render] No answers to render');
    return;
  }

  // Shuffle answers for variety
  const shuffledAnswers = [...page.answers];
  for (let i = shuffledAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
  }

  shuffledAnswers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-item';

    if (answer.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'answer-icon';
      iconSpan.textContent = answer.icon;
      btn.appendChild(iconSpan);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'answer-name';
    nameSpan.textContent = answer.name || `Answer ${index + 1}`;
    btn.appendChild(nameSpan);

    btn.onclick = () => handleAnswerSelection(answer, btn, page);
    grid.appendChild(btn);
  });

  // Hide continue button until correct answer
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.style.display = 'none';

  console.log('[Render] Question page rendered:', {
    question: page.question,
    answerCount: page.answers.length,
    correctAnswer: page.correctAnswerName
  });
}

// Render an "activitySpec" type page (placeholder for future activities)
function renderActivitySpecPage(page, stationContext) {
  if (!page || page.type !== 'activitySpec') {
    console.error('[Render] Invalid activitySpec page:', page);
    return;
  }

  // For now, show a "Coming Soon" message
  const questionSection = document.getElementById('questionSection');
  if (questionSection) {
    questionSection.style.display = 'block';
    questionSection.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="font-size: 32px; margin-bottom: 20px;">Activity Time!</h2>
        <p style="font-size: 20px; margin-bottom: 30px;">${page.prompt || 'Special activity coming soon!'}</p>
        <button id="activityContinueBtn" class="continue-btn" style="display: inline-flex;">
          Continue
        </button>
      </div>
    `;

    const btn = document.getElementById('activityContinueBtn');
    if (btn) {
      btn.onclick = () => {
        if (typeof continueToNextPage === 'function') {
          continueToNextPage();
        } else {
          console.error('[Activity] continueToNextPage function not found');
        }
      };
    }
  }

  const menuSection = document.getElementById('menuSection');
  if (menuSection) menuSection.style.display = 'none';
  const readingSection = document.querySelector('.reading-section');
  if (readingSection) readingSection.style.display = 'none';

  console.log('[Render] ActivitySpec page rendered (placeholder):', page.prompt);
}

// Handle answer selection in question pages
function handleAnswerSelection(answer, button, page) {
  if (!page || !page.correctAnswerName) {
    console.error('[Render] Cannot validate answer - missing correct answer');
    return;
  }

  if (typeof unlockAudioContext === 'function') {
    unlockAudioContext();
  }

  const isCorrect = answer.name === page.correctAnswerName;

  // Track if this is first attempt for this question
  const currentPage = typeof state !== 'undefined' ? state.currentPage : 0;
  const questionKey = `page_${currentPage}`;
  if (!page._attemptsMade) {
    page._attemptsMade = {};
  }
  const isFirstTry = !page._attemptsMade[questionKey];
  page._attemptsMade[questionKey] = true;

  // Visual feedback
  document.querySelectorAll('.answer-item').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'incorrect');
  });

  if (isCorrect) {
    // Correct answer
    button.classList.add('selected', 'correct');

    // Show success message
    const successFeedback = document.getElementById('successFeedback');
    if (successFeedback) {
      successFeedback.textContent = page.successMessage || 'Correct! Great job!';
      successFeedback.style.display = 'block';
    }

    // Celebration animation
    if (typeof speak === 'function') {
      speak(page.successMessage || 'Correct!', 1.0);
    }

    // Show continue button
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
      continueBtn.style.display = 'flex';
      if (typeof setContinueEnabled === 'function') {
        setContinueEnabled(true);
      }
    }

    // Record progress in enhanced tracking system
    if (typeof recordStationProgressTracking === 'function' && typeof state !== 'undefined' && state.currentStation) {
      recordStationProgressTracking(state.currentStation, state.currentPage, true, isFirstTry);
    }

    // Track analytics
    console.log('[Analytics] Correct answer:', answer.name, 'First try:', isFirstTry);
  } else {
    // Incorrect answer
    button.classList.add('selected', 'incorrect');

    // Show gentle feedback
    if (typeof speak === 'function') {
      speak('Not quite. Try again!', 1.0);
    }

    // Show comprehension hint
    const hintElement = document.getElementById('questionHint');
    if (hintElement && page.comprehensionHint) {
      hintElement.style.display = 'block';
    }

    // Highlight passage if available
    const passageBox = document.getElementById('passageBox');
    if (passageBox && passageBox.style.display === 'none') {
      passageBox.style.display = 'block';
    }

    // Record incorrect attempt in progress tracking
    if (typeof recordStationProgressTracking === 'function' && typeof state !== 'undefined' && state.currentStation) {
      recordStationProgressTracking(state.currentStation, state.currentPage, false, isFirstTry);
    }

    // Allow retry - remove selection after brief delay
    setTimeout(() => {
      button.classList.remove('selected', 'incorrect');
    }, 1500);

    // Track analytics
    console.log('[Analytics] Incorrect answer:', answer.name, 'Correct was:', page.correctAnswerName);
  }
}

// ===== 3. PAGE NAVIGATION =====

// Navigate to next page
function continueToNextPage() {
  if (typeof state === 'undefined') {
    console.error('[Navigation] State object not found');
    return;
  }

  if (!state.currentStation) {
    console.warn('[Navigation] No current station');
    return;
  }

  const pages = getStationPages(state.currentStation);
  if (!pages || pages.length === 0) {
    console.warn('[Navigation] No pages for station:', state.currentStation);
    return;
  }

  state.currentPage++;

  if (state.currentPage >= pages.length) {
    // Lesson complete
    console.log('[Navigation] Lesson complete for station:', state.currentStation);
    handleLessonComplete();
    return;
  }

  // Show next page
  if (typeof showPage === 'function') {
    showPage();
  } else {
    console.error('[Navigation] showPage function not found');
  }

  console.log('[Navigation] Next page:', state.currentPage, '/', pages.length);
}

// Navigate to previous page (if allowed)
function goToPreviousPage() {
  if (typeof state === 'undefined') {
    console.error('[Navigation] State object not found');
    return;
  }

  if (state.currentPage <= 0) {
    console.warn('[Navigation] Already at first page');
    return;
  }

  state.currentPage--;

  if (typeof showPage === 'function') {
    showPage();
  } else {
    console.error('[Navigation] showPage function not found');
  }

  console.log('[Navigation] Previous page:', state.currentPage);
}

// Handle lesson completion
function handleLessonComplete() {
  console.log('[Navigation] Lesson complete!');

  if (typeof state === 'undefined') {
    console.error('[Navigation] State object not found');
    return;
  }

  // Mark station as completed in legacy system
  if (state.currentStation && Array.isArray(state.completedStations) && !state.completedStations.includes(state.currentStation)) {
    state.completedStations.push(state.currentStation);
  }

  // Mark station as completed in enhanced progress tracking
  if (typeof markStationCompletedEnhanced === 'function' && state.currentStation) {
    markStationCompletedEnhanced(state.currentStation);
  }

  // Update progress
  if (typeof updateProgress === 'function') {
    updateProgress();
  }

  // Show reward screen
  if (typeof goToScreen === 'function') {
    goToScreen('rewardScreen');
  } else if (typeof showScreen === 'function') {
    showScreen('rewardScreen');
  } else {
    console.error('[Navigation] goToScreen/showScreen function not found');
  }
}

// ===== 4. STATE MANAGEMENT =====

// State persistence keys
const STATE_KEYS = {
  CURRENT_STATION: 'isaiahCurrentStation',
  CURRENT_PAGE: 'isaiahCurrentPage',
  ANSWERS_GIVEN: 'isaiahAnswersGiven',
  ATTEMPTS_PER_QUESTION: 'isaiahAttemptsPerQuestion',
  LESSON_START_TIME: 'isaiahLessonStartTime',
  TIME_PER_PAGE: 'isaiahTimePerPage'
};

// Save lesson progress to localStorage
function saveLessonProgress() {
  if (typeof state === 'undefined') {
    console.error('[State] State object not found');
    return;
  }

  if (!state.currentStation) return;

  try {
    const progressData = {
      stationId: state.currentStation,
      pageIndex: state.currentPage,
      timestamp: Date.now(),
      completedStations: state.completedStations || []
    };

    localStorage.setItem(STATE_KEYS.CURRENT_STATION, state.currentStation);
    localStorage.setItem(STATE_KEYS.CURRENT_PAGE, String(state.currentPage));

    console.log('[State] Progress saved:', progressData);
  } catch (error) {
    console.error('[State] Failed to save progress:', error);
  }
}

// Load lesson progress from localStorage
function loadLessonProgress() {
  if (typeof state === 'undefined') {
    console.error('[State] State object not found');
    return false;
  }

  try {
    const savedStation = localStorage.getItem(STATE_KEYS.CURRENT_STATION);
    const savedPage = localStorage.getItem(STATE_KEYS.CURRENT_PAGE);

    if (savedStation && getStation(savedStation)) {
      state.currentStation = savedStation;
      state.currentPage = savedPage ? parseInt(savedPage, 10) : 0;

      console.log('[State] Progress loaded:', {
        station: savedStation,
        page: state.currentPage
      });

      return true;
    }
  } catch (error) {
    console.error('[State] Failed to load progress:', error);
  }

  return false;
}

// Clear lesson progress
function clearLessonProgress() {
  try {
    localStorage.removeItem(STATE_KEYS.CURRENT_STATION);
    localStorage.removeItem(STATE_KEYS.CURRENT_PAGE);
    localStorage.removeItem(STATE_KEYS.ANSWERS_GIVEN);
    localStorage.removeItem(STATE_KEYS.ATTEMPTS_PER_QUESTION);
    localStorage.removeItem(STATE_KEYS.LESSON_START_TIME);
    localStorage.removeItem(STATE_KEYS.TIME_PER_PAGE);

    console.log('[State] Progress cleared');
  } catch (error) {
    console.error('[State] Failed to clear progress:', error);
  }
}

// Initialize content pack on page load
async function initializeContentPack() {
  try {
    console.log('[ContentPack] Initializing...');
    await loadContentPack();

    // Load saved progress if available
    const hasProgress = loadLessonProgress();

    if (hasProgress) {
      console.log('[ContentPack] Resuming from saved progress');
    } else {
      console.log('[ContentPack] Starting fresh');
    }

    return true;
  } catch (error) {
    console.error('[ContentPack] Initialization failed:', error);
    return false;
  }
}

// ===== END CONTENT PACK RENDERING ENGINE =====
