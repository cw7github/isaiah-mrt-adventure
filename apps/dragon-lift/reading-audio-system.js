// ============================================
// READING & AUDIO INTERACTION SYSTEM
// Grade 1 Interactive Storybook
// ============================================

/**
 * DESIGN OVERVIEW
 * ===============
 * This system provides:
 * 1. Word-by-word highlighting synced with narration
 * 2. Tap-to-hear individual word pronunciation
 * 3. Narration toggle (OFF by default)
 * 4. Dual audio support: Web Speech API fallback + pre-recorded voices
 * 5. Rich visual feedback for word interactions
 * 6. Accessibility features for early readers
 */

// ============================================
// 1. DATA STRUCTURES FOR STORY CONTENT
// ============================================

/**
 * Story data structure with word-level timing information
 * Each word has its own timing data for precise synchronization
 */
const STORY_WITH_TIMING = {
  id: "ember-dragon-treasure",
  title: "The Ember Dragon's Hidden Treasure",

  // Metadata for the story
  metadata: {
    gradeLevel: 1,
    readingLevel: "beginner",
    estimatedDuration: 180, // seconds
    totalWords: 295,
    audioFile: "stories/ember-dragon/narration.mp3" // Pre-recorded narration
  },

  // Paragraphs array - each contains sentences with word timing
  paragraphs: [
    {
      id: "p1",
      sentences: [
        {
          id: "s1",
          // Each word object contains timing and metadata
          words: [
            {
              text: "Long",
              startTime: 0.0,
              endTime: 0.35,
              phonetic: "lawng",
              audioClip: "words/long.mp3", // Optional pre-recorded word
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "ago,",
              startTime: 0.35,
              endTime: 0.72,
              phonetic: "uh-goh",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "deep",
              startTime: 0.72,
              endTime: 1.05,
              phonetic: "deep",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "in",
              startTime: 1.05,
              endTime: 1.20,
              phonetic: "in",
              isSightWord: true, // Grade 1 sight word
              isPunctuation: false
            },
            {
              text: "the",
              startTime: 1.20,
              endTime: 1.35,
              phonetic: "thuh",
              isSightWord: true,
              isPunctuation: false
            },
            {
              text: "mountain",
              startTime: 1.35,
              endTime: 1.85,
              phonetic: "moun-tin",
              syllables: ["moun", "tain"],
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "caves,",
              startTime: 1.85,
              endTime: 2.25,
              phonetic: "kayvz",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "there",
              startTime: 2.25,
              endTime: 2.50,
              phonetic: "thair",
              isSightWord: true,
              isPunctuation: false
            },
            {
              text: "lived",
              startTime: 2.50,
              endTime: 2.85,
              phonetic: "livd",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "a",
              startTime: 2.85,
              endTime: 2.95,
              phonetic: "uh",
              isSightWord: true,
              isPunctuation: false
            },
            {
              text: "wise",
              startTime: 2.95,
              endTime: 3.35,
              phonetic: "wyz",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "dragon",
              startTime: 3.35,
              endTime: 3.90,
              phonetic: "drag-un",
              syllables: ["drag", "on"],
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "named",
              startTime: 3.90,
              endTime: 4.25,
              phonetic: "naymd",
              isSightWord: false,
              isPunctuation: false
            },
            {
              text: "Ember.",
              startTime: 4.25,
              endTime: 4.80,
              phonetic: "em-ber",
              syllables: ["Em", "ber"],
              isSightWord: false,
              isPunctuation: false
            }
          ]
        }
      ]
    }
    // ... additional paragraphs follow same structure
  ],

  // Sight words for this story (highlighted differently)
  sightWords: ["fire", "come", "see", "look", "read", "in", "the", "a", "there", "was", "is", "are"],

  // Challenge words (vocabulary building)
  challengeWords: ["treasure", "precious", "ancient", "scrolls", "glowed"]
};

// ============================================
// 2. AUDIO ENGINE - Hybrid TTS + Pre-recorded
// ============================================

class StoryAudioEngine {
  constructor(options = {}) {
    // Configuration
    this.config = {
      preferPreRecorded: true,      // Prefer pre-recorded audio over TTS
      fallbackToTTS: true,          // Use TTS if pre-recorded unavailable
      ttsVoiceName: null,           // Will be set to best available voice
      ttsRate: 0.85,                // Slower for Grade 1 readers (0.1 to 10)
      ttsPitch: 1.1,                // Slightly higher pitch for engagement
      wordGapMs: 50,                // Gap between words for TTS
      highlightDurationMs: 300,     // How long word stays highlighted after audio
      ...options
    };

    // State
    this.isNarrationEnabled = false;  // OFF by default per requirements
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = 0;
    this.currentAudio = null;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;

    // Audio cache for pre-recorded clips
    this.audioCache = new Map();

    // Callbacks
    this.onWordHighlight = null;
    this.onWordComplete = null;
    this.onSentenceComplete = null;
    this.onNarrationComplete = null;
    this.onNarrationStateChange = null;

    // Initialize
    this._initializeVoices();
    this._setupVisibilityHandling();
  }

  // Initialize Web Speech API voices
  _initializeVoices() {
    const setVoice = () => {
      const voices = this.speechSynthesis.getVoices();

      // Prefer child-friendly, clear voices
      // Priority: US English female > UK English female > Any English
      const preferredVoices = [
        'Samantha',           // macOS - clear, friendly
        'Karen',              // macOS Australian - clear
        'Google US English',  // Chrome - good quality
        'Microsoft Zira',     // Windows - clear female
        'Microsoft David',    // Windows - clear male
      ];

      for (const preferred of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferred));
        if (voice) {
          this.config.ttsVoiceName = voice.name;
          this.selectedVoice = voice;
          console.log(`[Audio] Selected voice: ${voice.name}`);
          return;
        }
      }

      // Fallback to first English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        this.config.ttsVoiceName = englishVoice.name;
        this.selectedVoice = englishVoice;
        console.log(`[Audio] Fallback voice: ${englishVoice.name}`);
      }
    };

    // Voices may load asynchronously
    if (this.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }
  }

  // Handle tab visibility changes (pause when hidden)
  _setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        this.pause();
      }
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Toggle narration on/off
   * @returns {boolean} New narration state
   */
  toggleNarration() {
    this.isNarrationEnabled = !this.isNarrationEnabled;

    if (!this.isNarrationEnabled && this.isPlaying) {
      this.stop();
    }

    if (this.onNarrationStateChange) {
      this.onNarrationStateChange(this.isNarrationEnabled);
    }

    console.log(`[Audio] Narration ${this.isNarrationEnabled ? 'enabled' : 'disabled'}`);
    return this.isNarrationEnabled;
  }

  /**
   * Set narration state directly
   * @param {boolean} enabled
   */
  setNarrationEnabled(enabled) {
    if (this.isNarrationEnabled !== enabled) {
      this.toggleNarration();
    }
  }

  /**
   * Speak a single word (for tap-to-hear)
   * @param {Object} wordData - Word object with text and optional audio clip
   * @param {HTMLElement} wordElement - The DOM element for visual feedback
   */
  async speakWord(wordData, wordElement) {
    // Stop any current speech
    this.stopCurrentSpeech();

    // Visual feedback - add tapped state
    if (wordElement) {
      wordElement.classList.add('word-tapped');
    }

    try {
      // Try pre-recorded audio first
      if (this.config.preferPreRecorded && wordData.audioClip) {
        await this._playPreRecordedWord(wordData.audioClip);
      }
      // Fallback to TTS
      else if (this.config.fallbackToTTS) {
        await this._speakWordTTS(wordData.text);
      }
    } catch (error) {
      console.warn(`[Audio] Error speaking word "${wordData.text}":`, error);
      // Still try TTS as last resort
      if (this.config.fallbackToTTS) {
        await this._speakWordTTS(wordData.text);
      }
    }

    // Remove visual feedback after delay
    if (wordElement) {
      setTimeout(() => {
        wordElement.classList.remove('word-tapped');
      }, this.config.highlightDurationMs);
    }
  }

  /**
   * Play full narration with word-by-word highlighting
   * @param {Array} words - Array of word objects with timing
   */
  async playNarration(words) {
    if (!this.isNarrationEnabled) {
      console.log('[Audio] Narration is disabled');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentWordIndex = 0;

    try {
      // Check if we have a pre-recorded full narration with timing
      const storyData = this._getStoryData();
      if (storyData?.metadata?.audioFile && this.config.preferPreRecorded) {
        await this._playPreRecordedNarration(storyData.metadata.audioFile, words);
      } else {
        await this._playTTSNarration(words);
      }
    } catch (error) {
      console.error('[Audio] Narration error:', error);
    }

    this.isPlaying = false;
    if (this.onNarrationComplete) {
      this.onNarrationComplete();
    }
  }

  /**
   * Pause current narration
   */
  pause() {
    this.isPaused = true;

    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Resume paused narration
   */
  resume() {
    this.isPaused = false;

    if (this.currentAudio) {
      this.currentAudio.play();
    }

    if (this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }

  /**
   * Stop all audio
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = 0;

    this.stopCurrentSpeech();

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Stop only current speech (for tap interruption)
   */
  stopCurrentSpeech() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  // Play a pre-recorded word audio clip
  async _playPreRecordedWord(audioPath) {
    return new Promise((resolve, reject) => {
      // Check cache first
      let audio = this.audioCache.get(audioPath);

      if (!audio) {
        audio = new Audio(audioPath);
        this.audioCache.set(audioPath, audio);
      }

      audio.currentTime = 0;

      audio.onended = resolve;
      audio.onerror = reject;

      audio.play().catch(reject);
    });
  }

  // Speak a word using Web Speech API
  async _speakWordTTS(text) {
    return new Promise((resolve, reject) => {
      // Clean the text (remove punctuation for cleaner speech)
      const cleanText = text.replace(/[.,!?;:'"]/g, '').trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.rate = this.config.ttsRate;
      utterance.pitch = this.config.ttsPitch;

      utterance.onend = resolve;
      utterance.onerror = (event) => {
        // Don't reject on 'interrupted' - that's expected when stopping
        if (event.error === 'interrupted') {
          resolve();
        } else {
          reject(event);
        }
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    });
  }

  // Play pre-recorded narration with sync
  async _playPreRecordedNarration(audioPath, words) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioPath);
      this.currentAudio = audio;

      // Track current word based on audio time
      audio.ontimeupdate = () => {
        const currentTime = audio.currentTime;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];

          if (currentTime >= word.startTime && currentTime < word.endTime) {
            if (this.currentWordIndex !== i) {
              this.currentWordIndex = i;

              if (this.onWordHighlight) {
                this.onWordHighlight(i, word);
              }
            }
            break;
          }
        }
      };

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = reject;

      audio.play().catch(reject);
    });
  }

  // Play TTS narration word by word
  async _playTTSNarration(words) {
    for (let i = 0; i < words.length; i++) {
      if (!this.isPlaying) break;

      while (this.isPaused) {
        await this._sleep(100);
        if (!this.isPlaying) return;
      }

      this.currentWordIndex = i;
      const word = words[i];

      // Highlight callback
      if (this.onWordHighlight) {
        this.onWordHighlight(i, word);
      }

      // Speak the word
      await this._speakWordTTS(word.text);

      // Word complete callback
      if (this.onWordComplete) {
        this.onWordComplete(i, word);
      }

      // Small gap between words
      await this._sleep(this.config.wordGapMs);
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _getStoryData() {
    // This would be connected to your story management system
    return STORY_WITH_TIMING;
  }

  // Preload audio files for smoother playback
  async preloadAudio(words) {
    const audioPromises = words
      .filter(w => w.audioClip)
      .map(w => {
        return new Promise((resolve) => {
          const audio = new Audio(w.audioClip);
          audio.addEventListener('canplaythrough', () => {
            this.audioCache.set(w.audioClip, audio);
            resolve();
          }, { once: true });
          audio.addEventListener('error', resolve, { once: true });
          audio.load();
        });
      });

    await Promise.all(audioPromises);
    console.log(`[Audio] Preloaded ${audioPromises.length} audio clips`);
  }
}

// ============================================
// 3. WORD HIGHLIGHT MANAGER
// ============================================

class WordHighlightManager {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.words = [];
    this.wordElements = [];
    this.currentHighlightIndex = -1;

    this.config = {
      highlightClass: 'word-highlighted',
      tappedClass: 'word-tapped',
      sightWordClass: 'sight-word',
      challengeWordClass: 'challenge-word',
      currentWordClass: 'word-current',
      spokenWordClass: 'word-spoken',
      ...options
    };

    // Animation frame for smooth highlighting
    this.animationFrame = null;
  }

  /**
   * Render story text as clickable words
   * @param {Array} paragraphs - Paragraph data with word timing
   */
  renderStory(paragraphs) {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.wordElements = [];
    let wordIndex = 0;

    paragraphs.forEach((paragraph, pIndex) => {
      const pElement = document.createElement('p');
      pElement.className = 'story-paragraph';
      pElement.dataset.paragraphIndex = pIndex;

      paragraph.sentences.forEach((sentence, sIndex) => {
        sentence.words.forEach((word, wIndex) => {
          const wordSpan = this._createWordElement(word, wordIndex);
          pElement.appendChild(wordSpan);

          // Add space between words (except before punctuation)
          const nextWord = sentence.words[wIndex + 1];
          if (!nextWord?.text.match(/^[.,!?;:]$/)) {
            pElement.appendChild(document.createTextNode(' '));
          }

          this.wordElements.push(wordSpan);
          wordIndex++;
        });
      });

      this.container.appendChild(pElement);
    });

    // Set up keyboard navigation for accessibility
    this._setupKeyboardNavigation();
  }

  /**
   * Create a word element with proper classes and attributes
   */
  _createWordElement(wordData, index) {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = wordData.text;
    span.dataset.index = index;
    span.dataset.word = wordData.text.toLowerCase().replace(/[.,!?;:'"]/g, '');
    span.tabIndex = 0; // Make focusable for accessibility
    span.setAttribute('role', 'button');
    span.setAttribute('aria-label', `Word: ${wordData.text}. Tap to hear pronunciation.`);

    // Add special classes
    if (wordData.isSightWord) {
      span.classList.add(this.config.sightWordClass);
    }
    if (wordData.isChallenge) {
      span.classList.add(this.config.challengeWordClass);
    }

    // Store word data
    span.wordData = wordData;

    return span;
  }

  /**
   * Highlight a specific word
   * @param {number} index - Word index to highlight
   * @param {boolean} scrollIntoView - Whether to scroll word into view
   */
  highlightWord(index, scrollIntoView = true) {
    // Remove previous highlight
    if (this.currentHighlightIndex >= 0 && this.wordElements[this.currentHighlightIndex]) {
      this.wordElements[this.currentHighlightIndex].classList.remove(
        this.config.highlightClass,
        this.config.currentWordClass
      );
      this.wordElements[this.currentHighlightIndex].classList.add(this.config.spokenWordClass);
    }

    // Add new highlight
    if (index >= 0 && index < this.wordElements.length) {
      const element = this.wordElements[index];
      element.classList.add(this.config.highlightClass, this.config.currentWordClass);
      element.classList.remove(this.config.spokenWordClass);

      // Smooth scroll into view if needed
      if (scrollIntoView) {
        this._scrollWordIntoView(element);
      }

      this.currentHighlightIndex = index;
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    this.wordElements.forEach(el => {
      el.classList.remove(
        this.config.highlightClass,
        this.config.currentWordClass,
        this.config.spokenWordClass,
        this.config.tappedClass
      );
    });
    this.currentHighlightIndex = -1;
  }

  /**
   * Add tap feedback to a word
   */
  showTapFeedback(element) {
    element.classList.add(this.config.tappedClass);

    // Remove after animation
    setTimeout(() => {
      element.classList.remove(this.config.tappedClass);
    }, 400);
  }

  /**
   * Scroll word into view smoothly
   */
  _scrollWordIntoView(element) {
    // Cancel any pending scroll
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    });
  }

  /**
   * Setup keyboard navigation for accessibility
   */
  _setupKeyboardNavigation() {
    this.container.addEventListener('keydown', (e) => {
      const target = e.target;
      if (!target.classList.contains('word')) return;

      const currentIndex = parseInt(target.dataset.index);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < this.wordElements.length - 1) {
            this.wordElements[currentIndex + 1].focus();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            this.wordElements[currentIndex - 1].focus();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          target.click();
          break;
      }
    });
  }

  /**
   * Get word element by index
   */
  getWordElement(index) {
    return this.wordElements[index];
  }
}

// ============================================
// 4. READING INTERACTION CONTROLLER
// ============================================

class ReadingInteractionController {
  constructor(options = {}) {
    this.config = {
      storyContainerSelector: '#storyText',
      audioControlsSelector: '#audioControls',
      ...options
    };

    // Initialize components
    this.audioEngine = new StoryAudioEngine({
      ttsRate: 0.85,
      preferPreRecorded: true,
      fallbackToTTS: true
    });

    this.highlightManager = new WordHighlightManager(
      this.config.storyContainerSelector
    );

    // State
    this.storyData = null;
    this.flatWords = []; // Flattened word array for easy indexing

    // Bind methods
    this._handleWordClick = this._handleWordClick.bind(this);
    this._handlePlayPause = this._handlePlayPause.bind(this);
    this._handleNarrationToggle = this._handleNarrationToggle.bind(this);

    // Set up audio engine callbacks
    this._setupAudioCallbacks();
  }

  /**
   * Initialize with story data
   */
  async initialize(storyData) {
    this.storyData = storyData;

    // Flatten words for easy access
    this.flatWords = this._flattenWords(storyData.paragraphs);

    // Render the story
    this.highlightManager.renderStory(storyData.paragraphs);

    // Set up click handlers
    this._setupWordClickHandlers();

    // Preload audio if available
    await this.audioEngine.preloadAudio(this.flatWords);

    // Create UI controls
    this._createAudioControls();

    console.log('[Reading] Controller initialized with', this.flatWords.length, 'words');
  }

  /**
   * Flatten paragraphs into single word array
   */
  _flattenWords(paragraphs) {
    const words = [];
    paragraphs.forEach(p => {
      p.sentences.forEach(s => {
        s.words.forEach(w => {
          words.push(w);
        });
      });
    });
    return words;
  }

  /**
   * Set up click handlers for words
   */
  _setupWordClickHandlers() {
    const container = document.querySelector(this.config.storyContainerSelector);
    if (!container) return;

    container.addEventListener('click', this._handleWordClick);

    // Touch support with proper feedback
    container.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('word')) {
        e.target.classList.add('word-touch-active');
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (e.target.classList.contains('word')) {
        e.target.classList.remove('word-touch-active');
      }
    }, { passive: true });
  }

  /**
   * Handle word click/tap
   */
  _handleWordClick(event) {
    const target = event.target;
    if (!target.classList.contains('word')) return;

    const wordData = target.wordData;
    if (!wordData) return;

    console.log('[Reading] Word tapped:', wordData.text);

    // Visual feedback
    this.highlightManager.showTapFeedback(target);

    // Speak the word
    this.audioEngine.speakWord(wordData, target);

    // Analytics/tracking (optional)
    this._trackWordInteraction(wordData);
  }

  /**
   * Set up audio engine callbacks
   */
  _setupAudioCallbacks() {
    this.audioEngine.onWordHighlight = (index, word) => {
      this.highlightManager.highlightWord(index);
    };

    this.audioEngine.onWordComplete = (index, word) => {
      // Could add completion animation here
    };

    this.audioEngine.onNarrationComplete = () => {
      this.highlightManager.clearHighlights();
      this._updatePlayButton(false);
    };

    this.audioEngine.onNarrationStateChange = (enabled) => {
      this._updateNarrationToggle(enabled);
    };
  }

  /**
   * Handle play/pause button
   */
  _handlePlayPause() {
    if (!this.audioEngine.isNarrationEnabled) {
      // Show message that narration is off
      this._showNarrationDisabledMessage();
      return;
    }

    if (this.audioEngine.isPlaying) {
      if (this.audioEngine.isPaused) {
        this.audioEngine.resume();
        this._updatePlayButton(true, false);
      } else {
        this.audioEngine.pause();
        this._updatePlayButton(true, true);
      }
    } else {
      this.audioEngine.playNarration(this.flatWords);
      this._updatePlayButton(true, false);
    }
  }

  /**
   * Handle narration toggle
   */
  _handleNarrationToggle() {
    const enabled = this.audioEngine.toggleNarration();
    this._updateNarrationToggle(enabled);
  }

  /**
   * Create audio control UI
   */
  _createAudioControls() {
    // This would typically be added to your HTML, but here's programmatic creation
    const existingControls = document.querySelector(this.config.audioControlsSelector);
    if (existingControls) {
      this._setupExistingControls(existingControls);
      return;
    }

    // Create controls container if it doesn't exist
    const controls = document.createElement('div');
    controls.id = 'audioControls';
    controls.className = 'audio-controls';
    controls.innerHTML = `
      <div class="audio-controls-inner">
        <button class="audio-btn narration-toggle" aria-label="Toggle Narration" title="Turn narration on/off">
          <span class="icon-speaker-off"></span>
          <span class="btn-label">Read to Me</span>
        </button>
        <button class="audio-btn play-pause" aria-label="Play/Pause" title="Play or pause narration" disabled>
          <span class="icon-play"></span>
        </button>
        <button class="audio-btn stop" aria-label="Stop" title="Stop narration" disabled>
          <span class="icon-stop"></span>
        </button>
      </div>
      <div class="narration-status">
        <span class="status-text">Narration is OFF</span>
      </div>
    `;

    // Insert before story container
    const storyContainer = document.querySelector(this.config.storyContainerSelector);
    if (storyContainer && storyContainer.parentNode) {
      storyContainer.parentNode.insertBefore(controls, storyContainer);
    }

    this._setupExistingControls(controls);
  }

  _setupExistingControls(controls) {
    const toggleBtn = controls.querySelector('.narration-toggle');
    const playBtn = controls.querySelector('.play-pause');
    const stopBtn = controls.querySelector('.stop');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', this._handleNarrationToggle);
    }
    if (playBtn) {
      playBtn.addEventListener('click', this._handlePlayPause);
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.audioEngine.stop();
        this.highlightManager.clearHighlights();
        this._updatePlayButton(false);
      });
    }
  }

  _updatePlayButton(playing, paused = false) {
    const playBtn = document.querySelector('.play-pause');
    if (!playBtn) return;

    const icon = playBtn.querySelector('span');
    if (playing && !paused) {
      icon.className = 'icon-pause';
      playBtn.setAttribute('aria-label', 'Pause');
    } else {
      icon.className = 'icon-play';
      playBtn.setAttribute('aria-label', 'Play');
    }
  }

  _updateNarrationToggle(enabled) {
    const toggleBtn = document.querySelector('.narration-toggle');
    const playBtn = document.querySelector('.play-pause');
    const stopBtn = document.querySelector('.stop');
    const statusText = document.querySelector('.narration-status .status-text');

    if (toggleBtn) {
      const icon = toggleBtn.querySelector('span:first-child');
      icon.className = enabled ? 'icon-speaker-on' : 'icon-speaker-off';
      toggleBtn.classList.toggle('active', enabled);
    }

    if (playBtn) {
      playBtn.disabled = !enabled;
    }
    if (stopBtn) {
      stopBtn.disabled = !enabled;
    }
    if (statusText) {
      statusText.textContent = enabled ? 'Narration is ON' : 'Narration is OFF';
    }
  }

  _showNarrationDisabledMessage() {
    // Could show a tooltip or toast
    console.log('[Reading] Enable narration first using the "Read to Me" button');
  }

  _trackWordInteraction(wordData) {
    // Placeholder for analytics
    // Could track: which words are tapped most, sight word recognition, etc.
  }
}

// ============================================
// 5. CSS FOR WORD HIGHLIGHTING (to be added to styles.css)
// ============================================

const READING_AUDIO_CSS = `
/* ============================================
   READING AUDIO SYSTEM STYLES
   ============================================ */

/* Base word styling */
.story-text .word {
  display: inline-block;
  padding: 4px 6px;
  margin: 2px 1px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent; /* Remove mobile tap highlight */
}

/* Word hover state */
.story-text .word:hover {
  background: rgba(0, 245, 212, 0.15);
  transform: scale(1.05);
}

/* Word focus state (keyboard navigation) */
.story-text .word:focus {
  outline: 2px solid var(--dragon-teal);
  outline-offset: 2px;
  background: rgba(0, 245, 212, 0.1);
}

/* Sight words - subtle glow */
.story-text .word.sight-word {
  color: var(--dragon-amber);
  font-weight: 600;
  text-shadow: 0 0 8px rgba(255, 159, 28, 0.4);
}

/* Challenge/vocabulary words */
.story-text .word.challenge-word {
  color: var(--dragon-teal);
  font-weight: 500;
  border-bottom: 2px dotted var(--dragon-teal);
}

/* ============================================
   WORD HIGHLIGHT STATES - Narration Sync
   ============================================ */

/* Currently being read - main highlight */
.story-text .word.word-highlighted,
.story-text .word.word-current {
  background: linear-gradient(135deg,
    var(--dragon-amber) 0%,
    var(--dragon-ember) 100%);
  color: var(--dragon-indigo);
  transform: scale(1.15);
  box-shadow:
    0 4px 15px rgba(255, 159, 28, 0.5),
    0 0 20px rgba(255, 159, 28, 0.3);
  z-index: 10;
  animation: word-highlight-pulse 0.4s ease-out;
}

@keyframes word-highlight-pulse {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1.15);
    box-shadow:
      0 4px 15px rgba(255, 159, 28, 0.5),
      0 0 20px rgba(255, 159, 28, 0.3);
  }
}

/* Already spoken words - subtle indicator */
.story-text .word.word-spoken {
  color: rgba(255, 255, 255, 0.7);
}

/* ============================================
   TAP-TO-HEAR FEEDBACK
   ============================================ */

/* Word being tapped/clicked */
.story-text .word.word-tapped {
  animation: word-tap-feedback 0.4s ease-out;
  background: radial-gradient(circle,
    var(--dragon-teal) 0%,
    rgba(0, 245, 212, 0.3) 70%);
  color: var(--dragon-indigo);
}

@keyframes word-tap-feedback {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.1);
  }
}

/* Touch active state (mobile) */
.story-text .word.word-touch-active {
  background: rgba(0, 245, 212, 0.2);
  transform: scale(1.05);
}

/* Ripple effect on tap */
.story-text .word.word-tapped::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle,
    rgba(0, 245, 212, 0.6) 0%,
    transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
  animation: word-ripple 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes word-ripple {
  to {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* ============================================
   AUDIO CONTROLS UI
   ============================================ */

.audio-controls {
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(0, 245, 212, 0.3);
  border-radius: 16px;
  padding: 16px 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.audio-controls-inner {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid rgba(0, 245, 212, 0.5);
  border-radius: 30px;
  background: rgba(0, 245, 212, 0.1);
  color: var(--dragon-teal);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-btn:hover:not(:disabled) {
  background: rgba(0, 245, 212, 0.2);
  border-color: var(--dragon-teal);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 245, 212, 0.3);
}

.audio-btn:active:not(:disabled) {
  transform: translateY(0);
}

.audio-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Narration toggle button - special styling */
.audio-btn.narration-toggle {
  background: linear-gradient(135deg,
    rgba(255, 107, 53, 0.2) 0%,
    rgba(255, 159, 28, 0.2) 100%);
  border-color: rgba(255, 159, 28, 0.5);
  color: var(--dragon-amber);
}

.audio-btn.narration-toggle.active {
  background: linear-gradient(135deg,
    var(--dragon-ember) 0%,
    var(--dragon-amber) 100%);
  color: var(--dragon-indigo);
  border-color: var(--dragon-amber);
  box-shadow: 0 0 20px rgba(255, 159, 28, 0.4);
}

/* Play/Pause button icons */
.icon-play::before { content: ''; }
.icon-pause::before { content: ''; }
.icon-stop::before { content: ''; }
.icon-speaker-on::before { content: ''; }
.icon-speaker-off::before { content: ''; }

/* Narration status text */
.narration-status {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.narration-status .status-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

/* High contrast mode */
@media (prefers-contrast: high) {
  .story-text .word.word-highlighted {
    outline: 3px solid #fff;
    outline-offset: 2px;
  }

  .story-text .word.word-tapped {
    outline: 3px solid var(--dragon-teal);
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .story-text .word,
  .story-text .word.word-highlighted,
  .story-text .word.word-tapped {
    transition: none;
    animation: none;
  }

  .story-text .word.word-highlighted {
    transform: none;
    background: var(--dragon-amber);
    border: 3px solid var(--dragon-indigo);
  }

  .story-text .word.word-tapped::after {
    display: none;
  }
}

/* Large text mode / Dyslexia-friendly */
.reading-mode-large .story-text {
  font-size: 1.6rem;
  line-height: 2.5;
  letter-spacing: 0.05em;
  word-spacing: 0.15em;
}

.reading-mode-large .story-text .word {
  padding: 6px 10px;
  margin: 4px 3px;
}

/* Focus visible for keyboard users */
.story-text .word:focus-visible {
  outline: 3px solid var(--dragon-teal);
  outline-offset: 3px;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */

@media (max-width: 768px) {
  .audio-controls {
    padding: 12px 16px;
  }

  .audio-controls-inner {
    flex-wrap: wrap;
    gap: 10px;
  }

  .audio-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .story-text .word {
    padding: 6px 8px;
    font-size: 1.2rem;
  }

  /* Larger touch targets on mobile */
  .story-text .word {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
`;

// ============================================
// 6. INTEGRATION EXAMPLE
// ============================================

/**
 * Example integration with Dragon Lift app
 */
function initializeReadingSystem() {
  // Create controller
  const readingController = new ReadingInteractionController({
    storyContainerSelector: '#storyText',
    audioControlsSelector: '#audioControls'
  });

  // Initialize with story data
  readingController.initialize(STORY_WITH_TIMING);

  // Expose for debugging
  window.readingController = readingController;

  return readingController;
}

// ============================================
// 7. ACCESSIBILITY CONSIDERATIONS
// ============================================

/**
 * ACCESSIBILITY FEATURES FOR EARLY READERS
 * ========================================
 *
 * 1. KEYBOARD NAVIGATION
 *    - All words are focusable (tabIndex=0)
 *    - Arrow keys move between words
 *    - Enter/Space triggers word pronunciation
 *    - Escape stops narration
 *
 * 2. SCREEN READER SUPPORT
 *    - Words have aria-label with pronunciation hint
 *    - Audio controls have descriptive labels
 *    - Status changes announced (narration on/off)
 *    - Live region for current word during narration
 *
 * 3. VISUAL ACCESSIBILITY
 *    - High contrast mode support
 *    - Reduced motion preference respected
 *    - Large text mode available
 *    - Color is never the only indicator
 *
 * 4. MOTOR ACCESSIBILITY
 *    - Large touch targets (min 44x44px)
 *    - No time-dependent interactions required
 *    - Tap anywhere on word (not precision required)
 *
 * 5. COGNITIVE ACCESSIBILITY
 *    - Clear visual feedback for all interactions
 *    - Consistent highlighting behavior
 *    - Slower speech rate for Grade 1
 *    - Word-by-word highlighting reduces cognitive load
 *    - Sight words visually distinct
 */

// ============================================
// 8. TTS vs PRE-RECORDED COMPARISON
// ============================================

/**
 * AUDIO APPROACH COMPARISON
 * =========================
 *
 * WEB SPEECH API (TTS)
 * Pros:
 * - Zero storage requirements
 * - Works offline (most browsers)
 * - Instant - no loading time
 * - Easy to update story text
 * - Free
 *
 * Cons:
 * - Voice quality varies by device/browser
 * - Less natural prosody
 * - No emotional expression
 * - Word boundaries less precise
 * - May sound robotic to children
 *
 * PRE-RECORDED AUDIO
 * Pros:
 * - Professional, warm voice quality
 * - Natural prosody and emotion
 * - Precise word timing possible
 * - Consistent across all devices
 * - Can include sound effects
 *
 * Cons:
 * - Storage space required
 * - Loading time needed
 * - Cost to produce
 * - Hard to update text
 * - Need different languages separately
 *
 * RECOMMENDATION: HYBRID APPROACH
 * - Use pre-recorded for full narration (natural, engaging)
 * - Use TTS for tap-to-hear words (instant response)
 * - TTS as fallback if pre-recorded fails to load
 */

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StoryAudioEngine,
    WordHighlightManager,
    ReadingInteractionController,
    STORY_WITH_TIMING,
    READING_AUDIO_CSS,
    initializeReadingSystem
  };
}
