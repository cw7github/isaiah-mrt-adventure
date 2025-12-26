# Reading Experience Flow Design
## Interactive Storybook - Complete UX Specification
### Incorporating Educational Research Feedback

---

## Table of Contents
1. [Flow Overview](#flow-overview)
2. [Phase 1: Pre-Reading](#phase-1-pre-reading)
3. [Phase 2: First Read](#phase-2-first-read)
4. [Phase 3: Comprehension Checks](#phase-3-comprehension-checks)
5. [Phase 4: Story Completion](#phase-4-story-completion)
6. [Phase 5: Re-Read Options](#phase-5-re-read-options)
7. [Phase 6: Mini-Game](#phase-6-mini-game)
8. [UI Mode Variations](#ui-mode-variations)
9. [Screen-by-Screen Wireframes](#screen-by-screen-wireframes)
10. [State Management](#state-management)
11. [Accessibility Considerations](#accessibility-considerations)

---

## Flow Overview

```
                    STORY SELECTION
                          |
                          v
    +--------------------------------------------+
    |           PHASE 1: PRE-READING             |
    |  [Vocabulary] -> [Prediction] -> [Intro]   |
    +--------------------------------------------+
                          |
                          v
    +--------------------------------------------+
    |           PHASE 2: FIRST READ              |
    |     Full narration with highlighting       |
    |        (Every 2-3 pages triggers)          |
    +--------------------------------------------+
                          |
                          v
    +--------------------------------------------+
    |       PHASE 3: COMPREHENSION CHECK         |
    |    Evidence-based, tap-in-text answers     |
    +--------------------------------------------+
                          |
            (Loop back to Phase 2 until story ends)
                          |
                          v
    +--------------------------------------------+
    |        PHASE 4: STORY COMPLETION           |
    |   Celebration -> Reflection -> Unlock      |
    +--------------------------------------------+
                          |
              +---------------------+
              |                     |
              v                     v
    +------------------+   +------------------+
    |  PHASE 5: REREAD |   |  PHASE 6: GAME   |
    |  (Echo/Your Turn |   |  (Story-based    |
    |   /Record modes) |   |   mini-game)     |
    +------------------+   +------------------+
```

---

## Phase 1: Pre-Reading

**Purpose**: Activate prior knowledge, build vocabulary, create engagement

**Duration**: 2-3 minutes

### Screen 1.1: Vocabulary Preview

```
+----------------------------------------------------------+
|                                                          |
|  [Dragon Character]     "Before we read, let's learn    |
|       ~~~~              some special words!"             |
|       ( )                                                |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|   +------------+  +------------+  +------------+         |
|   |   [IMG]    |  |   [IMG]    |  |   [IMG]    |         |
|   |  treasure  |  |  ancient   |  |  scrolls   |         |
|   |    ~~~~    |  |   ~~~~     |  |   ~~~~     |         |
|   +------------+  +------------+  +------------+         |
|                                                          |
|   +------------+  +------------+                         |
|   |   [IMG]    |  |   [IMG]    |                         |
|   |   cave     |  |   magic    |                         |
|   |   ~~~~     |  |   ~~~~     |                         |
|   +------------+  +------------+                         |
|                                                          |
|           Tap each word to hear it!                      |
|                                                          |
|       Progress: [*] [*] [*] [ ] [ ]   (3/5)              |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|            [ Continue ]  (enabled after all tapped)      |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:
- **Vocabulary Cards**: 3-5 cards arranged in a grid
  - Each card: Simple illustration + word + pronunciation line
  - Minimum touch target: 80x80px
  - Card animation: Gentle pulse to indicate tappability
- **Audio Feedback**: Word pronounced clearly when tapped
  - Card glows with dragon-amber highlight
  - Checkmark appears after word heard
- **Progress Indicator**: Visual dots showing completion
- **Continue Button**: Disabled until all words heard at least once

**Behavior**:
1. Cards appear with staggered fade-in animation (100ms delay each)
2. Tapping a card:
   - Card scales up 1.1x with glow effect
   - Word is spoken (TTS or pre-recorded)
   - Green checkmark animates into corner
   - Progress dot fills in
3. After all words heard, Continue button glows and enables
4. Dragon provides encouragement: "Great! You know the words!"

**Data Structure**:
```javascript
const vocabularyPreview = {
  words: [
    {
      word: "treasure",
      image: "assets/vocab/treasure.png",
      audioClip: "audio/words/treasure.mp3",
      definition: "Something very special and valuable",
      sentenceHint: "The dragon guards a secret _____."
    },
    // ... 4 more words
  ],
  minWordsRequired: 5, // All words must be tapped
  dragonPrompt: "Before we read, let's learn some special words!"
};
```

---

### Screen 1.2: Prediction Prompt

```
+----------------------------------------------------------+
|                                                          |
|       THE EMBER DRAGON'S HIDDEN TREASURE                 |
|              [Story Cover Image]                         |
|                                                          |
|              ~~~~~~~~~~~~~~~~~~~~~~                      |
|              |                    |                      |
|              |    [Illustration]  |                      |
|              |    Dragon + Cave   |                      |
|              |                    |                      |
|              ~~~~~~~~~~~~~~~~~~~~~~                      |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    [Dragon]  "What do you THINK will happen              |
|              in this story?"                             |
|                                                          |
|    +--------------------------------------------------+  |
|    |  Tap to choose your prediction:                 |  |
|    |                                                  |  |
|    |  [ ] The dragon finds gold                       |  |
|    |  [ ] The dragon makes a friend                   |  |
|    |  [ ] The dragon learns to read                   |  |
|    |  [ ] Something else? Tell me!                    |  |
|    +--------------------------------------------------+  |
|                                                          |
|             [ Start Reading! ]                           |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:
- **Story Cover**: Central illustration (50% of screen height)
- **Title**: Displayed above cover in decorative font
- **Prediction Options**: 3-4 simple predictions + open option
  - Large touch targets (full width, 60px height minimum)
  - Checkbox/bubble selection style
  - Only ONE can be selected
- **Dragon Character**: Small avatar with speech bubble
- **Start Button**: Prominent, dragon-themed

**Behavior**:
1. Cover image fades in with gentle zoom
2. Dragon asks prediction question with animation
3. Child taps their prediction:
   - Option highlights with amber glow
   - Dragon responds: "Interesting! Let's find out!"
4. Start button animates with fire effect
5. Prediction is SAVED to be revisited after story

**Educational Rationale**:
- Predictions activate schema and prior knowledge
- Creates investment in the story
- Provides metacognitive framework
- NOT graded - all predictions are celebrated

---

### Screen 1.3: Character & Setting Introduction

```
+----------------------------------------------------------+
|                                                          |
|              MEET THE CHARACTERS                          |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    +-------------------+    +-------------------+        |
|    |                   |    |                   |        |
|    |   [Dragon Img]    |    |   [Cave Img]      |        |
|    |                   |    |                   |        |
|    +-------------------+    +-------------------+        |
|    |   EMBER           |    |   THE CAVE        |        |
|    |   A wise dragon   |    |   Deep in the     |        |
|    |   who loves       |    |   mountains,      |        |
|    |   stories         |    |   full of magic   |        |
|    +-------------------+    +-------------------+        |
|                                                          |
|    +-------------------+                                 |
|    |                   |                                 |
|    |  [Traveler Img]   |                                 |
|    |                   |                                 |
|    +-------------------+                                 |
|    |   THE TRAVELER    |                                 |
|    |   A brave visitor |                                 |
|    |   seeking the     |                                 |
|    |   dragon's secret |                                 |
|    +-------------------+                                 |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|        [ Ready to Read! ]                                |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:
- **Character Cards**: 2-3 main characters/settings
  - Illustration (square, ~150px)
  - Name in bold
  - Brief description (1-2 lines)
  - Tappable for audio introduction
- **Layout**: Horizontal scroll on iPhone, grid on iPad
- **Ready Button**: Final transition to story

**Behavior**:
1. Cards appear with staggered entrance
2. Tapping a card:
   - Card lifts with shadow
   - Brief audio description plays
   - "This is Ember. Ember is a wise dragon..."
3. All cards optional to tap
4. Ready button always available

---

## Phase 2: First Read (With Support)

**Purpose**: Guided reading with full scaffolding

**Key Principles**:
- Full narration ON with word-by-word highlighting
- NO interrupting games or activities
- Pace adjustable by child
- Any word tappable for repetition

### Screen 2.1: Reading View (Primary)

```
+----------------------------------------------------------+
|  [=]  The Ember Dragon's Treasure      Page 1 of 12  [x] |
+----------------------------------------------------------+
|                                                          |
|  +------------------------+  +--------------------------+|
|  |                        |  |                          ||
|  |    [ILLUSTRATION]      |  |   Long ago, deep in      ||
|  |                        |  |   the mountain           ||
|  |    Dragon in cave      |  |   [caves], there lived   ||
|  |    with scrolls        |  |   a wise [dragon]        ||
|  |                        |  |   named [Ember].         ||
|  |                        |  |                          ||
|  |                        |  |   Ember was not like     ||
|  |                        |  |   other dragons who      ||
|  |                        |  |   loved gold and         ||
|  |                        |  |   [jewels].              ||
|  |                        |  |                          ||
|  +------------------------+  +--------------------------+|
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  NARRATION CONTROLS:                                     |
|                                                          |
|  [||]  [<|] [>|]    Speed: [Slow] [Normal] [Fast]       |
|  Pause  Back  Fwd                                        |
|                                                          |
|  ===================================== (progress bar)    |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|        [<< Prev Page]           [Next Page >>]           |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:

#### Top Bar
- **Menu Button** [=]: Access settings, exit story
- **Story Title**: Truncated if needed
- **Page Counter**: "Page X of Y"
- **Close Button** [x]: Confirm exit dialog

#### Content Area (Two-Page Spread - iPad Landscape)
- **Illustration Page** (Left):
  - Full-bleed illustration
  - object-fit: cover
  - Focal point adjustable per image
- **Text Page** (Right):
  - Cream/warm background (#FDF8F0)
  - Large text (28-32px)
  - Line height 2.4 for word highlighting
  - Highlighted words in brackets indicate current word

#### Narration Controls Bar
- **Pause/Play Button**: Toggle narration
- **Back/Forward**: Jump 5 seconds or to previous/next sentence
- **Speed Selector**: Three speeds
  - Slow: 0.7x rate, extra pauses
  - Normal: 0.85x rate (optimized for Grade 1)
  - Fast: 1.0x rate
- **Progress Bar**: Scrubable, shows current position

#### Navigation Bar
- **Previous Page**: Left arrow, disabled on page 1
- **Next Page**: Right arrow, auto-enabled when page narration completes

**Word Highlighting System**:

```css
/* Currently being read word */
.word-current {
  background: linear-gradient(135deg, #ff9f1c, #ff6b35);
  color: #1a1a2e;
  transform: scale(1.15);
  box-shadow: 0 4px 15px rgba(255, 159, 28, 0.5);
  border-radius: 6px;
  padding: 4px 8px;
  margin: -4px -8px;
  animation: word-pulse 0.3s ease-out;
}

/* Words already read */
.word-spoken {
  color: rgba(0, 0, 0, 0.65);
}

/* Words not yet read */
.word-pending {
  color: rgba(0, 0, 0, 0.9);
}
```

**Behavior**:
1. Page loads with illustration and text
2. Narration begins automatically (if enabled in settings)
3. Each word highlights as it's spoken:
   - Word scales up with glow
   - Previous words dim slightly
   - Smooth scroll keeps current word visible
4. Tapping ANY word:
   - Narration pauses
   - Tapped word is spoken
   - Visual pulse feedback
   - Narration resumes OR waits for play
5. Page navigation:
   - Can only advance AFTER hearing entire page (first read)
   - Previous always available
   - Swipe gestures also work

**Speed Settings Detail**:

| Speed | TTS Rate | Word Pause | Description |
|-------|----------|------------|-------------|
| Slow | 0.7x | 150ms | Deliberate, clear |
| Normal | 0.85x | 50ms | Natural, fluent |
| Fast | 1.0x | 0ms | Confident readers |

---

### Screen 2.2: Word Tap Detail View (Overlay)

```
+----------------------------------------------------------+
|                                                          |
|          (story content blurred behind)                  |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |               T R E A S U R E                    |  |
|    |                                                  |  |
|    |            [Speaker Icon - Tap to hear]          |  |
|    |                                                  |  |
|    |  ------------------------------------------------|  |
|    |                                                  |  |
|    |     Syllables:  TREA - SURE                      |  |
|    |                                                  |  |
|    |     Meaning:  Something very special             |  |
|    |               and valuable                       |  |
|    |                                                  |  |
|    |     [Image of treasure chest]                    |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|              [ Close - tap anywhere ]                    |
|                                                          |
+----------------------------------------------------------+
```

**Triggered By**: Long-press on any word (optional feature)

**Elements**:
- **Large Word Display**: Word centered, 48px font
- **Audio Button**: Tap to hear pronunciation again
- **Syllable Breakdown**: Visual syllable separation
- **Simple Definition**: 1-2 sentence child-friendly meaning
- **Supporting Image**: If available for vocabulary words

**Behavior**:
- Appears as modal overlay with backdrop blur
- Auto-plays word pronunciation once
- Tap anywhere or X to close
- Returns to exact narration position

---

## Phase 3: Comprehension Checks

**Purpose**: Verify understanding with evidence-based responses

**Timing**: After every 2-3 pages (configurable)

**Key Principles**:
- NOT multiple choice
- Answer found IN the text
- Child taps the evidence
- Gentle, encouraging feedback

### Screen 3.1: Comprehension Question

```
+----------------------------------------------------------+
|                                                          |
|    [Dragon Avatar]                                       |
|                                                          |
|    "Let's check what we learned!                         |
|     This is not a test - just for fun!"                  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    QUESTION:                                             |
|                                                          |
|    "Find the word that tells us what                     |
|     Ember collected. Tap it in the story!"               |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   Ember was not like other dragons who loved     |  |
|    |   gold and jewels. No, Ember collected           |  |
|    |   something far more precious - [stories]        |  |
|    |   written on ancient scrolls.                    |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    (Tap the answer in the text above!)                   |
|                                                          |
|           Hint available: [ Need a Hint? ]               |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:

#### Question Area
- **Dragon Avatar**: Friendly, encouraging pose
- **Question Frame**: Clear, simple question
- **Question Types**:
  - "Find the word that tells us..."
  - "Which word describes..."
  - "Tap the word that means..."
  - "What did [character] do? Find it!"

#### Text Excerpt
- **Relevant Passage**: 2-4 sentences containing the answer
- **All Words Tappable**: Any word can be tapped
- **Visual Distinction**: Correct answer NOT visually different
- **Touch Targets**: Same 52px minimum as main reading

#### Support Options
- **Hint Button**: Available after 10 seconds or 1 wrong attempt
- **Skip Option**: Hidden, appears after 2 wrong attempts

**Behavior**:

1. **Correct Answer Tapped**:
   ```
   +----------------------------------------------------+
   |                                                    |
   |    [Dragon breathing small flame]                  |
   |                                                    |
   |    "Yes! 'Stories' is exactly right!               |
   |     Ember loves stories, not gold!"                |
   |                                                    |
   |    [Word 'stories' glows golden]                   |
   |                                                    |
   |              [ Continue Reading ]                  |
   |                                                    |
   +----------------------------------------------------+
   ```
   - Word pulses with celebration animation
   - Dragon provides positive reinforcement
   - Connects answer to story meaning
   - No score displayed

2. **Incorrect Answer Tapped**:
   ```
   +----------------------------------------------------+
   |                                                    |
   |    [Dragon with gentle expression]                 |
   |                                                    |
   |    "Hmm, 'gold' is close - that's what             |
   |     OTHER dragons like. But Ember is               |
   |     different! Try again!"                         |
   |                                                    |
   |    (Wrong word gently fades back)                  |
   |                                                    |
   |              [ Try Again ]                         |
   |                                                    |
   +----------------------------------------------------+
   ```
   - No negative sounds or colors
   - Constructive hint toward correct answer
   - Tapped word dims but doesn't highlight red
   - Encourages retry

3. **Hint Requested**:
   ```
   +----------------------------------------------------+
   |                                                    |
   |    HINT:                                           |
   |                                                    |
   |    "Look for a word that means 'tales'             |
   |     or things you can READ!"                       |
   |                                                    |
   |    [Relevant sentence highlighted softly]          |
   |                                                    |
   +----------------------------------------------------+
   ```
   - Synonym hint
   - Narrows focus area
   - Does NOT highlight answer directly

**Question Data Structure**:

```javascript
const comprehensionCheck = {
  afterPage: 3, // Triggers after page 3
  question: {
    prompt: "Find the word that tells us what Ember collected.",
    questionType: "find_word", // find_word, find_phrase, yes_no
    passageStart: 2, // Sentence index
    passageEnd: 3,
    correctAnswer: "stories",
    correctFeedback: "Yes! 'Stories' is exactly right! Ember loves stories, not gold!",
    hints: [
      "Look for a word that means 'tales'",
      "It starts with 'st'"
    ],
    wrongFeedbacks: {
      "gold": "That's what OTHER dragons like. Ember is different!",
      "jewels": "Close! Those are shiny, but Ember wants something you can read.",
      "default": "Good try! Read the sentence again carefully."
    }
  }
};
```

---

### Screen 3.2: Extended Comprehension (Story Middle)

**After 5-6 pages, slightly more complex questions**:

```
+----------------------------------------------------------+
|                                                          |
|    [Dragon Avatar]                                       |
|                                                          |
|    "The traveler asked Ember a question.                 |
|     Can you find what the traveler wanted?"              |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|   "Great dragon," said the traveler, "I have             |
|    heard you possess the greatest [treasure]             |
|    in all the land. May I look upon it?"                 |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    Tap the word that shows what the traveler             |
|    wanted to SEE.                                        |
|                                                          |
+----------------------------------------------------------+
```

**Progression**:
- Early checks: Single word identification
- Middle checks: Phrase or action identification
- Later checks: Character motivation or cause/effect

---

## Phase 4: Story Completion

**Purpose**: Celebrate achievement and encourage reflection

### Screen 4.1: Celebration Moment

```
+----------------------------------------------------------+
|                                                          |
|                    ***  ***  ***                         |
|                  *    **    **    *                      |
|                      AMAZING!                            |
|                  *    **    **    *                      |
|                    ***  ***  ***                         |
|                                                          |
|              You finished the story!                     |
|                                                          |
|                   [Dragon breathing                      |
|                    celebratory fire]                     |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |     DRAGON SCALES EARNED: [*] [*] [*] [*] [*]   |  |
|    |                                                  |  |
|    |     WORDS READ: 295                              |  |
|    |                                                  |  |
|    |     QUESTIONS ANSWERED: 4/4                      |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|              [ Continue to Reflection ]                  |
|                                                          |
+----------------------------------------------------------+
```

**Animation Sequence**:
1. Screen fills with sparkle particles
2. "AMAZING!" text scales in with bounce
3. Dragon performs celebration animation
4. Dragon scales light up one by one with sound
5. Stats fade in
6. Continue button appears

**Duration**: 5-7 seconds of celebration before button appears

---

### Screen 4.2: Reflection - Favorite Part

```
+----------------------------------------------------------+
|                                                          |
|    [Dragon Avatar - curious pose]                        |
|                                                          |
|    "What was YOUR favorite part of the story?"           |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |  [ ] When Ember showed the scrolls               |  |
|    |                                                  |  |
|    |  [ ] When the words appeared in fire             |  |
|    |                                                  |  |
|    |  [ ] When the traveler read the words            |  |
|    |                                                  |  |
|    |  [ ] The ending when they read together          |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    Or tap to tell me in your own words:                  |
|    [          Voice Recording Button          ]          |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|              [ Skip ]        [ Done! ]                   |
|                                                          |
+----------------------------------------------------------+
```

**UI Elements**:
- **Multiple Choice Options**: Major story moments
- **Voice Recording Option**: Press and hold to record
- **Skip Option**: Always available (no pressure)

**Behavior**:
1. Selection OR recording required to enable "Done"
2. Skip always available without penalty
3. If choice made, dragon responds:
   - "I love that part too! The fire words were magical!"
4. Voice recording saved for parent review (optional)

---

### Screen 4.3: Prediction Check-Back

```
+----------------------------------------------------------+
|                                                          |
|    [Dragon Avatar]                                       |
|                                                          |
|    "Remember what you predicted?"                        |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    You thought:                                          |
|    "The dragon learns to read"                           |
|                                                          |
|    What really happened:                                 |
|    "The dragon taught the traveler that                  |
|     reading is the greatest treasure!"                   |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |  Were you close?  [ Yes! ] [ Kind of ] [ No ]   |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    "Making predictions helps us think                    |
|     about stories. Good job!"                            |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|              [ See What You Unlocked! ]                  |
|                                                          |
+----------------------------------------------------------+
```

**Purpose**:
- Metacognitive awareness
- Validates prediction process (not accuracy)
- Connects pre-reading to post-reading

---

### Screen 4.4: Mini-Game Unlock

```
+----------------------------------------------------------+
|                                                          |
|                    NEW GAME UNLOCKED!                    |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |         [Animated Game Preview]                  |  |
|    |                                                  |  |
|    |         DRAGON'S WORD TREASURE                   |  |
|    |                                                  |  |
|    |    Help Ember find the sight words               |  |
|    |    hidden in the cave!                           |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    This game practices the words from the story!         |
|                                                          |
|    +------------------------+  +------------------------+|
|    |                        |  |                        ||
|    |     [ Play Now! ]      |  |    [ Read Again ]      ||
|    |                        |  |                        ||
|    +------------------------+  +------------------------+|
|                                                          |
|              [ Return to Dragon Lift ]                   |
|                                                          |
+----------------------------------------------------------+
```

**Options**:
1. **Play Now**: Go to mini-game
2. **Read Again**: Go to re-read mode selection
3. **Return**: Back to main menu/elevator

---

## Phase 5: Re-Read Options

**Purpose**: Build fluency through repeated reading with scaffolding fade

### Screen 5.1: Re-Read Mode Selection

```
+----------------------------------------------------------+
|                                                          |
|    [Dragon Avatar]                                       |
|                                                          |
|    "Want to read the story again?                        |
|     Choose how you'd like to read!"                      |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   [Echo Icon]      ECHO READING                  |  |
|    |                                                  |  |
|    |   I read a sentence, then YOU read it!           |  |
|    |                                                  |  |
|    |   Good for: Building confidence                  |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   [Book Icon]      YOUR TURN                     |  |
|    |                                                  |  |
|    |   You read by yourself! Tap words if stuck.      |  |
|    |                                                  |  |
|    |   Good for: Independent reading                  |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   [Mic Icon]       RECORD YOURSELF               |  |
|    |                                                  |  |
|    |   Read the story and record your voice!          |  |
|    |                                                  |  |
|    |   Good for: Hearing yourself read                |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

**Mode Descriptions**:

| Mode | Narration | Child Role | Support Level |
|------|-----------|------------|---------------|
| Echo | ON, pauses after sentence | Repeats sentence | High |
| Your Turn | OFF | Reads independently | Medium (tap support) |
| Record | OFF | Records themselves | Low |

---

### Screen 5.2: Echo Reading Mode

```
+----------------------------------------------------------+
|  [Echo Mode]   Page 1 of 12                      [Exit]  |
+----------------------------------------------------------+
|                                                          |
|  +------------------------+  +--------------------------+|
|  |                        |  |                          ||
|  |    [ILLUSTRATION]      |  |   Long ago, deep in      ||
|  |                        |  |   the mountain caves,    ||
|  |                        |  |   there lived a wise     ||
|  |                        |  |   dragon named Ember.    ||
|  |                        |  |                          ||
|  +------------------------+  +--------------------------+|
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    [Dragon]  "Listen first, then repeat after me!"       |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   (Sentence playing...)                          |  |
|    |   "Long ago, deep in the mountain caves..."      |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|              [ YOUR TURN! - Tap when ready ]             |
|                                                          |
+----------------------------------------------------------+
```

**Echo Mode Behavior**:

1. **Narrator reads one sentence** with word highlighting
2. **Pause with prompt**: "Your turn! Read it back!"
3. **Child reads** (not recorded, just practice)
4. **Child taps "Done"** when finished
5. **Positive feedback**: "Great job!"
6. **Next sentence** proceeds

**No Wrong Answers**: Child is practicing, not tested

---

### Screen 5.3: Your Turn Mode

```
+----------------------------------------------------------+
|  [Your Turn]   Page 1 of 12                      [Exit]  |
+----------------------------------------------------------+
|                                                          |
|  +------------------------+  +--------------------------+|
|  |                        |  |                          ||
|  |    [ILLUSTRATION]      |  |   Long ago, deep in      ||
|  |                        |  |   the [mountain] caves,  ||
|  |                        |  |   there lived a wise     ||
|  |                        |  |   dragon named Ember.    ||
|  |                        |  |                          ||
|  +------------------------+  +--------------------------+|
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    [Dragon]  "Read on your own! Tap any word             |
|               if you need help."                         |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |   Tap a word to hear it                          |  |
|    |   ----------------------------------------       |  |
|    |   [ ] Read to Me (turn narration on)             |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|        [<< Prev Page]           [Next Page >>]           |
|                                                          |
+----------------------------------------------------------+
```

**Your Turn Mode Behavior**:

1. **No automatic narration**
2. **All words tappable** - tap to hear pronunciation
3. **Page advance enabled immediately** (no gate)
4. **"Read to Me" toggle** - can switch to supported reading anytime
5. **No comprehension checks** (already completed)

---

### Screen 5.4: Record Yourself Mode

```
+----------------------------------------------------------+
|  [Recording]   Page 1 of 12                      [Exit]  |
+----------------------------------------------------------+
|                                                          |
|  +------------------------+  +--------------------------+|
|  |                        |  |                          ||
|  |    [ILLUSTRATION]      |  |   Long ago, deep in      ||
|  |                        |  |   the mountain caves,    ||
|  |                        |  |   there lived a wise     ||
|  |                        |  |   dragon named Ember.    ||
|  |                        |  |                          ||
|  +------------------------+  +--------------------------+|
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    RECORDING YOUR READING                                |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |         [    RECORDING...    ]                   |  |
|    |         |||||||||||||||||                        |  |
|    |         (waveform animation)                     |  |
|    |                                                  |  |
|    |   [Stop Recording]        [Hear Sample]          |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
|    Tip: Read at your own pace! Tap words for help.       |
|                                                          |
+----------------------------------------------------------+
```

**Recording Mode Behavior**:

1. **Recording starts** when entering mode
2. **Continuous recording** across all pages
3. **Tap words** still works (plays pronunciation)
4. **Stop Recording** to pause and listen
5. **At story end**:
   - Play back full recording
   - Option to save for parent/keep
   - Option to re-record

---

## Phase 6: Mini-Game (Post-Story)

**Purpose**: Reinforce specific skills from the story

**Design Principles**:
- Directly connected to story content
- 2-3 minutes maximum
- One clear skill focus
- Replayable

### Screen 6.1: Game - Dragon's Word Treasure

**Game Type**: Sight Word Cave Hunt

```
+----------------------------------------------------------+
|  Dragon's Word Treasure            Words: 3/5    [Exit]  |
+----------------------------------------------------------+
|                                                          |
|                    [Cave Scene]                          |
|                                                          |
|    +--------------------------------------------------+  |
|    |     *                            *               |  |
|    |          *     [glowing scroll]                  |  |
|    |    *             "fire"               *          |  |
|    |                                                  |  |
|    |         [rock]       [rock with word]            |  |
|    |                         "come"                   |  |
|    |    [stalagmite]                                  |  |
|    |                    [Ember Dragon]                |  |
|    |       [glowing word]                             |  |
|    |          "see"           [crystal]               |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    [Dragon]  "Find and tap the word: SEE"                |
|                                                          |
|    +--------------------------------------------------+  |
|    |                                                  |  |
|    |              [ HINT ]                            |  |
|    |                                                  |  |
|    +--------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

**Gameplay**:

1. **Dragon calls out word** (audio + text)
2. **Child scans cave scene** for matching word
3. **Words hidden** on scrolls, rocks, crystals
4. **Correct tap**:
   - Word flies to treasure chest
   - Dragon celebrates
   - Next word called
5. **Wrong tap**:
   - Gentle "try again" feedback
   - Word subtly pulses as hint
6. **Completion**:
   - Treasure chest opens with all words
   - Dragon scale reward earned
   - Option to play again

**Educational Focus**:
- Sight word recognition
- Visual scanning
- Audio-visual matching

---

### Screen 6.2: Alternative Game - Story Sequencing

```
+----------------------------------------------------------+
|  Story Order                       Correct: 2/4   [Exit] |
+----------------------------------------------------------+
|                                                          |
|    [Dragon]  "Put the story in order!"                   |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|    DRAG TO THE CORRECT ORDER:                            |
|                                                          |
|    +--------------------------------------------------+  |
|    |  1. [ Drop Zone ]                                |  |
|    |  2. [ The traveler reads the words ]  <-- placed |  |
|    |  3. [ Drop Zone ]                                |  |
|    |  4. [ Drop Zone ]                                |  |
|    +--------------------------------------------------+  |
|                                                          |
|    STORY PIECES:                                         |
|                                                          |
|    +---------------+  +---------------+  +---------------+|
|    | The traveler  |  | Ember shows   |  | They read     ||
|    | arrives at    |  | the scrolls   |  | together      ||
|    | the cave      |  |               |  | forever       ||
|    +---------------+  +---------------+  +---------------+|
|                                                          |
+----------------------------------------------------------+
|                                                          |
|                      [ Check Order ]                     |
|                                                          |
+----------------------------------------------------------+
```

**Educational Focus**:
- Narrative sequencing
- Story structure
- Comprehension reinforcement

---

## UI Mode Variations

### How UI Changes Between Modes

| Element | First Read | Echo Read | Your Turn | Record |
|---------|------------|-----------|-----------|--------|
| Narration | Auto-play | Sentence-by-sentence | OFF | OFF |
| Highlighting | Word-by-word | Sentence | None | None |
| Word Tap | Hear word | Hear word | Hear word | Hear word |
| Progress Bar | Yes | Yes | No | Recording bar |
| Speed Controls | Yes | No | No | No |
| Comprehension | Every 2-3 pages | No | No | No |
| Page Gate | Must finish page | After repeat | Free navigation | Free navigation |
| Bottom Bar | Play controls | "Your turn" prompt | Help tips | Recording controls |

### Visual Mode Indicators

```
+----------------------------------------------------------+
|                                                          |
|  FIRST READ:    [Speaker icon with waves]                |
|                 "Reading Together"                       |
|                                                          |
|  ECHO READ:     [Two speakers icon]                      |
|                 "Echo Reading"                           |
|                                                          |
|  YOUR TURN:     [Single child icon]                      |
|                 "Independent Reading"                    |
|                                                          |
|  RECORD:        [Microphone icon]                        |
|                 "Recording Your Reading"                 |
|                                                          |
+----------------------------------------------------------+
```

Each mode has:
- Distinct icon in header
- Consistent color coding
- Mode label visible at all times
- Different bottom bar controls

---

## Screen-by-Screen Wireframes

### Complete Flow Sequence

```
1.  LOBBY
    ↓
2.  STORY SELECTION
    ↓
3.  PRE-READ: Vocabulary Preview
    ↓
4.  PRE-READ: Prediction Prompt
    ↓
5.  PRE-READ: Character Introduction
    ↓
6.  FIRST READ: Page 1-2
    ↓
7.  COMPREHENSION: Check 1
    ↓
8.  FIRST READ: Page 3-4
    ↓
9.  COMPREHENSION: Check 2
    ↓
10. FIRST READ: Page 5-6
    ↓
11. COMPREHENSION: Check 3
    ↓
12. FIRST READ: Page 7-8 (Final)
    ↓
13. COMPLETION: Celebration
    ↓
14. COMPLETION: Reflection
    ↓
15. COMPLETION: Prediction Review
    ↓
16. COMPLETION: Game Unlock
    ↓
17. CHOICE: Re-Read / Play Game / Exit
    ↓
18. RE-READ: Mode Selection (if chosen)
    ↓
19. RE-READ: Echo/YourTurn/Record Flow
    ↓
20. MINI-GAME: Word Treasure (if chosen)
    ↓
21. RETURN: Back to Lobby
```

---

## State Management

### Reading Session State

```javascript
const ReadingSessionState = {
  // Story identification
  storyId: "ember-dragon-treasure",
  storyTitle: "The Ember Dragon's Hidden Treasure",

  // Pre-reading phase
  preReading: {
    vocabularyComplete: false,
    wordsReviewed: [],
    predictionMade: null, // "dragon_finds_gold", "makes_friend", etc.
    characterIntroSeen: false
  },

  // First read progress
  firstRead: {
    currentPage: 1,
    totalPages: 8,
    pagesCompleted: [],
    currentMode: "first_read", // first_read, echo, your_turn, record
    narrationEnabled: true,
    currentSpeed: "normal", // slow, normal, fast
    wordsHeard: [], // indices of words tapped for pronunciation
    currentWordIndex: 0, // for highlighting
    narrationPosition: 0 // timestamp in audio
  },

  // Comprehension tracking
  comprehension: {
    checksCompleted: 0,
    totalChecks: 4,
    responses: [
      {
        questionId: "q1",
        attempts: 1,
        hintsUsed: 0,
        correct: true,
        responseWord: "stories"
      }
    ]
  },

  // Completion
  completion: {
    storyFinished: false,
    celebrationSeen: false,
    favoritePartResponse: null,
    predictionReviewSeen: false,
    gameUnlocked: false
  },

  // Re-read tracking
  reRead: {
    timesReread: 0,
    modesUsed: [], // ["echo", "your_turn"]
    recordings: [] // saved recording metadata
  },

  // Mini-game
  miniGame: {
    played: false,
    highScore: 0,
    wordsFound: []
  },

  // Metrics (for parent dashboard)
  metrics: {
    sessionStartTime: null,
    totalReadingTime: 0, // seconds
    wordsTapped: 0,
    pagesPerMinute: 0,
    comprehensionAccuracy: 100 // percentage
  }
};
```

### State Transitions

```javascript
const StateTransitions = {
  // Pre-reading phase
  "VOCABULARY_WORD_TAPPED": (state, word) => {
    return {
      ...state,
      preReading: {
        ...state.preReading,
        wordsReviewed: [...state.preReading.wordsReviewed, word],
        vocabularyComplete: state.preReading.wordsReviewed.length + 1 >= 5
      }
    };
  },

  "PREDICTION_MADE": (state, prediction) => {
    return {
      ...state,
      preReading: {
        ...state.preReading,
        predictionMade: prediction
      }
    };
  },

  // Reading phase
  "PAGE_COMPLETED": (state, pageNum) => {
    return {
      ...state,
      firstRead: {
        ...state.firstRead,
        pagesCompleted: [...state.firstRead.pagesCompleted, pageNum],
        currentPage: pageNum + 1
      }
    };
  },

  "NARRATION_SPEED_CHANGED": (state, speed) => {
    return {
      ...state,
      firstRead: {
        ...state.firstRead,
        currentSpeed: speed
      }
    };
  },

  "WORD_TAPPED": (state, wordIndex) => {
    return {
      ...state,
      firstRead: {
        ...state.firstRead,
        wordsHeard: [...new Set([...state.firstRead.wordsHeard, wordIndex])]
      },
      metrics: {
        ...state.metrics,
        wordsTapped: state.metrics.wordsTapped + 1
      }
    };
  },

  // Comprehension
  "COMPREHENSION_ANSWERED": (state, response) => {
    return {
      ...state,
      comprehension: {
        ...state.comprehension,
        checksCompleted: state.comprehension.checksCompleted + 1,
        responses: [...state.comprehension.responses, response]
      }
    };
  },

  // Mode changes
  "MODE_CHANGED": (state, newMode) => {
    return {
      ...state,
      firstRead: {
        ...state.firstRead,
        currentMode: newMode
      },
      reRead: {
        ...state.reRead,
        modesUsed: [...new Set([...state.reRead.modesUsed, newMode])]
      }
    };
  }
};
```

---

## Accessibility Considerations

### Visual Accessibility

| Feature | Implementation |
|---------|----------------|
| Color Contrast | All text meets WCAG AA (4.5:1 minimum) |
| Highlighted Words | Use background + scale, not color alone |
| Buttons | Include icons AND text labels |
| Progress Indicators | Use shapes (filled/empty) not just color |
| Error States | Icon + color + text explanation |

### Motor Accessibility

| Feature | Implementation |
|---------|----------------|
| Touch Targets | Minimum 52x52px for all interactive elements |
| Swipe Alternatives | Tap buttons available for all swipe actions |
| Drag-Drop | Tap-to-select alternative in sequencing game |
| Time Limits | No timed interactions in reading flow |
| Pause Capability | Narration can be paused indefinitely |

### Auditory Accessibility

| Feature | Implementation |
|---------|----------------|
| Captions | All narration has synced text |
| Visual Feedback | Sound effects accompanied by animations |
| Narration Off | App fully functional without audio |
| Volume Control | In-app volume separate from device |

### Cognitive Accessibility

| Feature | Implementation |
|---------|----------------|
| Clear Instructions | Dragon provides step-by-step guidance |
| Consistent Layout | Same structure across all pages |
| Undo/Retry | Always possible without penalty |
| Progress Saving | Auto-save at each phase transition |
| Simple Navigation | Maximum 2 taps to reach any function |

### Dyslexia-Friendly Options

```css
/* Dyslexia mode toggle */
.dyslexia-mode .story-text {
  font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif;
  letter-spacing: 0.1em;
  word-spacing: 0.25em;
  line-height: 2.5;
  font-size: 32px;
}

.dyslexia-mode .word {
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.dyslexia-mode .word-current {
  background: #FFF3CD; /* Warm cream, not harsh yellow */
  color: #000;
}
```

---

## Implementation Priority

### Phase 1 (MVP)
1. Pre-reading: Vocabulary preview only
2. First Read with basic highlighting
3. Simple tap-to-hear words
4. Story completion celebration
5. Single comprehension check type

### Phase 2
1. Full pre-reading sequence
2. Speed controls
3. Multiple comprehension question types
4. Reflection prompts
5. Echo reading mode

### Phase 3
1. Your Turn mode
2. Record mode
3. Mini-game
4. Parent dashboard integration
5. Progress persistence

### Phase 4
1. Accessibility options menu
2. Dyslexia mode
3. Multiple language support
4. Advanced analytics
5. Custom story creation

---

## Summary

This Reading Experience Flow creates a complete, research-backed reading journey that:

1. **Prepares** the reader with vocabulary and predictions
2. **Supports** with full narration and word-level help
3. **Checks** understanding without stress or punishment
4. **Celebrates** completion meaningfully
5. **Builds** fluency through varied re-reading modes
6. **Reinforces** with connected mini-games

The UI adapts smoothly between phases and modes, always maintaining the Dragon Lift aesthetic while prioritizing readability and child-friendly interaction patterns.

---

*Designed for Isaiah's Grade 1 Learning Journey*
*Integrates with Dragon Lift Educational Platform*
