# Interactive Read Page Component

A beautiful, interactive reading component designed for Grade 1 learners with autism-friendly features.

## Features

### 1. Sentence Display
- **Large, clear text** - Appropriate font size for Grade 1 readers (clamp 1.75rem - 2.5rem)
- **Word-by-word tap-to-hear** - Each word is individually tappable with audio feedback
- **Visual highlighting** - Words glow and animate when tapped or spoken
- **Sight word focus** - Special gradient underline with subtle animation
- **Target words** - Bold and underlined for emphasis
- **Sequential fade-in** - Words appear one by one on page load

### 2. Word Interaction

The `createInteractiveWord()` function creates tappable word elements:

```javascript
function createInteractiveWord(word, options) {
  // options:
  //   - isSightWord: boolean - Adds special sight word styling
  //   - isTargetWord: boolean - Adds target word emphasis
  //   - audioUrl: string - Optional custom audio file
  //   - index: number - Word position for animation delay

  // Returns: HTMLElement - Tappable span element
}
```

Features:
- On tap: plays audio and shows sparkle animation
- Accessibility: keyboard navigation support (Enter/Space)
- Visual feedback: hover, active, and completed states
- ARIA labels for screen readers

### 3. Read-to-Me Feature

**Large speaker button** with the following capabilities:
- Reads entire sentence with word-by-word highlighting
- Karaoke-style sync (highlights each word as it's spoken)
- Adjustable speed (Normal or Slow)
- Pause/Resume capability
- Visual feedback (button changes color when playing)

### 4. Visual Elements

- **Station-themed background** - Subtle, semi-transparent background image
- **Large emoji display** - Animated bouncing emoji (4-8rem size)
- **Reading tip box** - Friendly callout with glowing lightbulb icon
- **Page progress indicator** - Dots showing current page and completion status

### 5. Animations

All animations respect `calm-mode` for reduced motion:

- **Words fade in sequentially** on page load
- **Gentle pulse** on sight word focus
- **Sparkle effect** when word is tapped (✨)
- **Smooth transitions** when advancing pages
- **Emoji bounce** animation (can be disabled)

### 6. Accessibility

- **Minimum 24px font** for sentence text
- **High contrast** text on background
- **Focus indicators** for keyboard navigation (3px blue outline)
- **Screen reader compatible** with ARIA labels
- **Calm mode support** - Reduces/removes animations
- **Keyboard navigation** - Full functionality without mouse

### 7. CSS Classes

```css
/* Container */
.read-page { }
.read-page-container { }

/* Sentence and words */
.read-sentence { }
.read-word { }
.read-word--sight { }      /* Sight word styling */
.read-word--target { }     /* Target word styling */
.read-word--active { }     /* Currently being spoken */
.read-word--completed { }  /* Already heard */

/* UI Elements */
.reading-tip { }
.read-to-me-btn { }
.read-speed-controls { }
.speed-btn { }
.read-pause-btn { }

/* Navigation */
.read-navigation { }
.read-nav-btn { }
.read-prev-btn { }
.read-next-btn { }

/* Progress */
.read-progress-dots { }
.progress-dot { }
.progress-dot.active { }
.progress-dot.completed { }
```

## Installation

### 1. Add the files to your project

```
project/
  ├── index.html
  ├── read-page.css
  └── read-page.js
```

### 2. Include in your HTML

```html
<head>
  <!-- Add stylesheet -->
  <link rel="stylesheet" href="read-page.css">
</head>
<body>
  <!-- Your read page HTML structure -->

  <!-- Add script before closing body tag -->
  <script src="read-page.js"></script>
</body>
```

## Usage

### Basic Setup

1. **Add the HTML structure:**

```html
<section class="screen read-page active" id="readPageScreen">
  <div class="read-page-container">

    <!-- Progress Dots -->
    <div class="read-progress-dots" id="readProgressDots"></div>

    <!-- Background Image -->
    <div class="read-page-background" id="readPageBackground"></div>

    <!-- Emoji -->
    <div class="read-page-emoji" id="readPageEmoji">🍎</div>

    <!-- Reading Tip -->
    <div class="reading-tip" id="readingTip">
      <span class="tip-icon">💡</span>
      <span class="tip-text" id="tipText">Tap each word!</span>
    </div>

    <!-- Sentence Display -->
    <div class="read-sentence" id="readSentence">
      <!-- Words will be inserted here by JS -->
    </div>

    <!-- Controls -->
    <div class="read-controls">
      <button class="read-to-me-btn" id="readToMeBtn" type="button">
        <span class="read-btn-icon">🔊</span>
        <span class="read-btn-text">Read to Me</span>
      </button>

      <div class="read-speed-controls">
        <button class="speed-btn" id="speedNormal" data-speed="normal">Normal</button>
        <button class="speed-btn" id="speedSlow" data-speed="slow">Slow</button>
      </div>

      <button class="read-pause-btn" id="readPauseBtn" style="display: none;">
        <span id="pauseBtnIcon">⏸</span>
        <span id="pauseBtnText">Pause</span>
      </button>
    </div>

    <!-- Navigation -->
    <div class="read-navigation">
      <button class="read-nav-btn read-prev-btn" id="readPrevBtn" style="display: none;">
        <span>← Previous</span>
      </button>
      <button class="read-nav-btn read-next-btn" id="readNextBtn">
        <span>Next →</span>
      </button>
    </div>

  </div>
</section>
```

2. **Initialize with your data:**

```javascript
// Define your pages
const pages = [
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

// Initialize the component
ReadPage.init(pages);
```

### Page Data Structure

Each page object can have the following properties:

```javascript
{
  emoji: '🍎',                          // Large emoji to display
  backgroundImage: 'path/to/image.jpg', // Background image URL (optional)
  tip: 'Helpful reading tip text',     // Reading tip text (optional)

  // Option 1: Array of word objects (recommended)
  words: [
    {
      text: 'I',              // The word text
      isSightWord: true,      // Add sight word styling (optional)
      isTargetWord: false,    // Add target word styling (optional)
      audioUrl: 'path.mp3'    // Custom audio file (optional)
    },
    // ... more words
  ],

  // Option 2: Simple sentence string (will be auto-split)
  sentence: 'I want an apple'
}
```

### API Methods

The `ReadPage` global object provides these methods:

```javascript
// Initialize with page data
ReadPage.init(pages);

// Create a single interactive word element
const wordElement = ReadPage.createInteractiveWord('hello', {
  isSightWord: true,
  isTargetWord: false,
  audioUrl: 'optional/path/to/audio.mp3',
  index: 0
});

// Load a specific page
ReadPage.loadPage(pageData);

// Navigate between pages
ReadPage.next();      // Go to next page
ReadPage.previous();  // Go to previous page

// Trigger read-to-me
ReadPage.readToMe();
```

## Examples

### Example 1: Simple Single Page

```javascript
const pages = [
  {
    emoji: '🐱',
    tip: 'Read the sentence!',
    sentence: 'The cat is big'
  }
];

ReadPage.init(pages);
```

### Example 2: With Sight Words and Target Words

```javascript
const pages = [
  {
    emoji: '🍎',
    backgroundImage: 'assets/fruit.jpg',
    tip: 'Tap the underlined words!',
    words: [
      { text: 'I', isSightWord: true },
      { text: 'see', isSightWord: true },
      { text: 'a', isSightWord: true },
      { text: 'red', isTargetWord: true },
      { text: 'apple', isTargetWord: true }
    ]
  }
];

ReadPage.init(pages);
```

### Example 3: Multi-Page Story

```javascript
const storyPages = [
  {
    emoji: '🌅',
    tip: 'A new day begins...',
    words: [
      { text: 'The', isSightWord: true },
      { text: 'sun', isTargetWord: true },
      { text: 'is', isSightWord: true },
      { text: 'up', isSightWord: true }
    ]
  },
  {
    emoji: '🐦',
    tip: 'What do you hear?',
    words: [
      { text: 'I', isSightWord: true },
      { text: 'hear', isTargetWord: true },
      { text: 'a', isSightWord: true },
      { text: 'bird', isTargetWord: true }
    ]
  },
  {
    emoji: '😊',
    tip: 'How do you feel?',
    words: [
      { text: 'I', isSightWord: true },
      { text: 'am', isSightWord: true },
      { text: 'happy', isTargetWord: true }
    ]
  }
];

ReadPage.init(storyPages);
```

### Example 4: With Custom Audio

```javascript
const pages = [
  {
    emoji: '🎵',
    tip: 'Listen to the sounds!',
    words: [
      { text: 'cat', audioUrl: 'audio/cat.mp3', isTargetWord: true },
      { text: 'and', isSightWord: true },
      { text: 'dog', audioUrl: 'audio/dog.mp3', isTargetWord: true }
    ]
  }
];

ReadPage.init(pages);
```

## Styling Customization

You can customize the appearance by overriding CSS variables:

```css
:root {
  /* Adjust font sizes */
  --read-sentence-size: 2rem;

  /* Change colors */
  --mrt-blue: #4A90C2;
  --accent-golden: #FBD38D;

  /* Adjust spacing */
  --space-md: 16px;
  --space-lg: 24px;
}
```

Or override specific classes:

```css
/* Make words bigger on mobile */
@media (max-width: 640px) {
  .read-sentence {
    font-size: 2rem;
  }
}

/* Custom sight word color */
.read-word--sight::after {
  background: linear-gradient(90deg, purple, pink);
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Web Speech API for text-to-speech
- CSS Grid and Flexbox
- CSS Custom Properties (CSS Variables)
- ES6+ JavaScript

## Accessibility Features

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and roles
3. **High Contrast**: Text meets WCAG AA contrast requirements
4. **Focus Indicators**: Clear 3px outline on focused elements
5. **Calm Mode**: Respects `prefers-reduced-motion` and custom calm mode
6. **Large Touch Targets**: Minimum 44x44px touch targets on mobile

## Demo

Open `read-page-demo.html` in your browser to see live examples.

## Integration with Main App

The component is already integrated into `/Users/charleswu/Desktop/+/home_school/isaiah_school/index.html`:

- CSS: `<link rel="stylesheet" href="read-page.css">`
- JS: `<script src="read-page.js"></script>`
- HTML: Section with `id="readPageScreen"`

To navigate to the read page from your app:

```javascript
// Show the read page
goToScreen('readPageScreen');

// Initialize with your lesson data
const lessonPages = getLessonPages(); // Your data source
ReadPage.init(lessonPages);
```

## License

Part of Isaiah's MRT Food Adventure learning application.
