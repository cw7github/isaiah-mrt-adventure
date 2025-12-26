/**
 * CREATURE TRANSIT AUTHORITY - MAIN APP LOGIC
 *
 * This file contains:
 * - App state management
 * - UI rendering
 * - Drag-and-drop logic
 * - Game flow and scoring
 * - Sound effects (via Web Audio API)
 */

// ============================================
// APP STATE
// ============================================

const TransitApp = {
  state: {
    currentScreen: 'welcome', // welcome, control, complete
    creatures: [], // Creatures in queue
    cars: {}, // Cars with their passengers
    stats: {
      totalStars: 0,
      totalCreatures: 0,
      shiftStars: 0,
      shiftCreatures: 0,
      perfectMatches: 0
    },
    draggedCreature: null,
    gameStarted: false,
    waveCount: 0
  },

  // Initialize the app
  init() {
    console.log('🚇 Initializing Creature Transit Authority...');

    // Initialize cars
    this.initializeCars();

    // Set up event listeners
    this.setupEventListeners();

    // Load saved stats
    this.loadStats();

    // Update UI
    this.updateStatsDisplay();

    console.log('✅ Transit Authority ready!');
  },

  // Initialize all transit cars
  initializeCars() {
    const carsContainer = document.getElementById('transitCars');
    carsContainer.innerHTML = '';

    Object.keys(CAR_TYPES).forEach(carKey => {
      const carData = CAR_TYPES[carKey];

      // Create car state
      this.state.cars[carKey] = {
        type: carKey,
        passengers: [],
        capacity: carData.capacity
      
  // Announce to screen reader
  announceToScreenReader(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  },
};

      // Create car element
      const carElement = this.createCarElement(carKey, carData);
      carsContainer.appendChild(carElement);
    });
  },

  // Create a car DOM element
  createCarElement(carKey, carData) {
    const car = document.createElement('div');
    car.className = `transit-car ${carData.className}`;
    car.dataset.carType = carKey;

    car.innerHTML = `
      <div class="car-header">
        <div class="car-title">
          <span class="car-icon">${carData.icon}</span>
          <span>${carData.name}</span>
        </div>
        <div class="car-capacity" data-capacity="${carKey}">
          0/${carData.capacity}
        </div>
      </div>
      <div class="car-passengers" data-passengers="${carKey}">
        <!-- Passengers will be added here -->
      </div>
    `;

    // Set up drop zone
    this.setupDropZone(car);

    return car;
  },

  // Set up event listeners
  setupEventListeners() {
    // Start shift button
    const startBtn = document.getElementById('startShiftBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startShift());
    }

    // Depart cars button
    const departBtn = document.getElementById('departCarsBtn');
    if (departBtn) {
      departBtn.addEventListener('click', () => this.departCars());
    }

    // End shift button
    const endShiftBtn = document.getElementById('endShiftBtn');
    if (endShiftBtn) {
      endShiftBtn.addEventListener('click', () => this.endShift());
    }

    // New shift button
    const newShiftBtn = document.getElementById('newShiftBtn');
    if (newShiftBtn) {
      newShiftBtn.addEventListener('click', () => this.newShift());
    }
  },

  // Start a new shift
  startShift() {
    console.log('🚀 Starting shift...');

    // Reset shift stats
    this.state.stats.shiftStars = 0;
    this.state.stats.shiftCreatures = 0;
    this.state.stats.perfectMatches = 0;
    this.state.waveCount = 0;

    // Clear all cars
    Object.keys(this.state.cars).forEach(carKey => {
      this.state.cars[carKey].passengers = [];
    });

    // Switch to control room
    this.showScreen('control');

    // Spawn first wave of creatures
    this.spawnCreatureWave();

    this.state.gameStarted = true;
    this.updateStatsDisplay();
    this.updateCarDisplays();

    this.showNotification('⏰', 'Shift started! Help the creatures get home!');
  },

  // Spawn a wave of creatures
  spawnCreatureWave(count = 3) {
    this.state.waveCount++;
    const creatures = generateCreatureWave(count);

    creatures.forEach(creature => {
      this.state.creatures.push(creature);
      this.addCreatureToQueue(creature);
    });

    console.log(`🎫 Spawned wave ${this.state.waveCount}:`, creatures);
  },

  // Spawn a single creature (for testing/extending gameplay)
  spawnCreature(type = null) {
    const creature = type ? generateCreature(type) : generateRandomCreature();
    this.state.creatures.push(creature);
    this.addCreatureToQueue(creature);
    return creature;
  },

  // Add creature card to queue
  addCreatureToQueue(creature) {
    const queue = document.getElementById('creatureQueue');
    const card = this.createCreatureCard(creature);
    queue.appendChild(card);

    // Animate in
    setTimeout(() => {
      card.style.animation = 'creature-bounce 2s ease-in-out infinite';
    }, 50);
  },

  // Create creature card DOM element
  createCreatureCard(creature) {
    const creatureData = CREATURE_TYPES[creature.type];
    const card = document.createElement('div');
    card.className = 'creature-card';
    card.dataset.creatureId = creature.id;
    card.dataset.type = creature.type;
    card.draggable = true;

    card.innerHTML = `
      <div class="creature-blob" style="background: ${creatureData.color};">
        <div class="creature-eyes">
          <div class="creature-eye">
            <div class="creature-pupil"></div>
          </div>
          <div class="creature-eye">
            <div class="creature-pupil"></div>
          </div>
        </div>
      </div>
      <div class="creature-info">
        <div class="creature-name">${creatureData.emoji} ${creatureData.name}</div>
        <div class="creature-ticket">
          <span class="ticket-destination">${creature.destination}</span>
          <span class="ticket-needs">${creatureData.description}</span>
        </div>
      </div>
    `;

    // Set up drag handlers
    this.setupDragHandlers(card, creature);

    return card;
  },

  // Set up drag handlers for creature card
  setupDragHandlers(card, creature) {
    card.addEventListener('dragstart', (e) => {
      this.state.draggedCreature = creature;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', card.innerHTML);

      // Play sound
      this.playSound('pickup');
    });

    card.addEventListener('dragend', (e) => {
      card.classList.remove('dragging');
      this.state.draggedCreature = null;
    });
  },

  // Set up drop zone for car
  setupDropZone(carElement) {
    carElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      carElement.classList.add('drag-over');
    });

    carElement.addEventListener('dragleave', (e) => {
      carElement.classList.remove('drag-over');
    });

    carElement.addEventListener('drop', (e) => {
      e.preventDefault();
      carElement.classList.remove('drag-over');

      if (!this.state.draggedCreature) return;

      const carType = carElement.dataset.carType;
      this.handleCreatureDrop(this.state.draggedCreature, carType);
    });
  },

  // Handle dropping a creature into a car
  handleCreatureDrop(creature, carType) {
    const car = this.state.cars[carType];
    const compatibility = checkCompatibility(creature, car, car.passengers);

    if (!compatibility.valid) {
      // Invalid drop - show error
      this.showNotification('❌', compatibility.reason);
      this.playSound('error');

      // Shake the card
      const card = document.querySelector(`[data-creature-id="${creature.id}"]`);
      if (card) {
        card.classList.add('invalid-drop');
        setTimeout(() => card.classList.remove('invalid-drop'), 500);
      }

      return;
    }

    // Valid drop - add to car!
    this.addCreatureToCar(creature, carType);
  },

  // Add creature to car
  addCreatureToCar(creature, carType) {
    const car = this.state.cars[carType];
    const creatureData = CREATURE_TYPES[creature.type];

    // Calculate happiness
    const happiness = calculateHappiness(creature, car, [...car.passengers, creature]);
    creature.happiness = happiness;

    // Add to car
    car.passengers.push(creature);

    // Remove from queue
    const queueCard = document.querySelector(`[data-creature-id="${creature.id}"]`);
    if (queueCard) {
      queueCard.remove();
    }

    // Remove from state
    this.state.creatures = this.state.creatures.filter(c => c.id !== creature.id);

    // Update display
    this.updateCarDisplay(carType);
    this.updateDepartButton();

    // Show success
    this.showNotification('✨', getEducationalMessage('perfect_match'));
    this.playSound('success');

    // Track perfect matches
    if (happiness === 3) {
      this.state.stats.perfectMatches++;
    }

    // Check if we should spawn more creatures
    if (this.state.creatures.length === 0 && this.state.waveCount < 5) {
      setTimeout(() => {
        this.spawnCreatureWave(3 + this.state.waveCount); // Increase difficulty
      }, 2000);
    }
  },

  // Update car display
  updateCarDisplay(carType) {
    const car = this.state.cars[carType];
    const carData = CAR_TYPES[carType];
    const passengersContainer = document.querySelector(`[data-passengers="${carType}"]`);
    const capacityDisplay = document.querySelector(`[data-capacity="${carType}"]`);

    if (!passengersContainer || !capacityDisplay) return;

    // Clear passengers
    passengersContainer.innerHTML = '';

    // Add each passenger
    car.passengers.forEach(passenger => {
      const passengerElement = this.createPassengerElement(passenger);
      passengersContainer.appendChild(passengerElement);
    });

    // Update capacity
    const currentCapacity = car.passengers.reduce((sum, p) => {
      return sum + CREATURE_TYPES[p.type].size;
    }, 0);

    capacityDisplay.textContent = `${Math.round(currentCapacity * 10) / 10}/${carData.capacity}`;

    // Highlight if full
    if (currentCapacity >= carData.capacity) {
      capacityDisplay.classList.add('full');
    } else {
      capacityDisplay.classList.remove('full');
    }
  },

  // Update all car displays
  updateCarDisplays() {
    Object.keys(this.state.cars).forEach(carType => {
      this.updateCarDisplay(carType);
    });
  },

  // Create passenger element for display in car
  createPassengerElement(passenger) {
    const creatureData = CREATURE_TYPES[passenger.type];
    const element = document.createElement('div');
    element.className = 'car-passenger';

    if (passenger.happiness === 3) {
      element.classList.add('happy');
    }

    element.style.background = creatureData.color;
    element.innerHTML = `
      <div class="creature-eyes">
        <div class="creature-eye">
          <div class="creature-pupil"></div>
        </div>
        <div class="creature-eye">
          <div class="creature-pupil"></div>
        </div>
      </div>
    `;

    // Add stars for happiness
    const stars = '⭐'.repeat(passenger.happiness);
    element.title = `${creatureData.name} - ${stars}`;

    return element;
  },

  // Update depart button state
  updateDepartButton() {
    const departBtn = document.getElementById('departCarsBtn');
    if (!departBtn) return;

    // Enable if any car has passengers
    const hasPassengers = Object.values(this.state.cars).some(car => car.passengers.length > 0);
    departBtn.disabled = !hasPassengers;
  },

  // Depart all cars with passengers
  departCars() {
    console.log('🚦 Departing cars...');

    let totalStars = 0;
    let totalCreatures = 0;

    Object.keys(this.state.cars).forEach(carType => {
      const car = this.state.cars[carType];

      if (car.passengers.length === 0) return;

      // Calculate stars from this car
      car.passengers.forEach(passenger => {
        totalStars += passenger.happiness;
        totalCreatures++;
      });

      // Animate departure
      const carElement = document.querySelector(`[data-car-type="${carType}"]`);
      if (carElement) {
        carElement.classList.add('departing');

        setTimeout(() => {
          carElement.classList.remove('departing');

          // Clear passengers
          car.passengers = [];
          this.updateCarDisplay(carType);
        }, 1000);
      }
    });

    // Update stats
    this.state.stats.shiftStars += totalStars;
    this.state.stats.shiftCreatures += totalCreatures;
    this.state.stats.totalStars += totalStars;
    this.state.stats.totalCreatures += totalCreatures;

    this.updateStatsDisplay();
    this.saveStats();
    this.updateDepartButton();

    this.showNotification('🚇', `Departed! Earned ${totalStars} stars!`);
    this.playSound('depart');
  },

  // Update stats displays
  updateStatsDisplay() {
    // Welcome screen stats
    const totalRatingEl = document.getElementById('totalRating');
    const totalCreaturesEl = document.getElementById('totalCreatures');

    if (totalRatingEl) totalRatingEl.textContent = this.state.stats.totalStars;
    if (totalCreaturesEl) totalCreaturesEl.textContent = this.state.stats.totalCreatures;

    // Shift stats
    const shiftRatingEl = document.getElementById('shiftRating');
    const shiftCreaturesEl = document.getElementById('shiftCreatures');

    if (shiftRatingEl) shiftRatingEl.textContent = this.state.stats.shiftStars;
    if (shiftCreaturesEl) shiftCreaturesEl.textContent = this.state.stats.shiftCreatures;
  },

  // End current shift
  endShift() {
    console.log('🏠 Ending shift...');

    // If there are creatures still in cars, depart them first
    const hasPassengers = Object.values(this.state.cars).some(car => car.passengers.length > 0);
    if (hasPassengers) {
      this.departCars();
      setTimeout(() => this.showShiftComplete(), 1500);
    } else {
      this.showShiftComplete();
    }
  },

  // Show shift complete screen
  showShiftComplete() {
    this.showScreen('complete');

    // Update final stats
    document.getElementById('finalStars').textContent = this.state.stats.shiftStars;
    document.getElementById('finalCreatures').textContent = this.state.stats.shiftCreatures;
    document.getElementById('finalHappy').textContent = this.state.stats.perfectMatches;

    // Calculate grade
    const avgStars = this.state.stats.shiftCreatures > 0
      ? this.state.stats.shiftStars / this.state.stats.shiftCreatures
      : 0;

    let gradeTitle = 'GOOD WORK!';
    let gradeMessage = 'The creatures made it home safely!';

    if (avgStars >= 2.5) {
      gradeTitle = 'EXCELLENT WORK!';
      gradeMessage = 'All creatures arrived safely and happily!';
    } else if (avgStars >= 2) {
      gradeTitle = 'GREAT JOB!';
      gradeMessage = 'The creatures are happy with your service!';
    }

    document.getElementById('gradeTitle').textContent = gradeTitle;
    document.getElementById('gradeMessage').textContent = gradeMessage;

    this.playSound('complete');
  },

  // Start a new shift
  newShift() {
    // Clear creatures queue
    this.state.creatures = [];
    document.getElementById('creatureQueue').innerHTML = '';

    // Reset and go to welcome
    this.showScreen('welcome');
    this.updateStatsDisplay();
  },

  // Reset entire shift (for debugging)
  resetShift() {
    this.state.creatures = [];
    this.state.waveCount = 0;
    this.state.stats.shiftStars = 0;
    this.state.stats.shiftCreatures = 0;
    this.state.stats.perfectMatches = 0;

    Object.keys(this.state.cars).forEach(carKey => {
      this.state.cars[carKey].passengers = [];
    });

    document.getElementById('creatureQueue').innerHTML = '';
    this.updateCarDisplays();
    this.updateStatsDisplay();
    this.updateDepartButton();
  },

  // Show a specific screen
  showScreen(screenName) {
    const screens = ['welcome', 'control', 'complete'];
    screens.forEach(screen => {
      const element = document.getElementById(
        screen === 'welcome' ? 'welcomeScreen' :
        screen === 'control' ? 'controlRoom' :
        'shiftComplete'
      );

      if (element) {
        if (screen === screenName) {
          element.classList.remove('hidden');
        } else {
          element.classList.add('hidden');
        }
      }
    });

    this.state.currentScreen = screenName;
  },

  // Show notification toast
  showNotification(icon, text) {
    const notification = document.getElementById('notification');
    const iconEl = notification.querySelector('.notification-icon');
    const textEl = notification.querySelector('.notification-text');

    iconEl.textContent = icon;
    textEl.textContent = text;

    notification.classList.remove('hidden');
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 300);
    }, 3000);
  },

  // Save stats to localStorage
  saveStats() {
    try {
      localStorage.setItem('transitAuthority_stats', JSON.stringify({
        totalStars: this.state.stats.totalStars,
        totalCreatures: this.state.stats.totalCreatures
      }));
    } catch (e) {
      console.warn('Could not save stats:', e);
    }
  },

  // Load stats from localStorage
  loadStats() {
    try {
      const saved = localStorage.getItem('transitAuthority_stats');
      if (saved) {
        const stats = JSON.parse(saved);
        this.state.stats.totalStars = stats.totalStars || 0;
        this.state.stats.totalCreatures = stats.totalCreatures || 0;
      }
    } catch (e) {
      console.warn('Could not load stats:', e);
    }
  },

  // ============================================
  // SOUND EFFECTS
  // ============================================

  // Play a sound effect
  playSound(type) {
    if (!window.AudioContext && !window.webkitAudioContext) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const sounds = {
      pickup: () => this.playTone(audioContext, 440, 0.1, 'sine'),
      success: () => this.playChord(audioContext, [523, 659, 784], 0.3),
      error: () => this.playTone(audioContext, 200, 0.2, 'sawtooth'),
      depart: () => this.playTone(audioContext, 880, 0.5, 'triangle'),
      complete: () => this.playVictory(audioContext)
    };

    if (sounds[type]) {
      sounds[type]();
    }
  },

  // Play a simple tone
  playTone(audioContext, frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  },

  // Play a chord
  playChord(audioContext, frequencies, duration) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(audioContext, freq, duration * 0.6, 'sine');
      }, index * 100);
    });
  },

  // Play victory jingle
  playVictory(audioContext) {
    const notes = [523, 587, 659, 784]; // C D E G
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(audioContext, freq, 0.3, 'sine');
      }, index * 150);
    });
  }
};

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  TransitApp.init();
});

// Expose to window for debugging
window.TransitApp = TransitApp;
