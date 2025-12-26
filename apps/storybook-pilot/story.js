/**
 * THE MIDNIGHT PIZZA TRAIN
 * Interactive Story Content for Isaiah
 *
 * Story Structure:
 * - 10 pages with word-by-word timing data
 * - 3 comprehension checkpoints
 * - Target sight words: and, said, to, into, like, this, will, with, look, there
 * - Mini-game ingredients for Dream Pizza Kitchen
 */

const STORY_DATA = {
  title: "The Midnight Pizza Train",
  author: "Dream Kitchen Press",
  targetReader: "Isaiah",
  gradeLevel: 1,

  // Sight words to emphasize throughout
  sightWords: ['and', 'said', 'to', 'into', 'like', 'this', 'will', 'with', 'look', 'there'],

  // Total pages in the story
  totalPages: 10,

  // Pages array with all content
  pages: [
    // ============================================
    // PAGE 1: The Discovery
    // ============================================
    {
      pageNumber: 1,
      scene: "station",
      sceneLabel: "The Station at Midnight",
      sceneEmoji: "🚉",
      sceneDescription: "A magical train station bathed in golden light. An old wooden clock strikes midnight. Steam rises from brass vents in the floor.",

      // Story text with word-by-word data
      text: "It was midnight. Isaiah could not sleep. He went to the window and looked outside.",

      // Words array with timing (milliseconds) for narration sync
      words: [
        { text: "It", start: 0, duration: 200 },
        { text: "was", start: 250, duration: 200 },
        { text: "midnight.", start: 500, duration: 400 },
        { text: "Isaiah", start: 1000, duration: 400 },
        { text: "could", start: 1500, duration: 250 },
        { text: "not", start: 1800, duration: 200 },
        { text: "sleep.", start: 2100, duration: 400 },
        { text: "He", start: 2700, duration: 150 },
        { text: "went", start: 2900, duration: 250 },
        { text: "to", start: 3200, duration: 150, isSightWord: true },
        { text: "the", start: 3400, duration: 150 },
        { text: "window", start: 3600, duration: 350 },
        { text: "and", start: 4050, duration: 150, isSightWord: true },
        { text: "looked", start: 4250, duration: 300 },
        { text: "outside.", start: 4600, duration: 450 }
      ],

      // No comprehension check on page 1
      comprehensionCheck: null
    },

    // ============================================
    // PAGE 2: The Magical Train Appears
    // ============================================
    {
      pageNumber: 2,
      scene: "station",
      sceneLabel: "The Magical Arrival",
      sceneEmoji: "🚂",
      sceneDescription: "A golden steam train emerges from swirling mist. Its headlight glows like the sun. Smoke puffs form heart shapes.",

      text: "There was a train! But this was not a normal train. It was made of gold and smelled like pizza!",

      words: [
        { text: "There", start: 0, duration: 250, isSightWord: true },
        { text: "was", start: 300, duration: 200 },
        { text: "a", start: 550, duration: 100 },
        { text: "train!", start: 700, duration: 350 },
        { text: "But", start: 1200, duration: 200 },
        { text: "this", start: 1450, duration: 200, isSightWord: true },
        { text: "was", start: 1700, duration: 200 },
        { text: "not", start: 1950, duration: 200 },
        { text: "a", start: 2200, duration: 100 },
        { text: "normal", start: 2350, duration: 350 },
        { text: "train.", start: 2750, duration: 350 },
        { text: "It", start: 3300, duration: 150 },
        { text: "was", start: 3500, duration: 200 },
        { text: "made", start: 3750, duration: 250 },
        { text: "of", start: 4050, duration: 150 },
        { text: "gold", start: 4250, duration: 300 },
        { text: "and", start: 4600, duration: 150, isSightWord: true },
        { text: "smelled", start: 4800, duration: 350 },
        { text: "like", start: 5200, duration: 200, isSightWord: true },
        { text: "pizza!", start: 5450, duration: 400 }
      ],

      comprehensionCheck: null
    },

    // ============================================
    // PAGE 3: Meeting the Conductor
    // ============================================
    {
      pageNumber: 3,
      scene: "train",
      sceneLabel: "The Conductor's Welcome",
      sceneEmoji: "🧑‍✈️",
      sceneDescription: "Inside a warm wooden train car. A friendly conductor with a pizza-shaped badge smiles warmly. Brass lanterns glow.",

      text: '"Welcome!" said the conductor. "I am Chef Marco. Will you help me? The Dream Oven is broken!"',

      words: [
        { text: '"Welcome!"', start: 0, duration: 450 },
        { text: "said", start: 550, duration: 250, isSightWord: true },
        { text: "the", start: 850, duration: 150 },
        { text: "conductor.", start: 1050, duration: 450 },
        { text: '"I', start: 1700, duration: 150 },
        { text: "am", start: 1900, duration: 150 },
        { text: "Chef", start: 2100, duration: 250 },
        { text: 'Marco.', start: 2400, duration: 350 },
        { text: "Will", start: 2950, duration: 200, isSightWord: true },
        { text: "you", start: 3200, duration: 200 },
        { text: "help", start: 3450, duration: 250 },
        { text: "me?", start: 3750, duration: 250 },
        { text: "The", start: 4200, duration: 150 },
        { text: "Dream", start: 4400, duration: 300 },
        { text: "Oven", start: 4750, duration: 300 },
        { text: "is", start: 5100, duration: 150 },
        { text: 'broken!"', start: 5300, duration: 450 }
      ],

      // First comprehension checkpoint!
      comprehensionCheck: {
        question: "Who did Isaiah meet on the train?",
        answers: [
          { text: "Chef Marco the conductor", correct: true },
          { text: "A pizza delivery person", correct: false },
          { text: "His mom", correct: false }
        ],
        correctFeedback: "That's right! Chef Marco is the conductor!",
        incorrectFeedback: "Not quite. Isaiah met Chef Marco, the conductor."
      }
    },

    // ============================================
    // PAGE 4: The Quest Begins
    // ============================================
    {
      pageNumber: 4,
      scene: "train",
      sceneLabel: "The Special Ingredients",
      sceneEmoji: "📜",
      sceneDescription: "Chef Marco holds an old scroll with three glowing symbols. The train car is filled with herbs and spices.",

      text: '"To fix the oven," said Marco, "we need three things. A Kindness Crumb. A Courage Spark. And a Love Seed."',

      words: [
        { text: '"To', start: 0, duration: 150, isSightWord: true },
        { text: "fix", start: 200, duration: 200 },
        { text: "the", start: 450, duration: 150 },
        { text: 'oven,"', start: 650, duration: 300 },
        { text: "said", start: 1050, duration: 250, isSightWord: true },
        { text: "Marco,", start: 1350, duration: 350 },
        { text: '"we', start: 1850, duration: 150 },
        { text: "need", start: 2050, duration: 250 },
        { text: "three", start: 2350, duration: 250 },
        { text: "things.", start: 2650, duration: 350 },
        { text: "A", start: 3200, duration: 100 },
        { text: "Kindness", start: 3350, duration: 400 },
        { text: "Crumb.", start: 3800, duration: 350 },
        { text: "A", start: 4350, duration: 100 },
        { text: "Courage", start: 4500, duration: 400 },
        { text: "Spark.", start: 4950, duration: 350 },
        { text: "And", start: 5500, duration: 150, isSightWord: true },
        { text: "a", start: 5700, duration: 100 },
        { text: "Love", start: 5850, duration: 250 },
        { text: 'Seed."', start: 6150, duration: 350 }
      ],

      comprehensionCheck: null
    },

    // ============================================
    // PAGE 5: Finding the Kindness Crumb
    // ============================================
    {
      pageNumber: 5,
      scene: "kitchen",
      sceneLabel: "The Kindness Kitchen",
      sceneEmoji: "💛",
      sceneDescription: "A cozy kitchen car with warm ovens. A small mouse looks sad, holding an empty bowl. Bread crumbs scattered on the counter.",

      text: 'In the kitchen car, Isaiah saw a sad little mouse. "I am so hungry," the mouse said. Isaiah gave it some bread.',

      words: [
        { text: "In", start: 0, duration: 150 },
        { text: "the", start: 200, duration: 150 },
        { text: "kitchen", start: 400, duration: 350 },
        { text: "car,", start: 800, duration: 250 },
        { text: "Isaiah", start: 1150, duration: 400 },
        { text: "saw", start: 1600, duration: 250 },
        { text: "a", start: 1900, duration: 100 },
        { text: "sad", start: 2050, duration: 250 },
        { text: "little", start: 2350, duration: 300 },
        { text: "mouse.", start: 2700, duration: 350 },
        { text: '"I', start: 3250, duration: 150 },
        { text: "am", start: 3450, duration: 150 },
        { text: "so", start: 3650, duration: 150 },
        { text: 'hungry,"', start: 3850, duration: 350 },
        { text: "the", start: 4300, duration: 150 },
        { text: "mouse", start: 4500, duration: 300 },
        { text: "said.", start: 4850, duration: 300, isSightWord: true },
        { text: "Isaiah", start: 5350, duration: 400 },
        { text: "gave", start: 5800, duration: 250 },
        { text: "it", start: 6100, duration: 150 },
        { text: "some", start: 6300, duration: 250 },
        { text: "bread.", start: 6600, duration: 350 }
      ],

      comprehensionCheck: null
    },

    // ============================================
    // PAGE 6: The Kindness Reward
    // ============================================
    {
      pageNumber: 6,
      scene: "kitchen",
      sceneLabel: "The First Ingredient",
      sceneEmoji: "✨",
      sceneDescription: "The happy mouse glows with golden light. A sparkling crumb floats up from the shared bread. Isaiah catches it gently.",

      text: 'The mouse smiled. "Thank you!" A golden crumb appeared. It was the Kindness Crumb! "Look at that!" said Marco with a grin.',

      words: [
        { text: "The", start: 0, duration: 150 },
        { text: "mouse", start: 200, duration: 300 },
        { text: "smiled.", start: 550, duration: 350 },
        { text: '"Thank', start: 1100, duration: 300 },
        { text: 'you!"', start: 1450, duration: 300 },
        { text: "A", start: 1950, duration: 100 },
        { text: "golden", start: 2100, duration: 350 },
        { text: "crumb", start: 2500, duration: 300 },
        { text: "appeared.", start: 2850, duration: 450 },
        { text: "It", start: 3500, duration: 150 },
        { text: "was", start: 3700, duration: 200 },
        { text: "the", start: 3950, duration: 150 },
        { text: "Kindness", start: 4150, duration: 400 },
        { text: "Crumb!", start: 4600, duration: 350 },
        { text: '"Look', start: 5150, duration: 250, isSightWord: true },
        { text: "at", start: 5450, duration: 150 },
        { text: 'that!"', start: 5650, duration: 300 },
        { text: "said", start: 6050, duration: 250, isSightWord: true },
        { text: "Marco", start: 6350, duration: 350 },
        { text: "with", start: 6750, duration: 200, isSightWord: true },
        { text: "a", start: 7000, duration: 100 },
        { text: "grin.", start: 7150, duration: 300 }
      ],

      // Second comprehension checkpoint!
      comprehensionCheck: {
        question: "How did Isaiah get the Kindness Crumb?",
        answers: [
          { text: "He shared bread with a hungry mouse", correct: true },
          { text: "He found it on the floor", correct: false },
          { text: "Chef Marco gave it to him", correct: false }
        ],
        correctFeedback: "Yes! Being kind to the mouse made the Kindness Crumb appear!",
        incorrectFeedback: "Remember, Isaiah shared his bread with the hungry mouse."
      }
    },

    // ============================================
    // PAGE 7: The Shadow Car
    // ============================================
    {
      pageNumber: 7,
      scene: "shadow",
      sceneLabel: "The Dark Car",
      sceneEmoji: "👻",
      sceneDescription: "A dark train car with shadows dancing on the walls. Scary shapes seem to move. A small orange spark glows in the distance.",

      text: 'The next car was dark and scary. Isaiah felt afraid. But he walked into the darkness anyway. He had to be brave.',

      words: [
        { text: "The", start: 0, duration: 150 },
        { text: "next", start: 200, duration: 250 },
        { text: "car", start: 500, duration: 250 },
        { text: "was", start: 800, duration: 200 },
        { text: "dark", start: 1050, duration: 300 },
        { text: "and", start: 1400, duration: 150, isSightWord: true },
        { text: "scary.", start: 1600, duration: 400 },
        { text: "Isaiah", start: 2200, duration: 400 },
        { text: "felt", start: 2650, duration: 250 },
        { text: "afraid.", start: 2950, duration: 400 },
        { text: "But", start: 3550, duration: 200 },
        { text: "he", start: 3800, duration: 150 },
        { text: "walked", start: 4000, duration: 300 },
        { text: "into", start: 4350, duration: 250, isSightWord: true },
        { text: "the", start: 4650, duration: 150 },
        { text: "darkness", start: 4850, duration: 400 },
        { text: "anyway.", start: 5300, duration: 400 },
        { text: "He", start: 5900, duration: 150 },
        { text: "had", start: 6100, duration: 200 },
        { text: "to", start: 6350, duration: 150, isSightWord: true },
        { text: "be", start: 6550, duration: 150 },
        { text: "brave.", start: 6750, duration: 400 }
      ],

      comprehensionCheck: null
    },

    // ============================================
    // PAGE 8: Finding the Courage Spark
    // ============================================
    {
      pageNumber: 8,
      scene: "shadow",
      sceneLabel: "Courage Found",
      sceneEmoji: "🧡",
      sceneDescription: "The shadows dissolve into butterflies. An orange spark floats in the center of the car. Isaiah reaches for it bravely.",

      text: 'When Isaiah kept walking, the shadows went away! A bright orange spark floated to him. He had found the Courage Spark!',

      words: [
        { text: "When", start: 0, duration: 250 },
        { text: "Isaiah", start: 300, duration: 400 },
        { text: "kept", start: 750, duration: 250 },
        { text: "walking,", start: 1050, duration: 350 },
        { text: "the", start: 1500, duration: 150 },
        { text: "shadows", start: 1700, duration: 400 },
        { text: "went", start: 2150, duration: 250 },
        { text: "away!", start: 2450, duration: 350 },
        { text: "A", start: 3000, duration: 100 },
        { text: "bright", start: 3150, duration: 300 },
        { text: "orange", start: 3500, duration: 350 },
        { text: "spark", start: 3900, duration: 300 },
        { text: "floated", start: 4250, duration: 350 },
        { text: "to", start: 4650, duration: 150, isSightWord: true },
        { text: "him.", start: 4850, duration: 250 },
        { text: "He", start: 5300, duration: 150 },
        { text: "had", start: 5500, duration: 200 },
        { text: "found", start: 5750, duration: 300 },
        { text: "the", start: 6100, duration: 150 },
        { text: "Courage", start: 6300, duration: 400 },
        { text: "Spark!", start: 6750, duration: 400 }
      ],

      comprehensionCheck: null
    },

    // ============================================
    // PAGE 9: The Love Seed
    // ============================================
    {
      pageNumber: 9,
      scene: "dream",
      sceneLabel: "The Heart of the Train",
      sceneEmoji: "❤️",
      sceneDescription: "A beautiful garden car with heart-shaped plants. Chef Marco looks worried near a cold oven. A red seed glows in Isaiah's heart.",

      text: '"Where is the Love Seed?" Isaiah asked. Marco smiled. "It was with you all along. You love to help others. That is the Love Seed."',

      words: [
        { text: '"Where', start: 0, duration: 300 },
        { text: "is", start: 350, duration: 150 },
        { text: "the", start: 550, duration: 150 },
        { text: "Love", start: 750, duration: 250 },
        { text: 'Seed?"', start: 1050, duration: 350 },
        { text: "Isaiah", start: 1600, duration: 400 },
        { text: "asked.", start: 2050, duration: 350 },
        { text: "Marco", start: 2600, duration: 350 },
        { text: "smiled.", start: 3000, duration: 350 },
        { text: '"It', start: 3550, duration: 150 },
        { text: "was", start: 3750, duration: 200 },
        { text: "with", start: 4000, duration: 200, isSightWord: true },
        { text: "you", start: 4250, duration: 200 },
        { text: "all", start: 4500, duration: 200 },
        { text: "along.", start: 4750, duration: 350 },
        { text: "You", start: 5300, duration: 200 },
        { text: "love", start: 5550, duration: 250 },
        { text: "to", start: 5850, duration: 150, isSightWord: true },
        { text: "help", start: 6050, duration: 250 },
        { text: "others.", start: 6350, duration: 400 },
        { text: "That", start: 6950, duration: 250 },
        { text: "is", start: 7250, duration: 150 },
        { text: "the", start: 7450, duration: 150 },
        { text: "Love", start: 7650, duration: 250 },
        { text: 'Seed."', start: 7950, duration: 400 }
      ],

      // Third comprehension checkpoint!
      comprehensionCheck: {
        question: "Where was the Love Seed?",
        answers: [
          { text: "In the garden car", correct: false },
          { text: "It was inside Isaiah all along", correct: true },
          { text: "Chef Marco had it", correct: false }
        ],
        correctFeedback: "Exactly! The love in Isaiah's heart was the Love Seed!",
        incorrectFeedback: "The Love Seed was inside Isaiah because he loves to help others."
      }
    },

    // ============================================
    // PAGE 10: The Happy Ending
    // ============================================
    {
      pageNumber: 10,
      scene: "dream",
      sceneLabel: "The Dream Oven Glows",
      sceneEmoji: "🍕",
      sceneDescription: "The Dream Oven blazes with golden fire. Magical pizzas float in the air. Isaiah and Marco celebrate. The train glows with warmth.",

      text: 'Isaiah put all three things into the oven. It roared to life! Golden pizzas flew out. "You did it!" said Marco. "Thank you, little chef!"',

      words: [
        { text: "Isaiah", start: 0, duration: 400 },
        { text: "put", start: 450, duration: 200 },
        { text: "all", start: 700, duration: 200 },
        { text: "three", start: 950, duration: 250 },
        { text: "things", start: 1250, duration: 300 },
        { text: "into", start: 1600, duration: 250, isSightWord: true },
        { text: "the", start: 1900, duration: 150 },
        { text: "oven.", start: 2100, duration: 350 },
        { text: "It", start: 2650, duration: 150 },
        { text: "roared", start: 2850, duration: 350 },
        { text: "to", start: 3250, duration: 150, isSightWord: true },
        { text: "life!", start: 3450, duration: 350 },
        { text: "Golden", start: 4000, duration: 350 },
        { text: "pizzas", start: 4400, duration: 400 },
        { text: "flew", start: 4850, duration: 250 },
        { text: "out.", start: 5150, duration: 300 },
        { text: '"You', start: 5650, duration: 200 },
        { text: "did", start: 5900, duration: 200 },
        { text: 'it!"', start: 6150, duration: 300 },
        { text: "said", start: 6550, duration: 250, isSightWord: true },
        { text: "Marco.", start: 6850, duration: 350 },
        { text: '"Thank', start: 7400, duration: 300 },
        { text: "you,", start: 7750, duration: 250 },
        { text: "little", start: 8050, duration: 300 },
        { text: 'chef!"', start: 8400, duration: 400 }
      ],

      comprehensionCheck: null
    }
  ],

  // Mini-game ingredients for the Dream Pizza Kitchen
  miniGameData: {
    title: "Dream Pizza Kitchen",
    instruction: "Sort the ingredients into the right bowls!",
    targetScore: 3,

    ingredients: [
      // Kindness ingredients
      { emoji: "🍞", label: "Bread", category: "kindness" },
      { emoji: "🥛", label: "Milk", category: "kindness" },
      { emoji: "🍪", label: "Cookie", category: "kindness" },

      // Courage ingredients
      { emoji: "🌶️", label: "Pepper", category: "courage" },
      { emoji: "🔥", label: "Fire", category: "courage" },
      { emoji: "⚡", label: "Lightning", category: "courage" },

      // Love ingredients
      { emoji: "❤️", label: "Heart", category: "love" },
      { emoji: "🌹", label: "Rose", category: "love" },
      { emoji: "💝", label: "Gift", category: "love" }
    ],

    bowls: [
      { id: "kindness", label: "Kindness", icon: "💛" },
      { id: "courage", label: "Courage", icon: "🧡" },
      { id: "love", label: "Love", icon: "❤️" }
    ]
  },

  // Completion rewards
  completionData: {
    badge: {
      icon: "🍕",
      name: "Pizza Chef Reader"
    },
    message: "You helped Isaiah save the Dream Oven!",
    stats: {
      pagesRead: 10,
      sightWordsLearned: 10,
      questionsAnswered: 3
    }
  }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STORY_DATA;
}
