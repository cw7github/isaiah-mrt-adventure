/**
 * THE GROWTH TOWER - Main Application Logic
 * A living building where plants tell stories as they grow
 * Educational app for Grade 1 - Plant Life Cycle
 */

const growthTower = {
  // State management
  state: {
    currentScene: 'lobby',
    currentFloor: 1,
    waterDrops: 0,
    plantingSteps: {
      dug: false,
      planted: false,
      covered: false
    },
    storySegment: 0,
    achievements: []
  },

  // Scene transitions
  showScene(sceneName) {
    // Hide all scenes
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
      scene.classList.remove('active');
    });

    // Show requested scene
    const targetScene = document.getElementById(`scene-${sceneName}`);
    if (targetScene) {
      targetScene.classList.add('active');
      this.state.currentScene = sceneName;

      // Play scene-specific animations
      this.playSceneAnimation(sceneName);
    }
  },

  // Play animations specific to each scene
  playSceneAnimation(sceneName) {
    switch (sceneName) {
      case 'vine-lift':
        this.animateVineLift();
        break;
      case 'germination':
        this.animateGermination();
        break;
      case 'growing':
        this.animateGrowthMontage();
        break;
      case 'bloom':
        this.animateFlowerBloom();
        break;
    }
  },

  // === SCENE 1: GARDEN LOBBY ===
  startAdventure() {
    console.log('🌱 Starting garden adventure!');
    this.playSound('gentle-chime');
    setTimeout(() => {
      this.showScene('receive-seed');
    }, 300);
  },

  // === SCENE 2: RECEIVE SEED ===
  enterVineLift() {
    console.log('🌿 Entering the Vine Lift');
    this.playSound('vine-rustle');
    setTimeout(() => {
      this.showScene('vine-lift');
    }, 300);
  },

  // === SCENE 3: VINE LIFT ===
  animateVineLift() {
    const leafIndicators = document.querySelectorAll('.leaf-indicator');
    const liftMessage = document.querySelector('.lift-message');

    // Clear all active states
    leafIndicators.forEach(leaf => leaf.classList.remove('active'));

    // Animate descent to floor 1
    setTimeout(() => {
      liftMessage.textContent = 'Descending through the earth...';
    }, 500);
  },

  descendToSeedFloor() {
    const leafIndicators = document.querySelectorAll('.leaf-indicator');
    const liftMessage = document.querySelector('.lift-message');

    // Show descending animation
    liftMessage.textContent = 'Going down... down... down...';
    this.playSound('elevator-descend');

    // Animate leaf indicators
    let currentFloor = 5;
    const descendInterval = setInterval(() => {
      leafIndicators.forEach(leaf => {
        if (parseInt(leaf.dataset.floor) === currentFloor) {
          leaf.classList.add('active');
          setTimeout(() => leaf.classList.remove('active'), 500);
        }
      });

      currentFloor--;

      if (currentFloor === 0) {
        clearInterval(descendInterval);
        const seedFloorLeaf = document.querySelector('.leaf-indicator[data-floor="1"]');
        seedFloorLeaf.classList.add('active');
        liftMessage.textContent = 'Arrived at the Seed Floor!';

        setTimeout(() => {
          this.showScene('seed-floor');
          this.initializePlanting();
        }, 1500);
      }
    }, 600);
  },

  // === SCENE 4: SEED FLOOR - PLANTING ===
  initializePlanting() {
    const plantingHole = document.getElementById('planting-hole');
    const stepDig = document.getElementById('step-dig');

    // Make first step active
    stepDig.classList.add('active');

    // Set up planting hole interaction
    plantingHole.addEventListener('click', () => this.digHole());
  },

  digHole() {
    if (this.state.plantingSteps.dug) return;

    console.log('⛏️ Digging hole');
    this.playSound('dig');

    const plantingHole = document.getElementById('planting-hole');
    const stepDig = document.getElementById('step-dig');
    const stepPlant = document.getElementById('step-plant');

    // Mark step complete
    this.state.plantingSteps.dug = true;
    stepDig.classList.remove('active');
    stepPlant.classList.add('active');

    // Enlarge hole
    plantingHole.style.transform = 'scale(1.2)';
    plantingHole.querySelector('.hole-prompt').textContent = 'Click to place seed';

    // Next: place seed
    setTimeout(() => {
      plantingHole.addEventListener('click', () => this.placeSeed(), { once: true });
    }, 300);
  },

  placeSeed() {
    if (this.state.plantingSteps.planted) return;

    console.log('🌱 Placing seed');
    this.playSound('gentle-plop');

    const plantingHole = document.getElementById('planting-hole');
    const plantedSeed = document.getElementById('planted-seed');
    const stepPlant = document.getElementById('step-plant');
    const stepCover = document.getElementById('step-cover');

    // Mark step complete
    this.state.plantingSteps.planted = true;
    stepPlant.classList.remove('active');
    stepCover.classList.add('active');

    // Hide hole, show seed
    plantingHole.style.display = 'none';
    plantedSeed.classList.remove('hidden');

    // Auto-cover with soil after a moment
    setTimeout(() => {
      this.coverSeed();
    }, 1500);
  },

  coverSeed() {
    if (this.state.plantingSteps.covered) return;

    console.log('🪨 Covering with soil');
    this.playSound('soil-rustle');

    const stepCover = document.getElementById('step-cover');
    const btnWater = document.getElementById('btn-water');

    // Mark step complete
    this.state.plantingSteps.covered = true;
    stepCover.classList.remove('active');

    // Show watering button
    btnWater.classList.remove('hidden');
  },

  waterSeed() {
    console.log('💧 Time to water!');
    this.playSound('water-drop');
    setTimeout(() => {
      this.showScene('watering');
    }, 300);
  },

  // === SCENE 5: WATERING ===
  addWaterDrop() {
    if (this.state.waterDrops >= 5) return;

    this.state.waterDrops++;
    console.log(`💧 Water drop ${this.state.waterDrops}/5`);

    // Update counter
    const dropCount = document.getElementById('drop-count');
    dropCount.textContent = this.state.waterDrops;

    // Animate water drop
    this.animateWaterDrop();
    this.playSound('water-drop');

    // Check if watering complete
    if (this.state.waterDrops === 5) {
      setTimeout(() => {
        this.completeWatering();
      }, 1000);
    }
  },

  animateWaterDrop() {
    const wateringCan = document.getElementById('watering-can');

    // Tilt can
    wateringCan.style.transform = 'translateX(-50%) rotate(20deg)';

    // Create falling drop animation
    const drop = wateringCan.querySelector('.drop');
    drop.style.animation = 'none';
    setTimeout(() => {
      drop.style.animation = 'water-drop 1s ease-in';
    }, 10);

    // Return can to normal
    setTimeout(() => {
      wateringCan.style.transform = 'translateX(-50%) rotate(0deg)';
    }, 500);
  },

  completeWatering() {
    console.log('✅ Watering complete!');
    this.playSound('success-chime');

    const btnAddWater = document.getElementById('btn-add-water');
    btnAddWater.textContent = 'Perfect! Watch what happens next...';
    btnAddWater.disabled = true;

    setTimeout(() => {
      this.showScene('germination');
    }, 1500);
  },

  // === SCENE 6: GERMINATION ===
  animateGermination() {
    console.log('🌱 Germination animation starting');
    this.playSound('seed-crack');

    // The CSS animations handle the visual germination
    // Just need to enable the button after animation completes
    setTimeout(() => {
      this.enableGerminationButton();
    }, 4000);
  },

  enableGerminationButton() {
    const btnListen = document.querySelector('#scene-germination .garden-button');
    if (btnListen) {
      btnListen.style.opacity = '1';
      btnListen.style.pointerEvents = 'auto';
    }
  },

  seedSpeaks() {
    console.log('📖 Seed begins to tell its story');
    this.playSound('gentle-chime');
    setTimeout(() => {
      this.showScene('story');
      this.initializeStory();
    }, 300);
  },

  // === SCENE 7: STORY TIME ===
  initializeStory() {
    console.log('📚 Initializing story');
    this.state.storySegment = 0;
    this.displayStorySegment();
  },

  displayStorySegment() {
    const segment = sunflowerStory.getSegment(this.state.storySegment);
    if (!segment) return;

    const storyText = document.getElementById('story-text');
    const storyProgress = document.getElementById('story-progress');
    const storyPercent = document.getElementById('story-percent');
    const btnContinue = document.getElementById('btn-continue-story');
    const btnGrowUp = document.getElementById('btn-grow-up');

    // Display text with typing effect
    this.typeText(storyText, segment.text);

    // Update progress
    const progress = sunflowerStory.getProgress(this.state.storySegment + 1);
    storyProgress.style.width = `${progress}%`;
    storyPercent.textContent = progress;

    // Check if story complete
    if (this.state.storySegment >= sunflowerStory.getTotalSegments() - 1) {
      btnContinue.classList.add('hidden');
      btnGrowUp.classList.remove('hidden');
    } else {
      btnContinue.classList.remove('hidden');
      btnGrowUp.classList.add('hidden');
    }
  },

  typeText(element, text, speed = 30) {
    element.textContent = '';
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, speed);
  },

  continueStory() {
    console.log('📖 Continue reading story');
    this.playSound('page-turn');
    this.state.storySegment++;
    this.displayStorySegment();
  },

  growUpFloors() {
    console.log('🌿 Growing up through the floors!');
    this.playSound('growth-whoosh');
    setTimeout(() => {
      this.showScene('growing');
    }, 300);
  },

  // === SCENE 8: GROWING UP ===
  animateGrowthMontage() {
    console.log('🌱➡️🌻 Growth montage playing');

    // Start countdown timer
    let timeRemaining = 3;
    const timerElement = document.getElementById('growth-timer');

    const timerInterval = setInterval(() => {
      timeRemaining--;
      timerElement.textContent = timeRemaining;

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        setTimeout(() => {
          this.completeGrowth();
        }, 1000);
      }
    }, 1000);
  },

  completeGrowth() {
    console.log('🌻 Growth complete! Time to bloom!');
    this.playSound('success-fanfare');
    this.showScene('bloom');
  },

  // === SCENE 9: FLOWER BLOOMS ===
  animateFlowerBloom() {
    console.log('🌻 Flower blooming animation');
    this.playSound('magical-bloom');

    // Award achievement
    setTimeout(() => {
      this.awardAchievement('Sunflower Gardener');
    }, 2000);
  },

  awardAchievement(achievementName) {
    if (!this.state.achievements.includes(achievementName)) {
      this.state.achievements.push(achievementName);
      console.log(`🏆 Achievement unlocked: ${achievementName}`);
      this.playSound('achievement');
    }
  },

  visitSkyGarden() {
    console.log('☁️ Visiting the Sky Garden!');
    this.playSound('elevator-ascend');
    setTimeout(() => {
      this.showScene('sky-garden');
    }, 300);
  },

  // === BONUS: SKY GARDEN ===
  returnToLobby() {
    console.log('🏠 Returning to Garden Lobby');
    this.playSound('gentle-chime');
    setTimeout(() => {
      this.showScene('lobby');
    }, 300);
  },

  restart() {
    console.log('🔄 Restarting garden journey');

    // Reset state
    this.state = {
      currentScene: 'lobby',
      currentFloor: 1,
      waterDrops: 0,
      plantingSteps: {
        dug: false,
        planted: false,
        covered: false
      },
      storySegment: 0,
      achievements: []
    };

    // Return to lobby
    this.showScene('lobby');

    // Reset UI elements
    const dropCount = document.getElementById('drop-count');
    if (dropCount) dropCount.textContent = '0';

    const plantedSeed = document.getElementById('planted-seed');
    if (plantedSeed) {
      plantedSeed.classList.add('hidden');
    }

    const plantingHole = document.getElementById('planting-hole');
    if (plantingHole) {
      plantingHole.style.display = 'flex';
      plantingHole.style.transform = 'scale(1)';
    }

    // Reset instruction steps
    const steps = document.querySelectorAll('.instruction-step');
    steps.forEach(step => step.classList.remove('active'));
  },

  // === SOUND SYSTEM ===
  playSound(soundName) {
    // Sound effects mapping
    const soundEffects = {
      'gentle-chime': '🔔',
      'vine-rustle': '🌿',
      'elevator-descend': '⬇️',
      'elevator-ascend': '⬆️',
      'dig': '⛏️',
      'gentle-plop': '💧',
      'soil-rustle': '🪨',
      'water-drop': '💧',
      'success-chime': '✨',
      'seed-crack': '🌱',
      'page-turn': '📖',
      'growth-whoosh': '🌪️',
      'success-fanfare': '🎉',
      'magical-bloom': '✨',
      'achievement': '🏆'
    };

    console.log(`🔊 Playing sound: ${soundName} ${soundEffects[soundName] || ''}`);

    // In a full implementation, this would trigger actual audio
    // For now, we just log the sound effects
    // You could integrate Web Audio API or HTML5 Audio here
  },

  // === INITIALIZATION ===
  init() {
    console.log('🌱 The Growth Tower is initializing...');
    console.log('🌻 Total story words:', sunflowerStory.getTotalWords());
    console.log('📚 Story segments:', sunflowerStory.getTotalSegments());

    // Show initial scene
    this.showScene('lobby');

    // Log a random sunflower fact
    const randomFact = sunflowerFacts[Math.floor(Math.random() * sunflowerFacts.length)];
    console.log('🌻 Fun fact:', randomFact);

    // Add keyboard shortcuts for development
    this.initializeKeyboardShortcuts();

    console.log('✅ The Growth Tower is ready!');
    console.log('🎮 Press ? for keyboard shortcuts');
  },

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Skip scenes with number keys (dev mode)
      if (e.key === '1') this.showScene('lobby');
      if (e.key === '2') this.showScene('receive-seed');
      if (e.key === '3') this.showScene('vine-lift');
      if (e.key === '4') this.showScene('seed-floor');
      if (e.key === '5') this.showScene('watering');
      if (e.key === '6') this.showScene('germination');
      if (e.key === '7') this.showScene('story');
      if (e.key === '8') this.showScene('growing');
      if (e.key === '9') this.showScene('bloom');
      if (e.key === '0') this.showScene('sky-garden');

      // Help
      if (e.key === '?') {
        console.log('⌨️ KEYBOARD SHORTCUTS:');
        console.log('1-9, 0: Jump to scenes');
        console.log('R: Restart');
        console.log('S: Show current state');
      }

      // Restart
      if (e.key.toLowerCase() === 'r') {
        this.restart();
      }

      // Show state
      if (e.key.toLowerCase() === 's') {
        console.log('📊 Current state:', this.state);
      }
    });
  }
};

// === AUTO-INITIALIZE WHEN PAGE LOADS ===
document.addEventListener('DOMContentLoaded', () => {
  growthTower.init();
});

// === EDUCATIONAL EXTENSIONS ===

// Math Helper - integrated with the story
const gardenMathHelper = {
  askQuestion(questionKey) {
    const question = gardenMath[questionKey];
    if (!question) return;

    console.log('🧮 Math Question:', question.question);
    console.log('💡 Hint:', question.hint);

    // Could create a modal here for interactive math problems
    return question;
  },

  checkAnswer(questionKey, userAnswer) {
    const question = gardenMath[questionKey];
    if (!question) return false;

    const isCorrect = parseInt(userAnswer) === question.answer;
    console.log(isCorrect ? '✅ Correct!' : '❌ Try again!');
    return isCorrect;
  }
};

// Vocabulary Helper
const vocabularyHelper = {
  explain(word) {
    const vocab = vocabularyWords[word.toLowerCase()];
    if (!vocab) {
      console.log('❓ Word not in vocabulary list');
      return null;
    }

    console.log(`📚 ${word}:`);
    console.log(`   Definition: ${vocab.definition}`);
    console.log(`   Simplified: ${vocab.simplified}`);
    return vocab;
  },

  getAllWords() {
    return Object.keys(vocabularyWords);
  }
};

// Progress Tracker
const progressTracker = {
  saveProgress() {
    const progress = {
      state: growthTower.state,
      timestamp: new Date().toISOString(),
      achievements: growthTower.state.achievements
    };

    localStorage.setItem('growth-tower-progress', JSON.stringify(progress));
    console.log('💾 Progress saved!');
  },

  loadProgress() {
    const saved = localStorage.getItem('growth-tower-progress');
    if (!saved) {
      console.log('📭 No saved progress found');
      return null;
    }

    const progress = JSON.parse(saved);
    console.log('📬 Progress loaded!', progress);
    return progress;
  },

  clearProgress() {
    localStorage.removeItem('growth-tower-progress');
    console.log('🗑️ Progress cleared!');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    growthTower,
    gardenMathHelper,
    vocabularyHelper,
    progressTracker
  };
}

// Console welcome message
console.log('%c🌻 THE GROWTH TOWER 🌻', 'font-size: 24px; font-weight: bold; color: #ffd60a;');
console.log('%cWelcome to a living building where plants tell stories!', 'font-size: 14px; color: #40916c;');
console.log('%cEducational App for Grade 1 - Plant Life Cycle', 'font-size: 12px; color: #1b4332; font-style: italic;');
console.log('%cPress ? for keyboard shortcuts', 'font-size: 10px; color: #6b4423;');
