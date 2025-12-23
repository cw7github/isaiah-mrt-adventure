/**
 * Interactive Read Page Component
 * Beautiful, interactive read page for Grade 1 with word-by-word tap-to-hear
 */

(function() {
  'use strict';

  // Read Page State
  const readPageState = {
    currentPageIndex: 0,
    pages: [],
    isPlaying: false,
    isPaused: false,
    speed: 'normal', // 'normal' or 'slow'
    currentWordIndex: -1,
    speechSynthesis: window.speechSynthesis
  };

  /**
   * Create an interactive word element
   * @param {string} word - The word text
   * @param {Object} options - Word options
   * @param {boolean} options.isSightWord - Is this a sight word?
   * @param {boolean} options.isTargetWord - Is this a target word?
   * @param {string} options.audioUrl - Optional audio URL
   * @param {number} options.index - Word index in sentence
   * @returns {HTMLElement} Tappable span element
   */
  function createInteractiveWord(word, options = {}) {
    const span = document.createElement('span');
    span.className = 'read-word';
    span.textContent = word;
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', `${word}${options.isSightWord ? ' (sight word)' : ''}${options.isTargetWord ? ' (target word)' : ''}`);

    // Add special classes
    if (options.isSightWord) {
      span.classList.add('read-word--sight');
    }
    if (options.isTargetWord) {
      span.classList.add('read-word--target');
    }

    // Store word data
    span.dataset.word = word;
    span.dataset.index = options.index || 0;

    // Add sequential fade-in delay
    span.style.animationDelay = `${(options.index || 0) * 0.05}s`;

    // Tap/click to hear
    const speakWord = () => {
      if (readPageState.isPlaying) return; // Don't interrupt sentence reading

      // Add sparkle effect
      span.classList.add('sparkle');
      setTimeout(() => span.classList.remove('sparkle'), 600);

      // Add tap-heard animation
      span.classList.add('read-word--active');

      // Speak the word
      if (options.audioUrl) {
        playAudio(options.audioUrl);
      } else {
        speakText(word, () => {
          span.classList.remove('read-word--active');
          span.classList.add('read-word--completed');
        });
      }
    };

    span.addEventListener('click', speakWord);
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        speakWord();
      }
    });

    return span;
  }

  /**
   * Speak text using Web Speech API
   * @param {string} text - Text to speak
   * @param {Function} onEnd - Callback when speech ends
   */
  function speakText(text, onEnd) {
    if (!readPageState.speechSynthesis) return;

    // Cancel any ongoing speech
    readPageState.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = readPageState.speed === 'slow' ? 0.7 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    readPageState.speechSynthesis.speak(utterance);
  }

  /**
   * Play audio file
   * @param {string} url - Audio URL
   */
  function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(err => {
      console.warn('Audio playback failed, falling back to speech synthesis', err);
      // Fallback to speech synthesis if audio fails
    });
  }

  /**
   * Read entire sentence with word-by-word highlighting (karaoke-style)
   */
  function readToMe() {
    const sentence = document.getElementById('readSentence');
    if (!sentence) return;

    const words = Array.from(sentence.querySelectorAll('.read-word'));
    if (words.length === 0) return;

    readPageState.isPlaying = true;
    readPageState.isPaused = false;
    readPageState.currentWordIndex = 0;

    const readToMeBtn = document.getElementById('readToMeBtn');
    const pauseBtn = document.getElementById('readPauseBtn');

    readToMeBtn.classList.add('playing');
    pauseBtn.style.display = 'flex';

    // Read each word sequentially
    function readNextWord() {
      if (readPageState.isPaused) return;

      if (readPageState.currentWordIndex >= words.length) {
        // Finished reading all words
        finishReading();
        return;
      }

      const word = words[readPageState.currentWordIndex];
      const wordText = word.dataset.word;

      // Remove previous highlights
      words.forEach(w => w.classList.remove('read-word--active'));

      // Highlight current word
      word.classList.add('read-word--active');

      // Speak the word
      speakText(wordText, () => {
        // Mark as completed
        word.classList.remove('read-word--active');
        word.classList.add('read-word--completed');

        readPageState.currentWordIndex++;

        // Short pause between words
        setTimeout(readNextWord, 200);
      });
    }

    function finishReading() {
      readPageState.isPlaying = false;
      readPageState.isPaused = false;
      readPageState.currentWordIndex = -1;

      readToMeBtn.classList.remove('playing');
      pauseBtn.style.display = 'none';

      // Remove all highlights after a delay
      setTimeout(() => {
        words.forEach(w => {
          w.classList.remove('read-word--active', 'read-word--completed');
        });
      }, 1000);
    }

    readNextWord();
  }

  /**
   * Toggle pause/resume reading
   */
  function togglePause() {
    readPageState.isPaused = !readPageState.isPaused;

    const pauseBtn = document.getElementById('readPauseBtn');
    const pauseIcon = document.getElementById('pauseBtnIcon');
    const pauseText = document.getElementById('pauseBtnText');

    if (readPageState.isPaused) {
      readPageState.speechSynthesis.pause();
      if (pauseIcon) pauseIcon.textContent = '▶️';
      if (pauseText) pauseText.textContent = 'Resume';
    } else {
      readPageState.speechSynthesis.resume();
      if (pauseIcon) pauseIcon.textContent = '⏸';
      if (pauseText) pauseText.textContent = 'Pause';

      // Note: Resume functionality requires refactoring readToMe to be resumable
      // For now, pausing will stop the reading completely
    }
  }

  /**
   * Set reading speed
   * @param {string} speed - 'normal' or 'slow'
   */
  function setSpeed(speed) {
    readPageState.speed = speed;

    // Update UI
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === speed);
    });
  }

  /**
   * Load a page of content
   * @param {Object} page - Page data
   */
  function loadReadPage(page) {
    // Set background image
    const background = document.getElementById('readPageBackground');
    if (background && page.backgroundImage) {
      background.style.backgroundImage = `url('${page.backgroundImage}')`;
    }

    // Set emoji
    const emoji = document.getElementById('readPageEmoji');
    if (emoji && page.emoji) {
      emoji.textContent = page.emoji;
    }

    // Set reading tip
    const tip = document.getElementById('readingTip');
    const tipText = document.getElementById('tipText');
    if (page.tip) {
      tipText.textContent = page.tip;
      tip.style.display = 'flex';
    } else {
      tip.style.display = 'none';
    }

    // Create interactive sentence
    const sentence = document.getElementById('readSentence');
    sentence.innerHTML = '';

    if (page.words) {
      page.words.forEach((wordData, index) => {
        const word = createInteractiveWord(wordData.text, {
          isSightWord: wordData.isSightWord,
          isTargetWord: wordData.isTargetWord,
          audioUrl: wordData.audioUrl,
          index: index
        });
        sentence.appendChild(word);
      });
    } else if (page.sentence) {
      // Simple text parsing
      const words = page.sentence.split(' ');
      words.forEach((wordText, index) => {
        const word = createInteractiveWord(wordText, { index: index });
        sentence.appendChild(word);
      });
    }

    // Update progress dots
    updateProgressDots();
  }

  /**
   * Update progress indicator dots
   */
  function updateProgressDots() {
    const dotsContainer = document.getElementById('readProgressDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    readPageState.pages.forEach((page, index) => {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';

      if (index < readPageState.currentPageIndex) {
        dot.classList.add('completed');
      } else if (index === readPageState.currentPageIndex) {
        dot.classList.add('active');
      }

      dotsContainer.appendChild(dot);
    });
  }

  /**
   * Navigate to next page
   */
  function nextPage() {
    if (readPageState.currentPageIndex < readPageState.pages.length - 1) {
      readPageState.currentPageIndex++;
      loadReadPage(readPageState.pages[readPageState.currentPageIndex]);
      updateNavigationButtons();
    }
  }

  /**
   * Navigate to previous page
   */
  function previousPage() {
    if (readPageState.currentPageIndex > 0) {
      readPageState.currentPageIndex--;
      loadReadPage(readPageState.pages[readPageState.currentPageIndex]);
      updateNavigationButtons();
    }
  }

  /**
   * Update navigation button visibility
   */
  function updateNavigationButtons() {
    const prevBtn = document.getElementById('readPrevBtn');
    const nextBtn = document.getElementById('readNextBtn');

    if (prevBtn) {
      prevBtn.style.display = readPageState.currentPageIndex > 0 ? 'block' : 'none';
    }

    if (nextBtn) {
      const isLastPage = readPageState.currentPageIndex >= readPageState.pages.length - 1;
      nextBtn.querySelector('span').textContent = isLastPage ? 'Finish' : 'Next →';
    }
  }

  /**
   * Initialize the read page component
   * @param {Array} pages - Array of page data objects
   */
  function initReadPage(pages) {
    readPageState.pages = pages;
    readPageState.currentPageIndex = 0;

    // Load first page
    if (pages.length > 0) {
      loadReadPage(pages[0]);
      updateNavigationButtons();
    }

    // Set up event listeners
    const readToMeBtn = document.getElementById('readToMeBtn');
    if (readToMeBtn) {
      readToMeBtn.addEventListener('click', readToMe);
    }

    const pauseBtn = document.getElementById('readPauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', togglePause);
    }

    const speedBtns = document.querySelectorAll('.speed-btn');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => setSpeed(btn.dataset.speed));
    });

    // Set normal speed as default
    setSpeed('normal');

    const prevBtn = document.getElementById('readPrevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', previousPage);
    }

    const nextBtn = document.getElementById('readNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', nextPage);
    }
  }

  // Export functions to global scope
  window.ReadPage = {
    init: initReadPage,
    createInteractiveWord: createInteractiveWord,
    loadPage: loadReadPage,
    next: nextPage,
    previous: previousPage,
    readToMe: readToMe
  };

  // Example usage - Demo data
  // Uncomment to test the component with sample data
  /*
  document.addEventListener('DOMContentLoaded', () => {
    // Example page data
    const samplePages = [
      {
        emoji: '🍎',
        backgroundImage: 'assets/food_fruit.jpeg',
        tip: 'Tap each word to hear it!',
        words: [
          { text: 'I', isSightWord: true },
          { text: 'want', isSightWord: true },
          { text: 'an', isSightWord: true },
          { text: 'apple', isTargetWord: true }
        ]
      },
      {
        emoji: '🍕',
        backgroundImage: 'assets/food_pizza.jpeg',
        tip: 'Can you find the sight words?',
        words: [
          { text: 'The', isSightWord: true },
          { text: 'pizza', isTargetWord: true },
          { text: 'is', isSightWord: true },
          { text: 'hot', isTargetWord: true }
        ]
      }
    ];

    // Initialize the read page
    if (document.getElementById('readPageScreen')) {
      ReadPage.init(samplePages);
    }
  });
  */
})();
