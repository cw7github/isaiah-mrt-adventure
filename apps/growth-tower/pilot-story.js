/**
 * THE STORYTELLING SUNFLOWER
 * A magical story told by the sunflower as it grows
 * ~200 words, age-appropriate for Grade 1
 */

const sunflowerStory = {
  title: "The Storytelling Sunflower",
  author: "Sunny the Sunflower",
  segments: [
    {
      text: "Hello, little gardener! My name is Sunny, and I'm so happy you planted me. Can you believe I started as just a tiny seed? Now let me tell you my story!",
      illustration: "baby-sunflower"
    },
    {
      text: "When I was a seed, I slept deep in the dark soil. It was cozy and quiet. Then one day, something magical happened—you gave me water! The water woke me up, and I knew it was time to start my adventure.",
      illustration: "seed-waking"
    },
    {
      text: "First, I pushed out a little root. My root stretched down, down, down into the earth, searching for water and food. Roots are very important—they help me stand tall and strong!",
      illustration: "root-growing"
    },
    {
      text: "Next, I pushed a tiny green shoot up, up, up toward the sky. Breaking through the soil was hard work, but I was so excited to see the sunshine! When the warm light touched my leaves, I felt so happy.",
      illustration: "shoot-emerging"
    },
    {
      text: "Day by day, I grew taller. I made more leaves to catch the sunlight. Did you know that sunlight is like food for plants? We use it to make energy—that's called photosynthesis! It's like having a superpower!",
      illustration: "growing-tall"
    },
    {
      text: "Finally, the most magical moment came. I grew a beautiful yellow flower on top! Bees and butterflies came to visit me. They loved my bright petals. Some of my seeds will grow into new sunflowers, just like you helped me grow!",
      illustration: "blooming"
    },
    {
      text: "Thank you for taking care of me, little gardener. You gave me water, and the sun gave me light. Together, we made something beautiful. Remember: every big, beautiful thing starts small—just like you and me! 🌻",
      illustration: "complete-sunflower"
    }
  ],

  // Calculate total word count
  getTotalWords() {
    const allText = this.segments.map(seg => seg.text).join(' ');
    return allText.split(/\s+/).length;
  },

  // Get a specific segment
  getSegment(index) {
    return this.segments[index] || null;
  },

  // Get total number of segments
  getTotalSegments() {
    return this.segments.length;
  },

  // Get reading progress percentage
  getProgress(currentSegment) {
    return Math.round((currentSegment / this.segments.length) * 100);
  }
};

// Educational vocabulary words highlighted in the story
const vocabularyWords = {
  "photosynthesis": {
    definition: "How plants use sunlight to make food",
    simplified: "Plants eat sunlight!"
  },
  "germination": {
    definition: "When a seed starts to grow",
    simplified: "The seed wakes up and starts growing"
  },
  "roots": {
    definition: "The parts of a plant that grow underground to get water",
    simplified: "Like plant feet that drink water"
  },
  "petals": {
    definition: "The colorful parts of a flower",
    simplified: "The pretty leaves around a flower"
  },
  "pollination": {
    definition: "When bees help flowers make new seeds",
    simplified: "Bees help flowers make baby flowers"
  }
};

// Fun facts about sunflowers
const sunflowerFacts = [
  "Sunflowers can grow up to 12 feet tall—that's taller than your dad!",
  "Sunflowers always turn their faces to follow the sun across the sky.",
  "One sunflower can have up to 2,000 seeds!",
  "Sunflowers are native to North America—they grew here first!",
  "The tallest sunflower ever grown was 30 feet tall!",
  "Sunflower seeds are yummy snacks and can also be made into oil.",
  "Baby sunflowers are called seedlings.",
  "Sunflowers can clean dirty soil—they're like nature's vacuum cleaners!"
];

// Math problems embedded in the story
const gardenMath = {
  watering: {
    question: "If Sunny needs 5 drops of water today and 5 drops tomorrow, how many drops total?",
    answer: 10,
    hint: "Add 5 + 5"
  },
  petals: {
    question: "If a sunflower has 8 petals and you see 3 sunflowers, how many petals in total?",
    answer: 24,
    hint: "Count by 8s: 8, 16, 24"
  },
  seeds: {
    question: "If you plant 3 seeds and each grows 2 flowers, how many flowers?",
    answer: 6,
    hint: "3 × 2 = ?"
  }
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sunflowerStory, vocabularyWords, sunflowerFacts, gardenMath };
}
