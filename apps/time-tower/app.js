/**
 * THE TIME TOWER - MAIN APPLICATION
 * A steampunk time machine elevator that teaches history through cooking
 */

// ===== GAME STATE =====
const gameState = {
  currentScene: 'timeLobby',
  selectedEra: null,
  currentStep: 0,
  ingredientCount: 0,
  wordsRead: 0,
  measurementsMade: 0,
  readingProgress: 0
};

// ===== SCENE MANAGEMENT =====
function showScene(sceneId) {
  // Hide all scenes
  document.querySelectorAll('.scene').forEach(scene => {
    scene.classList.remove('active');
  });

  // Show the requested scene
  const scene = document.getElementById(sceneId);
  if (scene) {
    scene.classList.add('active');
    gameState.currentScene = sceneId;
  }
}

// ===== TIME LOBBY FUNCTIONS =====
function enterElevator() {
  // Play door opening animation
  const doors = document.querySelectorAll('.door');
  doors[0].style.transform = 'translateX(-100%)';
  doors[1].style.transform = 'translateX(100%)';

  // After doors open, transition to elevator interior
  setTimeout(() => {
    showScene('elevatorInterior');
    // Reset doors for next time
    setTimeout(() => {
      doors[0].style.transform = 'translateX(0)';
      doors[1].style.transform = 'translateX(0)';
    }, 600);
  }, 1000);
}

// ===== ELEVATOR INTERIOR FUNCTIONS =====
function selectEra(eraNumber) {
  // Only Ancient Egypt (era 2) is available in the pilot
  if (eraNumber !== 2) {
    return;
  }

  gameState.selectedEra = eraNumber;

  // Rotate the indicator hand to point at the selected era
  const indicatorHand = document.getElementById('eraIndicator');
  const rotationAngles = {
    1: 0,     // Top (12 o'clock)
    2: 90,    // Right (3 o'clock)
    3: 180,   // Bottom (6 o'clock)
    4: 270,   // Left (9 o'clock)
    5: 45     // Top-right
  };
  indicatorHand.style.transform = `rotate(${rotationAngles[eraNumber]}deg)`;

  // Start time travel animation
  setTimeout(() => {
    startTimeTravel(eraNumber);
  }, 800);
}

function startTimeTravel(eraNumber) {
  showScene('timeTravel');

  const destinations = {
    1: 'Dinosaur Age - 65 Million Years Ago',
    2: 'Ancient Egypt - 3000 BC',
    3: 'Medieval Times - 1200 AD',
    4: 'Victorian Era - 1850 AD',
    5: 'The Future - 2500 AD'
  };

  const travelText = document.getElementById('travelText');
  travelText.textContent = `Traveling to ${destinations[eraNumber]}...`;

  // Time travel takes 3 seconds
  setTimeout(() => {
    arriveAtEra(eraNumber);
  }, 3000);
}

function arriveAtEra(eraNumber) {
  if (eraNumber === 2) {
    showScene('egyptScene');
  }
  // Other eras would be implemented here
}

// ===== ANCIENT EGYPT SCENE =====
function startRecipe() {
  showScene('recipeScene');
  loadRecipeStory();
}

function loadRecipeStory() {
  const storyContainer = document.getElementById('recipeStory');
  storyContainer.innerHTML = HONEY_BREAD_STORY.story;

  // Simulate reading progress
  const totalWords = HONEY_BREAD_STORY.story.split(/\s+/).length;
  gameState.wordsRead = totalWords;

  // Animate progress bar
  setTimeout(() => {
    animateReadingProgress();
  }, 500);
}

function animateReadingProgress() {
  const progressBar = document.getElementById('readingProgress');
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    progressBar.style.width = `${progress}%`;
    gameState.readingProgress = progress;

    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 50);
}

// ===== COOKING MINI-GAME =====
function startCooking() {
  showScene('cookingScene');
  gameState.currentStep = 0;
  gameState.ingredientCount = 0;
  updateCookingTask();
}

function updateCookingTask() {
  const currentTask = COOKING_STEPS[gameState.currentStep];

  if (!currentTask) {
    // All steps complete, move to baking
    startBaking();
    return;
  }

  // Update instruction text
  document.getElementById('taskText').textContent = currentTask.instruction;

  // Reset ingredient count for new step
  gameState.ingredientCount = 0;
  document.getElementById('ingredientCount').textContent = '0';

  // Clear bowl
  document.getElementById('bowlContents').innerHTML = '';

  // Enable/disable buttons based on current ingredient
  const buttons = document.querySelectorAll('.ingredient-btn');
  buttons.forEach(btn => {
    const ingredient = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (ingredient === currentTask.ingredient) {
      btn.disabled = false;
      btn.style.opacity = '1';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
    }
  });
}

function addIngredient(ingredientType) {
  const currentTask = COOKING_STEPS[gameState.currentStep];

  // Only allow the correct ingredient
  if (ingredientType !== currentTask.ingredient) {
    return;
  }

  // Don't allow more than needed
  if (gameState.ingredientCount >= currentTask.targetCount) {
    return;
  }

  // Add visual ingredient to bowl
  gameState.ingredientCount++;
  gameState.measurementsMade++;

  const bowlContents = document.getElementById('bowlContents');
  const ingredientItem = document.createElement('div');
  ingredientItem.className = 'ingredient-item';
  ingredientItem.textContent = currentTask.icon;
  bowlContents.appendChild(ingredientItem);

  // Update counter
  document.getElementById('ingredientCount').textContent = gameState.ingredientCount;

  // Check if step is complete
  if (gameState.ingredientCount === currentTask.targetCount) {
    setTimeout(() => {
      showSuccessMessage(currentTask.successMessage);
    }, 500);
  }
}

function showSuccessMessage(message) {
  // Create a temporary success message
  const taskInstruction = document.querySelector('.task-instruction p');
  const originalText = taskInstruction.textContent;

  taskInstruction.textContent = message;
  taskInstruction.style.color = 'var(--egypt-gold)';
  taskInstruction.style.fontSize = '1.8rem';

  // Show a random Egypt fact
  const randomFact = EGYPT_FACTS[Math.floor(Math.random() * EGYPT_FACTS.length)];
  const factDisplay = document.createElement('p');
  factDisplay.style.marginTop = '20px';
  factDisplay.style.fontSize = '1.1rem';
  factDisplay.style.color = 'var(--egypt-blue)';
  factDisplay.textContent = randomFact;
  document.querySelector('.task-instruction').appendChild(factDisplay);

  setTimeout(() => {
    // Remove fact and move to next step
    factDisplay.remove();
    taskInstruction.style.color = '';
    taskInstruction.style.fontSize = '';
    gameState.currentStep++;
    updateCookingTask();
  }, 3000);
}

// ===== BAKING SCENE =====
function startBaking() {
  showScene('bakingScene');

  // Baking takes 5 seconds (matches CSS animation)
  setTimeout(() => {
    showReward();
  }, 5500);
}

// ===== REWARD SCENE =====
function showReward() {
  showScene('rewardScene');

  // Update stats
  document.querySelector('.reward-stats .stat-card:nth-child(2) .stat-value').textContent =
    gameState.wordsRead;
  document.querySelector('.reward-stats .stat-card:nth-child(3) .stat-value').textContent =
    gameState.measurementsMade;
}

function returnToElevator() {
  // Reset game state
  gameState.currentStep = 0;
  gameState.ingredientCount = 0;
  gameState.selectedEra = null;

  // Go back to elevator
  showScene('elevatorInterior');
}

function playAgain() {
  // Reset just the cooking portion
  gameState.currentStep = 0;
  gameState.ingredientCount = 0;
  gameState.measurementsMade = 0;

  // Go back to the Egypt welcome scene
  showScene('egyptScene');
}

// ===== INITIALIZATION =====
function initTimeTower() {
  console.log('The Time Tower is ready!');
  console.log('Starting scene:', gameState.currentScene);

  // Make sure the lobby is showing
  showScene('timeLobby');

  // Add some dynamic effects
  initDynamicEffects();
}

function initDynamicEffects() {
  // Add random variations to gear spin speeds
  const gears = document.querySelectorAll('.gear');
  gears.forEach((gear, index) => {
    const randomSpeed = 12 + Math.random() * 10;
    gear.style.animationDuration = `${randomSpeed}s`;
  });

  // Add subtle movement to steam puffs
  const steamPuffs = document.querySelectorAll('.steam-puff');
  steamPuffs.forEach((puff, index) => {
    const randomDelay = Math.random() * 4;
    puff.style.animationDelay = `${randomDelay}s`;
  });
}

// ===== WINDOW LOAD =====
window.addEventListener('load', () => {
  initTimeTower();
});

// Make functions available globally
window.enterElevator = enterElevator;
window.selectEra = selectEra;
window.startRecipe = startRecipe;
window.startCooking = startCooking;
window.addIngredient = addIngredient;
window.returnToElevator = returnToElevator;
window.playAgain = playAgain;
