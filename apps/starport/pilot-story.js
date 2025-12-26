// ===== STARPORT STATION - Pilot Story =====
// The Birthday Cake Delivery to Zorbax

// ===== MISSION DEFINITIONS =====
const missions = [
  // Mission 1: Birthday Cake to Zorbax (Pilot Story)
  {
    id: 1,
    planet: 'zorbax',
    briefing: 'We have a very special delivery! Someone on Planet Zorbax is having a birthday, and they need their cake delivered. This is an important mission, Space Cadet!',
    package: {
      name: 'Birthday Cake',
      icon: '🎂'
    },
    instructions: '<strong>DELIVERY TO:</strong> Zorb the Purple<br><strong>LOCATION:</strong> Bubble District, Zorbax<br><strong>SPECIAL NOTES:</strong> Handle with care! Don\'t let the cake fall!',
    targetDistrict: 'Bubble District',
    hint: 'Look for the Bubble District!',
    alienColor: '#9d4edd',
    alienMessage: 'OH WOW! My birthday cake! Thank you so much, Space Cadet! This is the best birthday ever! 🎉',
    task: {
      question: 'Help Zorb count the candles on the cake! How many candles do you see? 🕯️🕯️🕯️🕯️🕯️',
      options: [3, 4, 5, 6],
      correct: 5
    }
  },

  // Mission 2: Crystal Package to Lunara
  {
    id: 2,
    planet: 'lunara',
    briefing: 'The moon colony needs a special delivery! Valuable crystals from Earth are heading to Lunara. The scientists there are waiting!',
    package: {
      name: 'Crystal Container',
      icon: '💎'
    },
    instructions: '<strong>DELIVERY TO:</strong> Dr. Luna<br><strong>LOCATION:</strong> Crystal Caves, Lunara<br><strong>SPECIAL NOTES:</strong> Fragile crystals inside!',
    targetDistrict: 'Crystal Caves',
    hint: 'The crystals go to the Crystal Caves!',
    alienColor: '#9ba3af',
    alienMessage: 'Perfect! These crystals are exactly what we needed for our research. You\'re an excellent delivery pilot! 🌙',
    task: {
      question: 'Dr. Luna needs to sort the crystals. She has 8 blue crystals and 4 red crystals. How many total? 💎',
      options: [10, 11, 12, 13],
      correct: 12
    }
  },

  // Mission 3: Plant Seeds to Verdania
  {
    id: 3,
    planet: 'verdania',
    briefing: 'The jungle planet needs help! Special seeds from the galactic garden are ready to be planted. The plant aliens are excited!',
    package: {
      name: 'Seed Package',
      icon: '🌱'
    },
    instructions: '<strong>DELIVERY TO:</strong> Leaf the Green<br><strong>LOCATION:</strong> Vine Village, Verdania<br><strong>SPECIAL NOTES:</strong> Keep package warm and dry!',
    targetDistrict: 'Vine Village',
    hint: 'Vine Village is where the villagers live!',
    alienColor: '#38b000',
    alienMessage: 'Amazing! These seeds will help our forest grow even bigger! Thank you, friend! 🌿',
    task: {
      question: 'Leaf wants to plant the seeds in 3 gardens. Each garden needs 4 seeds. How many seeds total? 🌱',
      options: [7, 10, 12, 15],
      correct: 12
    }
  },

  // Mission 4: Waterproof Books to Aquarix
  {
    id: 4,
    planet: 'aquarix',
    briefing: 'The underwater schools need their supplies! Waterproof books are being delivered to the ocean domes. Education is important everywhere!',
    package: {
      name: 'Waterproof Books',
      icon: '📚'
    },
    instructions: '<strong>DELIVERY TO:</strong> Coral the Teacher<br><strong>LOCATION:</strong> Bubble Bay, Aquarix<br><strong>SPECIAL NOTES:</strong> Already waterproofed and ready!',
    targetDistrict: 'Bubble Bay',
    hint: 'Look for Bubble Bay!',
    alienColor: '#0096c7',
    alienMessage: 'Wonderful! The students will love these new books! You\'re making learning possible under the sea! 🐠',
    task: {
      question: 'Coral has 15 students. She gives each student 2 books. How many books did she give out? 📚',
      options: [17, 25, 30, 32],
      correct: 30
    }
  },

  // Mission 5: Cloud Cookies to Nebulox
  {
    id: 5,
    planet: 'nebulox',
    briefing: 'The cloud dwellers are having a festival! Special fluffy cookies are being delivered to the floating islands. They must stay light!',
    package: {
      name: 'Cloud Cookies',
      icon: '🍪'
    },
    instructions: '<strong>DELIVERY TO:</strong> Nimbus the Baker<br><strong>LOCATION:</strong> Float Island, Nebulox<br><strong>SPECIAL NOTES:</strong> Keep away from heavy gravity!',
    targetDistrict: 'Float Island',
    hint: 'Float Island is the main floating city!',
    alienColor: '#9d4edd',
    alienMessage: 'These cookies are perfect! Light as a cloud, just how we like them! You\'re the best pilot! ☁️',
    task: {
      question: 'Nimbus baked 20 cookies. She gives 8 to friends. How many cookies are left? 🍪',
      options: [8, 10, 12, 14],
      correct: 12
    }
  },

  // Mission 6: Party Balloons to Zorbax (Return Mission)
  {
    id: 6,
    planet: 'zorbax',
    briefing: 'Zorbax needs more party supplies! They\'re having another celebration and need colorful balloons delivered to Party Plaza!',
    package: {
      name: 'Party Balloons',
      icon: '🎈'
    },
    instructions: '<strong>DELIVERY TO:</strong> Blip the Party Planner<br><strong>LOCATION:</strong> Party Plaza, Zorbax<br><strong>SPECIAL NOTES:</strong> Don\'t pop the balloons!',
    targetDistrict: 'Party Plaza',
    hint: 'Party Plaza is where all the celebrations happen!',
    alienColor: '#ff6d00',
    alienMessage: 'YES! These balloons are exactly what we need! The party is going to be AMAZING! 🎉',
    task: {
      question: 'Blip has 6 red balloons, 5 blue balloons, and 4 yellow balloons. How many total? 🎈',
      options: [14, 15, 16, 17],
      correct: 15
    }
  }
];

// ===== MISSION MANAGER =====
let currentMissionIndex = 0;

function loadNextMission() {
  if (currentMissionIndex < missions.length) {
    const mission = missions[currentMissionIndex];
    gameState.currentMission = mission;
    currentMissionIndex++;
    return mission;
  } else {
    // Cycle back to start
    currentMissionIndex = 0;
    const mission = missions[currentMissionIndex];
    gameState.currentMission = mission;
    currentMissionIndex++;
    return mission;
  }
}

// ===== OVERRIDE START MISSION =====
const originalStartMission = startMission;

startMission = function() {
  // Load the next mission
  const mission = loadNextMission();

  // Update mission briefing
  const missionText = document.getElementById('mission-text');
  const packageDisplay = document.getElementById('package-display');
  const startButton = document.getElementById('start-mission-button');

  // Hide start button
  startButton.classList.add('hidden');

  // Show mission briefing
  if (missionText) {
    missionText.innerHTML = `
      <strong>MISSION #${mission.id}:</strong><br><br>
      ${mission.briefing}
    `;
  }

  // Show package
  if (packageDisplay) {
    packageDisplay.classList.add('active');
    packageDisplay.innerHTML = `
      <div class="package-item">${mission.package.icon}</div>
      <div class="package-label">${mission.package.name}</div>
    `;
  }

  // Enable planet selection
  enablePlanetSelection();
};

// ===== WELCOME MESSAGE =====
document.addEventListener('DOMContentLoaded', () => {
  // Wait for app to initialize
  setTimeout(() => {
    const missionText = document.getElementById('mission-text');
    if (missionText) {
      missionText.innerHTML = `
        <strong>Welcome to Starport Station, Space Cadet!</strong><br><br>
        You're our newest Galactic Delivery Pilot! Your mission is to deliver important packages across the galaxy.<br><br>
        Each planet is different and special. You'll teleport to planets, find the right district, and complete deliveries!<br><br>
        Are you ready for your first mission?
      `;
    }

    // Pre-load first mission
    loadNextMission();
  }, 2600);
});

// ===== MISSION PROGRESS TRACKING =====
function getMissionStats() {
  return {
    totalMissions: missions.length,
    completedMissions: gameState.deliveryCount,
    starsEarned: gameState.starsEarned,
    completionRate: Math.round((gameState.deliveryCount / missions.length) * 100)
  };
}

// ===== EDUCATIONAL INSIGHTS =====
const educationalGoals = {
  reading: [
    'Read delivery instructions carefully',
    'Identify key information (recipient, location)',
    'Follow multi-step directions',
    'Match written district names to options'
  ],
  math: [
    'Count objects (candles, books, cookies)',
    'Addition with single and double digits',
    'Subtraction problems',
    'Multiplication introduction (groups of items)',
    'Word problem solving'
  ],
  logic: [
    'Match package to correct recipient',
    'Navigate district maps',
    'Process elimination for wrong districts',
    'Cause and effect (reading instructions leads to success)'
  ]
};

// ===== CELEBRATION MESSAGES =====
const celebrationMessages = [
  'Amazing work, Space Cadet! You\'re a natural pilot! 🚀',
  'Stellar delivery! The galaxy is lucky to have you! ⭐',
  'Perfect mission! You\'re becoming a legendary pilot! 🌟',
  'Incredible! Keep up the fantastic work! 🎯',
  'Outstanding delivery! You\'re a star! ✨',
  'Brilliant! The planets appreciate your service! 🪐',
  'Fantastic job! You\'re mastering galactic deliveries! 🎊'
];

// ===== OVERRIDE CELEBRATION =====
const originalShowCelebration = showCelebration;

showCelebration = function() {
  // Update celebration message with variety
  const messageEl = document.getElementById('celebration-message');
  if (messageEl) {
    const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    messageEl.textContent = randomMessage;
  }

  // Call original celebration
  originalShowCelebration();
};

// ===== MISSION HINTS SYSTEM =====
function provideMissionHint() {
  const deliveryTask = document.getElementById('delivery-task');
  if (deliveryTask && gameState.currentMission) {
    deliveryTask.innerHTML = `
      <strong>💡 HINT:</strong><br>
      ${gameState.currentMission.hint}
    `;
  }
}

// ===== ACCESSIBILITY FEATURES =====
// Add keyboard navigation for planet selection
document.addEventListener('keydown', (e) => {
  if (gameState.currentScreen === 'lobby-screen') {
    const planetButtons = Array.from(document.querySelectorAll('.planet-button:not(:disabled)'));

    if (e.key === 'Enter' && gameState.selectedPlanet) {
      launchTeleport();
    }

    // Arrow key navigation through planets
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const currentIndex = planetButtons.findIndex(btn =>
        btn.getAttribute('data-planet') === gameState.selectedPlanet
      );

      let nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % planetButtons.length;
      } else {
        nextIndex = (currentIndex - 1 + planetButtons.length) % planetButtons.length;
      }

      if (planetButtons[nextIndex]) {
        const nextPlanet = planetButtons[nextIndex].getAttribute('data-planet');
        selectPlanet(nextPlanet);
      }
    }
  }
});

// ===== PROGRESS PERSISTENCE (Optional) =====
function saveProgress() {
  const progress = {
    deliveryCount: gameState.deliveryCount,
    starsEarned: gameState.starsEarned,
    currentMissionIndex: currentMissionIndex
  };

  try {
    localStorage.setItem('starport-progress', JSON.stringify(progress));
  } catch (e) {
    console.log('Unable to save progress');
  }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem('starport-progress');
    if (saved) {
      const progress = JSON.parse(saved);
      gameState.deliveryCount = progress.deliveryCount || 0;
      gameState.starsEarned = progress.starsEarned || 0;
      currentMissionIndex = progress.currentMissionIndex || 0;

      // Update UI
      updateDeliveryCount();
    }
  } catch (e) {
    console.log('Unable to load progress');
  }
}

// Auto-save after each delivery
const originalCompleteDelivery = completeDelivery;

completeDelivery = function() {
  originalCompleteDelivery();
  saveProgress();
};

// Load progress on startup
window.addEventListener('load', () => {
  setTimeout(() => {
    loadProgress();
  }, 100);
});

// ===== CONSOLE MESSAGES FOR EDUCATORS =====
console.log(`
🚀 STARPORT STATION - Educational App
========================================

LEARNING OBJECTIVES:
📖 Reading Comprehension
  - Following written instructions
  - Identifying key details
  - Matching text to actions

🔢 Mathematics (Grade 1)
  - Counting objects
  - Addition (single & double digit)
  - Subtraction
  - Simple multiplication concepts

🧠 Logic & Problem Solving
  - Spatial navigation
  - Process of elimination
  - Cause and effect

MISSIONS AVAILABLE: ${missions.length}
Each mission combines reading + math!

Have fun exploring the galaxy! 🌟
`);
