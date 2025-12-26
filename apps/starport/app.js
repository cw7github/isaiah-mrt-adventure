// ===== STARPORT STATION - Main Application Logic =====
// Soviet Retro-Space Galactic Delivery Adventure

// ===== STATE MANAGEMENT =====
const gameState = {
  currentScreen: 'loading',
  selectedPlanet: null,
  currentMission: null,
  deliveryCount: 0,
  starsEarned: 0,
  currentDistrict: null
};

// ===== PLANET DATA =====
const planets = {
  lunara: {
    name: 'LUNARA',
    fullName: 'Lunara Moon Colony',
    color: '#9ba3af',
    districts: [
      { name: 'Crystal Caves', icon: '💎' },
      { name: 'Crater District', icon: '🌑' },
      { name: 'Gravity Gardens', icon: '🌙' }
    ]
  },
  verdania: {
    name: 'VERDANIA',
    fullName: 'Verdania Jungle World',
    color: '#38b000',
    districts: [
      { name: 'Vine Village', icon: '🌿' },
      { name: 'Canopy Heights', icon: '🌳' },
      { name: 'Root Market', icon: '🍃' }
    ]
  },
  aquarix: {
    name: 'AQUARIX',
    fullName: 'Aquarix Ocean Domes',
    color: '#0096c7',
    districts: [
      { name: 'Coral Reef', icon: '🐠' },
      { name: 'Deep Dome', icon: '🌊' },
      { name: 'Bubble Bay', icon: '💧' }
    ]
  },
  zorbax: {
    name: 'ZORBAX',
    fullName: 'Zorbax Party Planet',
    color: '#ff6d00',
    districts: [
      { name: 'Bubble District', icon: '🎈' },
      { name: 'Party Plaza', icon: '🎉' },
      { name: 'Celebration Square', icon: '🎊' }
    ]
  },
  nebulox: {
    name: 'NEBULOX',
    fullName: 'Nebulox Cloud Isles',
    color: '#9d4edd',
    districts: [
      { name: 'Float Island', icon: '☁️' },
      { name: 'Sky Gardens', icon: '🌈' },
      { name: 'Wind Plaza', icon: '💨' }
    ]
  }
};

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    gameState.currentScreen = screenId;
  }
}

// ===== LOADING SEQUENCE =====
function initializeApp() {
  setTimeout(() => {
    showScreen('lobby-screen');
    updateDeliveryCount();
  }, 2500);
}

// ===== LOBBY FUNCTIONS =====
function updateDeliveryCount() {
  const countElement = document.getElementById('delivery-count');
  if (countElement) {
    countElement.textContent = gameState.deliveryCount;
  }
}

function startMission() {
  const missionText = document.getElementById('mission-text');
  const packageDisplay = document.getElementById('package-display');
  const startButton = document.getElementById('start-mission-button');

  if (!gameState.currentMission) {
    // Hide start button
    startButton.classList.add('hidden');

    // Show mission briefing
    missionText.innerHTML = `
      <strong>MISSION BRIEFING:</strong><br><br>
      ${gameState.currentMission ? gameState.currentMission.briefing : 'Ready for your first mission, Space Cadet?'}
    `;

    // Show package
    if (packageDisplay) {
      packageDisplay.classList.add('active');
      packageDisplay.innerHTML = `
        <div class="package-item">${gameState.currentMission ? gameState.currentMission.package.icon : '🎂'}</div>
        <div class="package-label">${gameState.currentMission ? gameState.currentMission.package.name : 'Birthday Cake'}</div>
      `;
    }

    // Enable planet buttons
    enablePlanetSelection();
  }
}

function enablePlanetSelection() {
  const planetButtons = document.querySelectorAll('.planet-button');
  const launchButton = document.getElementById('launch-button');

  // Enable target planet
  const targetPlanet = gameState.currentMission ? gameState.currentMission.planet : 'zorbax';

  planetButtons.forEach(button => {
    const planet = button.getAttribute('data-planet');
    if (planet === targetPlanet) {
      button.disabled = false;
      button.addEventListener('click', () => selectPlanet(planet));
    }
  });
}

function selectPlanet(planetId) {
  gameState.selectedPlanet = planetId;

  // Visual feedback
  document.querySelectorAll('.planet-button').forEach(btn => {
    btn.classList.remove('selected');
  });

  const selectedButton = document.querySelector(`[data-planet="${planetId}"]`);
  if (selectedButton) {
    selectedButton.classList.add('selected');
  }

  // Enable launch button
  const launchButton = document.getElementById('launch-button');
  if (launchButton) {
    launchButton.disabled = false;
  }

  // Play selection sound (visual feedback)
  playChunkSound();
}

function launchTeleport() {
  if (!gameState.selectedPlanet) return;

  // Show teleport animation
  const destinationName = document.getElementById('destination-name');
  if (destinationName) {
    destinationName.textContent = planets[gameState.selectedPlanet].name;
  }

  showScreen('teleport-screen');

  // Play whoosh sound
  playWhooshSound();

  // Arrive at planet after animation
  setTimeout(() => {
    arriveAtPlanet(gameState.selectedPlanet);
  }, 2000);
}

// ===== PLANET FUNCTIONS =====
function arriveAtPlanet(planetId) {
  const planet = planets[planetId];

  // Update planet screen
  const planetBg = document.getElementById('planet-bg');
  const planetTitle = document.getElementById('planet-title');

  if (planetBg) {
    planetBg.className = 'planet-bg ' + planetId;
  }

  if (planetTitle) {
    planetTitle.textContent = planet.name;
  }

  // Show delivery instructions
  const deliveryInstructions = document.getElementById('delivery-instructions');
  if (deliveryInstructions && gameState.currentMission) {
    deliveryInstructions.innerHTML = gameState.currentMission.instructions;
  }

  // Setup district map
  setupDistrictMap(planetId);

  // Show planet screen
  showScreen('planet-screen');

  // Play arrival sound
  playDingSound();
}

function setupDistrictMap(planetId) {
  const planet = planets[planetId];
  const districtMap = document.getElementById('district-map');

  if (!districtMap) return;

  // Clear existing districts
  districtMap.innerHTML = '<h3 style="font-family: var(--font-header); margin-bottom: 20px; color: var(--starfield-navy); text-align: center; letter-spacing: 2px;">FIND THE RIGHT DISTRICT</h3>';

  // Create district buttons
  planet.districts.forEach(district => {
    const districtButton = document.createElement('button');
    districtButton.className = 'district-sign';
    districtButton.innerHTML = `
      <div class="district-icon">${district.icon}</div>
      <div class="district-name">${district.name}</div>
    `;

    districtButton.addEventListener('click', () => {
      selectDistrict(planetId, district.name);
    });

    districtMap.appendChild(districtButton);
  });
}

function selectDistrict(planetId, districtName) {
  gameState.currentDistrict = districtName;

  // Check if correct district
  const isCorrect = gameState.currentMission &&
                    gameState.currentMission.targetDistrict === districtName;

  if (isCorrect) {
    // Correct district - show alien and complete delivery
    const districtButtons = document.querySelectorAll('.district-sign');
    districtButtons.forEach(btn => {
      if (btn.querySelector('.district-name').textContent === districtName) {
        btn.classList.add('correct');
      }
      btn.disabled = true;
    });

    // Show alien after a moment
    setTimeout(() => {
      showAlien();
    }, 800);
  } else {
    // Wrong district - shake effect
    const clickedButton = Array.from(document.querySelectorAll('.district-sign'))
      .find(btn => btn.querySelector('.district-name').textContent === districtName);

    if (clickedButton) {
      clickedButton.style.animation = 'none';
      setTimeout(() => {
        clickedButton.style.animation = 'shake 0.5s ease';
      }, 10);
    }

    // Provide hint
    const deliveryTask = document.getElementById('delivery-task');
    if (deliveryTask) {
      deliveryTask.innerHTML = `<strong>Hmm, not quite right!</strong><br>Read the instructions carefully. ${gameState.currentMission ? gameState.currentMission.hint : 'Where does it say to deliver the package?'}`;
    }
  }
}

// Add shake animation to CSS (will be added dynamically)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(shakeStyle);

function showAlien() {
  const alienContainer = document.getElementById('alien-container');

  if (!alienContainer) return;

  // Create alien based on current mission
  const alienColor = gameState.currentMission ? gameState.currentMission.alienColor : '#9d4edd';
  const alienMessage = gameState.currentMission ? gameState.currentMission.alienMessage : 'Thank you so much!';

  alienContainer.innerHTML = `
    <div class="alien">
      <div class="alien-speech">${alienMessage}</div>
      <div class="alien-body" style="background: ${alienColor};">
        <div class="alien-eyes">
          <div class="alien-eye">
            <div class="alien-pupil"></div>
          </div>
          <div class="alien-eye">
            <div class="alien-pupil"></div>
          </div>
        </div>
        <div class="alien-mouth"></div>
      </div>
    </div>
  `;

  alienContainer.classList.add('show');

  // Start delivery task after alien appears
  setTimeout(() => {
    startDeliveryTask();
  }, 1500);
}

function startDeliveryTask() {
  const deliveryTask = document.getElementById('delivery-task');

  if (!deliveryTask || !gameState.currentMission) return;

  // Show math task
  const task = gameState.currentMission.task;

  deliveryTask.innerHTML = `
    <div style="margin-bottom: 15px;"><strong>${task.question}</strong></div>
    <div id="task-options" style="display: grid; gap: 10px;">
      ${task.options.map((option, index) => `
        <button class="task-option" data-answer="${option}" style="
          background: var(--cosmic-cream);
          border: 3px solid var(--starfield-navy);
          border-radius: 10px;
          padding: 15px;
          font-family: var(--font-body);
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        ">${option}</button>
      `).join('')}
    </div>
    <div id="task-feedback" style="margin-top: 15px; font-size: 16px; font-weight: 700;"></div>
  `;

  // Add click handlers to options
  document.querySelectorAll('.task-option').forEach(btn => {
    btn.addEventListener('click', function() {
      checkAnswer(this.getAttribute('data-answer'), task.correct);
    });

    // Add hover effect
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
      this.style.boxShadow = 'var(--shadow-chunky)';
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
}

function checkAnswer(answer, correct) {
  const feedback = document.getElementById('task-feedback');
  const options = document.querySelectorAll('.task-option');

  // Disable all options
  options.forEach(btn => btn.disabled = true);

  if (answer == correct) {
    // Correct answer!
    feedback.innerHTML = '✅ <strong>Perfect! Great counting!</strong>';
    feedback.style.color = 'var(--alien-green)';

    // Complete delivery
    setTimeout(() => {
      completeDelivery();
    }, 1500);
  } else {
    // Wrong answer
    feedback.innerHTML = '❌ <strong>Try counting again!</strong>';
    feedback.style.color = 'var(--rocket-red)';

    // Re-enable options after a moment
    setTimeout(() => {
      feedback.innerHTML = '';
      options.forEach(btn => btn.disabled = false);
    }, 1500);
  }
}

function completeDelivery() {
  // Update stats
  gameState.deliveryCount++;
  gameState.starsEarned++;

  // Show celebration
  showCelebration();
}

// ===== CELEBRATION FUNCTIONS =====
function showCelebration() {
  // Update celebration stats
  const starsEarnedEl = document.getElementById('stars-earned');
  const packagesDeliveredEl = document.getElementById('packages-delivered');

  if (starsEarnedEl) starsEarnedEl.textContent = gameState.starsEarned;
  if (packagesDeliveredEl) packagesDeliveredEl.textContent = gameState.deliveryCount;

  // Create confetti
  createConfetti();

  // Show celebration screen
  showScreen('celebration-screen');

  // Play celebration sound
  playCelebrationSound();
}

function createConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  container.innerHTML = '';

  const colors = ['#e63946', '#f77f00', '#2ec4b2', '#ffd60a', '#9d4edd'];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

    container.appendChild(confetti);
  }
}

function continueToNextMission() {
  // Reset mission state
  gameState.currentMission = null;
  gameState.selectedPlanet = null;
  gameState.currentDistrict = null;

  // Reset lobby
  const packageDisplay = document.getElementById('package-display');
  if (packageDisplay) {
    packageDisplay.classList.remove('active');
  }

  // Disable planet buttons
  document.querySelectorAll('.planet-button').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected');
  });

  // Disable launch button
  const launchButton = document.getElementById('launch-button');
  if (launchButton) {
    launchButton.disabled = true;
  }

  // Show start button again
  const startButton = document.getElementById('start-mission-button');
  if (startButton) {
    startButton.classList.remove('hidden');
  }

  // Reset mission text
  const missionText = document.getElementById('mission-text');
  if (missionText) {
    missionText.textContent = 'Ready for another delivery mission, Space Cadet?';
  }

  // Update delivery count
  updateDeliveryCount();

  // Hide alien
  const alienContainer = document.getElementById('alien-container');
  if (alienContainer) {
    alienContainer.classList.remove('show');
  }

  // Return to lobby
  showScreen('lobby-screen');
}

// ===== SOUND EFFECTS (Visual Feedback) =====
function playChunkSound() {
  // Visual feedback for button press
  console.log('CHUNK! 🔊');
}

function playWhooshSound() {
  // Visual feedback for teleport
  console.log('WHOOOOSH! 🚀');
}

function playDingSound() {
  // Visual feedback for arrival
  console.log('DING! 🔔');
}

function playCelebrationSound() {
  // Visual feedback for celebration
  console.log('CELEBRATION! 🎉');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Start mission button
  const startButton = document.getElementById('start-mission-button');
  if (startButton) {
    startButton.addEventListener('click', startMission);
  }

  // Launch button
  const launchButton = document.getElementById('launch-button');
  if (launchButton) {
    launchButton.addEventListener('click', launchTeleport);
  }

  // Back to lobby button
  const backButton = document.getElementById('back-to-lobby');
  if (backButton) {
    backButton.addEventListener('click', () => {
      showScreen('lobby-screen');

      // Reset planet state
      const alienContainer = document.getElementById('alien-container');
      if (alienContainer) {
        alienContainer.classList.remove('show');
      }
    });
  }

  // Continue button
  const continueButton = document.getElementById('continue-button');
  if (continueButton) {
    continueButton.addEventListener('click', continueToNextMission);
  }

  // Initialize app
  initializeApp();
});

// Export for pilot story
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, planets, showScreen, startMission };
}
