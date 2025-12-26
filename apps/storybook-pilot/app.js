/**
 * MIDNIGHT PIZZA TRAIN - Interactive Storybook Engine
 *
 * Features:
 * - Word-by-word highlighting synced with narration
 * - Tap any word to hear it spoken
 * - Gradual release narration model
 * - Comprehension checkpoints
 * - Progress tracking
 * - Mini-game at story completion
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
  currentPage: 1,
  totalPages: 10,
  isNarrating: false,
  narrationEnabled: true,
  autoNarrate: true,
  highlightEnabled: true,
  currentWordIndex: -1,
  speechRate: 1.0,
  textSize: 'medium',
  questionsCorrect: 0,
  questionsTotal: 0,
  wordsRead: new Set(),
  sightWordsEncountered: new Set(),
  isGameActive: false,
  gameScore: 0,
  readingStartTime: null,
  totalReadingTime: 0,
  imageManifest: null
};

// Speech synthesis setup (fallback)
let speechSynth = window.speechSynthesis;
let currentUtterance = null;
let wordHighlightTimer = null;

// ElevenLabs audio engine (primary)
let useElevenLabs = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  console.log('%c🚂 Midnight Pizza Train Loading...', 'font-size: 16px; color: #E8C882;');

  // Warm up audio on iOS (requires user interaction)
  warmUpAudio();

  // Initialize ElevenLabs audio engine (primary)
  if (window.audioEngine) {
    useElevenLabs = await window.audioEngine.init();
    if (useElevenLabs) {
      console.log('%c🎙️ Using ElevenLabs Audio Engine', 'color: #4CAF50; font-weight: bold');
    }
  }

  // Initialize speech synthesis (fallback)
  if (!useElevenLabs) {
    initSpeechSynthesis();
  }

  // Load image manifest for scene illustrations
  await loadImageManifest();

  // Bind event listeners
  bindEventListeners();

  // Show loading screen briefly, then title
  setTimeout(() => {
    hideLoadingScreen();
  }, 2000);
}

function warmUpAudio() {
  // Pre-warm audio context for iOS Safari
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const audioCtx = new AudioContext();
    // Create silent buffer
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  }
}

function initSpeechSynthesis() {
  // Ensure voices are loaded
  if (speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = () => {
      console.log('Speech voices loaded:', speechSynth.getVoices().length);
    };
  }
}

async function loadImageManifest() {
  try {
    const response = await fetch('assets/images/manifest.json');
    if (response.ok) {
      AppState.imageManifest = await response.json();
      console.log('%c🖼️ Image manifest loaded', 'color: #4CAF50; font-weight: bold', AppState.imageManifest);
    }
  } catch (err) {
    console.log('Image manifest not found, using emoji placeholders');
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const titleScreen = document.getElementById('titleScreen');

  loadingScreen.classList.add('hidden');
  titleScreen.classList.remove('hidden');

  // Animate title screen entrance
  titleScreen.style.opacity = '0';
  requestAnimationFrame(() => {
    titleScreen.style.transition = 'opacity 0.5s ease-out';
    titleScreen.style.opacity = '1';
  });
}

// ============================================
// EVENT BINDINGS
// ============================================
function bindEventListeners() {
  // Title Screen
  document.getElementById('openBookBtn')?.addEventListener('click', openBook);

  // Reading Navigation
  document.getElementById('closeBookBtn')?.addEventListener('click', closeBook);
  document.getElementById('prevPageBtn')?.addEventListener('click', goToPrevPage);
  document.getElementById('nextPageBtn')?.addEventListener('click', goToNextPage);
  document.getElementById('narrationToggle')?.addEventListener('click', toggleNarration);
  document.getElementById('settingsBtn')?.addEventListener('click', toggleSettings);
  document.getElementById('closeSettings')?.addEventListener('click', closeSettings);

  // Completion Screen
  document.getElementById('playGameBtn')?.addEventListener('click', startMiniGame);
  document.getElementById('readAgainBtn')?.addEventListener('click', readAgain);
  document.getElementById('returnHubBtn')?.addEventListener('click', returnToHub);

  // Mini-game
  document.getElementById('finishGameBtn')?.addEventListener('click', finishGame);

  // Settings
  bindSettingsListeners();

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);

  // Touch/click outside to close tooltip
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.story-word') && !e.target.closest('.word-tooltip')) {
      hideWordTooltip();
    }
  });
}

function bindSettingsListeners() {
  // Text size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      setTextSize(size);
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Speed slider
  document.getElementById('speedSlider')?.addEventListener('input', (e) => {
    AppState.speechRate = parseFloat(e.target.value);
  });

  // Toggles
  document.getElementById('highlightToggle')?.addEventListener('change', (e) => {
    AppState.highlightEnabled = e.target.checked;
  });

  document.getElementById('autoNarrate')?.addEventListener('change', (e) => {
    AppState.autoNarrate = e.target.checked;
  });
}

function handleKeyboard(e) {
  // Only handle keyboard in reading mode
  if (document.getElementById('readingMode')?.classList.contains('hidden')) return;

  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      goToNextPage();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      goToPrevPage();
      break;
    case 'Escape':
      closeBook();
      break;
    case 'n':
      toggleNarration();
      break;
  }
}

// ============================================
// BOOK NAVIGATION
// ============================================
function openBook() {
  const titleScreen = document.getElementById('titleScreen');
  const readingMode = document.getElementById('readingMode');

  // Fade out title
  titleScreen.style.transition = 'opacity 0.3s ease-out';
  titleScreen.style.opacity = '0';

  setTimeout(() => {
    titleScreen.classList.add('hidden');
    readingMode.classList.remove('hidden');
    readingMode.style.opacity = '0';

    requestAnimationFrame(() => {
      readingMode.style.transition = 'opacity 0.5s ease-out';
      readingMode.style.opacity = '1';
    });

    // Start reading timer
    AppState.readingStartTime = Date.now();

    // Load first page
    loadPage(1);
  }, 300);

  // Announce for screen readers
  announce('Opening the storybook. Page 1 of 10.');
}

function closeBook() {
  stopNarration();

  const readingMode = document.getElementById('readingMode');
  const titleScreen = document.getElementById('titleScreen');

  // Update total reading time
  if (AppState.readingStartTime) {
    AppState.totalReadingTime += Date.now() - AppState.readingStartTime;
    AppState.readingStartTime = null;
  }

  readingMode.classList.add('hidden');
  titleScreen.classList.remove('hidden');
  titleScreen.style.opacity = '1';
}

function goToNextPage() {
  if (AppState.currentPage < AppState.totalPages) {
    stopNarration();
    AppState.currentPage++;
    loadPage(AppState.currentPage);
  } else {
    // Story complete!
    showCompletionScreen();
  }
}

function goToPrevPage() {
  if (AppState.currentPage > 1) {
    stopNarration();
    AppState.currentPage--;
    loadPage(AppState.currentPage);
  }
}

// ============================================
// PAGE RENDERING
// ============================================
function loadPage(pageNumber) {
  const pageData = STORY_DATA.pages[pageNumber - 1];
  if (!pageData) return;

  // Update page indicators
  document.getElementById('currentPage').textContent = pageNumber;
  document.getElementById('totalPages').textContent = AppState.totalPages;
  document.getElementById('pageNum').textContent = pageNumber;

  // Update scene with AI-generated image or fallback to emoji
  const sceneLabel = document.getElementById('sceneLabel');
  const illustrationContainer = document.getElementById('illustrationContainer');

  sceneLabel.textContent = pageData.sceneLabel;

  // Check if we have a generated image for this page
  const pageKey = `page${pageNumber}`;
  const imageInfo = AppState.imageManifest?.[pageKey];

  if (imageInfo?.file) {
    // Use actual generated image
    const imageUrl = `assets/images/${imageInfo.file}`;
    illustrationContainer.innerHTML = `<img src="${imageUrl}" alt="${pageData.sceneLabel}" class="scene-image" />`;
    illustrationContainer.classList.add('has-image');
  } else {
    // Fallback to emoji placeholder
    illustrationContainer.innerHTML = `<div class="illustration-placeholder"><div class="placeholder-scene" data-scene="${pageData.scene}">${pageData.sceneEmoji}</div></div>`;
    illustrationContainer.classList.remove('has-image');
  }

  // Render story text with clickable words
  renderStoryText(pageData.words);

  // Update navigation buttons
  document.getElementById('prevPageBtn').disabled = pageNumber === 1;

  const nextBtn = document.getElementById('nextPageBtn');
  if (pageNumber === AppState.totalPages) {
    nextBtn.querySelector('.nav-label').textContent = 'Finish';
  } else {
    nextBtn.querySelector('.nav-label').textContent = 'Next';
  }

  // Update progress bar
  updateProgress(pageNumber);

  // Animate page transition
  animatePageTurn();

  // Auto-narrate if enabled
  if (AppState.narrationEnabled && AppState.autoNarrate) {
    setTimeout(() => {
      startNarration(pageData.words);
    }, 500);
  }

  // Announce for screen readers
  announce(`Page ${pageNumber}. ${pageData.text}`);

  // Check for comprehension question after a delay
  if (pageData.comprehensionCheck) {
    // Wait until narration would be complete before showing question
    const totalDuration = pageData.words.reduce((sum, w) => Math.max(sum, w.start + w.duration), 0);
    setTimeout(() => {
      showComprehensionCheck(pageData.comprehensionCheck);
    }, totalDuration + 1500);
  }
}

function renderStoryText(words) {
  const container = document.getElementById('storyText');
  container.innerHTML = '';

  words.forEach((wordData, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'story-word';
    wordSpan.textContent = wordData.text;
    wordSpan.dataset.index = index;

    // Mark sight words
    if (wordData.isSightWord) {
      wordSpan.classList.add('sight-word');
      AppState.sightWordsEncountered.add(wordData.text.toLowerCase().replace(/[^a-z]/g, ''));
    }

    // Click to hear word
    wordSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      showWordTooltip(wordData.text, e.target);
    });

    // Touch support
    wordSpan.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showWordTooltip(wordData.text, e.target);
    });

    container.appendChild(wordSpan);
    container.appendChild(document.createTextNode(' '));

    // Track word as read
    AppState.wordsRead.add(wordData.text.toLowerCase());
  });
}

function animatePageTurn() {
  const spread = document.querySelector('.book-spread');
  spread.style.animation = 'none';
  spread.offsetHeight; // Trigger reflow
  spread.style.animation = 'page-turn 0.5s ease-out';
}

function updateProgress(pageNumber) {
  const progress = (pageNumber / AppState.totalPages) * 100;
  const progressFill = document.getElementById('progressFill');
  const progressTrain = document.getElementById('progressTrain');

  progressFill.style.width = `${progress}%`;
  progressTrain.style.left = `calc(${progress}% - 12px)`;
}

// ============================================
// NARRATION & SPEECH
// ============================================
function toggleNarration() {
  AppState.narrationEnabled = !AppState.narrationEnabled;

  const btn = document.getElementById('narrationToggle');
  btn.classList.toggle('active', AppState.narrationEnabled);
  btn.title = AppState.narrationEnabled ? 'Narration ON' : 'Narration OFF';
  btn.querySelector('.btn-icon').textContent = AppState.narrationEnabled ? '🔊' : '🔇';

  if (!AppState.narrationEnabled) {
    stopNarration();
  }

  announce(AppState.narrationEnabled ? 'Narration enabled' : 'Narration disabled');
}

function startNarration(words) {
  if (!AppState.narrationEnabled || AppState.isNarrating) return;

  AppState.isNarrating = true;
  AppState.currentWordIndex = -1;

  // Use ElevenLabs audio engine if available
  if (useElevenLabs && window.audioEngine) {
    // Play page turn sound effect
    window.audioEngine.playSFX('page_turn', 0.3);

    // Track word index across segments
    let globalWordIndex = 0;

    window.audioEngine.playPage(AppState.currentPage, {
      onWordHighlight: (timing) => {
        // Find the word element that matches
        const wordElements = document.querySelectorAll('.story-word');
        const cleanWord = timing.word.replace(/[.,!?;:"""'']/g, '').toLowerCase();

        // Search for matching word starting from current position
        for (let i = globalWordIndex; i < wordElements.length; i++) {
          const elText = wordElements[i].textContent.replace(/[.,!?;:"""'']/g, '').toLowerCase();
          if (elText === cleanWord) {
            highlightWord(i);
            globalWordIndex = i + 1;
            break;
          }
        }
      },
      onSegmentStart: (segment) => {
        // Optional: Show voice indicator for multi-voice pages
        console.log(`Speaking: ${segment.voice}${segment.emotion ? ` (${segment.emotion})` : ''}`);
      },
      onComplete: () => {
        AppState.isNarrating = false;
        clearAllHighlights();
      }
    });
    return;
  }

  // Fallback: Use Web Speech API
  const fullText = words.map(w => w.text).join(' ');

  currentUtterance = new SpeechSynthesisUtterance(fullText);
  currentUtterance.rate = AppState.speechRate;
  currentUtterance.pitch = 1.0;

  // Try to find a good voice
  const voices = speechSynth.getVoices();
  const preferredVoice = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
  }

  // Word boundary event for highlighting
  currentUtterance.onboundary = (event) => {
    if (event.name === 'word') {
      highlightWordAtCharIndex(event.charIndex, words, fullText);
    }
  };

  currentUtterance.onend = () => {
    AppState.isNarrating = false;
    clearAllHighlights();
  };

  currentUtterance.onerror = () => {
    AppState.isNarrating = false;
    clearAllHighlights();
  };

  speechSynth.speak(currentUtterance);

  // Fallback: Manual word highlighting based on timing data
  // (More reliable than onboundary which is inconsistent)
  startTimedHighlighting(words);
}

function startTimedHighlighting(words) {
  if (!AppState.highlightEnabled) return;

  words.forEach((wordData, index) => {
    setTimeout(() => {
      if (!AppState.isNarrating) return;
      highlightWord(index);
    }, wordData.start / AppState.speechRate);
  });
}

function highlightWordAtCharIndex(charIndex, words, fullText) {
  // Find which word we're at based on character position
  let currentPos = 0;
  for (let i = 0; i < words.length; i++) {
    if (charIndex >= currentPos && charIndex < currentPos + words[i].text.length) {
      highlightWord(i);
      return;
    }
    currentPos += words[i].text.length + 1; // +1 for space
  }
}

function highlightWord(index) {
  if (!AppState.highlightEnabled) return;

  clearAllHighlights();

  const wordElements = document.querySelectorAll('.story-word');
  if (wordElements[index]) {
    wordElements[index].classList.add('highlighted');
    AppState.currentWordIndex = index;

    // Scroll word into view if needed
    wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function clearAllHighlights() {
  document.querySelectorAll('.story-word.highlighted').forEach(el => {
    el.classList.remove('highlighted');
  });
  AppState.currentWordIndex = -1;
}

function stopNarration() {
  // Stop ElevenLabs audio engine
  if (window.audioEngine) {
    window.audioEngine.stop();
  }

  // Stop Web Speech API
  if (speechSynth) {
    speechSynth.cancel();
  }

  AppState.isNarrating = false;
  clearAllHighlights();
}

// ============================================
// WORD TOOLTIP (Tap to Hear)
// ============================================
function showWordTooltip(word, element) {
  const tooltip = document.getElementById('wordTooltip');
  const tooltipWord = document.getElementById('tooltipWord');
  const speakBtn = document.getElementById('tooltipSpeak');

  // Clean word for display
  const cleanWord = word.replace(/["""''.,!?;:]/g, '');
  tooltipWord.textContent = cleanWord;

  // Position tooltip above the word
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 60}px`;
  tooltip.style.transform = 'translateX(-50%)';

  tooltip.classList.remove('hidden');

  // Bind speak button
  speakBtn.onclick = () => {
    speakWord(cleanWord);
  };

  // Auto-speak the word
  speakWord(cleanWord);
}

function hideWordTooltip() {
  document.getElementById('wordTooltip')?.classList.add('hidden');
}

function speakWord(word) {
  // Cancel any current speech
  speechSynth.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8; // Slower for individual words
  utterance.pitch = 1.0;

  const voices = speechSynth.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en'));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  speechSynth.speak(utterance);
}

// ============================================
// COMPREHENSION CHECKS
// ============================================
function showComprehensionCheck(checkData) {
  const modal = document.getElementById('comprehensionModal');
  const questionText = document.getElementById('questionText');
  const answerChoices = document.getElementById('answerChoices');
  const feedback = document.getElementById('questionFeedback');

  // Reset
  feedback.classList.add('hidden');

  // Set question
  questionText.textContent = checkData.question;

  // Render answers
  answerChoices.innerHTML = '';
  checkData.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer.text;
    btn.onclick = () => handleAnswer(answer, checkData, btn);
    answerChoices.appendChild(btn);
  });

  // Show modal
  modal.classList.remove('hidden');
  AppState.questionsTotal++;

  announce(`Question: ${checkData.question}`);
}

function handleAnswer(answer, checkData, buttonElement) {
  const feedback = document.getElementById('questionFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const allButtons = document.querySelectorAll('.answer-btn');

  // Disable all buttons
  allButtons.forEach(btn => btn.disabled = true);

  if (answer.correct) {
    buttonElement.classList.add('correct');
    feedbackIcon.textContent = '✓';
    feedbackIcon.style.color = 'var(--success-green)';
    feedbackText.textContent = checkData.correctFeedback;
    feedbackText.style.color = 'var(--success-green)';
    AppState.questionsCorrect++;
    announce('Correct! ' + checkData.correctFeedback);
  } else {
    buttonElement.classList.add('incorrect');
    feedbackIcon.textContent = '✗';
    feedbackIcon.style.color = 'var(--error-red)';
    feedbackText.textContent = checkData.incorrectFeedback;
    feedbackText.style.color = 'var(--error-red)';
    announce('Not quite. ' + checkData.incorrectFeedback);

    // Highlight correct answer
    allButtons.forEach(btn => {
      if (checkData.answers.find(a => a.text === btn.textContent && a.correct)) {
        btn.classList.add('correct');
      }
    });
  }

  feedback.classList.remove('hidden');

  // Auto-close after delay
  setTimeout(() => {
    closeComprehensionCheck();
  }, 3000);
}

function closeComprehensionCheck() {
  document.getElementById('comprehensionModal')?.classList.add('hidden');
}

// ============================================
// COMPLETION SCREEN
// ============================================
function showCompletionScreen() {
  stopNarration();

  // Update reading time
  if (AppState.readingStartTime) {
    AppState.totalReadingTime += Date.now() - AppState.readingStartTime;
  }

  const readingMode = document.getElementById('readingMode');
  const completeScreen = document.getElementById('completeScreen');

  // Update stats
  document.getElementById('pagesRead').textContent = AppState.totalPages;
  document.getElementById('wordsLearned').textContent = AppState.sightWordsEncountered.size;
  document.getElementById('questionsCorrect').textContent = `${AppState.questionsCorrect}/${AppState.questionsTotal}`;

  // Hide reading mode, show completion
  readingMode.classList.add('hidden');
  completeScreen.classList.remove('hidden');

  // Trigger confetti
  triggerConfetti();

  announce('Congratulations! You finished the story!');
}

function triggerConfetti() {
  // The confetti is handled by CSS animation, but we could add more here
  const container = document.querySelector('.confetti-layer');
  container.innerHTML = '';

  const confettiChars = ['🎉', '✨', '🍕', '⭐', '🎊', '💛', '🧡', '❤️'];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('span');
    confetti.textContent = confettiChars[Math.floor(Math.random() * confettiChars.length)];
    confetti.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 20 + 15}px;
      left: ${Math.random() * 100}%;
      top: -30px;
      animation: confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s forwards;
    `;
    container.appendChild(confetti);
  }
}

function readAgain() {
  const completeScreen = document.getElementById('completeScreen');
  const readingMode = document.getElementById('readingMode');

  completeScreen.classList.add('hidden');
  readingMode.classList.remove('hidden');

  // Reset to first page
  AppState.currentPage = 1;
  AppState.readingStartTime = Date.now();
  loadPage(1);
}

function returnToHub() {
  window.location.href = '../hub/index.html';
}

// ============================================
// MINI-GAME: Dream Pizza Kitchen
// ============================================
function startMiniGame() {
  const completeScreen = document.getElementById('completeScreen');
  const gameScreen = document.getElementById('miniGameScreen');

  completeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  AppState.isGameActive = true;
  AppState.gameScore = 0;

  initializeMiniGame();

  announce('Mini-game: Dream Pizza Kitchen. Sort ingredients into the right bowls!');
}

function initializeMiniGame() {
  const gameData = STORY_DATA.miniGameData;
  const queue = document.getElementById('ingredientQueue');

  // Clear existing
  queue.innerHTML = '';
  document.getElementById('kindnessBowl').innerHTML = '';
  document.getElementById('courageBowl').innerHTML = '';
  document.getElementById('loveBowl').innerHTML = '';
  document.getElementById('pizzaScore').textContent = '0';
  document.getElementById('finishGameBtn').classList.add('hidden');

  // Shuffle ingredients
  const shuffled = [...gameData.ingredients].sort(() => Math.random() - 0.5);

  // Create draggable ingredients
  shuffled.forEach((ingredient, index) => {
    const item = document.createElement('div');
    item.className = 'ingredient-item';
    item.draggable = true;
    item.dataset.category = ingredient.category;
    item.innerHTML = `
      <span class="ingredient-emoji">${ingredient.emoji}</span>
      <span class="ingredient-label">${ingredient.label}</span>
    `;

    // Drag events
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);

    // Touch events for mobile
    item.addEventListener('touchstart', handleTouchStart, { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd);

    queue.appendChild(item);
  });

  // Setup drop zones
  document.querySelectorAll('.bowl').forEach(bowl => {
    bowl.addEventListener('dragover', handleDragOver);
    bowl.addEventListener('dragleave', handleDragLeave);
    bowl.addEventListener('drop', handleDrop);
  });
}

let draggedItem = null;
let touchClone = null;

function handleDragStart(e) {
  draggedItem = e.target.closest('.ingredient-item');
  draggedItem.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  if (draggedItem) {
    draggedItem.style.opacity = '1';
  }
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const bowl = e.currentTarget;
  bowl.classList.remove('drag-over');

  if (!draggedItem) return;

  const itemCategory = draggedItem.dataset.category;
  const bowlCategory = bowl.dataset.category;

  if (itemCategory === bowlCategory) {
    // Correct!
    const emoji = draggedItem.querySelector('.ingredient-emoji').textContent;
    const sortedItem = document.createElement('span');
    sortedItem.className = 'sorted-item';
    sortedItem.textContent = emoji;
    bowl.querySelector('.bowl-contents').appendChild(sortedItem);

    draggedItem.remove();
    updateGameScore();
    playSuccessSound();
  } else {
    // Wrong bowl - shake the item
    draggedItem.style.animation = 'shake 0.5s ease-out';
    setTimeout(() => {
      draggedItem.style.animation = '';
    }, 500);
    playErrorSound();
  }

  draggedItem = null;
}

// Touch handlers for mobile
function handleTouchStart(e) {
  e.preventDefault();
  draggedItem = e.target.closest('.ingredient-item');
  if (!draggedItem) return;

  // Create visual clone for dragging
  touchClone = draggedItem.cloneNode(true);
  touchClone.style.position = 'fixed';
  touchClone.style.pointerEvents = 'none';
  touchClone.style.zIndex = '9999';
  touchClone.style.opacity = '0.8';
  touchClone.style.transform = 'scale(1.1)';
  document.body.appendChild(touchClone);

  updateTouchPosition(e.touches[0]);
  draggedItem.style.opacity = '0.3';
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchClone) return;
  updateTouchPosition(e.touches[0]);

  // Check if over a bowl
  const bowls = document.querySelectorAll('.bowl');
  bowls.forEach(bowl => {
    const rect = bowl.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      bowl.classList.add('drag-over');
    } else {
      bowl.classList.remove('drag-over');
    }
  });
}

function handleTouchEnd(e) {
  if (!draggedItem || !touchClone) {
    cleanupTouch();
    return;
  }

  // Find which bowl we're over
  const bowls = document.querySelectorAll('.bowl');
  const touchPoint = e.changedTouches[0];
  let targetBowl = null;

  bowls.forEach(bowl => {
    bowl.classList.remove('drag-over');
    const rect = bowl.getBoundingClientRect();
    if (touchPoint.clientX >= rect.left && touchPoint.clientX <= rect.right &&
        touchPoint.clientY >= rect.top && touchPoint.clientY <= rect.bottom) {
      targetBowl = bowl;
    }
  });

  if (targetBowl) {
    const itemCategory = draggedItem.dataset.category;
    const bowlCategory = targetBowl.dataset.category;

    if (itemCategory === bowlCategory) {
      const emoji = draggedItem.querySelector('.ingredient-emoji').textContent;
      const sortedItem = document.createElement('span');
      sortedItem.className = 'sorted-item';
      sortedItem.textContent = emoji;
      targetBowl.querySelector('.bowl-contents').appendChild(sortedItem);

      draggedItem.remove();
      updateGameScore();
      playSuccessSound();
    } else {
      draggedItem.style.animation = 'shake 0.5s ease-out';
      setTimeout(() => {
        if (draggedItem) draggedItem.style.animation = '';
      }, 500);
      playErrorSound();
    }
  }

  cleanupTouch();
}

function updateTouchPosition(touch) {
  if (!touchClone) return;
  touchClone.style.left = `${touch.clientX - 35}px`;
  touchClone.style.top = `${touch.clientY - 35}px`;
}

function cleanupTouch() {
  if (touchClone) {
    touchClone.remove();
    touchClone = null;
  }
  if (draggedItem) {
    draggedItem.style.opacity = '1';
    draggedItem = null;
  }
}

function updateGameScore() {
  const kindnessCount = document.getElementById('kindnessBowl').children.length;
  const courageCount = document.getElementById('courageBowl').children.length;
  const loveCount = document.getElementById('loveBowl').children.length;

  // Score is number of complete sets of 3
  AppState.gameScore = Math.floor(Math.min(kindnessCount, courageCount, loveCount));
  document.getElementById('pizzaScore').textContent = AppState.gameScore;

  // Check if game complete
  const totalItems = kindnessCount + courageCount + loveCount;
  const gameData = STORY_DATA.miniGameData;

  if (totalItems >= gameData.ingredients.length) {
    // All sorted!
    document.getElementById('finishGameBtn').classList.remove('hidden');
  }
}

function finishGame() {
  AppState.isGameActive = false;

  const gameScreen = document.getElementById('miniGameScreen');
  const completeScreen = document.getElementById('completeScreen');

  gameScreen.classList.add('hidden');
  completeScreen.classList.remove('hidden');

  announce('Great job! You completed the mini-game!');
}

function playSuccessSound() {
  // Visual feedback for now
  console.log('🎉 Correct!');
}

function playErrorSound() {
  // Visual feedback for now
  console.log('❌ Try again!');
}

// ============================================
// SETTINGS
// ============================================
function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('hidden');
}

function closeSettings() {
  document.getElementById('settingsPanel')?.classList.add('hidden');
}

function setTextSize(size) {
  AppState.textSize = size;
  const readingMode = document.getElementById('readingMode');

  readingMode.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
  readingMode.classList.add(`text-size-${size}`);
}

// ============================================
// ACCESSIBILITY
// ============================================
function announce(message) {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// ============================================
// DEBUG & DEVELOPMENT
// ============================================
window.StorybookDebug = {
  state: AppState,
  goToPage: (n) => { AppState.currentPage = n - 1; goToNextPage(); },
  showCompletion: showCompletionScreen,
  showGame: startMiniGame,
  speakTest: (text) => speakWord(text)
};

console.log('%c🍕 Midnight Pizza Train Ready!', 'font-size: 16px; color: #FF6B35;');
console.log('Debug: StorybookDebug.goToPage(n), StorybookDebug.showCompletion(), etc.');

// Add shake animation for wrong answers
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-10px); }
    80% { transform: translateX(10px); }
  }

  @keyframes page-turn {
    0% { opacity: 0.5; transform: translateX(10px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(shakeStyle);
