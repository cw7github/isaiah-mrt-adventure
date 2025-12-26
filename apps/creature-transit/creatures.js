/**
 * CREATURE TRANSIT AUTHORITY - CREATURE DATA & LOGIC
 *
 * This file contains:
 * - Creature type definitions
 * - Car type definitions
 * - Compatibility rules
 * - Destination names
 * - Creature generation logic
 */

// ============================================
// CREATURE TYPE DEFINITIONS
// ============================================

const CREATURE_TYPES = {
  flameling: {
    name: 'Flameling',
    emoji: '🔥',
    needs: 'hot',
    size: 2, // Takes 2 spaces
    color: '#ff4d6d',
    description: 'Needs HOT car',
    special: 'Takes 2 spaces',
    incompatible: ['frostie', 'splashy'], // Can't be with these
    destinations: ['Volcano Vista', 'Ember Mountain', 'Lava Lagoon', 'Fire Peak']
  },

  frostie: {
    name: 'Frostie',
    emoji: '❄️',
    needs: 'cold',
    size: 1,
    color: '#4cc9f0',
    description: 'Needs COLD car',
    special: 'Melts in heat!',
    incompatible: ['flameling'],
    destinations: ['Ice Cavern', 'Frost Falls', 'Glacier Glen', 'Snow Summit']
  },

  splashy: {
    name: 'Splashy',
    emoji: '💧',
    needs: 'wet',
    size: 1,
    color: '#06ffa5',
    description: 'Needs WET car',
    special: 'Must stay wet',
    incompatible: ['flameling'],
    destinations: ['Coral Cove', 'Bubble Bay', 'Splash Springs', 'Wave Wharf']
  },

  shadeling: {
    name: 'Shadeling',
    emoji: '👻',
    needs: 'dark',
    size: 1,
    color: '#2b2d42',
    description: 'Needs DARK car',
    special: 'Scared of Flamelings',
    incompatible: ['flameling', 'glimmer'], // Too bright!
    destinations: ['Shadow Sanctuary', 'Twilight Terrace', 'Dim Den', 'Midnight Manor']
  },

  glimmer: {
    name: 'Glimmer',
    emoji: '🌈',
    needs: 'bright',
    size: 1,
    color: '#ffed4e',
    description: 'Needs BRIGHT car',
    special: 'Makes others happy!',
    incompatible: ['shadeling'], // Too bright for shadelings
    happiness_bonus: true, // Gives extra stars to car
    destinations: ['Sunbeam Square', 'Radiant Ridge', 'Gleam Garden', 'Sparkle Station']
  },

  rumble: {
    name: 'Rumble',
    emoji: '🪨',
    needs: 'heavy',
    size: 3, // Takes 3 spaces!
    color: '#8d99ae',
    description: 'Needs HEAVY car',
    special: 'Very heavy - 3 spaces',
    incompatible: [],
    destinations: ['Boulder Boulevard', 'Stone Street', 'Rock Ridge', 'Pebble Plaza']
  },

  pufflet: {
    name: 'Pufflet',
    emoji: '🌸',
    needs: 'gentle',
    size: 0.33, // 3 fit in 1 space!
    color: '#c77dff',
    description: 'Needs GENTLE car',
    special: '3 fit in 1 space!',
    incompatible: ['rumble'], // Too rough!
    destinations: ['Feather Falls', 'Cloud Crossing', 'Soft Meadow', 'Pillow Place']
  }
};

// ============================================
// CAR TYPE DEFINITIONS
// ============================================

const CAR_TYPES = {
  hot: {
    name: 'HOT CAR',
    icon: '🔥',
    type: 'hot',
    capacity: 4,
    environment: 'Lava floor, heat lamps',
    accepts: ['flameling'],
    className: 'car-hot',
    destinations: ['Volcano Vista', 'Ember Mountain', 'Lava Lagoon', 'Fire Peak']
  },

  cold: {
    name: 'COLD CAR',
    icon: '❄️',
    type: 'cold',
    capacity: 4,
    environment: 'Ice walls, snow floor',
    accepts: ['frostie'],
    className: 'car-cold',
    destinations: ['Ice Cavern', 'Frost Falls', 'Glacier Glen', 'Snow Summit']
  },

  wet: {
    name: 'WET CAR',
    icon: '💧',
    type: 'wet',
    capacity: 5,
    environment: 'Swimming pool inside',
    accepts: ['splashy'],
    className: 'car-wet',
    destinations: ['Coral Cove', 'Bubble Bay', 'Splash Springs', 'Wave Wharf']
  },

  dark: {
    name: 'DARK CAR',
    icon: '🌑',
    type: 'dark',
    capacity: 3,
    environment: 'No lights, cozy shadows',
    accepts: ['shadeling'],
    className: 'car-dark',
    destinations: ['Shadow Sanctuary', 'Twilight Terrace', 'Dim Den', 'Midnight Manor']
  },

  bright: {
    name: 'BRIGHT CAR',
    icon: '☀️',
    type: 'bright',
    capacity: 4,
    environment: 'Glowing walls, sunny',
    accepts: ['glimmer'],
    className: 'car-bright',
    destinations: ['Sunbeam Square', 'Radiant Ridge', 'Gleam Garden', 'Sparkle Station']
  },

  heavy: {
    name: 'HEAVY CAR',
    icon: '🪨',
    type: 'heavy',
    capacity: 6, // Weight units, not creatures
    environment: 'Reinforced floor',
    accepts: ['rumble', 'pufflet'], // Gentle car doubles as capacity for small creatures
    className: 'car-heavy',
    destinations: ['Boulder Boulevard', 'Stone Street', 'Rock Ridge', 'Pebble Plaza', 'Feather Falls', 'Cloud Crossing', 'Soft Meadow', 'Pillow Place']
  }
};

// ============================================
// COMPATIBILITY CHECKING
// ============================================

/**
 * Check if a creature can be placed in a car
 * @param {Object} creature - The creature to check
 * @param {Object} car - The car to check
 * @param {Array} currentPassengers - Current passengers in the car
 * @returns {Object} { valid: boolean, reason: string }
 */
function checkCompatibility(creature, car, currentPassengers = []) {
  const creatureType = CREATURE_TYPES[creature.type];
  const carType = CAR_TYPES[car.type];

  // Check if car accepts this creature type
  if (!carType.accepts.includes(creature.type)) {
    return {
      valid: false,
      reason: `${creatureType.name} needs a ${creatureType.needs.toUpperCase()} car!`
    };
  }

  // Check capacity
  const currentCapacity = currentPassengers.reduce((sum, p) => {
    return sum + CREATURE_TYPES[p.type].size;
  }, 0);

  const neededCapacity = creatureType.size;

  if (currentCapacity + neededCapacity > carType.capacity) {
    return {
      valid: false,
      reason: `Not enough space! ${creatureType.name} needs ${neededCapacity} space${neededCapacity > 1 ? 's' : ''}.`
    };
  }

  // Check incompatibility with existing passengers
  for (const passenger of currentPassengers) {
    if (creatureType.incompatible.includes(passenger.type)) {
      const incompatibleCreature = CREATURE_TYPES[passenger.type];
      return {
        valid: false,
        reason: `${creatureType.name} can't travel with ${incompatibleCreature.name}!`
      };
    }
  }

  // All checks passed!
  return {
    valid: true,
    reason: 'Perfect match!'
  };
}

// ============================================
// CREATURE GENERATION
// ============================================

/**
 * Generate a random creature
 * @returns {Object} creature data
 */
function generateRandomCreature() {
  const types = Object.keys(CREATURE_TYPES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const creatureData = CREATURE_TYPES[randomType];

  // Pick a random destination for this creature type
  const destination = creatureData.destinations[
    Math.floor(Math.random() * creatureData.destinations.length)
  ];

  return {
    id: `creature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: randomType,
    destination: destination,
    happiness: 0, // Will be set when placed correctly
    timestamp: Date.now()
  };
}

/**
 * Generate a creature of specific type
 * @param {string} type - Creature type
 * @returns {Object} creature data
 */
function generateCreature(type) {
  const creatureData = CREATURE_TYPES[type];

  if (!creatureData) {
    console.error(`Unknown creature type: ${type}`);
    return generateRandomCreature();
  }

  const destination = creatureData.destinations[
    Math.floor(Math.random() * creatureData.destinations.length)
  ];

  return {
    id: `creature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    destination: destination,
    happiness: 0,
    timestamp: Date.now()
  };
}

/**
 * Generate a balanced wave of creatures
 * Ensures variety and educational opportunities
 * @param {number} count - Number of creatures to generate
 * @returns {Array} array of creature objects
 */
function generateCreatureWave(count = 3) {
  const creatures = [];
  const types = Object.keys(CREATURE_TYPES);

  // Ensure variety by not repeating types too much
  const usedTypes = [];

  for (let i = 0; i < count; i++) {
    let selectedType;

    // Try to pick a type we haven't used yet
    const unusedTypes = types.filter(t => !usedTypes.includes(t));

    if (unusedTypes.length > 0) {
      selectedType = unusedTypes[Math.floor(Math.random() * unusedTypes.length)];
    } else {
      // All types used, pick randomly
      selectedType = types[Math.floor(Math.random() * types.length)];
    }

    usedTypes.push(selectedType);
    creatures.push(generateCreature(selectedType));
  }

  return creatures;
}

/**
 * Calculate happiness rating for a creature based on placement
 * @param {Object} creature - The creature
 * @param {Object} car - The car they're in
 * @param {Array} carPassengers - Other passengers in the car
 * @returns {number} Star rating (1-3)
 */
function calculateHappiness(creature, car, carPassengers) {
  const creatureType = CREATURE_TYPES[creature.type];
  const compatibility = checkCompatibility(creature, car, carPassengers.filter(p => p.id !== creature.id));

  if (!compatibility.valid) {
    return 0; // Should never happen if validation works
  }

  let stars = 2; // Base happiness for correct car

  // Bonus star if there's a Glimmer in the car (makes others happy)
  const hasGlimmer = carPassengers.some(p => p.type === 'glimmer');
  if (hasGlimmer && creature.type !== 'glimmer') {
    stars = 3;
  }

  // Glimmers are always super happy
  if (creature.type === 'glimmer') {
    stars = 3;
  }

  // Pufflets love being together
  const puffletCount = carPassengers.filter(p => p.type === 'pufflet').length;
  if (creature.type === 'pufflet' && puffletCount >= 2) {
    stars = 3;
  }

  return stars;
}

// ============================================
// EDUCATIONAL PROMPTS
// ============================================

const EDUCATIONAL_MESSAGES = {
  capacity_full: [
    "Oops! The car is full. Can you count how many spaces are left?",
    "The car can't fit any more! How much space does this creature need?",
    "Not enough room! Let's check the capacity together."
  ],

  wrong_car: [
    "This creature needs a different car. Check its ticket!",
    "Read the creature's needs carefully. What kind of car does it need?",
    "Close! But this creature needs a special environment."
  ],

  incompatible: [
    "These creatures can't travel together. Why do you think that is?",
    "Some creatures don't get along. Can you figure out why?",
    "Safety first! These creatures need to stay apart."
  ],

  perfect_match: [
    "Perfect! The creature is so happy!",
    "Excellent choice! You read the ticket correctly!",
    "Great work! This is exactly the right car!",
    "The creature loves it! You're a great operator!"
  ],

  departure: [
    "All aboard! The car is departing!",
    "Next stop: happiness! Great job!",
    "The creatures are on their way!",
    "Safe travels, little friends!"
  ]
};

/**
 * Get a random educational message
 * @param {string} category - Message category
 * @returns {string} Random message from that category
 */
function getEducationalMessage(category) {
  const messages = EDUCATIONAL_MESSAGES[category];
  if (!messages || messages.length === 0) return '';
  return messages[Math.floor(Math.random() * messages.length)];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CREATURE_TYPES,
    CAR_TYPES,
    checkCompatibility,
    generateRandomCreature,
    generateCreature,
    generateCreatureWave,
    calculateHappiness,
    getEducationalMessage
  };
}
