// ===== TRANSFORMATION JOURNEYS =====
// Each journey is a complete experiential learning sequence

const JOURNEYS = {
  raindrop: {
    id: 'raindrop',
    name: 'Water Cycle Journey',
    icon: '💧',
    transformText: 'a water droplet',
    badgeTitle: 'Water Cycle Master',
    badgeSubtitle: 'You lived the journey',
    completionText: `You experienced the water cycle from the inside.
      You felt the warmth of evaporation lifting you up,
      the cozy embrace of the cloud, the thrilling rush of falling rain,
      and the gentle flow of the river. This knowledge is now part of you.`,

    stages: [
      {
        id: 'ocean',
        title: 'I am Water',
        background: 'ocean',
        formClass: 'water-droplet',
        text: `I am a water droplet. I live in the vast, deep ocean.
          I can feel the gentle waves rocking me back and forth.
          The water around me is cool and calm. I am home.`,
        particles: {
          type: 'bubbles',
          count: 20
        },
        memory: {
          icon: '🌊',
          label: 'Ocean Home'
        }
      },

      {
        id: 'warming',
        title: 'The Sun Warms Me',
        background: 'ocean',
        formClass: 'water-droplet',
        text: `Wait... something is changing. I feel warmth from above!
          The sun's rays are reaching down through the water.
          I'm getting warmer... and lighter. What's happening to me?`,
        interaction: {
          type: 'temperature',
          question: 'What is making the water warmer?',
          options: [
            { text: 'The Sun ☀️', correct: true },
            { text: 'The Moon 🌙', correct: false },
            { text: 'The Wind 💨', correct: false }
          ]
        },
        memory: {
          icon: '☀️',
          label: 'Sun\'s Warmth'
        }
      },

      {
        id: 'evaporation',
        title: 'I\'m Rising!',
        background: 'evaporating',
        formClass: 'water-droplet',
        text: `I'm floating upward! The sun warmed me so much that I turned into vapor!
          I'm so light now, like a tiny invisible cloud. The ocean below me
          is getting smaller and smaller. I'm flying toward the sky!
          This is called EVAPORATION - when water becomes vapor and rises.`,
        soundEffect: 'whoosh-up',
        animation: 'rise',
        vocabulary: [
          { word: 'EVAPORATION', definition: 'When water heats up and turns into vapor that rises into the air' }
        ],
        memory: {
          icon: '⬆️',
          label: 'Evaporation'
        }
      },

      {
        id: 'sky',
        title: 'Up in the Sky',
        background: 'evaporating',
        formClass: 'water-droplet',
        text: `I'm high up now! I can see the whole ocean below me.
          The sky is all around me - it's so bright and blue!
          I'm not alone - there are other water droplets floating up here with me.
          We're all rising together, dancing in the warm air.`,
        particles: {
          type: 'vapor',
          count: 30
        },
        memory: {
          icon: '☁️',
          label: 'Rising Sky'
        }
      },

      {
        id: 'cooling',
        title: 'Getting Cooler',
        background: 'cloud',
        formClass: 'water-droplet',
        text: `The higher I go, the cooler it gets. Brrr!
          I'm starting to feel different again. I'm getting a little heavier.
          Other droplets are gathering around me. We're sticking together!`,
        interaction: {
          type: 'counting',
          question: 'You meet 2 droplets. Then 3 more join you. How many droplets total?',
          options: [
            { text: '5 droplets', correct: true },
            { text: '4 droplets', correct: false },
            { text: '6 droplets', correct: false }
          ],
          hint: 'Count them: 2 + 3 = ?'
        },
        memory: {
          icon: '❄️',
          label: 'Cooling Air'
        }
      },

      {
        id: 'cloud',
        title: 'We Form a Cloud',
        background: 'cloud',
        formClass: 'water-droplet',
        text: `More and more droplets join us! We're all clustering together,
          forming something beautiful - a CLOUD! It's so cozy here with my
          water droplet friends. We're condensing - turning from vapor back
          into tiny water drops. The cloud is soft and fluffy around us.
          This is called CONDENSATION!`,
        soundEffect: 'cloud-gather',
        vocabulary: [
          { word: 'CONDENSATION', definition: 'When water vapor cools down and turns back into liquid droplets' },
          { word: 'CLOUD', definition: 'A collection of tiny water droplets floating in the sky' }
        ],
        particles: {
          type: 'cloud-puffs',
          count: 25
        },
        memory: {
          icon: '☁️',
          label: 'Cloud Formation'
        }
      },

      {
        id: 'heavy',
        title: 'Getting Heavy',
        background: 'cloud',
        formClass: 'water-droplet',
        text: `Our cloud is getting bigger and bigger! More droplets keep joining.
          We're collecting more water. I'm getting heavier... and heavier...
          I can feel myself getting pulled downward. The cloud is turning
          darker gray. Something big is about to happen!`,
        memory: {
          icon: '⚫',
          label: 'Heavy Cloud'
        }
      },

      {
        id: 'falling',
        title: 'I\'m Falling!',
        background: 'raining',
        formClass: 'water-droplet',
        text: `WHOOOOSH! I'm falling! I became too heavy to stay in the cloud!
          I'm racing toward the ground as a RAINDROP! The wind rushes past me.
          Other raindrops are falling all around me. This is PRECIPITATION!
          Look at the ground coming closer... closer... closer...`,
        soundEffect: 'rain-fall',
        animation: 'fall',
        vocabulary: [
          { word: 'PRECIPITATION', definition: 'When water falls from clouds as rain, snow, or hail' },
          { word: 'RAINDROP', definition: 'A drop of water falling from a cloud' }
        ],
        particles: {
          type: 'rain-streaks',
          count: 50
        },
        memory: {
          icon: '💧',
          label: 'Rainfall'
        }
      },

      {
        id: 'splash',
        title: 'SPLASH!',
        background: 'river',
        formClass: 'water-droplet',
        text: `SPLASH! I landed! I'm in a river now! The water is flowing,
          carrying me along. I can feel the movement - we're traveling
          somewhere. The river knows where to go. Other raindrops that
          fell with me are here too. We're all flowing together!`,
        soundEffect: 'splash',
        interaction: {
          type: 'direction',
          question: 'Where does the river flow?',
          options: [
            { text: 'Downhill to the ocean 🌊', correct: true },
            { text: 'Uphill to the mountain ⛰️', correct: false },
            { text: 'In circles ⭕', correct: false }
          ]
        },
        memory: {
          icon: '🏞️',
          label: 'River Splash'
        }
      },

      {
        id: 'flowing',
        title: 'Flowing to the Sea',
        background: 'river',
        formClass: 'water-droplet',
        text: `The river is taking me on a journey! We flow past rocks and trees,
          under bridges, through valleys. The water rushes and swirls.
          I'm part of the river now, moving with the current.
          I can feel us heading downhill, always downhill...`,
        particles: {
          type: 'flow-lines',
          count: 40
        },
        memory: {
          icon: '➡️',
          label: 'River Flow'
        }
      },

      {
        id: 'return',
        title: 'Back to the Ocean',
        background: 'ocean',
        formClass: 'water-droplet',
        text: `The river is getting wider... and wider... and...
          I'm back in the ocean! I made it home! The vast, deep ocean
          welcomes me back. I started here, and now I've returned.
          But you know what? Tomorrow, the sun will warm me again,
          and my journey will begin anew. This is the WATER CYCLE!`,
        soundEffect: 'ocean-waves',
        vocabulary: [
          { word: 'WATER CYCLE', definition: 'The continuous journey of water: evaporation → condensation → precipitation → collection, then it starts again!' }
        ],
        memory: {
          icon: '🔄',
          label: 'Complete Cycle'
        }
      },

      {
        id: 'reflection',
        title: 'The Endless Journey',
        background: 'ocean',
        formClass: 'water-droplet',
        text: `Water is always moving, always cycling. From ocean to sky,
          from cloud to rain, from river back to ocean. Round and round,
          forever and ever. Every raindrop you've ever felt has been on
          this journey thousands of times. And now YOU know what it feels
          like to be water. You've LIVED the water cycle!`,
        summary: true,
        memory: {
          icon: '✨',
          label: 'Understanding'
        }
      }
    ]
  },

  // ===== FUTURE JOURNEYS (Frameworks) =====

  letter: {
    id: 'letter',
    name: 'Mail Journey',
    icon: '📬',
    transformText: 'a letter',
    badgeTitle: 'Mail System Explorer',
    badgeSubtitle: 'You traveled through the postal service',
    locked: true,
    stages: [
      // Framework stages:
      // - In the mailbox (waiting)
      // - Picked up by mail carrier
      // - Sorting facility (machine reading)
      // - Loaded onto truck
      // - Travel across country/city
      // - Local post office
      // - Delivery to recipient
      // - Opened and read!
    ]
  },

  seed: {
    id: 'seed',
    name: 'Seed to Flower Journey',
    icon: '🌱',
    transformText: 'a tiny seed',
    badgeTitle: 'Growth Master',
    badgeSubtitle: 'You grew from seed to flower',
    locked: true,
    stages: [
      // Framework stages:
      // - Dark underground (cozy but waiting)
      // - Water arrives! Seed swells
      // - Root breaks through seed coat
      // - Root grows DOWN into soil
      // - Stem pushes UP toward light
      // - Break through soil surface!
      // - First leaves unfold
      // - Growing taller with more leaves
      // - Flower bud forms
      // - Flower blooms!
      // - Making seeds for new plants
    ]
  },

  lightbeam: {
    id: 'lightbeam',
    name: 'Light\'s Journey',
    icon: '🌟',
    transformText: 'a beam of light',
    badgeTitle: 'Light Speed Traveler',
    badgeSubtitle: 'You traveled at the speed of light',
    locked: true,
    stages: [
      // Framework stages:
      // - Born in the sun (fusion reaction)
      // - Leaving the sun's surface
      // - Racing through space
      // - 8 minutes journey time
      // - Entering Earth's atmosphere
      // - Hitting a leaf (photosynthesis)
      // - OR hitting an eye (vision)
      // - OR hitting a solar panel (energy)
      // - Understanding that light gives life
    ]
  },

  butterfly: {
    id: 'butterfly',
    name: 'Metamorphosis Journey',
    icon: '🦋',
    transformText: 'a tiny caterpillar',
    badgeTitle: 'Metamorphosis Master',
    badgeSubtitle: 'You transformed completely',
    locked: true,
    stages: [
      // Framework stages:
      // - Hatching from egg
      // - Tiny hungry caterpillar
      // - Eating leaves (growing)
      // - Getting bigger and bigger
      // - Feeling the urge to change
      // - Finding the perfect spot
      // - Spinning silk (creating chrysalis)
      // - Inside chrysalis (the mystery)
      // - Body completely changing
      // - Breaking out!
      // - Wet wings expanding
      // - First flight as butterfly!
      // - Understanding transformation
    ]
  }
};

// ===== PARTICLE GENERATORS =====
// Create different particle effects for each journey stage

const ParticleEffects = {
  bubbles: (container) => {
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'particle';
      bubble.style.width = `${Math.random() * 10 + 5}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;
      bubble.style.animationDuration = `${Math.random() * 3 + 3}s`;
      container.appendChild(bubble);
    }
  },

  vapor: (container) => {
    for (let i = 0; i < 30; i++) {
      const vapor = document.createElement('div');
      vapor.className = 'particle';
      vapor.style.width = `${Math.random() * 8 + 3}px`;
      vapor.style.height = vapor.style.width;
      vapor.style.left = `${Math.random() * 100}%`;
      vapor.style.opacity = '0.3';
      vapor.style.animationDelay = `${Math.random() * 5}s`;
      vapor.style.animationDuration = `${Math.random() * 4 + 2}s`;
      container.appendChild(vapor);
    }
  },

  'cloud-puffs': (container) => {
    for (let i = 0; i < 25; i++) {
      const puff = document.createElement('div');
      puff.className = 'particle';
      puff.style.width = `${Math.random() * 20 + 10}px`;
      puff.style.height = puff.style.width;
      puff.style.left = `${Math.random() * 100}%`;
      puff.style.background = 'rgba(255, 255, 255, 0.8)';
      puff.style.animationDelay = `${Math.random() * 5}s`;
      puff.style.animationDuration = `${Math.random() * 6 + 4}s`;
      container.appendChild(puff);
    }
  },

  'rain-streaks': (container) => {
    for (let i = 0; i < 50; i++) {
      const streak = document.createElement('div');
      streak.className = 'particle';
      streak.style.width = '2px';
      streak.style.height = `${Math.random() * 30 + 20}px`;
      streak.style.left = `${Math.random() * 100}%`;
      streak.style.borderRadius = '2px';
      streak.style.background = 'rgba(200, 220, 255, 0.6)';
      streak.style.animationDelay = `${Math.random() * 2}s`;
      streak.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
      container.appendChild(streak);
    }
  },

  'flow-lines': (container) => {
    for (let i = 0; i < 40; i++) {
      const line = document.createElement('div');
      line.className = 'particle';
      line.style.width = `${Math.random() * 30 + 10}px`;
      line.style.height = '3px';
      line.style.left = `${Math.random() * 100}%`;
      line.style.borderRadius = '2px';
      line.style.background = 'rgba(255, 255, 255, 0.5)';
      line.style.animationDelay = `${Math.random() * 3}s`;
      line.style.animationDuration = `${Math.random() * 2 + 2}s`;
      container.appendChild(line);
    }
  }
};

// ===== VOCABULARY TRACKER =====
// Track words learned during journey
class VocabularyTracker {
  constructor() {
    this.words = [];
  }

  addWord(word, definition) {
    if (!this.words.find(w => w.word === word)) {
      this.words.push({ word, definition });
    }
  }

  getWords() {
    return this.words;
  }

  clear() {
    this.words = [];
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JOURNEYS, ParticleEffects, VocabularyTracker };
}
