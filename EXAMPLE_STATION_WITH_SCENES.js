// EXAMPLE: Fruit Station with Ghibli Scene Backgrounds
// This shows how to update the stationContent in index.html

// BEFORE (original with emojis):
const fruitStationBefore = {
  name: 'Fruit Stand',
  icon: '🍎',
  level: 1,
  floor: 3,
  stickers: ['🍎', '🍊', '🍌', '⭐'],
  sightWords: ['I', 'see', 'a', 'the', 'is', 'my', 'want', 'like', 'can', 'good'],
  previewWords: [
    { word: 'apple', icon: '🍎', isSightWord: false, phonicsNote: 'a-p-p-le' },
    { word: 'red', icon: '🔴', isSightWord: false, phonicsNote: 'r-e-d (CVC)' },
    { word: 'want', icon: '👆', isSightWord: true },
    { word: 'see', icon: '👀', isSightWord: true }
  ],
  pages: [
    {
      type: 'read',
      image: '🚂🍎',  // OLD: Just emojis
      sentence: 'I am at the fruit stand.',
      words: ['I', 'am', 'at', 'the', 'fruit', 'stand.'],
      targetWords: ['I', 'am', 'at', 'the', 'fruit'],
      sightWordFocus: 'the',
      readingTip: 'Point to each word as you read. Tap the word the.'
    },
    {
      type: 'read',
      image: '🍎🍊🍌',  // OLD: Just emojis
      sentence: 'I see red apples. I see big oranges. I see yellow bananas.',
      words: ['I', 'see', 'red', 'apples.', 'I', 'see', 'big', 'oranges.', 'I', 'see', 'yellow', 'bananas.'],
      targetWords: ['see', 'red', 'apples', 'big', 'oranges', 'yellow', 'bananas'],
      sightWordFocus: 'see',
      readingTip: 'Notice the pattern. I see a color and a fruit.'
    },
    // ... more pages ...
  ]
};

// AFTER (updated with Ghibli scene backgrounds):
const fruitStationAfter = {
  name: 'Fruit Stand',
  icon: '🍎',
  level: 1,
  floor: 3,
  stickers: ['🍎', '🍊', '🍌', '⭐'],
  sightWords: ['I', 'see', 'a', 'the', 'is', 'my', 'want', 'like', 'can', 'good'],
  previewWords: [
    { word: 'apple', icon: '🍎', isSightWord: false, phonicsNote: 'a-p-p-le' },
    { word: 'red', icon: '🔴', isSightWord: false, phonicsNote: 'r-e-d (CVC)' },
    { word: 'want', icon: '👆', isSightWord: true },
    { word: 'see', icon: '👀', isSightWord: true }
  ],
  pages: [
    {
      type: 'read',
      image: 'assets/scenes/fruit_arrival.png',  // NEW: Beautiful Ghibli background
      backgroundImage: true,                      // NEW: Flag for background rendering
      sentence: 'I am at the fruit stand.',
      words: ['I', 'am', 'at', 'the', 'fruit', 'stand.'],
      targetWords: ['I', 'am', 'at', 'the', 'fruit'],
      sightWordFocus: 'the',
      readingTip: 'Point to each word as you read. Tap the word the.'
    },
    {
      type: 'read',
      image: 'assets/scenes/fruit_exploring.png', // NEW: Fruit displays scene
      backgroundImage: true,                       // NEW: Flag for background rendering
      sentence: 'I see red apples. I see big oranges. I see yellow bananas.',
      words: ['I', 'see', 'red', 'apples.', 'I', 'see', 'big', 'oranges.', 'I', 'see', 'yellow', 'bananas.'],
      targetWords: ['see', 'red', 'apples', 'big', 'oranges', 'yellow', 'bananas'],
      sightWordFocus: 'see',
      readingTip: 'Notice the pattern. I see a color and a fruit.'
    },
    {
      type: 'read',
      image: '👦🤔',           // KEPT: Emoji for character emotion (optional)
      backgroundImage: false,  // Not a background image
      sentence: 'I want a fruit. What do I want?',
      words: ['I', 'want', 'a', 'fruit.', 'What', 'do', 'I', 'want?'],
      targetWords: ['want', 'fruit', 'What'],
      sightWordFocus: 'want',
      readingTip: 'Tap the word want. Then find want in the sentence.'
    },
    {
      type: 'menu',
      prompt: 'Pick your fruit!',
      menuStory: 'The fruit looks so good. What fruit do you want?',
      items: [
        { name: 'Apple', icon: '🍎', description: 'Red and round' },
        { name: 'Orange', icon: '🍊', description: 'Big and juicy' },
        { name: 'Banana', icon: '🍌', description: 'Yellow and sweet' }
      ]
    },
    {
      type: 'question',
      questionType: 'comprehension',
      questionMode: 'multipleChoice',
      question: 'Where am I?',
      passage: 'I am at the fruit stand.',
      comprehensionHint: 'Find the place in the sentence.',
      answers: [
        { name: 'At the fruit stand', icon: '🏪' },
        { name: 'At the zoo', icon: '🦁' },
        { name: 'At the beach', icon: '🏖️' }
      ],
      correctAnswerName: 'At the fruit stand',
      successMessage: 'Yes! You found the setting.'
    },
    {
      type: 'read',
      image: 'assets/scenes/fruit_enjoying.png',  // NEW: Final enjoyment scene
      backgroundImage: true,                       // NEW: Flag for background rendering
      sentence: 'My fruit is so good! I like it a lot.',
      words: ['My', 'fruit', 'is', 'so', 'good!', 'I', 'like', 'it', 'a', 'lot.'],
      targetWords: ['My', 'is', 'good', 'like', 'lot'],
      sightWordFocus: 'my',
      readingTip: 'My tells who has something. My fruit. My food. My book.'
    }
  ]
};

// ===== REQUIRED: Update showReadingPage function =====

// Find this function in index.html and update it:

function showReadingPage(page) {
  const sentenceImage = document.getElementById('sentenceImage');

  // NEW: Check if this is a background image
  if (page.backgroundImage === true) {
    // Display as background image
    sentenceImage.style.backgroundImage = `url('${page.image}')`;
    sentenceImage.style.backgroundSize = 'cover';
    sentenceImage.style.backgroundPosition = 'center';
    sentenceImage.style.backgroundRepeat = 'no-repeat';
    sentenceImage.textContent = ''; // Clear emoji text
    sentenceImage.classList.add('has-background');
  } else {
    // Display as emoji (legacy mode)
    sentenceImage.style.backgroundImage = 'none';
    sentenceImage.textContent = page.image;
    sentenceImage.classList.remove('has-background');
  }

  // Rest of the function stays the same...
  const station = stationContent[state.currentStation];
  const stationSightWords = station.sightWords || [];
  const focusSightWord = page.sightWordFocus || null;

  // Create clickable words
  const wordsContainer = document.getElementById('wordsContainer');
  wordsContainer.innerHTML = page.words
    .map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      const isSightWord = stationSightWords.includes(cleanWord);
      const isFocusWord = cleanWord === focusSightWord;
      const isTarget = page.targetWords?.includes(cleanWord) || page.targetWords?.includes(word);

      let classes = 'word-btn';
      if (isSightWord) classes += ' sight-word';
      if (isFocusWord) classes += ' focus-word';

      return `<button class="${classes}" onclick="speakWord('${cleanWord}')">${word}</button>`;
    })
    .join(' ');

  // Show reading tip if available
  const tipElement = document.getElementById('readingTip');
  if (page.readingTip) {
    tipElement.textContent = page.readingTip;
    tipElement.style.display = 'block';
  } else {
    tipElement.style.display = 'none';
  }

  document.getElementById('continueBtn').style.display = 'block';
}

// ===== REQUIRED: Add CSS for background images =====

/*
Add this to the <style> section in index.html:
*/

const newStyles = `
  .sentence-image {
    min-height: 300px;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }

  /* When displaying as background */
  .sentence-image.has-background {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Optional: Add subtle overlay for better text contrast */
  .sentence-image.has-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.15)
    );
    pointer-events: none;
  }

  /* When displaying as emoji (legacy) */
  .sentence-image:not(.has-background) {
    font-size: 4rem;
    padding: 2rem;
  }
`;

// ===== SCENE SUMMARY FOR ALL STATIONS =====

const allStationScenes = {
  fruit: {
    page1_arrival: 'assets/scenes/fruit_arrival.png',
    page2_exploring: 'assets/scenes/fruit_exploring.png',
    page6_enjoying: 'assets/scenes/fruit_enjoying.png'
  },
  drink: {
    page1_arrival: 'assets/scenes/drink_arrival.png',
    page2_exploring: 'assets/scenes/drink_exploring.png',
    page6_enjoying: 'assets/scenes/drink_enjoying.png'
  },
  bakery: {
    page1_arrival: 'assets/scenes/bakery_arrival.png',
    page2_exploring: 'assets/scenes/bakery_exploring.png',
    page6_enjoying: 'assets/scenes/bakery_enjoying.png'
  },
  pizza: {
    page1_arrival: 'assets/scenes/pizza_arrival.png',
    page2_exploring: 'assets/scenes/pizza_exploring.png',
    page6_enjoying: 'assets/scenes/pizza_enjoying.png'
  },
  icecream: {
    page1_arrival: 'assets/scenes/icecream_arrival.png',
    page2_exploring: 'assets/scenes/icecream_exploring.png',
    page6_enjoying: 'assets/scenes/icecream_enjoying.png'
  },
  fishshop: {
    page1_arrival: 'assets/scenes/fishshop_arrival.png',
    page2_exploring: 'assets/scenes/fishshop_exploring.png',
    page6_enjoying: 'assets/scenes/fishshop_enjoying.png'
  },
  cheese: {
    page1_arrival: 'assets/scenes/cheese_arrival.png',
    page2_exploring: 'assets/scenes/cheese_exploring.png',
    page6_enjoying: 'assets/scenes/cheese_enjoying.png'
  },
  noodle: {
    page1_arrival: 'assets/scenes/noodle_arrival.png',
    page2_exploring: 'assets/scenes/noodle_exploring.png',
    page6_enjoying: 'assets/scenes/noodle_enjoying.png'
  }
};

console.log('Total scenes needed:', Object.keys(allStationScenes).length * 3); // 24 scenes
