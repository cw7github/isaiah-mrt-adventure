# PROTOTYPE SPECIFICATION: Story Page 1
## "The Polar Express" - Opening Scene

**Target Device:** iPad Mini (Landscape)
**Screen Dimensions:** 1024 x 768 pixels
**Target Age:** Grade 1 (Age 6-7)
**Story Context:** Isaiah looking out his window at night, seeing a magical glowing train

---

## 1. VISUAL LAYOUT SPECIFICATION

### 1.1 Device Frame & Safe Areas

```
+------------------------------------------------------------------+
|                        iPad Mini Landscape                        |
|  1024px x 768px (usable after safe areas)                        |
|  Safe Area Insets: top: 20px, bottom: 20px, left: 20px, right: 20px |
+------------------------------------------------------------------+
```

### 1.2 Layout Structure: Split Panel Design

The page uses a **60/40 horizontal split** optimized for young readers:

```
+------------------------------------------------------------------+
|  [ILLUSTRATION AREA - 60%]          |  [TEXT AREA - 40%]         |
|                                     |                             |
|  614px width                        |  410px width                |
|  Full height (728px after safe)     |  Full height                |
|                                     |                             |
|  +-----------------------------+    |  +----------------------+   |
|  |                             |    |  |   Story Text Panel   |   |
|  |   Isaiah at Window          |    |  |                      |   |
|  |   (Full bleed to edge)      |    |  |  Line 1: "Isaiah     |   |
|  |                             |    |  |   could not sleep."  |   |
|  |   Night sky with stars      |    |  |                      |   |
|  |   Window frame visible      |    |  |  Line 2: "He looked  |   |
|  |   Glowing train in distance |    |  |   out his window."   |   |
|  |                             |    |  |                      |   |
|  |   [Animated elements:       |    |  |  Line 3: "Something  |   |
|  |    - twinkling stars        |    |  |   amazing was        |   |
|  |    - train lights pulsing   |    |  |   outside!"          |   |
|  |    - steam from train]      |    |  |                      |   |
|  |                             |    |  +----------------------+   |
|  +-----------------------------+    |                             |
|                                     |  +----------------------+   |
|                                     |  |   Audio Controls     |   |
|                                     |  +----------------------+   |
|                                     |                             |
|                                     |  +----------------------+   |
|                                     |  |   Navigation Arrows  |   |
|                                     |  +----------------------+   |
+------------------------------------------------------------------+
```

### 1.3 Exact Element Positioning

```css
/* ============================================
   PAGE CONTAINER
   ============================================ */
.story-page {
  width: 100vw;
  height: 100vh;
  max-width: 1024px;
  max-height: 768px;
  display: grid;
  grid-template-columns: 60% 40%;
  grid-template-rows: 1fr;
  overflow: hidden;
  background: #0a0a1a; /* Deep night blue fallback */
}

/* ============================================
   ILLUSTRATION PANEL (Left Side)
   ============================================ */
.illustration-panel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.illustration-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Main illustration - full bleed with subtle frame effect */
.illustration-main {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Decorative frame overlay (optional vintage storybook feel) */
.illustration-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-right: 4px solid rgba(212, 175, 55, 0.3); /* Gold accent */
  box-shadow:
    inset 0 0 60px rgba(0, 0, 0, 0.4),
    inset 0 0 120px rgba(0, 0, 0, 0.2);
}

/* ============================================
   TEXT PANEL (Right Side)
   ============================================ */
.text-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px 30px 30px;
  background: linear-gradient(135deg,
    rgba(10, 10, 30, 0.95) 0%,
    rgba(20, 20, 50, 0.98) 100%);
  backdrop-filter: blur(10px);
}

.text-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.story-text-container {
  width: 100%;
  max-width: 340px;
  text-align: center;
}

/* ============================================
   AUDIO CONTROLS AREA
   ============================================ */
.audio-controls-area {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* ============================================
   NAVIGATION AREA
   ============================================ */
.navigation-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 1.4 Illustration Specifications

**Scene Description:**
- Isaiah (young Black boy, 6-7 years old) in pajamas
- Standing at bedroom window, back partially visible
- Looking out at snowy night scene
- Magical glowing train visible in the distance
- Station platform with warm lights near his house
- Stars twinkling in clear night sky
- Soft snow falling

**Art Style:**
- Warm, painterly digital illustration
- Inspired by Chris Van Allsburg (Polar Express) meets Studio Ghibli
- Rich, saturated night colors (deep blues, warm golds, soft whites)
- Magical lighting with soft glows

**Animated Elements (CSS/SVG):**
```css
/* Twinkling stars overlay */
.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  animation: twinkle var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Train lights glow pulse */
.train-glow {
  position: absolute;
  bottom: 20%;
  left: 30%;
  width: 200px;
  height: 80px;
  background: radial-gradient(ellipse,
    rgba(255, 200, 100, 0.4) 0%,
    rgba(255, 180, 80, 0.2) 40%,
    transparent 70%);
  animation: train-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes train-pulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Gentle steam animation */
.steam-particle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle,
    rgba(255, 255, 255, 0.6) 0%,
    transparent 70%);
  border-radius: 50%;
  animation: steam-rise 4s ease-out infinite;
}

@keyframes steam-rise {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.5);
  }
  20% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) translateX(20px) scale(1.5);
  }
}
```

---

## 2. TEXT DISPLAY SPECIFICATION

### 2.1 Story Text Content

**Sentence 1:** "Isaiah could not sleep."
**Sentence 2:** "He looked out his window."
**Sentence 3:** "Something amazing was outside!"

**Total Words:** 12
**Sight Words:** could, not, he, out, his, was (6 words - Dolch list)

### 2.2 HTML Structure

```html
<div class="story-text-container" role="article" aria-label="Story page 1 of 24">

  <!-- Sentence 1 -->
  <p class="story-sentence" data-sentence-id="s1">
    <span class="word" data-word-id="w001" data-index="0" tabindex="0"
          role="button" aria-label="Word: Isaiah. Tap to hear.">Isaiah</span>
    <span class="word sight-word" data-word-id="w002" data-index="1" tabindex="0"
          role="button" aria-label="Word: could. Sight word. Tap to hear.">could</span>
    <span class="word sight-word" data-word-id="w003" data-index="2" tabindex="0"
          role="button" aria-label="Word: not. Sight word. Tap to hear.">not</span>
    <span class="word" data-word-id="w004" data-index="3" tabindex="0"
          role="button" aria-label="Word: sleep. Tap to hear.">sleep.</span>
  </p>

  <!-- Sentence 2 -->
  <p class="story-sentence" data-sentence-id="s2">
    <span class="word sight-word" data-word-id="w005" data-index="4" tabindex="0"
          role="button" aria-label="Word: He. Sight word. Tap to hear.">He</span>
    <span class="word" data-word-id="w006" data-index="5" tabindex="0"
          role="button" aria-label="Word: looked. Tap to hear.">looked</span>
    <span class="word sight-word" data-word-id="w007" data-index="6" tabindex="0"
          role="button" aria-label="Word: out. Sight word. Tap to hear.">out</span>
    <span class="word sight-word" data-word-id="w008" data-index="7" tabindex="0"
          role="button" aria-label="Word: his. Sight word. Tap to hear.">his</span>
    <span class="word" data-word-id="w009" data-index="8" tabindex="0"
          role="button" aria-label="Word: window. Tap to hear.">window.</span>
  </p>

  <!-- Sentence 3 -->
  <p class="story-sentence" data-sentence-id="s3">
    <span class="word" data-word-id="w010" data-index="9" tabindex="0"
          role="button" aria-label="Word: Something. Tap to hear.">Something</span>
    <span class="word" data-word-id="w011" data-index="10" tabindex="0"
          role="button" aria-label="Word: amazing. Tap to hear.">amazing</span>
    <span class="word sight-word" data-word-id="w012" data-index="11" tabindex="0"
          role="button" aria-label="Word: was. Sight word. Tap to hear.">was</span>
    <span class="word" data-word-id="w013" data-index="12" tabindex="0"
          role="button" aria-label="Word: outside! Tap to hear.">outside!</span>
  </p>

  <!-- Screen reader live region for narration -->
  <div aria-live="polite" aria-atomic="false" class="sr-only" id="narration-status">
    <!-- Updated dynamically: "Now reading: [word]" -->
  </div>
</div>
```

### 2.3 Typography Specifications

```css
/* ============================================
   TYPOGRAPHY SYSTEM
   ============================================ */

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Literata:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  /* Primary reading font - Lexend (designed for readability/dyslexia) */
  --font-story: 'Lexend', 'Comic Sans MS', sans-serif;

  /* Decorative/title font */
  --font-display: 'Literata', Georgia, serif;

  /* Font sizes - optimized for Grade 1 readers */
  --text-size-story: 28px;      /* Main story text */
  --text-size-story-lg: 32px;   /* Larger mode */
  --line-height-story: 2.0;     /* Generous line height */
  --word-spacing: 0.15em;       /* Extra word spacing */
  --letter-spacing: 0.02em;     /* Slight letter spacing */
}

/* Sentence styling */
.story-sentence {
  font-family: var(--font-story);
  font-size: var(--text-size-story);
  font-weight: 500;
  line-height: var(--line-height-story);
  color: #ffffff;
  margin-bottom: 24px;
  word-spacing: var(--word-spacing);
  letter-spacing: var(--letter-spacing);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Individual word styling */
.story-sentence .word {
  display: inline-block;
  padding: 6px 10px;
  margin: 4px 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  vertical-align: baseline;

  /* Prevent text selection on tap */
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Sight word indicator - subtle golden glow */
.story-sentence .word.sight-word {
  color: #ffd93d;
  font-weight: 600;
  text-shadow:
    0 0 10px rgba(255, 217, 61, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Sight word dot indicator (accessibility) */
.story-sentence .word.sight-word::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #ffd93d;
  border-radius: 50%;
  opacity: 0.6;
}
```

### 2.4 Word Highlight Animation (Current Word Being Read)

```css
/* ============================================
   WORD HIGHLIGHT STATES
   ============================================ */

/* Currently being read - main highlight */
.story-sentence .word.word-highlighted {
  background: linear-gradient(135deg,
    #ffd93d 0%,
    #ffb347 100%);
  color: #1a1a2e;
  transform: scale(1.15);
  box-shadow:
    0 4px 20px rgba(255, 217, 61, 0.5),
    0 0 30px rgba(255, 217, 61, 0.3),
    0 0 60px rgba(255, 179, 71, 0.2);
  z-index: 10;
  animation: word-glow-pulse 0.4s ease-out;
}

@keyframes word-glow-pulse {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  40% {
    transform: scale(1.25);
    box-shadow:
      0 4px 30px rgba(255, 217, 61, 0.8),
      0 0 50px rgba(255, 217, 61, 0.5);
  }
  100% {
    transform: scale(1.15);
    box-shadow:
      0 4px 20px rgba(255, 217, 61, 0.5),
      0 0 30px rgba(255, 217, 61, 0.3);
  }
}

/* Words already read - subtle dim */
.story-sentence .word.word-spoken {
  color: rgba(255, 255, 255, 0.6);
}

.story-sentence .word.sight-word.word-spoken {
  color: rgba(255, 217, 61, 0.6);
}

/* Upcoming words - normal state */
.story-sentence .word.word-pending {
  color: #ffffff;
}

/* Hover state (desktop) */
.story-sentence .word:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* Focus state (keyboard navigation) */
.story-sentence .word:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(100, 200, 255, 0.6);
  background: rgba(100, 200, 255, 0.15);
}

.story-sentence .word:focus-visible {
  outline: 3px solid #64c8ff;
  outline-offset: 3px;
}
```

---

## 3. AUDIO SYSTEM SPECIFICATION

### 3.1 Audio Timing Data (JSON)

```json
{
  "pageId": "page-001",
  "audioFile": "audio/pages/page-001-narration.mp3",
  "totalDuration": 8.5,
  "sentences": [
    {
      "id": "s1",
      "text": "Isaiah could not sleep.",
      "startTime": 0.0,
      "endTime": 2.4,
      "words": [
        { "id": "w001", "text": "Isaiah", "start": 0.0, "end": 0.55 },
        { "id": "w002", "text": "could", "start": 0.60, "end": 0.95, "isSightWord": true },
        { "id": "w003", "text": "not", "start": 1.00, "end": 1.25, "isSightWord": true },
        { "id": "w004", "text": "sleep.", "start": 1.30, "end": 2.40 }
      ]
    },
    {
      "id": "s2",
      "text": "He looked out his window.",
      "startTime": 2.6,
      "endTime": 5.2,
      "words": [
        { "id": "w005", "text": "He", "start": 2.60, "end": 2.80, "isSightWord": true },
        { "id": "w006", "text": "looked", "start": 2.85, "end": 3.30 },
        { "id": "w007", "text": "out", "start": 3.35, "end": 3.60, "isSightWord": true },
        { "id": "w008", "text": "his", "start": 3.65, "end": 3.85, "isSightWord": true },
        { "id": "w009", "text": "window.", "start": 3.90, "end": 5.20 }
      ]
    },
    {
      "id": "s3",
      "text": "Something amazing was outside!",
      "startTime": 5.4,
      "endTime": 8.5,
      "words": [
        { "id": "w010", "text": "Something", "start": 5.40, "end": 6.00 },
        { "id": "w011", "text": "amazing", "start": 6.05, "end": 6.70 },
        { "id": "w012", "text": "was", "start": 6.75, "end": 7.00, "isSightWord": true },
        { "id": "w013", "text": "outside!", "start": 7.05, "end": 8.50 }
      ]
    }
  ]
}
```

### 3.2 Audio Playback Behavior

**Narration Start Trigger:**
- **Default:** Narration OFF (user must tap "Read to Me" button)
- **Auto-play Option:** Can be enabled in settings for younger readers
- **Alternative:** Tap anywhere on text panel to begin

**Audio Controls UI:**
```html
<div class="audio-controls-area">
  <!-- Read to Me Toggle -->
  <button class="audio-btn read-to-me-btn"
          aria-pressed="false"
          aria-label="Read to me: Off. Tap to turn on.">
    <span class="btn-icon" aria-hidden="true">
      <!-- Speaker icon SVG -->
    </span>
    <span class="btn-label">Read to Me</span>
  </button>

  <!-- Play/Pause (only visible when Read to Me is on) -->
  <button class="audio-btn play-pause-btn"
          disabled
          aria-label="Play narration">
    <span class="btn-icon play-icon" aria-hidden="true">
      <!-- Play/Pause icon SVG -->
    </span>
  </button>

  <!-- Progress indicator -->
  <div class="progress-indicator" role="progressbar"
       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
       aria-label="Reading progress">
    <div class="progress-bar"></div>
  </div>
</div>
```

### 3.3 Audio Engine Pseudo-code

```javascript
class PageAudioController {
  constructor(pageData) {
    this.pageData = pageData;
    this.audio = new Audio(pageData.audioFile);
    this.isNarrationEnabled = false;
    this.isPlaying = false;
    this.currentWordIndex = -1;

    // Callbacks
    this.onWordHighlight = null;
    this.onNarrationComplete = null;

    this._setupTimeTracking();
  }

  _setupTimeTracking() {
    this.audio.addEventListener('timeupdate', () => {
      const currentTime = this.audio.currentTime;
      this._updateHighlight(currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this._clearAllHighlights();
      if (this.onNarrationComplete) {
        this.onNarrationComplete();
      }
    });
  }

  _updateHighlight(currentTime) {
    const allWords = this._getAllWords();

    for (let i = 0; i < allWords.length; i++) {
      const word = allWords[i];

      if (currentTime >= word.start && currentTime < word.end) {
        if (this.currentWordIndex !== i) {
          this._highlightWord(i);
        }
        return;
      }
    }
  }

  _highlightWord(index) {
    const allWords = this._getAllWords();
    const wordElements = document.querySelectorAll('.word');

    // Remove previous highlight
    wordElements.forEach((el, i) => {
      el.classList.remove('word-highlighted');
      if (i < index) {
        el.classList.add('word-spoken');
      } else {
        el.classList.remove('word-spoken');
      }
    });

    // Add new highlight
    if (wordElements[index]) {
      wordElements[index].classList.add('word-highlighted');

      // Announce for screen readers
      const statusEl = document.getElementById('narration-status');
      if (statusEl) {
        statusEl.textContent = `Now reading: ${allWords[index].text}`;
      }
    }

    this.currentWordIndex = index;

    if (this.onWordHighlight) {
      this.onWordHighlight(index, allWords[index]);
    }
  }

  toggleNarration() {
    this.isNarrationEnabled = !this.isNarrationEnabled;
    return this.isNarrationEnabled;
  }

  play() {
    if (!this.isNarrationEnabled) return;
    this.isPlaying = true;
    this.audio.play();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
  }

  stop() {
    this.pause();
    this.audio.currentTime = 0;
    this.currentWordIndex = -1;
    this._clearAllHighlights();
  }

  // Tap-to-hear single word
  async speakWord(wordData) {
    // Use Web Speech API for instant response
    const utterance = new SpeechSynthesisUtterance(wordData.text);
    utterance.rate = 0.8;  // Slower for young readers
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }

  _getAllWords() {
    return this.pageData.sentences.flatMap(s => s.words);
  }

  _clearAllHighlights() {
    document.querySelectorAll('.word').forEach(el => {
      el.classList.remove('word-highlighted', 'word-spoken');
    });
  }
}
```

### 3.4 What Happens When Narration Ends

1. **Visual Reset:**
   - All word highlights fade out (0.5s transition)
   - Words return to normal color

2. **Audio State:**
   - Audio stops at end
   - Play button returns to "Play" icon

3. **User Prompt:**
   - Show subtle "Next Page" prompt animation
   - Navigation arrow glows/pulses to draw attention

4. **Auto-advance Option:**
   - In settings: auto-advance to next page after 2 second delay
   - Default: wait for user tap

---

## 4. INTERACTIONS SPECIFICATION

### 4.1 Tappable Elements Map

```
+------------------------------------------------------------------+
|  ILLUSTRATION PANEL                 |  TEXT PANEL                 |
|  +-----------------------+          |                             |
|  | Entire illustration   |          |  [Word 1] [Word 2]          |
|  | = TAPPABLE            |          |  [Word 3] [Word 4]...       |
|  | Action: Play          |          |                             |
|  | ambient sound effect  |          |  Each word = TAPPABLE       |
|  |                       |          |  Action: Speak word         |
|  | Train area = TAPPABLE |          |                             |
|  | Action: Train whistle |          |  [Read to Me] button        |
|  |                       |          |  Action: Toggle narration   |
|  | Stars = Auto-animate  |          |                             |
|  +-----------------------+          |  [Play/Pause] button        |
|                                     |  Action: Control playback   |
|                                     |                             |
|                                     |  [< Back] [Next >] arrows   |
|                                     |  Action: Page navigation    |
+------------------------------------------------------------------+
```

### 4.2 Word Tap Interaction

**Trigger:** Tap/click on any word

**Immediate Feedback (< 100ms):**
```css
.word.word-tapped {
  animation: word-tap-pulse 0.3s ease-out;
  background: radial-gradient(circle,
    rgba(100, 200, 255, 0.5) 0%,
    rgba(100, 200, 255, 0.1) 70%);
}

@keyframes word-tap-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

/* Ripple effect */
.word.word-tapped::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle,
    rgba(100, 200, 255, 0.6) 0%,
    transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: tap-ripple 0.5s ease-out forwards;
}

@keyframes tap-ripple {
  to {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
```

**Audio Response:**
- Word is spoken using TTS (Web Speech API)
- Rate: 0.8 (slower than normal)
- If word is a sight word: add brief chime sound after

**Pseudo-code:**
```javascript
function handleWordTap(event) {
  const wordElement = event.target;
  const wordData = getWordData(wordElement);

  // 1. Immediate visual feedback
  wordElement.classList.add('word-tapped');

  // 2. Haptic feedback (if available)
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // 3. Speak the word
  speakWord(wordData.text);

  // 4. Sight word chime
  if (wordData.isSightWord) {
    setTimeout(() => playChime(), 400);
  }

  // 5. Remove tap class after animation
  setTimeout(() => {
    wordElement.classList.remove('word-tapped');
  }, 400);

  // 6. Track interaction for analytics
  trackWordTap(wordData);
}
```

### 4.3 Illustration Tap Interactions

**Tap on General Area:**
- Play ambient night sounds (crickets, gentle wind)
- Brief visual sparkle effect at tap location

**Tap on Train Area (if detectable):**
- Play train whistle sound
- Train lights pulse brighter momentarily
- Optional: small steam puff animation

```javascript
function handleIllustrationTap(event) {
  const { x, y } = event.offsetX, event.offsetY;
  const width = illustrationPanel.offsetWidth;
  const height = illustrationPanel.offsetHeight;

  // Calculate relative position (0-1)
  const relX = x / width;
  const relY = y / height;

  // Train hotspot: roughly bottom-left quadrant
  const isTrainArea = (relX > 0.2 && relX < 0.6) && (relY > 0.5 && relY < 0.9);

  if (isTrainArea) {
    playTrainWhistle();
    pulseTrainLights();
  } else {
    playAmbientSound();
    createSparkleEffect(x, y);
  }
}
```

### 4.4 Navigation Interactions

**Swipe Gestures:**
- Swipe LEFT on illustration → go to next page
- Swipe RIGHT on illustration → go to previous page
- Minimum swipe distance: 80px
- Swipe velocity threshold: 0.3 (prevents accidental triggers)

**Navigation Arrows:**
```html
<div class="navigation-area">
  <button class="nav-btn nav-back" aria-label="Go to previous page">
    <svg class="nav-icon"><!-- Back arrow --></svg>
  </button>

  <div class="page-indicator">
    <span class="page-current">1</span>
    <span class="page-separator">/</span>
    <span class="page-total">24</span>
  </div>

  <button class="nav-btn nav-next" aria-label="Go to next page">
    <svg class="nav-icon"><!-- Forward arrow --></svg>
  </button>
</div>
```

**Navigation Button Styling:**
```css
.nav-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.nav-btn:active {
  transform: scale(0.95);
}

/* Pulse animation when narration ends */
.nav-btn.nav-next.prompt-advance {
  animation: nav-pulse 1.5s ease-in-out infinite;
}

@keyframes nav-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 217, 61, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(255, 217, 61, 0);
  }
}
```

**What Happens on Page Advance:**
1. Current page begins exit transition
2. Audio stops if playing
3. All states reset
4. Next page loads and begins entrance transition

---

## 5. ACCESSIBILITY SPECIFICATION

### 5.1 Screen Reader Experience

**Page Load Announcement:**
```html
<div role="main" aria-label="Story: The Night Train, Page 1 of 24">
  <!-- Automatic announcement on page load -->
</div>
```

**Story Content Structure:**
```html
<article class="story-page" aria-label="Page 1">
  <figure class="illustration-panel" aria-hidden="true">
    <!-- Illustration is decorative, described in alt text only -->
    <img src="..." alt="Isaiah, a young boy in pajamas, looks out his bedroom window
         at night. In the distance, a magical glowing train pulls into a small station
         near his house. Snow falls gently and stars twinkle in the dark sky." />
  </figure>

  <section class="text-panel" aria-label="Story text">
    <div class="story-text-container">
      <!-- Each word is a button for tap-to-hear -->
      <p class="story-sentence">
        <span class="word" role="button" tabindex="0"
              aria-label="Word: Isaiah. Tap to hear pronunciation.">Isaiah</span>
        <!-- ... -->
      </p>
    </div>

    <!-- Live region for narration progress -->
    <div aria-live="polite" class="sr-only" id="narration-status"></div>
  </section>
</article>
```

**Keyboard Navigation:**
- Tab: Move between words
- Enter/Space: Speak currently focused word
- Arrow Left/Right: Move between words
- Arrow Up: Previous sentence
- Arrow Down: Next sentence
- Escape: Stop narration
- Page Down: Next page
- Page Up: Previous page

```javascript
function handleKeyboard(event) {
  const words = document.querySelectorAll('.word');
  const currentIndex = Array.from(words).indexOf(document.activeElement);

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < words.length - 1) {
        words[currentIndex + 1].focus();
      }
      break;

    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        words[currentIndex - 1].focus();
      }
      break;

    case 'Enter':
    case ' ':
      event.preventDefault();
      handleWordTap({ target: document.activeElement });
      break;

    case 'Escape':
      audioController.stop();
      announceToScreenReader('Narration stopped');
      break;

    case 'PageDown':
      navigateToNextPage();
      break;

    case 'PageUp':
      navigateToPreviousPage();
      break;
  }
}
```

### 5.2 Reduced Motion Version

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential visual feedback but instant */
  .word.word-highlighted {
    background: #ffd93d;
    color: #1a1a2e;
    transform: none;
    box-shadow: none;
    border: 3px solid #1a1a2e;
  }

  .word.word-tapped {
    background: rgba(100, 200, 255, 0.5);
    transform: none;
  }

  /* Static stars instead of twinkling */
  .star {
    opacity: 0.6;
  }

  /* Static train glow */
  .train-glow {
    opacity: 0.8;
  }

  /* No steam animation */
  .steam-particle {
    display: none;
  }

  /* Instant page transitions */
  .story-page.exiting {
    opacity: 0;
  }

  .story-page.entering {
    opacity: 1;
  }
}
```

### 5.3 High Contrast Version

```css
@media (prefers-contrast: high) {
  :root {
    --text-color: #ffffff;
    --background: #000000;
    --highlight-color: #ffff00;
    --sight-word-color: #00ffff;
  }

  .text-panel {
    background: #000000;
  }

  .story-sentence .word {
    color: #ffffff;
    border: 2px solid transparent;
  }

  .story-sentence .word.sight-word {
    color: var(--sight-word-color);
    border-color: var(--sight-word-color);
  }

  .story-sentence .word.word-highlighted {
    background: var(--highlight-color);
    color: #000000;
    border-color: #000000;
    border-width: 3px;
  }

  .story-sentence .word:focus {
    outline: 4px solid #ffffff;
    outline-offset: 4px;
  }

  .nav-btn {
    border: 3px solid #ffffff;
    background: #000000;
  }

  .audio-btn {
    border: 3px solid #ffffff;
    background: #000000;
    color: #ffffff;
  }
}
```

### 5.4 Large Text / Dyslexia-Friendly Mode

```css
.reading-mode-accessible {
  --text-size-story: 36px;
  --line-height-story: 2.4;
  --word-spacing: 0.25em;
  --letter-spacing: 0.05em;
}

.reading-mode-accessible .story-sentence {
  font-family: 'OpenDyslexic', 'Lexend', sans-serif;
}

.reading-mode-accessible .word {
  padding: 10px 14px;
  margin: 6px 4px;
}
```

---

## 6. PAGE TRANSITIONS SPECIFICATION

### 6.1 Page Entrance Animation

**Default: Fade + Gentle Slide**

```css
/* Entering page */
.story-page {
  opacity: 0;
}

.story-page.page-enter {
  animation: page-entrance 0.6s ease-out forwards;
}

@keyframes page-entrance {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Staggered element entrance */
.page-enter .illustration-panel {
  animation: illustration-entrance 0.8s ease-out 0.1s forwards;
  opacity: 0;
}

@keyframes illustration-entrance {
  0% {
    opacity: 0;
    transform: scale(1.05);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

.page-enter .story-sentence {
  animation: sentence-entrance 0.5s ease-out forwards;
  opacity: 0;
}

.page-enter .story-sentence:nth-child(1) { animation-delay: 0.3s; }
.page-enter .story-sentence:nth-child(2) { animation-delay: 0.45s; }
.page-enter .story-sentence:nth-child(3) { animation-delay: 0.6s; }

@keyframes sentence-entrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Audio controls entrance */
.page-enter .audio-controls-area {
  animation: controls-entrance 0.5s ease-out 0.7s forwards;
  opacity: 0;
}

@keyframes controls-entrance {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6.2 Page Exit Animation

**Default: Fade + Gentle Slide Out**

```css
.story-page.page-exit {
  animation: page-exit 0.5s ease-in forwards;
}

@keyframes page-exit {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-30px);
  }
}

/* Quick fade for returning */
.story-page.page-exit-back {
  animation: page-exit-back 0.5s ease-in forwards;
}

@keyframes page-exit-back {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(30px);
  }
}
```

### 6.3 Transition Controller Pseudo-code

```javascript
class PageTransitionController {
  constructor(container) {
    this.container = container;
    this.currentPage = null;
    this.isTransitioning = false;
  }

  async transitionTo(newPageData, direction = 'forward') {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // 1. Stop any audio
    if (this.currentPage) {
      this.currentPage.audioController.stop();
    }

    // 2. Create new page element
    const newPageElement = this.createPageElement(newPageData);

    // 3. Add exit animation to current page
    if (this.currentPage) {
      const exitClass = direction === 'forward' ? 'page-exit' : 'page-exit-back';
      this.currentPage.element.classList.add(exitClass);
    }

    // 4. Wait for exit animation
    await this.waitForAnimation(500);

    // 5. Remove old page
    if (this.currentPage) {
      this.currentPage.element.remove();
    }

    // 6. Insert new page
    this.container.appendChild(newPageElement);

    // 7. Trigger entrance animation
    requestAnimationFrame(() => {
      newPageElement.classList.add('page-enter');
    });

    // 8. Wait for entrance animation
    await this.waitForAnimation(800);

    // 9. Update state
    this.currentPage = {
      element: newPageElement,
      data: newPageData,
      audioController: new PageAudioController(newPageData)
    };

    this.isTransitioning = false;

    // 10. Announce to screen readers
    this.announcePageChange(newPageData.pageNumber, newPageData.totalPages);
  }

  waitForAnimation(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  announcePageChange(current, total) {
    const announcement = document.getElementById('page-announcement');
    if (announcement) {
      announcement.textContent = `Page ${current} of ${total}`;
    }
  }
}
```

### 6.4 Transition Timing Summary

| Phase | Duration | Easing |
|-------|----------|--------|
| Page Exit | 500ms | ease-in |
| Gap (cleanup) | 50ms | - |
| Page Enter (base) | 600ms | ease-out |
| Illustration reveal | 800ms | ease-out (delayed 100ms) |
| Sentence 1 reveal | 500ms | ease-out (delayed 300ms) |
| Sentence 2 reveal | 500ms | ease-out (delayed 450ms) |
| Sentence 3 reveal | 500ms | ease-out (delayed 600ms) |
| Controls reveal | 500ms | ease-out (delayed 700ms) |
| **Total perceived** | ~1200ms | - |

---

## 7. COMPLETE HTML TEMPLATE

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>The Night Train - Page 1</title>
  <link rel="stylesheet" href="styles/story-page.css">
</head>
<body>

  <!-- Page container -->
  <main class="story-page page-enter"
        role="main"
        aria-label="Story: The Night Train, Page 1 of 24">

    <!-- Screen reader announcement region -->
    <div id="page-announcement"
         class="sr-only"
         aria-live="polite"
         aria-atomic="true">
      Page 1 of 24
    </div>

    <!-- ===== ILLUSTRATION PANEL ===== -->
    <figure class="illustration-panel" aria-hidden="true">
      <div class="illustration-container">
        <!-- Main illustration -->
        <img class="illustration-main"
             src="assets/illustrations/page-001.webp"
             alt="Isaiah, a young boy in pajamas, looks out his bedroom window at night.
                  In the distance, a magical glowing train pulls into a small station
                  near his house. Snow falls gently and stars twinkle in the dark sky."
             loading="eager" />

        <!-- Animated layers -->
        <div class="animation-layers">
          <!-- Twinkling stars -->
          <div class="stars-layer">
            <div class="star" style="--delay: 0s; --duration: 2.5s; left: 15%; top: 8%;"></div>
            <div class="star" style="--delay: 0.5s; --duration: 3s; left: 35%; top: 12%;"></div>
            <div class="star" style="--delay: 1s; --duration: 2.8s; left: 55%; top: 5%;"></div>
            <div class="star" style="--delay: 1.5s; --duration: 3.2s; left: 75%; top: 15%;"></div>
            <div class="star" style="--delay: 0.8s; --duration: 2.6s; left: 25%; top: 20%;"></div>
            <div class="star" style="--delay: 2s; --duration: 2.9s; left: 65%; top: 18%;"></div>
          </div>

          <!-- Train glow -->
          <div class="train-glow"></div>

          <!-- Steam particles -->
          <div class="steam-container">
            <div class="steam-particle" style="--delay: 0s; left: 40%;"></div>
            <div class="steam-particle" style="--delay: 1.5s; left: 43%;"></div>
            <div class="steam-particle" style="--delay: 3s; left: 38%;"></div>
          </div>
        </div>

        <!-- Decorative frame -->
        <div class="illustration-frame"></div>
      </div>
    </figure>

    <!-- ===== TEXT PANEL ===== -->
    <section class="text-panel" aria-label="Story text">

      <!-- Story text -->
      <div class="text-content-area">
        <article class="story-text-container" role="article">

          <!-- Sentence 1 -->
          <p class="story-sentence" data-sentence-id="s1">
            <span class="word"
                  data-word-id="w001"
                  data-index="0"
                  tabindex="0"
                  role="button"
                  aria-label="Word: Isaiah. Tap to hear.">Isaiah</span>
            <span class="word sight-word"
                  data-word-id="w002"
                  data-index="1"
                  tabindex="0"
                  role="button"
                  aria-label="Word: could. Sight word. Tap to hear.">could</span>
            <span class="word sight-word"
                  data-word-id="w003"
                  data-index="2"
                  tabindex="0"
                  role="button"
                  aria-label="Word: not. Sight word. Tap to hear.">not</span>
            <span class="word"
                  data-word-id="w004"
                  data-index="3"
                  tabindex="0"
                  role="button"
                  aria-label="Word: sleep. Tap to hear.">sleep.</span>
          </p>

          <!-- Sentence 2 -->
          <p class="story-sentence" data-sentence-id="s2">
            <span class="word sight-word"
                  data-word-id="w005"
                  data-index="4"
                  tabindex="0"
                  role="button"
                  aria-label="Word: He. Sight word. Tap to hear.">He</span>
            <span class="word"
                  data-word-id="w006"
                  data-index="5"
                  tabindex="0"
                  role="button"
                  aria-label="Word: looked. Tap to hear.">looked</span>
            <span class="word sight-word"
                  data-word-id="w007"
                  data-index="6"
                  tabindex="0"
                  role="button"
                  aria-label="Word: out. Sight word. Tap to hear.">out</span>
            <span class="word sight-word"
                  data-word-id="w008"
                  data-index="7"
                  tabindex="0"
                  role="button"
                  aria-label="Word: his. Sight word. Tap to hear.">his</span>
            <span class="word"
                  data-word-id="w009"
                  data-index="8"
                  tabindex="0"
                  role="button"
                  aria-label="Word: window. Tap to hear.">window.</span>
          </p>

          <!-- Sentence 3 -->
          <p class="story-sentence" data-sentence-id="s3">
            <span class="word"
                  data-word-id="w010"
                  data-index="9"
                  tabindex="0"
                  role="button"
                  aria-label="Word: Something. Tap to hear.">Something</span>
            <span class="word"
                  data-word-id="w011"
                  data-index="10"
                  tabindex="0"
                  role="button"
                  aria-label="Word: amazing. Tap to hear.">amazing</span>
            <span class="word sight-word"
                  data-word-id="w012"
                  data-index="11"
                  tabindex="0"
                  role="button"
                  aria-label="Word: was. Sight word. Tap to hear.">was</span>
            <span class="word"
                  data-word-id="w013"
                  data-index="12"
                  tabindex="0"
                  role="button"
                  aria-label="Word: outside! Tap to hear.">outside!</span>
          </p>

        </article>

        <!-- Screen reader live region -->
        <div id="narration-status"
             class="sr-only"
             aria-live="polite"
             aria-atomic="false"></div>
      </div>

      <!-- Audio controls -->
      <div class="audio-controls-area">
        <button class="audio-btn read-to-me-btn"
                aria-pressed="false"
                aria-label="Read to me: Off. Tap to turn on.">
          <svg class="btn-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <span class="btn-label">Read to Me</span>
        </button>

        <button class="audio-btn play-pause-btn"
                disabled
                aria-label="Play narration">
          <svg class="btn-icon play-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="navigation-area" aria-label="Page navigation">
        <button class="nav-btn nav-back"
                aria-label="Go to previous page"
                disabled>
          <svg class="nav-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div class="page-indicator" aria-label="Page 1 of 24">
          <span class="page-current">1</span>
          <span class="page-separator">/</span>
          <span class="page-total">24</span>
        </div>

        <button class="nav-btn nav-next"
                aria-label="Go to next page">
          <svg class="nav-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </nav>

    </section>

  </main>

  <!-- Audio elements (preloaded) -->
  <audio id="page-narration" preload="auto">
    <source src="audio/pages/page-001.mp3" type="audio/mpeg">
  </audio>
  <audio id="ambient-night" preload="auto" loop>
    <source src="audio/ambient/night-crickets.mp3" type="audio/mpeg">
  </audio>
  <audio id="train-whistle" preload="auto">
    <source src="audio/sfx/train-whistle.mp3" type="audio/mpeg">
  </audio>
  <audio id="chime-sight-word" preload="auto">
    <source src="audio/sfx/chime-soft.mp3" type="audio/mpeg">
  </audio>

  <script src="scripts/story-page.js" defer></script>
</body>
</html>
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Core Layout
- [ ] Grid layout (60/40 split)
- [ ] Text panel with proper typography
- [ ] Navigation buttons
- [ ] Responsive scaling

### Phase 2: Text System
- [ ] Word spans with proper attributes
- [ ] Sight word styling
- [ ] Word tap feedback animation
- [ ] Highlight animation

### Phase 3: Audio System
- [ ] Page narration with timing data
- [ ] Word-by-word highlight sync
- [ ] Tap-to-hear TTS
- [ ] Audio controls UI

### Phase 4: Illustration
- [ ] Main illustration placement
- [ ] Animated stars layer
- [ ] Train glow effect
- [ ] Steam animation
- [ ] Tap hotspots

### Phase 5: Transitions
- [ ] Page entrance animation
- [ ] Page exit animation
- [ ] Element stagger timing
- [ ] Transition controller

### Phase 6: Accessibility
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Reduced motion support
- [ ] High contrast mode
- [ ] Focus management

### Phase 7: Polish
- [ ] Touch feedback (haptics)
- [ ] Sound effects
- [ ] Loading states
- [ ] Error handling

---

## 9. FILE STRUCTURE

```
polar-express-story/
  index.html

  styles/
    story-page.css
    animations.css
    accessibility.css

  scripts/
    story-page.js
    audio-controller.js
    word-highlight.js
    page-transitions.js
    gesture-handler.js

  assets/
    illustrations/
      page-001.webp
      page-001@2x.webp

  audio/
    pages/
      page-001.mp3
    ambient/
      night-crickets.mp3
    sfx/
      train-whistle.mp3
      chime-soft.mp3
    words/
      isaiah.mp3
      could.mp3
      not.mp3
      sleep.mp3
      ... (all words)

  data/
    page-001-timing.json
    story-manifest.json
```

---

*Specification Version: 1.0*
*Target Platform: iPad Mini (Landscape)*
*Created: December 2024*
*For: Isaiah's Grade 1 Reading Journey*
