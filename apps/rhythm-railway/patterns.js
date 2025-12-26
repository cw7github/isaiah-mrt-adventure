/**
 * RHYTHM RAILWAY - PATTERNS LIBRARY
 * Educational rhythm patterns organized by difficulty level
 * Each pattern teaches different musical and mathematical concepts
 */

const RHYTHM_PATTERNS = {
  // ===== LEVEL 1: STEADY BEATS (Counting in 4s) =====
  drumDepot1: {
    station: 'drumDepot',
    level: 1,
    name: 'Four Steady Beats',
    description: 'The foundation of all rhythm!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 }
    ],
    concept: 'Counting to 4',
    bpm: 120
  },

  drumDepot2: {
    station: 'drumDepot',
    level: 1,
    name: 'Eight Beat March',
    description: 'Keep that steady beat going!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 }
    ],
    concept: 'Counting to 8',
    bpm: 120
  },

  // ===== LEVEL 2: ALTERNATING PATTERNS (Pattern Recognition) =====
  pianoPlains1: {
    station: 'pianoPlains',
    level: 2,
    name: 'Red Blue Dance',
    description: 'Two different sounds, one rhythm!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'blue', sound: 'cymbal', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'blue', sound: 'cymbal', duration: 500 }
    ],
    concept: 'AB pattern (alternating)',
    bpm: 120
  },

  pianoPlains2: {
    station: 'pianoPlains',
    level: 2,
    name: 'Color Symphony',
    description: 'Three colors, endless rhythm!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'blue', sound: 'cymbal', duration: 500 },
      { color: 'yellow', sound: 'bell', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'blue', sound: 'cymbal', duration: 500 },
      { color: 'yellow', sound: 'bell', duration: 500 }
    ],
    concept: 'ABC pattern (sequence)',
    bpm: 120
  },

  // ===== LEVEL 3: VARYING SPEEDS (Fast and Slow) =====
  guitarGrove1: {
    station: 'guitarGrove',
    level: 3,
    name: 'Fast Slow Groove',
    description: 'Feel the difference!',
    pattern: [
      { color: 'green', sound: 'guitar', duration: 300 },
      { color: 'green', sound: 'guitar', duration: 300 },
      { color: 'purple', sound: 'bass', duration: 800 },
      { color: 'green', sound: 'guitar', duration: 300 },
      { color: 'green', sound: 'guitar', duration: 300 },
      { color: 'purple', sound: 'bass', duration: 800 }
    ],
    concept: 'Fast-fast-slow pattern',
    bpm: 120
  },

  guitarGrove2: {
    station: 'guitarGrove',
    level: 3,
    name: 'Speed Challenge',
    description: 'Quick fingers needed!',
    pattern: [
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'red', sound: 'drum', duration: 500 }
    ],
    concept: 'Quarter vs half notes',
    bpm: 120
  },

  // ===== LEVEL 4: RESTS AND SILENCE (Anticipation) =====
  trumpetTown1: {
    station: 'trumpetTown',
    level: 4,
    name: 'Call and Response',
    description: 'Listen to the silence!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 500 },
      { color: 'rest', sound: 'silence', duration: 500 },
      { color: 'blue', sound: 'cymbal', duration: 500 },
      { color: 'rest', sound: 'silence', duration: 500 }
    ],
    concept: 'Rests are part of music',
    bpm: 100
  },

  trumpetTown2: {
    station: 'trumpetTown',
    level: 4,
    name: 'Echo Pattern',
    description: 'Feel the space between beats!',
    pattern: [
      { color: 'yellow', sound: 'bell', duration: 400 },
      { color: 'yellow', sound: 'bell', duration: 400 },
      { color: 'rest', sound: 'silence', duration: 800 },
      { color: 'yellow', sound: 'bell', duration: 400 },
      { color: 'yellow', sound: 'bell', duration: 400 },
      { color: 'rest', sound: 'silence', duration: 800 }
    ],
    concept: 'Grouped patterns with rests',
    bpm: 100
  },

  // ===== LEVEL 5: COMPLEX COMBINATIONS (Mastery) =====
  violinValley1: {
    station: 'violinValley',
    level: 5,
    name: 'Rainbow Rhythm',
    description: 'All colors together!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 400 },
      { color: 'blue', sound: 'cymbal', duration: 400 },
      { color: 'yellow', sound: 'bell', duration: 400 },
      { color: 'green', sound: 'guitar', duration: 400 },
      { color: 'purple', sound: 'bass', duration: 600 },
      { color: 'rest', sound: 'silence', duration: 400 }
    ],
    concept: 'Complex sequence',
    bpm: 110
  },

  violinValley2: {
    station: 'violinValley',
    level: 5,
    name: 'Symphony Builder',
    description: 'You are a musical master!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 300 },
      { color: 'red', sound: 'drum', duration: 300 },
      { color: 'blue', sound: 'cymbal', duration: 600 },
      { color: 'yellow', sound: 'bell', duration: 300 },
      { color: 'rest', sound: 'silence', duration: 300 },
      { color: 'purple', sound: 'bass', duration: 900 },
      { color: 'green', sound: 'guitar', duration: 300 },
      { color: 'green', sound: 'guitar', duration: 300 }
    ],
    concept: 'Multi-tempo combination',
    bpm: 110
  },

  // ===== FINAL CHALLENGE: SYMPHONY STATION =====
  symphonyStation: {
    station: 'symphonyStation',
    level: 6,
    name: 'Grand Symphony',
    description: 'The ultimate rhythm challenge!',
    pattern: [
      { color: 'red', sound: 'drum', duration: 250 },
      { color: 'blue', sound: 'cymbal', duration: 250 },
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'green', sound: 'guitar', duration: 250 },
      { color: 'purple', sound: 'bass', duration: 500 },
      { color: 'rest', sound: 'silence', duration: 250 },
      { color: 'red', sound: 'drum', duration: 250 },
      { color: 'blue', sound: 'cymbal', duration: 250 },
      { color: 'yellow', sound: 'bell', duration: 250 },
      { color: 'purple', sound: 'bass', duration: 750 }
    ],
    concept: 'Complete mastery',
    bpm: 120
  }
};

// ===== STATION DEFINITIONS =====
const STATIONS = {
  drumDepot: {
    icon: '🥁',
    name: 'DRUM DEPOT',
    description: 'Feel the steady beat!',
    color: 'var(--beat-red)',
    patterns: ['drumDepot1', 'drumDepot2']
  },
  pianoPlains: {
    icon: '🎹',
    name: 'PIANO PLAINS',
    description: 'Simple melodies and patterns!',
    color: 'var(--rhythm-blue)',
    patterns: ['pianoPlains1', 'pianoPlains2']
  },
  guitarGrove: {
    icon: '🎸',
    name: 'GUITAR GROVE',
    description: 'Alternating patterns!',
    color: 'var(--harmony-green)',
    patterns: ['guitarGrove1', 'guitarGrove2']
  },
  trumpetTown: {
    icon: '🎺',
    name: 'TRUMPET TOWN',
    description: 'Call and response!',
    color: 'var(--melody-yellow)',
    patterns: ['trumpetTown1', 'trumpetTown2']
  },
  violinValley: {
    icon: '🎻',
    name: 'VIOLIN VALLEY',
    description: 'Smooth combinations!',
    color: 'var(--bass-purple)',
    patterns: ['violinValley1', 'violinValley2']
  },
  symphonyStation: {
    icon: '🌟',
    name: 'SYMPHONY STATION',
    description: 'The grand finale!',
    color: 'var(--melody-yellow)',
    patterns: ['symphonyStation']
  }
};

// ===== PROGRESSION SYSTEM =====
const PROGRESSION = [
  'drumDepot1',
  'drumDepot2',
  'pianoPlains1',
  'pianoPlains2',
  'guitarGrove1',
  'guitarGrove2',
  'trumpetTown1',
  'trumpetTown2',
  'violinValley1',
  'violinValley2',
  'symphonyStation'
];

// ===== TIMING WINDOWS (Accessibility) =====
const TIMING = {
  perfect: 100,   // ±100ms for "PERFECT!"
  good: 200,      // ±200ms for "GOOD!"
  okay: 300,      // ±300ms for "OK!"
  miss: 300       // Beyond ±300ms is a miss
};

// ===== EDUCATIONAL CONCEPTS MAPPING =====
const CONCEPTS = {
  counting: ['drumDepot1', 'drumDepot2'],
  patterns: ['pianoPlains1', 'pianoPlains2'],
  sequences: ['guitarGrove1', 'guitarGrove2'],
  timing: ['trumpetTown1', 'trumpetTown2'],
  combinations: ['violinValley1', 'violinValley2'],
  mastery: ['symphonyStation']
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RHYTHM_PATTERNS, STATIONS, PROGRESSION, TIMING, CONCEPTS };
}
