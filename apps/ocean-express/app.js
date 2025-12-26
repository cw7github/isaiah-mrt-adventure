// ===== OCEAN FLOOR EXPRESS - BATHYSPHERE MECHANICS =====
// Descent system, depth tracking, creature animations, and educational flow

// ===== GLOBAL STATE =====
const state = {
  currentDepth: 0,
  currentZone: 'surface',
  currentFloor: 0,
  isDescending: false,
  hasAnsweredQuestion: false
};

// ===== OCEAN ZONES DATA =====
const oceanZones = [
  {
    name: 'Sunlight Zone',
    depth: 0,
    maxDepth: 200,
    background: 'sunlight',
    creatures: ['🐠', '🐟', '🐡', '🐬', '🦈'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    lightLevel: 1
  },
  {
    name: 'Twilight Zone',
    depth: 200,
    maxDepth: 1000,
    background: 'twilight',
    creatures: ['🪼', '🦑', '🦐', '🐙'],
    colors: ['#9B59B6', '#3498DB', '#E74C3C', '#1ABC9C'],
    lightLevel: 0.5
  },
  {
    name: 'Midnight Zone',
    depth: 1000,
    maxDepth: 4000,
    background: 'midnight',
    creatures: ['🐡', '🦑', '🐙'],
    colors: ['#00f5ff', '#ff006e', '#ffbe0b'],
    lightLevel: 0.2
  },
  {
    name: 'Abyssal Zone',
    depth: 4000,
    maxDepth: 6000,
    background: 'abyssal',
    creatures: ['🦐', '🦑'],
    colors: ['#00f5ff', '#ff006e'],
    lightLevel: 0.1
  },
  {
    name: 'Hadal Zone',
    depth: 6000,
    maxDepth: 11000,
    background: 'hadal',
    creatures: ['🦑', '🐙'],
    colors: ['#00f5ff', '#ff006e'],
    lightLevel: 0.05
  }
];

// ===== SCENE TRANSITIONS =====
function enterBathysphere() {
  const surfaceDock = document.getElementById('surface-dock');
  const bathysphere = document.getElementById('bathysphere');

  surfaceDock.classList.remove('active');
  setTimeout(() => {
    bathysphere.classList.add('active');
    startBubbles();
    showCreatures('sunlight');

    // Auto-start first descent after entering
    setTimeout(() => {
      document.getElementById('descent-lever').addEventListener('click', handleLeverPull);
    }, 1000);
  }, 800);
}

function returnToSurface() {
  const bathysphere = document.getElementById('bathysphere');
  const surfaceDock = document.getElementById('surface-dock');
  const badgeAward = document.getElementById('badge-award');

  badgeAward.classList.remove('active');

  // Animate ascent
  const ascendInterval = setInterval(() => {
    if (state.currentDepth > 0) {
      state.currentDepth = Math.max(0, state.currentDepth - 100);
      updateDepthGauge();
      updatePressureGauge();
      updateOceanZone();
    } else {
      clearInterval(ascendInterval);
      setTimeout(() => {
        bathysphere.classList.remove('active');
        surfaceDock.classList.add('active');
        resetState();
      }, 1000);
    }
  }, 100);
}

function resetState() {
  state.currentDepth = 0;
  state.currentZone = 'surface';
  state.currentFloor = 0;
  state.isDescending = false;
  state.hasAnsweredQuestion = false;

  // Reset gauges
  document.getElementById('depth-reading').textContent = '0 m';
  document.getElementById('pressure-reading').textContent = '1 ATM';
  document.getElementById('depth-needle').style.transform = 'translate(-50%, -100%) rotate(0deg)';
  document.getElementById('pressure-fill').style.width = '1%';
}

// ===== DESCENT MECHANICS =====
function handleLeverPull() {
  if (state.isDescending) return;

  const lever = document.getElementById('descent-lever');
  lever.classList.add('active');

  setTimeout(() => {
    lever.classList.remove('active');
  }, 500);

  descendToNextFloor();
}

function descendToNextFloor() {
  state.isDescending = true;
  state.currentFloor++;

  if (state.currentFloor === 1) {
    // Descend to Sunlight Zone (200m)
    animateDescent(200, () => {
      showStory('sunlight-story');
    });
  } else if (state.currentFloor === 2) {
    // Show question gate before Twilight Zone
    showQuestionGate();
  } else if (state.currentFloor === 3) {
    // Descend to Twilight Zone (1000m)
    animateDescent(1000, () => {
      showStory('twilight-story');
    });
  } else if (state.currentFloor === 4) {
    // Descend to Midnight Zone (4000m) - Anglerfish!
    animateDescent(4000, () => {
      showStory('anglerfish-story');
    });
  } else if (state.currentFloor === 5) {
    // Discovery complete - show badge
    setTimeout(() => {
      showBadge();
    }, 1000);
  }
}

function animateDescent(targetDepth, callback) {
  const startDepth = state.currentDepth;
  const duration = 2000; // 2 seconds
  const startTime = Date.now();

  const descentInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    state.currentDepth = startDepth + (targetDepth - startDepth) * easeProgress;
    updateDepthGauge();
    updatePressureGauge();
    updateOceanZone();

    if (progress >= 1) {
      clearInterval(descentInterval);
      state.currentDepth = targetDepth;
      state.isDescending = false;
      if (callback) callback();
    }
  }, 16); // ~60fps
}

// ===== GAUGE UPDATES =====
function updateDepthGauge() {
  const depthReading = document.getElementById('depth-reading');
  const depthNeedle = document.getElementById('depth-needle');

  const depth = Math.round(state.currentDepth);
  depthReading.textContent = `${depth} m`;

  // Rotate needle (0-180 degrees for 0-11000m)
  const rotation = (depth / 11000) * 180;
  depthNeedle.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
}

function updatePressureGauge() {
  const pressureReading = document.getElementById('pressure-reading');
  const pressureFill = document.getElementById('pressure-fill');

  // Pressure = 1 ATM + (depth in meters / 10)
  const pressure = 1 + (state.currentDepth / 10);
  pressureReading.textContent = `${Math.round(pressure)} ATM`;

  // Fill bar (0-100% for 0-1100 ATM)
  const fillPercent = Math.min((pressure / 1100) * 100, 100);
  pressureFill.style.width = `${fillPercent}%`;
}

function updateOceanZone() {
  const oceanBackground = document.querySelector('.ocean-background');
  const zoneLabel = document.getElementById('zone-label');
  const waterCaustics = document.querySelector('.water-caustics');

  // Find current zone
  let currentZone = oceanZones[0];
  for (const zone of oceanZones) {
    if (state.currentDepth >= zone.depth && state.currentDepth < zone.maxDepth) {
      currentZone = zone;
      break;
    }
  }

  // Update background
  oceanBackground.className = 'ocean-background';
  oceanBackground.classList.add(currentZone.background);

  // Update zone label
  zoneLabel.textContent = currentZone.name;

  // Update water caustics visibility
  waterCaustics.style.opacity = currentZone.lightLevel;

  // Update creatures
  if (state.currentZone !== currentZone.background) {
    state.currentZone = currentZone.background;
    showCreatures(currentZone.background);
  }
}

// ===== BUBBLE ANIMATIONS =====
function startBubbles() {
  const bubblesContainer = document.getElementById('bubbles-container');

  setInterval(() => {
    createBubble(bubblesContainer);
  }, 800);
}

function createBubble(container) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const size = 10 + Math.random() * 20;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * 100}%`;

  const duration = 3 + Math.random() * 3;
  bubble.style.animationDuration = `${duration}s`;
  bubble.style.animationDelay = `${Math.random() * 0.5}s`;

  container.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, duration * 1000);
}

// ===== CREATURE ANIMATIONS =====
function showCreatures(zoneName) {
  const creaturesContainer = document.getElementById('creatures-container');
  creaturesContainer.innerHTML = '';

  // Find zone
  const zone = oceanZones.find(z => z.background === zoneName);
  if (!zone) return;

  // Create creatures
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createCreature(creaturesContainer, zone);
    }, i * 2000);
  }

  // Keep creating creatures
  const creatureInterval = setInterval(() => {
    if (state.currentZone === zoneName) {
      createCreature(creaturesContainer, zone);
    } else {
      clearInterval(creatureInterval);
    }
  }, 6000);
}

function createCreature(container, zone) {
  const creature = document.createElement('div');
  creature.className = 'creature';

  // Random creature from zone
  const emoji = zone.creatures[Math.floor(Math.random() * zone.creatures.length)];
  creature.textContent = emoji;

  // Random color from zone
  const color = zone.colors[Math.floor(Math.random() * zone.colors.length)];
  creature.style.color = color;

  // Random position
  creature.style.top = `${20 + Math.random() * 60}%`;
  creature.style.left = `${-10 + Math.random() * 20}%`;

  // Animation duration
  const duration = 6 + Math.random() * 4;
  creature.style.animationDuration = `${duration}s`;

  // Bioluminescent effect for deep zones
  if (zone.lightLevel < 0.3) {
    creature.classList.add('bioluminescent');
  }

  // Special anglerfish treatment
  if (emoji === '🐡' && zone.name === 'Midnight Zone') {
    creature.classList.add('anglerfish');
  }

  container.appendChild(creature);

  setTimeout(() => {
    creature.remove();
  }, duration * 1000);
}

// ===== STORY PANEL =====
function showStory(storyId) {
  const storyPanel = document.getElementById('story-panel');
  const storyTitle = document.getElementById('story-title');
  const storyText = document.getElementById('story-text');

  const story = STORIES[storyId];
  if (!story) return;

  storyTitle.textContent = story.title;
  storyText.textContent = story.text;

  storyPanel.classList.add('active');
}

function continueFromStory() {
  const storyPanel = document.getElementById('story-panel');
  storyPanel.classList.remove('active');

  // Continue to next floor
  state.isDescending = false;
}

// ===== QUESTION GATE =====
function showQuestionGate() {
  const questionGate = document.getElementById('question-gate');
  const questionText = document.getElementById('question-text');
  const answersContainer = document.getElementById('question-answers');
  const feedback = document.getElementById('question-feedback');

  const question = QUESTIONS[0]; // Use first question

  questionText.textContent = question.question;
  answersContainer.innerHTML = '';
  feedback.textContent = '';
  feedback.className = 'question-feedback';

  question.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.onclick = () => handleAnswer(index, question.correct, btn);
    answersContainer.appendChild(btn);
  });

  questionGate.classList.add('active');
}

function handleAnswer(selectedIndex, correctIndex, btn) {
  const feedback = document.getElementById('question-feedback');
  const allBtns = document.querySelectorAll('.answer-btn');

  // Disable all buttons
  allBtns.forEach(b => b.style.pointerEvents = 'none');

  if (selectedIndex === correctIndex) {
    btn.classList.add('correct');
    feedback.textContent = 'Correct! Descending deeper...';
    feedback.className = 'question-feedback correct';

    setTimeout(() => {
      document.getElementById('question-gate').classList.remove('active');
      descendToNextFloor();
    }, 2000);
  } else {
    btn.classList.add('incorrect');
    feedback.textContent = 'Try again!';
    feedback.className = 'question-feedback incorrect';

    // Re-enable buttons after animation
    setTimeout(() => {
      btn.classList.remove('incorrect');
      allBtns.forEach(b => b.style.pointerEvents = 'auto');
      feedback.textContent = '';
    }, 1000);
  }
}

// ===== BADGE AWARD =====
function showBadge() {
  const badgeAward = document.getElementById('badge-award');
  badgeAward.classList.add('active');
}

// ===== SAMPLE QUESTION DATA =====
const QUESTIONS = [
  {
    question: "What did you learn about dolphins in the Sunlight Zone?",
    answers: [
      "They are fish that breathe underwater",
      "They are mammals that breathe air",
      "They are reptiles that live in the ocean",
      "They are birds that can swim"
    ],
    correct: 1
  }
];
