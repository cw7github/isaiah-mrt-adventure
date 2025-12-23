/**
 * Integration Example: How to use the Read Page Component in your app
 *
 * This file shows how to integrate the Read Page component with your
 * existing MRT Food Adventure application.
 */

// ========================================
// EXAMPLE 1: Navigate to Read Page from Restaurant Screen
// ========================================

function startReadingLesson(stationData) {
  // Convert your station data to Read Page format
  const pages = [
    {
      emoji: stationData.image || '📖',
      backgroundImage: stationData.ui?.imagePrompt || '',
      tip: stationData.readingTip || 'Tap each word to hear it!',
      words: parseWordsFromSentence(
        stationData.sentence,
        stationData.sightWordFocus,
        stationData.targetWords || []
      )
    }
  ];

  // Navigate to read page screen
  goToScreen('readPageScreen');

  // Initialize the read page
  ReadPage.init(pages);
}

// Helper function to convert sentence into word objects
function parseWordsFromSentence(sentence, sightWord, targetWords) {
  const words = sentence.split(' ');

  return words.map((wordText, index) => {
    // Remove punctuation for comparison
    const cleanWord = wordText.replace(/[.,!?]/g, '').toLowerCase();

    return {
      text: wordText,
      isSightWord: cleanWord === sightWord?.toLowerCase(),
      isTargetWord: targetWords.some(tw => cleanWord === tw.toLowerCase()),
      index: index
    };
  });
}

// ========================================
// EXAMPLE 2: Create Multi-Page Story from Station Pages
// ========================================

function createStoryFromPages(stationPages) {
  const pages = stationPages.map(page => ({
    emoji: page.image || '📖',
    backgroundImage: page.ui?.imagePrompt || '',
    tip: page.readingTip || 'Keep reading!',
    sentence: page.sentence
  }));

  goToScreen('readPageScreen');
  ReadPage.init(pages);
}

// ========================================
// EXAMPLE 3: Add to Existing Station Flow
// ========================================

// Modify your existing loadStation function:
function loadStationWithReadPage(station) {
  // ... existing station loading code ...

  // Before showing restaurant screen, show read page first
  if (station.useReadPage) {
    const readPages = [{
      emoji: station.image,
      backgroundImage: station.ui?.imagePrompt,
      tip: station.readingTip,
      words: parseWordsFromSentence(
        station.sentence,
        station.sightWordFocus,
        station.targetWords
      )
    }];

    goToScreen('readPageScreen');
    ReadPage.init(readPages);

    // When user clicks "Next" on read page, go to restaurant
    document.getElementById('readNextBtn').onclick = () => {
      goToScreen('restaurantScreen');
      // ... continue with normal flow ...
    };
  } else {
    // Use existing restaurant screen
    goToScreen('restaurantScreen');
  }
}

// ========================================
// EXAMPLE 4: Add Read Page Option to Settings
// ========================================

// Add a toggle in settings to use Read Page mode
const settings = {
  useReadPage: true,  // Toggle between read page and restaurant screen
  readingSpeed: 'normal'
};

// Update your station navigation to check this setting
function navigateToStation(station) {
  if (settings.useReadPage) {
    // Use new Read Page component
    showReadPageForStation(station);
  } else {
    // Use existing restaurant screen
    showRestaurantScreen(station);
  }
}

function showReadPageForStation(station) {
  const pages = [{
    emoji: station.image,
    backgroundImage: station.ui?.imagePrompt,
    tip: station.readingTip || 'Tap each word to hear it!',
    words: parseWordsFromSentence(
      station.sentence,
      station.sightWordFocus,
      station.targetWords || []
    )
  }];

  goToScreen('readPageScreen');
  ReadPage.init(pages);

  // Set speed from settings
  document.querySelector(`[data-speed="${settings.readingSpeed}"]`)?.click();
}

// ========================================
// EXAMPLE 5: Custom Event Handlers
// ========================================

// Listen for when user finishes reading a page
document.getElementById('readNextBtn').addEventListener('click', () => {
  console.log('User finished reading page');
  // Track progress, award points, etc.

  // Example: Award completion points
  awardReadingPoints(10);

  // Example: Save progress
  saveReadingProgress();
});

// Listen for word taps to track engagement
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('read-word')) {
    const word = e.target.dataset.word;
    console.log('User tapped word:', word);

    // Track which words the user is practicing
    trackWordPractice(word);
  }
});

// ========================================
// EXAMPLE 6: Dynamic Content Loading
// ========================================

// Load pages from your data structure
async function loadLessonPages(lessonId) {
  // Fetch lesson data (from your existing data source)
  const lesson = await fetchLesson(lessonId);

  // Convert to Read Page format
  const pages = lesson.pages.map(page => ({
    emoji: page.emoji,
    backgroundImage: page.backgroundImage,
    tip: page.tip,
    words: page.words.map((word, index) => ({
      text: word.text,
      isSightWord: word.type === 'sight',
      isTargetWord: word.type === 'target',
      audioUrl: word.audioUrl, // Optional custom audio
      index: index
    }))
  }));

  // Show the read page
  goToScreen('readPageScreen');
  ReadPage.init(pages);
}

// ========================================
// EXAMPLE 7: Add Audio Support
// ========================================

// If you have pre-recorded audio files for words:
function createPagesWithAudio(sentences, audioMap) {
  return sentences.map(sentence => ({
    emoji: sentence.emoji,
    tip: sentence.tip,
    words: sentence.text.split(' ').map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();

      return {
        text: word,
        isSightWord: sentence.sightWords?.includes(cleanWord),
        isTargetWord: sentence.targetWords?.includes(cleanWord),
        audioUrl: audioMap[cleanWord], // Map word to audio file
        index: index
      };
    })
  }));
}

// Example usage:
const audioMap = {
  'apple': 'audio/words/apple.mp3',
  'pizza': 'audio/words/pizza.mp3',
  'noodle': 'audio/words/noodle.mp3'
};

const lessonSentences = [
  {
    emoji: '🍎',
    tip: 'What fruit do you see?',
    text: 'I want an apple',
    sightWords: ['i', 'want', 'an'],
    targetWords: ['apple']
  }
];

const pagesWithAudio = createPagesWithAudio(lessonSentences, audioMap);
ReadPage.init(pagesWithAudio);

// ========================================
// EXAMPLE 8: Progress Tracking
// ========================================

// Track reading completion
let readingProgress = {
  currentPage: 0,
  totalPages: 0,
  wordsRead: [],
  timeSpent: 0
};

function initReadPageWithTracking(pages) {
  readingProgress.totalPages = pages.length;
  readingProgress.currentPage = 0;
  readingProgress.wordsRead = [];
  readingProgress.startTime = Date.now();

  ReadPage.init(pages);

  // Track page changes
  const originalNext = ReadPage.next;
  ReadPage.next = function() {
    readingProgress.currentPage++;
    originalNext.call(this);

    // Check if completed all pages
    if (readingProgress.currentPage >= readingProgress.totalPages) {
      onReadingComplete();
    }
  };
}

function onReadingComplete() {
  readingProgress.timeSpent = Date.now() - readingProgress.startTime;

  console.log('Reading completed!', {
    pages: readingProgress.totalPages,
    wordsRead: readingProgress.wordsRead.length,
    timeSpent: readingProgress.timeSpent / 1000 + ' seconds'
  });

  // Award completion reward
  showRewardScreen();
}

// ========================================
// EXAMPLE 9: Integration with Existing Data
// ========================================

// Use your existing STATIONS data
const STATIONS = [
  {
    name: "Fruit Stand",
    sentence: "I want an apple",
    sightWordFocus: "want",
    targetWords: ["apple"],
    image: "🍎",
    ui: { imagePrompt: "assets/food_fruit.jpeg" },
    readingTip: "Tap each word to hear it!"
  }
  // ... more stations
];

// Convert station to read page
function stationToReadPage(station) {
  return {
    emoji: station.image,
    backgroundImage: station.ui?.imagePrompt,
    tip: station.readingTip || 'Read along!',
    words: station.sentence.split(' ').map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
      return {
        text: word,
        isSightWord: cleanWord === station.sightWordFocus?.toLowerCase(),
        isTargetWord: station.targetWords?.some(tw =>
          cleanWord === tw.toLowerCase()
        ),
        index: index
      };
    })
  };
}

// Load a station into read page
function loadStation(stationIndex) {
  const station = STATIONS[stationIndex];
  const page = stationToReadPage(station);

  goToScreen('readPageScreen');
  ReadPage.init([page]);
}

// ========================================
// READY TO USE!
// ========================================

console.log('Read Page Integration Examples Loaded');
console.log('Available functions:');
console.log('  - startReadingLesson(stationData)');
console.log('  - createStoryFromPages(pages)');
console.log('  - loadStationWithReadPage(station)');
console.log('  - showReadPageForStation(station)');
console.log('  - loadLessonPages(lessonId)');
console.log('  - loadStation(stationIndex)');
