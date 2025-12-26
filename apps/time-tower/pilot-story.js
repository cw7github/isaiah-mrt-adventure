/**
 * THE TIME TOWER - PILOT STORY
 * Ancient Egypt: Honey Bread Recipe
 *
 * This is the complete story for the Ancient Egypt cooking adventure.
 * Designed for Grade 1 reading level with history and food education.
 */

const HONEY_BREAD_STORY = {
  title: "Ancient Egyptian Honey Bread",
  era: "Ancient Egypt",
  year: "3000 BC",

  // The full story text (200 words, Grade 1 level)
  story: `
    <p>Long, long ago in Ancient Egypt, people lived along the great Nile River. The Egyptians were some of the first people in the world to bake bread!</p>

    <p>The Pharaohs and queens loved a special treat called honey bread. It was sweet and delicious. Bakers would make it in clay ovens heated by fire.</p>

    <p>To make honey bread, you need just a few simple things: flour from wheat, golden honey from bees, and fresh water from the Nile River.</p>

    <p>First, the baker adds flour to a big clay bowl. Then comes the best part - pouring in sweet, sticky honey! It makes everything smell amazing. A little water helps mix it all together.</p>

    <p>The baker kneads the dough with strong hands, folding and pressing it again and again. This makes the bread soft and fluffy.</p>

    <p>When the dough is ready, it goes into the hot oven. The bread rises and turns golden brown. The whole palace fills with a wonderful smell!</p>

    <p>When the honey bread is done, everyone celebrates. Even the Pharaoh himself comes to taste it. He smiles and says, "This is fit for the gods!"</p>

    <p>Now you know the ancient secret of Egyptian honey bread. Let's bake some together!</p>
  `,

  // Reading comprehension facts
  facts: [
    "Egyptians were some of the first people to bake bread",
    "They used clay ovens heated by fire",
    "Honey came from bees, water came from the Nile River",
    "Kneading makes the bread soft and fluffy",
    "The Pharaoh loved honey bread"
  ],

  // Educational takeaways
  learningPoints: {
    history: "Ancient Egyptians lived 5,000 years ago along the Nile River",
    science: "Heat makes bread rise and turn golden brown",
    math: "Measuring ingredients is important for baking",
    culture: "Different cultures have special foods and recipes"
  }
};

const COOKING_STEPS = [
  {
    step: 1,
    instruction: "Add 3 scoops of flour to the bowl",
    ingredient: "flour",
    targetCount: 3,
    icon: "🌾",
    successMessage: "Perfect! The flour looks great!"
  },
  {
    step: 2,
    instruction: "Add 2 scoops of honey to the bowl",
    ingredient: "honey",
    targetCount: 2,
    icon: "🍯",
    successMessage: "Wonderful! The honey smells so sweet!"
  },
  {
    step: 3,
    instruction: "Add 1 scoop of water to the bowl",
    ingredient: "water",
    targetCount: 1,
    icon: "💧",
    successMessage: "Excellent! Now the dough is ready to bake!"
  }
];

// Historical fun facts that appear during cooking
const EGYPT_FACTS = [
  "🏺 Ancient Egyptians invented ovens over 5,000 years ago!",
  "🐝 Honey was so valuable, it was sometimes used as money!",
  "🌾 Egyptians grew wheat along the Nile River.",
  "👑 Pharaohs had royal bakers who made bread every day.",
  "📜 The word 'bread' appears in ancient hieroglyphics!",
  "🍯 Egyptian honey has been found in tombs, still good after 3,000 years!"
];

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HONEY_BREAD_STORY,
    COOKING_STEPS,
    EGYPT_FACTS
  };
}
