// ============================================
// READING EXPERIENCE FLOW - Implementation
// Complete UX Flow for Interactive Storybook
// ============================================

/**
 * READING EXPERIENCE FLOW CONTROLLER
 *
 * Manages the complete reading journey:
 * 1. Pre-Reading (vocabulary, prediction, character intro)
 * 2. First Read (narration with highlighting)
 * 3. Comprehension Checks (evidence-based questions)
 * 4. Story Completion (celebration, reflection)
 * 5. Re-Read Options (echo, your turn, record)
 * 6. Mini-Game (post-story reinforcement)
 */

// ============================================
// 1. PHASE CONSTANTS & CONFIGURATION
// ============================================

const READING_PHASES = {
  LOBBY: 'lobby',
  STORY_SELECT: 'story_select',
  PRE_READ_VOCABULARY: 'pre_read_vocabulary',
  PRE_READ_PREDICTION: 'pre_read_prediction',
  PRE_READ_CHARACTERS: 'pre_read_characters',
  FIRST_READ: 'first_read',
  COMPREHENSION_CHECK: 'comprehension_check',
  COMPLETION_CELEBRATION: 'completion_celebration',
  COMPLETION_REFLECTION: 'completion_reflection',
  COMPLETION_PREDICTION_REVIEW: 'completion_prediction_review',
  COMPLETION_UNLOCK: 'completion_unlock',
  REREAD_SELECT: 'reread_select',
  REREAD_ECHO: 'reread_echo',
  REREAD_YOUR_TURN: 'reread_your_turn',
  REREAD_RECORD: 'reread_record',
  MINI_GAME: 'mini_game'
};

const READING_MODES = {
  FIRST_READ: 'first_read',
  ECHO: 'echo',
  YOUR_TURN: 'your_turn',
  RECORD: 'record'
};

const NARRATION_SPEEDS = {
  SLOW: { rate: 0.7, wordPauseMs: 150, label: 'Slow' },
  NORMAL: { rate: 0.85, wordPauseMs: 50, label: 'Normal' },
  FAST: { rate: 1.0, wordPauseMs: 0, label: 'Fast' }
};

const CONFIG = {
  minVocabularyWords: 5,
  pagesPerComprehensionCheck: 2,
  minTouchTarget: 52, // pixels
  celebrationDurationMs: 6000,
  comprehensionHintDelayMs: 10000,
  maxComprehensionAttempts: 3
};

// ============================================
// 2. STORY DATA STRUCTURE
// ============================================

/**
 * Complete story data structure with all phases
 */
const STORY_TEMPLATE = {
  id: 'story-id',
  title: 'Story Title',

  // Pre-reading content
  preReading: {
    vocabulary: [
      {
        word: 'treasure',
        image: 'assets/vocab/treasure.png',
        audioClip: 'audio/words/treasure.mp3',
        definition: 'Something very special and valuable',
        syllables: ['trea', 'sure'],
        sentenceExample: 'The dragon guards the treasure.'
      }
      // ... more words (minimum 3, recommended 5)
    ],
    predictions: [
      { id: 'pred_1', text: 'The dragon finds gold', icon: 'gold' },
      { id: 'pred_2', text: 'The dragon makes a friend', icon: 'friend' },
      { id: 'pred_3', text: 'The dragon learns to read', icon: 'book' },
      { id: 'pred_other', text: 'Something else!', icon: 'sparkle' }
    ],
    characters: [
      {
        name: 'Ember',
        role: 'The Dragon',
        image: 'assets/characters/ember.png',
        description: 'A wise dragon who loves stories',
        audioIntro: 'audio/intros/ember.mp3'
      }
      // ... more characters/settings
    ],
    coverImage: 'assets/covers/story-cover.png'
  },

  // Story pages
  pages: [
    {
      pageNumber: 1,
      illustration: 'assets/illustrations/page1.png',
      illustrationAlt: 'Dragon in cave with scrolls',
      illustrationFocalPoint: 'center', // top, bottom, left, right, center
      paragraphs: [
        {
          sentences: [
            {
              text: 'Long ago, deep in the mountain caves, there lived a wise dragon named Ember.',
              words: [
                { text: 'Long', startTime: 0.0, endTime: 0.35, isSightWord: false },
                { text: 'ago,', startTime: 0.35, endTime: 0.72, isSightWord: false },
                // ... all words with timing
              ]
            }
          ]
        }
      ],
      audioFile: 'audio/narration/page1.mp3' // optional pre-recorded
    }
    // ... more pages
  ],

  // Comprehension checks
  comprehensionChecks: [
    {
      id: 'check_1',
      afterPage: 2,
      questionType: 'find_word', // find_word, find_phrase, sequence
      prompt: 'Find the word that tells us what Ember collected.',
      passage: {
        startSentence: 2,
        endSentence: 3
      },
      correctAnswer: 'stories',
      correctAnswerIndex: 8, // word index in passage
      feedback: {
        correct: "Yes! 'Stories' is exactly right! Ember loves stories, not gold!",
        hints: [
          'Look for a word that means tales or things you can read.',
          'It starts with the letter S.'
        ],
        wrongResponses: {
          'gold': "That's what OTHER dragons like. Ember is different!",
          'jewels': 'Close! Those are shiny, but Ember wants something you can read.',
          'default': 'Good try! Read the sentence again carefully.'
        }
      }
    }
    // ... more checks (typically 3-5)
  ],

  // Completion content
  completion: {
    celebrationMessage: 'AMAZING! You finished the story!',
    reflectionOptions: [
      'When Ember showed the scrolls',
      'When the words appeared in fire',
      'When the traveler read the words',
      'The ending when they read together'
    ],
    predictionOutcome: 'The dragon taught the traveler that reading is the greatest treasure!',
    dragonScalesEarned: 5
  },

  // Mini-game configuration
  miniGame: {
    type: 'word_treasure', // word_treasure, sequence, matching
    title: "Dragon's Word Treasure",
    description: 'Help Ember find the sight words hidden in the cave!',
    targetWords: ['fire', 'come', 'see', 'look', 'read'],
    maxDurationMinutes: 3,
    backgroundImage: 'assets/games/cave-scene.png'
  },

  // Metadata
  metadata: {
    gradeLevel: 1,
    readingLevel: 'beginner',
    wordCount: 295,
    estimatedMinutes: 8,
    sightWords: ['fire', 'come', 'see', 'look', 'read'],
    thematicFocus: 'The value of reading and stories'
  }
};

// ============================================
// 3. SESSION STATE MANAGEMENT
// ============================================

class ReadingSessionState {
  constructor(storyId) {
    this.storyId = storyId;
    this.reset();
  }

  reset() {
    this.state = {
      // Current phase tracking
      currentPhase: READING_PHASES.PRE_READ_VOCABULARY,
      previousPhase: null,

      // Pre-reading
      preReading: {
        vocabularyComplete: false,
        wordsReviewed: new Set(),
        predictionMade: null,
        characterIntrosSeen: new Set()
      },

      // Reading progress
      reading: {
        currentPage: 1,
        pagesCompleted: new Set(),
        currentMode: READING_MODES.FIRST_READ,
        narrationEnabled: true,
        currentSpeed: 'NORMAL',
        currentWordIndex: 0,
        wordsHeard: new Set()
      },

      // Comprehension
      comprehension: {
        checksCompleted: new Set(),
        responses: [],
        currentCheckId: null
      },

      // Completion
      completion: {
        storyFinished: false,
        celebrationSeen: false,
        reflectionResponse: null,
        predictionReviewed: false,
        gameUnlocked: false
      },

      // Re-reading
      reReading: {
        timesCompleted: 0,
        modesUsed: new Set(),
        recordings: []
      },

      // Mini-game
      miniGame: {
        played: false,
        completed: false,
        score: 0,
        wordsFound: new Set()
      },

      // Session metrics
      metrics: {
        sessionStartTime: Date.now(),
        phaseStartTime: Date.now(),
        totalReadingTimeMs: 0,
        wordsTapped: 0,
        hintsUsed: 0
      }
    };
  }

  // Phase transitions
  setPhase(newPhase) {
    this.state.previousPhase = this.state.currentPhase;
    this.state.currentPhase = newPhase;
    this.state.metrics.phaseStartTime = Date.now();

    console.log(`[Session] Phase: ${this.state.previousPhase} -> ${newPhase}`);
    return this.state;
  }

  // Pre-reading actions
  markVocabularyWordReviewed(word) {
    this.state.preReading.wordsReviewed.add(word);
    this.state.preReading.vocabularyComplete =
      this.state.preReading.wordsReviewed.size >= CONFIG.minVocabularyWords;
    return this.state;
  }

  setPrediction(predictionId) {
    this.state.preReading.predictionMade = predictionId;
    return this.state;
  }

  markCharacterSeen(characterName) {
    this.state.preReading.characterIntrosSeen.add(characterName);
    return this.state;
  }

  // Reading actions
  setCurrentPage(pageNumber) {
    this.state.reading.currentPage = pageNumber;
    return this.state;
  }

  markPageCompleted(pageNumber) {
    this.state.reading.pagesCompleted.add(pageNumber);
    return this.state;
  }

  setReadingMode(mode) {
    this.state.reading.currentMode = mode;
    if (mode !== READING_MODES.FIRST_READ) {
      this.state.reReading.modesUsed.add(mode);
    }
    return this.state;
  }

  setNarrationSpeed(speed) {
    this.state.reading.currentSpeed = speed;
    return this.state;
  }

  setCurrentWordIndex(index) {
    this.state.reading.currentWordIndex = index;
    return this.state;
  }

  markWordHeard(wordIndex) {
    this.state.reading.wordsHeard.add(wordIndex);
    this.state.metrics.wordsTapped++;
    return this.state;
  }

  // Comprehension actions
  startComprehensionCheck(checkId) {
    this.state.comprehension.currentCheckId = checkId;
    return this.state;
  }

  recordComprehensionResponse(checkId, response) {
    this.state.comprehension.responses.push({
      checkId,
      ...response,
      timestamp: Date.now()
    });
    this.state.comprehension.checksCompleted.add(checkId);
    this.state.comprehension.currentCheckId = null;
    return this.state;
  }

  // Completion actions
  markStoryFinished() {
    this.state.completion.storyFinished = true;
    this.state.metrics.totalReadingTimeMs =
      Date.now() - this.state.metrics.sessionStartTime;
    return this.state;
  }

  markCelebrationSeen() {
    this.state.completion.celebrationSeen = true;
    return this.state;
  }

  setReflectionResponse(response) {
    this.state.completion.reflectionResponse = response;
    return this.state;
  }

  markPredictionReviewed() {
    this.state.completion.predictionReviewed = true;
    return this.state;
  }

  unlockMiniGame() {
    this.state.completion.gameUnlocked = true;
    return this.state;
  }

  // Re-reading actions
  incrementRereadCount() {
    this.state.reReading.timesCompleted++;
    return this.state;
  }

  saveRecording(recordingData) {
    this.state.reReading.recordings.push({
      ...recordingData,
      timestamp: Date.now()
    });
    return this.state;
  }

  // Mini-game actions
  recordMiniGameProgress(score, wordsFound) {
    this.state.miniGame.played = true;
    this.state.miniGame.score = Math.max(this.state.miniGame.score, score);
    wordsFound.forEach(w => this.state.miniGame.wordsFound.add(w));
    return this.state;
  }

  completeMiniGame() {
    this.state.miniGame.completed = true;
    return this.state;
  }

  // Metrics
  recordHintUsed() {
    this.state.metrics.hintsUsed++;
    return this.state;
  }

  // Serialization for persistence
  toJSON() {
    const state = { ...this.state };
    // Convert Sets to arrays for JSON
    state.preReading.wordsReviewed = [...this.state.preReading.wordsReviewed];
    state.preReading.characterIntrosSeen = [...this.state.preReading.characterIntrosSeen];
    state.reading.pagesCompleted = [...this.state.reading.pagesCompleted];
    state.reading.wordsHeard = [...this.state.reading.wordsHeard];
    state.comprehension.checksCompleted = [...this.state.comprehension.checksCompleted];
    state.reReading.modesUsed = [...this.state.reReading.modesUsed];
    state.miniGame.wordsFound = [...this.state.miniGame.wordsFound];
    return state;
  }

  fromJSON(json) {
    this.state = json;
    // Convert arrays back to Sets
    this.state.preReading.wordsReviewed = new Set(json.preReading.wordsReviewed);
    this.state.preReading.characterIntrosSeen = new Set(json.preReading.characterIntrosSeen);
    this.state.reading.pagesCompleted = new Set(json.reading.pagesCompleted);
    this.state.reading.wordsHeard = new Set(json.reading.wordsHeard);
    this.state.comprehension.checksCompleted = new Set(json.comprehension.checksCompleted);
    this.state.reReading.modesUsed = new Set(json.reReading.modesUsed);
    this.state.miniGame.wordsFound = new Set(json.miniGame.wordsFound);
    return this.state;
  }
}

// ============================================
// 4. READING FLOW CONTROLLER
// ============================================

class ReadingFlowController {
  constructor(storyData, options = {}) {
    this.story = storyData;
    this.session = new ReadingSessionState(storyData.id);

    this.config = {
      autoPlayNarration: true,
      showComprehensionHints: true,
      allowSkipPreReading: false,
      ...options
    };

    // UI callbacks
    this.onPhaseChange = null;
    this.onPageChange = null;
    this.onWordHighlight = null;
    this.onComprehensionStart = null;
    this.onComprehensionComplete = null;
    this.onStoryComplete = null;
    this.onMiniGameUnlock = null;

    // Audio engine reference
    this.audioEngine = null;

    console.log(`[Flow] Initialized with story: ${storyData.title}`);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Start the reading experience from the beginning
   */
  start() {
    this.session.reset();
    this._goToPhase(READING_PHASES.PRE_READ_VOCABULARY);
  }

  /**
   * Resume from a saved session
   */
  resume(savedState) {
    this.session.fromJSON(savedState);
    this._goToPhase(this.session.state.currentPhase);
  }

  // ============================================
  // PHASE NAVIGATION
  // ============================================

  _goToPhase(phase) {
    this.session.setPhase(phase);

    if (this.onPhaseChange) {
      this.onPhaseChange(phase, this._getPhaseData(phase));
    }
  }

  _getPhaseData(phase) {
    switch (phase) {
      case READING_PHASES.PRE_READ_VOCABULARY:
        return {
          words: this.story.preReading.vocabulary,
          reviewed: [...this.session.state.preReading.wordsReviewed],
          isComplete: this.session.state.preReading.vocabularyComplete
        };

      case READING_PHASES.PRE_READ_PREDICTION:
        return {
          coverImage: this.story.preReading.coverImage,
          storyTitle: this.story.title,
          predictions: this.story.preReading.predictions,
          selected: this.session.state.preReading.predictionMade
        };

      case READING_PHASES.PRE_READ_CHARACTERS:
        return {
          characters: this.story.preReading.characters,
          seen: [...this.session.state.preReading.characterIntrosSeen]
        };

      case READING_PHASES.FIRST_READ:
      case READING_PHASES.REREAD_ECHO:
      case READING_PHASES.REREAD_YOUR_TURN:
      case READING_PHASES.REREAD_RECORD:
        const pageNum = this.session.state.reading.currentPage;
        return {
          page: this.story.pages[pageNum - 1],
          pageNumber: pageNum,
          totalPages: this.story.pages.length,
          mode: this.session.state.reading.currentMode,
          speed: this.session.state.reading.currentSpeed,
          narrationEnabled: this.session.state.reading.narrationEnabled,
          isFirstRead: phase === READING_PHASES.FIRST_READ
        };

      case READING_PHASES.COMPREHENSION_CHECK:
        const checkId = this.session.state.comprehension.currentCheckId;
        const check = this.story.comprehensionChecks.find(c => c.id === checkId);
        return { check };

      case READING_PHASES.COMPLETION_CELEBRATION:
        return {
          message: this.story.completion.celebrationMessage,
          stats: this._getCompletionStats()
        };

      case READING_PHASES.COMPLETION_REFLECTION:
        return {
          options: this.story.completion.reflectionOptions,
          allowVoice: true
        };

      case READING_PHASES.COMPLETION_PREDICTION_REVIEW:
        return {
          prediction: this.session.state.preReading.predictionMade,
          predictionText: this._getPredictionText(),
          outcome: this.story.completion.predictionOutcome
        };

      case READING_PHASES.COMPLETION_UNLOCK:
        return {
          miniGame: this.story.miniGame
        };

      case READING_PHASES.REREAD_SELECT:
        return {
          modesAvailable: [
            READING_MODES.ECHO,
            READING_MODES.YOUR_TURN,
            READING_MODES.RECORD
          ],
          modesUsed: [...this.session.state.reReading.modesUsed]
        };

      case READING_PHASES.MINI_GAME:
        return {
          game: this.story.miniGame,
          previousScore: this.session.state.miniGame.score,
          wordsFound: [...this.session.state.miniGame.wordsFound]
        };

      default:
        return {};
    }
  }

  _getPredictionText() {
    const predId = this.session.state.preReading.predictionMade;
    const pred = this.story.preReading.predictions.find(p => p.id === predId);
    return pred ? pred.text : 'Unknown';
  }

  _getCompletionStats() {
    return {
      pagesRead: this.story.pages.length,
      wordsRead: this.story.metadata.wordCount,
      comprehensionCorrect: this.session.state.comprehension.responses
        .filter(r => r.correct).length,
      comprehensionTotal: this.story.comprehensionChecks.length,
      dragonScalesEarned: this.story.completion.dragonScalesEarned,
      readingTimeMinutes: Math.round(
        this.session.state.metrics.totalReadingTimeMs / 60000
      )
    };
  }

  // ============================================
  // PRE-READING PHASE HANDLERS
  // ============================================

  /**
   * Mark a vocabulary word as reviewed
   */
  reviewVocabularyWord(word) {
    this.session.markVocabularyWordReviewed(word);

    if (this.session.state.preReading.vocabularyComplete) {
      console.log('[Flow] Vocabulary complete');
    }

    return this.session.state.preReading;
  }

  /**
   * Complete vocabulary phase and move to prediction
   */
  completeVocabulary() {
    if (!this.session.state.preReading.vocabularyComplete &&
        !this.config.allowSkipPreReading) {
      console.warn('[Flow] Cannot complete vocabulary - not all words reviewed');
      return false;
    }

    this._goToPhase(READING_PHASES.PRE_READ_PREDICTION);
    return true;
  }

  /**
   * Record prediction and move to character intro
   */
  makePrediction(predictionId) {
    this.session.setPrediction(predictionId);
    this._goToPhase(READING_PHASES.PRE_READ_CHARACTERS);
  }

  /**
   * Skip prediction (always allowed)
   */
  skipPrediction() {
    this._goToPhase(READING_PHASES.PRE_READ_CHARACTERS);
  }

  /**
   * Mark character intro as seen
   */
  viewCharacterIntro(characterName) {
    this.session.markCharacterSeen(characterName);
    return this.session.state.preReading.characterIntrosSeen;
  }

  /**
   * Complete pre-reading and start story
   */
  startReading() {
    this.session.setReadingMode(READING_MODES.FIRST_READ);
    this.session.setCurrentPage(1);
    this._goToPhase(READING_PHASES.FIRST_READ);
  }

  // ============================================
  // READING PHASE HANDLERS
  // ============================================

  /**
   * Move to next page
   */
  nextPage() {
    const currentPage = this.session.state.reading.currentPage;
    const totalPages = this.story.pages.length;

    // Mark current page as completed
    this.session.markPageCompleted(currentPage);

    // Check if we need a comprehension check
    if (this._shouldDoComprehensionCheck(currentPage)) {
      this._startComprehensionCheck(currentPage);
      return;
    }

    // Check if story is complete
    if (currentPage >= totalPages) {
      this._completeStory();
      return;
    }

    // Go to next page
    this.session.setCurrentPage(currentPage + 1);

    if (this.onPageChange) {
      this.onPageChange(currentPage + 1, this.story.pages[currentPage]);
    }
  }

  /**
   * Move to previous page
   */
  previousPage() {
    const currentPage = this.session.state.reading.currentPage;

    if (currentPage > 1) {
      this.session.setCurrentPage(currentPage - 1);

      if (this.onPageChange) {
        this.onPageChange(currentPage - 1, this.story.pages[currentPage - 2]);
      }
    }
  }

  /**
   * Jump to specific page (for re-reading modes)
   */
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.story.pages.length) {
      this.session.setCurrentPage(pageNumber);

      if (this.onPageChange) {
        this.onPageChange(pageNumber, this.story.pages[pageNumber - 1]);
      }
    }
  }

  /**
   * Handle word tap (hear pronunciation)
   */
  tapWord(wordIndex) {
    this.session.markWordHeard(wordIndex);

    // Audio engine should handle pronunciation
    // Return word data for UI feedback
    const page = this.story.pages[this.session.state.reading.currentPage - 1];
    const word = this._getWordAtIndex(page, wordIndex);

    return word;
  }

  /**
   * Update current word highlight (for narration sync)
   */
  updateWordHighlight(wordIndex) {
    this.session.setCurrentWordIndex(wordIndex);

    if (this.onWordHighlight) {
      this.onWordHighlight(wordIndex);
    }
  }

  /**
   * Change narration speed
   */
  setSpeed(speedKey) {
    if (NARRATION_SPEEDS[speedKey]) {
      this.session.setNarrationSpeed(speedKey);
      return NARRATION_SPEEDS[speedKey];
    }
    return null;
  }

  /**
   * Toggle narration on/off
   */
  toggleNarration() {
    this.session.state.reading.narrationEnabled =
      !this.session.state.reading.narrationEnabled;
    return this.session.state.reading.narrationEnabled;
  }

  // ============================================
  // COMPREHENSION CHECK HANDLERS
  // ============================================

  _shouldDoComprehensionCheck(pageNumber) {
    // Only during first read
    if (this.session.state.reading.currentMode !== READING_MODES.FIRST_READ) {
      return false;
    }

    // Find check for this page
    const check = this.story.comprehensionChecks.find(c =>
      c.afterPage === pageNumber &&
      !this.session.state.comprehension.checksCompleted.has(c.id)
    );

    return !!check;
  }

  _startComprehensionCheck(afterPage) {
    const check = this.story.comprehensionChecks.find(c =>
      c.afterPage === afterPage
    );

    if (check) {
      this.session.startComprehensionCheck(check.id);
      this._goToPhase(READING_PHASES.COMPREHENSION_CHECK);

      if (this.onComprehensionStart) {
        this.onComprehensionStart(check);
      }
    }
  }

  /**
   * Submit answer for comprehension check
   */
  submitComprehensionAnswer(wordTapped, wordIndex) {
    const checkId = this.session.state.comprehension.currentCheckId;
    const check = this.story.comprehensionChecks.find(c => c.id === checkId);

    if (!check) return null;

    const isCorrect = wordTapped.toLowerCase() === check.correctAnswer.toLowerCase();

    const response = {
      wordTapped,
      wordIndex,
      correct: isCorrect,
      attemptNumber: this._getAttemptCount(checkId) + 1
    };

    if (isCorrect) {
      this.session.recordComprehensionResponse(checkId, response);

      if (this.onComprehensionComplete) {
        this.onComprehensionComplete(check, response);
      }

      return {
        correct: true,
        feedback: check.feedback.correct,
        canContinue: true
      };
    } else {
      // Wrong answer
      const feedback = check.feedback.wrongResponses[wordTapped] ||
                       check.feedback.wrongResponses.default;

      return {
        correct: false,
        feedback: feedback,
        canContinue: false,
        attemptsRemaining: CONFIG.maxComprehensionAttempts - response.attemptNumber
      };
    }
  }

  /**
   * Request hint for comprehension
   */
  requestComprehensionHint() {
    const checkId = this.session.state.comprehension.currentCheckId;
    const check = this.story.comprehensionChecks.find(c => c.id === checkId);

    if (!check) return null;

    this.session.recordHintUsed();

    const hintIndex = Math.min(
      this.session.state.metrics.hintsUsed - 1,
      check.feedback.hints.length - 1
    );

    return check.feedback.hints[hintIndex];
  }

  /**
   * Continue reading after comprehension check
   */
  continueAfterComprehension() {
    const currentPage = this.session.state.reading.currentPage;
    const totalPages = this.story.pages.length;

    if (currentPage >= totalPages) {
      this._completeStory();
    } else {
      this.session.setCurrentPage(currentPage + 1);
      this._goToPhase(READING_PHASES.FIRST_READ);
    }
  }

  _getAttemptCount(checkId) {
    return this.session.state.comprehension.responses
      .filter(r => r.checkId === checkId).length;
  }

  // ============================================
  // STORY COMPLETION HANDLERS
  // ============================================

  _completeStory() {
    this.session.markStoryFinished();
    this._goToPhase(READING_PHASES.COMPLETION_CELEBRATION);

    if (this.onStoryComplete) {
      this.onStoryComplete(this._getCompletionStats());
    }
  }

  /**
   * Proceed from celebration to reflection
   */
  completeCelebration() {
    this.session.markCelebrationSeen();
    this._goToPhase(READING_PHASES.COMPLETION_REFLECTION);
  }

  /**
   * Submit reflection response
   */
  submitReflection(response) {
    this.session.setReflectionResponse(response);
    this._goToPhase(READING_PHASES.COMPLETION_PREDICTION_REVIEW);
  }

  /**
   * Skip reflection
   */
  skipReflection() {
    this._goToPhase(READING_PHASES.COMPLETION_PREDICTION_REVIEW);
  }

  /**
   * Complete prediction review
   */
  completePredictionReview() {
    this.session.markPredictionReviewed();
    this.session.unlockMiniGame();
    this._goToPhase(READING_PHASES.COMPLETION_UNLOCK);

    if (this.onMiniGameUnlock) {
      this.onMiniGameUnlock(this.story.miniGame);
    }
  }

  // ============================================
  // RE-READ HANDLERS
  // ============================================

  /**
   * Go to re-read mode selection
   */
  chooseRereadMode() {
    this._goToPhase(READING_PHASES.REREAD_SELECT);
  }

  /**
   * Start specific re-read mode
   */
  startRereadMode(mode) {
    this.session.setReadingMode(mode);
    this.session.setCurrentPage(1);

    switch (mode) {
      case READING_MODES.ECHO:
        this._goToPhase(READING_PHASES.REREAD_ECHO);
        break;
      case READING_MODES.YOUR_TURN:
        this._goToPhase(READING_PHASES.REREAD_YOUR_TURN);
        break;
      case READING_MODES.RECORD:
        this._goToPhase(READING_PHASES.REREAD_RECORD);
        break;
    }
  }

  /**
   * Complete a re-read session
   */
  completeReread() {
    this.session.incrementRereadCount();
    this._goToPhase(READING_PHASES.COMPLETION_UNLOCK);
  }

  /**
   * Save a recording (for record mode)
   */
  saveRecording(audioBlob, metadata = {}) {
    this.session.saveRecording({
      blob: audioBlob,
      duration: metadata.duration,
      pages: metadata.pages
    });
  }

  // ============================================
  // MINI-GAME HANDLERS
  // ============================================

  /**
   * Start mini-game
   */
  startMiniGame() {
    this._goToPhase(READING_PHASES.MINI_GAME);
  }

  /**
   * Update mini-game progress
   */
  updateMiniGameProgress(score, wordsFound) {
    this.session.recordMiniGameProgress(score, wordsFound);
  }

  /**
   * Complete mini-game
   */
  completeMiniGame() {
    this.session.completeMiniGame();
    this._goToPhase(READING_PHASES.COMPLETION_UNLOCK);
  }

  /**
   * Return to main menu
   */
  returnToLobby() {
    this._goToPhase(READING_PHASES.LOBBY);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  _getWordAtIndex(page, index) {
    let currentIndex = 0;

    for (const paragraph of page.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const word of sentence.words) {
          if (currentIndex === index) {
            return word;
          }
          currentIndex++;
        }
      }
    }

    return null;
  }

  /**
   * Get current session state for saving
   */
  getSessionState() {
    return this.session.toJSON();
  }

  /**
   * Get current phase info for UI rendering
   */
  getCurrentPhaseInfo() {
    return {
      phase: this.session.state.currentPhase,
      data: this._getPhaseData(this.session.state.currentPhase)
    };
  }
}

// ============================================
// 5. UI COMPONENT HELPERS
// ============================================

/**
 * Generate HTML for vocabulary card
 */
function createVocabularyCardHTML(word, isReviewed) {
  return `
    <div class="vocabulary-card ${isReviewed ? 'reviewed' : ''}"
         data-word="${word.word}"
         tabindex="0"
         role="button"
         aria-label="Learn the word ${word.word}">
      <div class="vocab-image">
        <img src="${word.image}" alt="${word.word}" loading="lazy">
      </div>
      <div class="vocab-word">${word.word}</div>
      <div class="vocab-syllables">${word.syllables.join(' - ')}</div>
      ${isReviewed ? '<div class="vocab-check" aria-label="Reviewed">&#10003;</div>' : ''}
    </div>
  `;
}

/**
 * Generate HTML for prediction option
 */
function createPredictionOptionHTML(prediction, isSelected) {
  return `
    <button class="prediction-option ${isSelected ? 'selected' : ''}"
            data-prediction-id="${prediction.id}"
            aria-pressed="${isSelected}">
      <span class="prediction-icon">${prediction.icon}</span>
      <span class="prediction-text">${prediction.text}</span>
    </button>
  `;
}

/**
 * Generate HTML for comprehension passage with tappable words
 */
function createComprehensionPassageHTML(passage, words) {
  let html = '<p class="comprehension-passage">';

  words.forEach((word, index) => {
    html += `<span class="comp-word"
                   data-word="${word.text.toLowerCase().replace(/[^a-z]/g, '')}"
                   data-index="${index}"
                   tabindex="0"
                   role="button">${word.text}</span> `;
  });

  html += '</p>';
  return html;
}

/**
 * Generate HTML for reading mode indicator
 */
function createModeIndicatorHTML(mode) {
  const modeConfig = {
    [READING_MODES.FIRST_READ]: { icon: '&#128266;', label: 'Reading Together' },
    [READING_MODES.ECHO]: { icon: '&#128264;&#128264;', label: 'Echo Reading' },
    [READING_MODES.YOUR_TURN]: { icon: '&#128100;', label: 'Your Turn' },
    [READING_MODES.RECORD]: { icon: '&#127908;', label: 'Recording' }
  };

  const config = modeConfig[mode] || modeConfig[READING_MODES.FIRST_READ];

  return `
    <div class="mode-indicator mode-${mode}">
      <span class="mode-icon">${config.icon}</span>
      <span class="mode-label">${config.label}</span>
    </div>
  `;
}

// ============================================
// 6. EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    READING_PHASES,
    READING_MODES,
    NARRATION_SPEEDS,
    CONFIG,
    STORY_TEMPLATE,
    ReadingSessionState,
    ReadingFlowController,
    createVocabularyCardHTML,
    createPredictionOptionHTML,
    createComprehensionPassageHTML,
    createModeIndicatorHTML
  };
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.ReadingExperienceFlow = {
    READING_PHASES,
    READING_MODES,
    NARRATION_SPEEDS,
    CONFIG,
    STORY_TEMPLATE,
    ReadingSessionState,
    ReadingFlowController,
    createVocabularyCardHTML,
    createPredictionOptionHTML,
    createComprehensionPassageHTML,
    createModeIndicatorHTML
  };
}
