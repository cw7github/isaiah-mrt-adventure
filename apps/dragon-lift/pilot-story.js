// THE DRAGON LIFT - FLOOR 1: THE EMBER DRAGON'S TREASURE
// Pilot story for Isaiah's Grade 1 reading adventure

const PILOT_STORY = {
  floorNumber: 1,
  dragonName: "炎龙", // Yan Long (Ember Dragon in Chinese)
  dragonEmoji: "🐉",
  dragonColor: "#ff6b35",

  greeting: "Welcome to my lair, young scholar! I am the Ember Dragon.",

  story: {
    title: "The Ember Dragon's Hidden Treasure",

    // Full story text with sight words marked
    text: `Long ago, deep in the mountain caves, there lived a wise dragon named Ember.

    Ember was not like other dragons who loved gold and jewels. No, Ember collected something far more precious - stories written on ancient scrolls.

    Each scroll glowed with inner <sight>fire</sight>, and when you read the words aloud, they would <sight>come</sight> alive! Pictures would dance in the air, and you could <sight>see</sight> the tales unfold before your very eyes.

    One day, a young traveler came to Ember's cave. "Great dragon," said the traveler, "I have heard you possess the greatest treasure in all the land. May I <sight>look</sight> upon it?"

    Ember smiled, showing teeth that sparkled like stars. "You may," the dragon rumbled. "But first, you must prove yourself worthy. Can you <sight>read</sight> the five sacred words written in fire?"

    The traveler nodded bravely. Ember breathed a small flame, and five glowing words appeared in the air, shimmering with magic.

    The traveler read each word carefully, and with every word spoken, the cave grew brighter. When the final word was read, the scrolls began to glow, and their stories filled the cave with wonder.

    "Well done!" roared Ember with joy. "You have shown that you understand the true treasure - the power of reading! For those who can read can travel to any world, meet any character, and learn any secret."

    From that day on, the traveler visited Ember often, and together they read every scroll in the collection. And the cave was always filled with light, laughter, and the magic of stories.`,

    // Sight words to identify (Grade 1 appropriate)
    sightWords: ["fire", "come", "see", "look", "read"],

    // Word count for story
    wordCount: 295
  },

  challenge: {
    instruction: "Find and click the 5 glowing sight words to earn dragon scales!",
    totalWords: 5,
    rewardMessage: "You have mastered the sacred words! The Ember Dragon grants you the gift of his flame!"
  }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PILOT_STORY;
}
