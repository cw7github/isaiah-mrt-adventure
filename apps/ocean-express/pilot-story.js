// ===== OCEAN FLOOR EXPRESS - PILOT STORIES =====
// Educational stories for each ocean zone discovery

const STORIES = {
  // ===== SUNLIGHT ZONE STORY (0-200m) =====
  'sunlight-story': {
    title: 'Welcome to the Sunlight Zone',
    text: `You've descended into the bright, colorful world of the Sunlight Zone! Here, sunlight streams through the water, making everything glow with beautiful blues and greens.

Look out the porthole—do you see the dolphins playing in the distance? Dolphins are mammals, just like you! That means they breathe air, not water. They swim to the surface to take big breaths through the blowhole on top of their heads.

The Sunlight Zone is home to more ocean life than any other zone. Colorful fish dart through coral reefs, sea turtles glide gracefully by, and schools of fish move together like underwater birds.

This zone gets its name because sunlight can reach all the way down here, letting plants grow and feeding the entire ocean food chain. Pretty amazing, isn't it?`
  },

  // ===== TWILIGHT ZONE STORY (200-1000m) =====
  'twilight-story': {
    title: 'Entering the Twilight Zone',
    text: `The water grows dimmer as you descend into the mysterious Twilight Zone. Only faint blue light reaches this deep, creating an eerie, beautiful world.

Notice how the creatures here are different? Many animals in this zone have developed a special ability called bioluminescence—they can make their own light! Like living flashlights, they create glowing patterns on their bodies.

The jellyfish drifting past your porthole shimmer with bioluminescent blue and purple lights. They use these lights to confuse predators, attract prey, or communicate with each other in the darkness.

Scientists estimate that 90% of deep-sea creatures can produce their own light. It's nature's way of solving the problem of living where sunlight can't reach. The ocean is full of clever adaptations!`
  },

  // ===== MIDNIGHT ZONE STORY - THE ANGLERFISH (1000-4000m) =====
  'anglerfish-story': {
    title: 'The Glowing Anglerfish of the Midnight Zone',
    text: `Suddenly, a strange light appears in the absolute darkness outside your porthole. It's an anglerfish!

The anglerfish is one of the ocean's most fascinating creatures. Living in the pitch-black Midnight Zone, it has evolved an incredible hunting tool: a glowing lure that dangles in front of its mouth like a fishing rod. This bioluminescent "lantern" is filled with bacteria that glow in the dark, attracting curious prey right to the anglerfish's waiting jaws.

But here's something even more amazing—only female anglerfish have the glowing lure. The males are much smaller and actually attach themselves permanently to the females, becoming part of the same body! It's one of nature's strangest partnerships.

The anglerfish can't swim very fast, so instead of chasing its food, it waits patiently in the darkness. When a small fish or shrimp swims toward the mysterious glowing light, thinking it might be food—SNAP! The anglerfish's huge mouth opens, and dinner is served.

Living at depths where the pressure would crush most creatures, the anglerfish has a soft, flexible body that can handle the extreme conditions. Its grotesque appearance might seem scary, but it's perfectly designed for survival in one of Earth's harshest environments.

You've now witnessed one of the deep ocean's most remarkable hunters. The anglerfish reminds us that even in the darkest places on Earth, life finds amazing ways to survive and thrive.`
  }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STORIES };
}
