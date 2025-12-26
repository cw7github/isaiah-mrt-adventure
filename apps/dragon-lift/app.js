// THE DRAGON LIFT - Main Application Logic
// Isaiah's Grade 1 Educational Dragon Adventure

// ============================================
// APP STATE MANAGEMENT
// ============================================
const DragonLiftApp = {
  state: {
    currentScreen: 'lobby', // lobby, elevator, lair
    currentFloor: 0,
    doorsOpen: false,
    sightWordsFound: [],
    totalSightWords: 5,
    currentStory: null
  },

  // ============================================
  // INITIALIZATION
  // ============================================
  init() {
    console.log('🐉 THE DRAGON LIFT - Initializing...');

    // Load the pilot story
    this.state.currentStory = PILOT_STORY;

    // Set up event listeners
    this.setupEventListeners();

    // Create particle effects
    this.createEmberParticles();
    this.createScaleSparkles();

    // Start ambient dragon breathing sound (placeholder for future audio)
    this.startAmbientEffects();

    console.log('🐉 Dragon Lift ready! Welcome aboard.');
  },

  // ============================================
  // EVENT LISTENERS
  // ============================================
  setupEventListeners() {
    // Call elevator button
    const callBtn = document.getElementById('callElevatorBtn');
    if (callBtn) {
      callBtn.addEventListener('click', () => this.callElevator());
    }

    // Floor buttons (will be set up when elevator interior is shown)
    this.setupFloorButtons();
  },

  setupFloorButtons() {
    const floorButtons = document.querySelectorAll('.floor-button');
    floorButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const floor = parseInt(e.target.dataset.floor);
        this.selectFloor(floor);
      });
    });
  },

  // ============================================
  // ELEVATOR MECHANICS
  // ============================================
  callElevator() {
    console.log('🔔 Calling elevator...');

    const doorsContainer = document.getElementById('elevatorDoorsContainer');
    const callBtn = document.getElementById('callElevatorBtn');

    // Play dragon roar sound (placeholder)
    this.playSound('dragon-roar');

    // Disable button
    callBtn.disabled = true;
    callBtn.style.opacity = '0.5';

    // Wait a moment, then open doors
    setTimeout(() => {
      this.openDoors();
    }, 800);
  },

  openDoors() {
    console.log('🚪 Opening dragon scale doors...');

    const doorsContainer = document.getElementById('elevatorDoorsContainer');
    const elevatorInterior = document.getElementById('elevatorInterior');

    // Add opening class to trigger door animation
    doorsContainer.classList.add('opening');

    // Play door opening sound
    this.playSound('door-whoosh');

    // After doors are open, show interior
    setTimeout(() => {
      elevatorInterior.classList.add('visible');
      this.state.doorsOpen = true;
    }, 1200);
  },

  closeDoors() {
    console.log('🚪 Closing dragon scale doors...');

    const doorsContainer = document.getElementById('elevatorDoorsContainer');
    const elevatorInterior = document.getElementById('elevatorInterior');

    // Hide interior
    elevatorInterior.classList.remove('visible');

    // Close doors
    doorsContainer.classList.remove('opening');

    // Play door closing sound
    this.playSound('door-close');

    this.state.doorsOpen = false;
  },

  selectFloor(floorNumber) {
    console.log(`🎯 Floor ${floorNumber} selected`);

    // Mark button as active
    const buttons = document.querySelectorAll('.floor-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update dragon eye indicator
    this.updateFloorIndicator(floorNumber);

    // Play button sound
    this.playSound('jade-button');

    // Close doors and start ride
    setTimeout(() => {
      this.closeDoors();

      setTimeout(() => {
        this.rideToFloor(floorNumber);
      }, 1500);
    }, 500);
  },

  updateFloorIndicator(floorNumber) {
    const pupil = document.querySelector('.dragon-eye-pupil');
    if (pupil) {
      pupil.textContent = floorNumber;

      // Add pulse animation
      const eye = document.querySelector('.dragon-eye');
      eye.style.animation = 'none';
      setTimeout(() => {
        eye.style.animation = 'dragon-eye-pulse 2s ease-in-out infinite';
      }, 10);
    }
  },

  rideToFloor(floorNumber) {
    console.log(`🚀 Riding to floor ${floorNumber}...`);

    const elevatorInterior = document.getElementById('elevatorInterior');

    // Add riding animation
    elevatorInterior.classList.add('riding');

    // Play elevator movement sound
    this.playSound('elevator-rise');

    // Intensify ember particles
    this.intensifyEmbers();

    // After ride completes, arrive at floor
    setTimeout(() => {
      elevatorInterior.classList.remove('riding');
      this.arriveAtFloor(floorNumber);
    }, 3500);
  },

  arriveAtFloor(floorNumber) {
    console.log(`✨ Arrived at floor ${floorNumber}`);

    this.state.currentFloor = floorNumber;

    // Play arrival chime
    this.playSound('arrival-chime');

    // Hide lobby, show lair
    setTimeout(() => {
      this.showDragonLair(floorNumber);
    }, 1000);
  },

  // ============================================
  // DRAGON LAIR & STORY DISPLAY
  // ============================================
  showDragonLair(floorNumber) {
    console.log(`🐉 Entering Dragon Lair - Floor ${floorNumber}`);

    // Hide lobby
    document.getElementById('elevatorLobby').classList.add('hidden');

    // Show lair
    const lair = document.getElementById('dragonLair');
    lair.classList.remove('hidden');
    lair.classList.add('active');

    // Load story content
    this.loadStoryContent();

    // Play dragon greeting sound
    this.playSound('dragon-greeting');
  },

  loadStoryContent() {
    const story = this.state.currentStory;

    // Set dragon info
    document.getElementById('dragonCharacter').textContent = story.dragonEmoji;
    document.getElementById('dragonName').textContent = story.dragonName;
    document.getElementById('dragonGreeting').textContent = story.greeting;

    // Set story title
    document.getElementById('storyTitle').textContent = story.story.title;

    // Process and display story text with sight words
    this.displayStoryWithSightWords(story.story.text, story.story.sightWords);

    // Set challenge info
    document.getElementById('challengeTitle').textContent = story.challenge.instruction;
    this.updateChallengeProgress();
  },

  displayStoryWithSightWords(text, sightWords) {
    const storyTextEl = document.getElementById('storyText');

    // Split text into words while preserving structure
    const processedText = text.split(/(\s+)/).map(segment => {
      // Check if this segment is a word (not whitespace)
      if (segment.trim()) {
        // Remove punctuation for comparison
        const cleanWord = segment.toLowerCase().replace(/[<>]/g, '');
        const isSightWord = sightWords.some(sw => cleanWord.includes(sw));

        // Check for <sight> tags
        const sightMatch = segment.match(/<sight>(.*?)<\/sight>/);

        if (sightMatch) {
          const word = sightMatch[1];
          return `<span class="word sight-word" data-word="${word}">${word}</span>`;
        } else if (isSightWord) {
          // Find which sight word it is
          const foundWord = sightWords.find(sw => cleanWord.includes(sw));
          return `<span class="word sight-word" data-word="${foundWord}">${segment}</span>`;
        } else {
          return `<span class="word">${segment}</span>`;
        }
      }
      return segment;
    }).join('');

    storyTextEl.innerHTML = processedText;

    // Add click listeners to sight words
    const sightWordElements = storyTextEl.querySelectorAll('.sight-word');
    sightWordElements.forEach(el => {
      el.addEventListener('click', (e) => this.highlightSightWord(e.target));
    });
  },

  highlightSightWord(element) {
    const word = element.dataset.word;

    // Check if already highlighted
    if (element.classList.contains('highlighted')) {
      return;
    }

    // Check if word already found
    if (this.state.sightWordsFound.includes(word)) {
      return;
    }

    console.log(`✨ Sight word found: ${word}`);

    // Mark as highlighted
    element.classList.add('highlighted');

    // Add to found words
    this.state.sightWordsFound.push(word);

    // Play success sound
    this.playSound('word-found');

    // Earn a dragon scale
    this.earnDragonScale();

    // Update progress
    this.updateChallengeProgress();

    // Check if challenge complete
    if (this.state.sightWordsFound.length >= this.state.totalSightWords) {
      setTimeout(() => {
        this.completeChallenge();
      }, 1000);
    }
  },

  earnDragonScale() {
    const scales = document.querySelectorAll('.dragon-scale');
    const nextScale = scales[this.state.sightWordsFound.length - 1];

    if (nextScale) {
      nextScale.classList.add('earned');

      // Play scale collect sound
      this.playSound('scale-collect');
    }
  },

  updateChallengeProgress() {
    const progressEl = document.getElementById('challengeProgress');
    progressEl.textContent = `Dragon Scales Found: ${this.state.sightWordsFound.length} / ${this.state.totalSightWords}`;
  },

  completeChallenge() {
    console.log('🎉 Challenge complete!');

    const story = this.state.currentStory;

    // Play completion fanfare
    this.playSound('challenge-complete');

    // Show dragon fire reward
    this.showDragonFireReward(story.challenge.rewardMessage);
  },

  showDragonFireReward(message) {
    const rewardEl = document.getElementById('dragonFireReward');
    const messageEl = document.getElementById('fireMessage');

    messageEl.textContent = message;

    // Create fire particles
    this.createFireParticles();

    // Show reward screen
    rewardEl.classList.add('active');

    // Play dragon fire sound
    this.playSound('dragon-fire');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      rewardEl.classList.remove('active');
    }, 5000);
  },

  // ============================================
  // PARTICLE EFFECTS
  // ============================================
  createEmberParticles() {
    const container = document.getElementById('emberParticles');

    for (let i = 0; i < 8; i++) {
      const ember = document.createElement('div');
      ember.className = 'ember';
      container.appendChild(ember);
    }
  },

  createScaleSparkles() {
    const container = document.getElementById('scaleSparkles');

    for (let i = 0; i < 6; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      container.appendChild(sparkle);
    }
  },

  createFireParticles() {
    const container = document.getElementById('fireParticles');
    container.innerHTML = ''; // Clear existing

    for (let i = 0; i < 9; i++) {
      const particle = document.createElement('div');
      particle.className = 'fire-particle';
      container.appendChild(particle);
    }
  },

  intensifyEmbers() {
    const embers = document.querySelectorAll('.ember');
    embers.forEach(ember => {
      ember.style.animationDuration = '2s';
    });

    // Reset after ride
    setTimeout(() => {
      embers.forEach(ember => {
        ember.style.animationDuration = '';
      });
    }, 3500);
  },

  // ============================================
  // AMBIENT EFFECTS
  // ============================================
  startAmbientEffects() {
    // Placeholder for future ambient sound implementation
    console.log('🎵 Ambient dragon breathing effects started');

    // Could add Web Audio API ambient sounds here
    // For now, just visual effects are active
  },

  // ============================================
  // SOUND SYSTEM (Placeholder)
  // ============================================
  playSound(soundName) {
    console.log(`🔊 Playing sound: ${soundName}`);

    // Placeholder for future Web Audio API integration
    // Future implementation would load and play actual audio files

    // For now, we can use simple beep tones or be silent
    // This maintains the structure for easy audio addition later
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  resetApp() {
    this.state = {
      currentScreen: 'lobby',
      currentFloor: 0,
      doorsOpen: false,
      sightWordsFound: [],
      totalSightWords: 5,
      currentStory: PILOT_STORY
    };

    // Show lobby
    document.getElementById('elevatorLobby').classList.remove('hidden');
    document.getElementById('dragonLair').classList.remove('active');
    document.getElementById('dragonLair').classList.add('hidden');

    // Reset elevator
    document.getElementById('elevatorDoorsContainer').classList.remove('opening');
    document.getElementById('elevatorInterior').classList.remove('visible');

    // Reset call button
    const callBtn = document.getElementById('callElevatorBtn');
    callBtn.disabled = false;
    callBtn.style.opacity = '1';

    console.log('🔄 App reset to lobby');
  }
};

// ============================================
// AUTO-INITIALIZE WHEN DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  DragonLiftApp.init();
});

// Expose app globally for debugging
window.DragonLiftApp = DragonLiftApp;
