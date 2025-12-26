/**
 * RHYTHM RAILWAY - MAIN GAME LOGIC
 * A synesthetic musical learning experience
 */

// ===== GAME STATE =====
const GameState = {
  currentPatternIndex: 0,
  currentBeatIndex: 0,
  playerTaps: [],
  isListening: false,
  isPlaying: false,
  combo: 0,
  bestCombo: 0,
  score: 0,
  perfectHits: 0,
  goodHits: 0,
  mistakes: 0,
  progress: 0,
  completed: []

  // Announce to screen reader
  announceToScreenReader(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  },
};

// ===== DOM ELEMENTS =====
const Elements = {
  stationCard: null,
  stationIcon: null,
  stationName: null,
  stationDescription: null,
  train: null,
  progressFill: null,
  patternPreview: null,
  metronome: null,
  tapZone: null,
  tapCircle: null,
  feedback: null,
  comboNumber: null,
  listenBtn: null,
  playBtn: null,
  nextBtn: null,
  instructions: null,
  victoryModal: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚂 Rhythm Railway Loading...');

  // Get DOM elements
  Elements.stationCard = document.getElementById('stationCard');
  Elements.stationIcon = document.getElementById('stationIcon');
  Elements.stationName = document.getElementById('stationName');
  Elements.stationDescription = document.getElementById('stationDescription');
  Elements.train = document.getElementById('train');
  Elements.progressFill = document.getElementById('progressFill');
  Elements.patternPreview = document.getElementById('patternPreview');
  Elements.metronome = document.getElementById('metronome');
  Elements.tapZone = document.getElementById('tapZone');
  Elements.tapCircle = Elements.tapZone.querySelector('.tap-circle');
  Elements.feedback = document.getElementById('feedback');
  Elements.comboNumber = document.getElementById('comboNumber');
  Elements.listenBtn = document.getElementById('listenBtn');
  Elements.playBtn = document.getElementById('playBtn');
  Elements.nextBtn = document.getElementById('nextBtn');
  Elements.instructions = document.getElementById('instructions');
  Elements.victoryModal = document.getElementById('victoryModal');

  // Initialize sound engine on first interaction
  document.body.addEventListener('touchstart', initSound, { once: true });
  document.body.addEventListener('click', initSound, { once: true });

  // Set up event listeners
  Elements.listenBtn.addEventListener('click', handleListen);
  Elements.playBtn.addEventListener('click', handlePlayStart);
  Elements.tapCircle.addEventListener('click', handleTap);
  Elements.tapCircle.addEventListener('touchstart', handleTap);
  Elements.nextBtn.addEventListener('click', handleNextStation);
  Elements.victoryModal.addEventListener('click', hideVictory);

  // Load first pattern
  loadPattern(GameState.currentPatternIndex);

  console.log('🎵 Rhythm Railway Ready!');
});

// ===== SOUND INITIALIZATION =====
async function initSound() {
  await soundEngine.init();
  soundEngine.resume();
}

// ===== PATTERN LOADING =====
function loadPattern(index) {
  const patternKey = PROGRESSION[index];
  const pattern = RHYTHM_PATTERNS[patternKey];

  if (!pattern) {
    console.error('Pattern not found:', patternKey);
    return;
  }

  // Get station info
  const station = STATIONS[pattern.station];

  // Update UI
  Elements.stationIcon.textContent = station.icon;
  Elements.stationName.textContent = station.name;
  Elements.stationDescription.textContent = pattern.description;

  // Build pattern preview
  buildPatternPreview(pattern.pattern);

  // Reset game state for new pattern
  GameState.playerTaps = [];
  GameState.currentBeatIndex = 0;
  GameState.isListening = false;
  GameState.isPlaying = false;

  // Enable listen button
  Elements.listenBtn.disabled = false;
  Elements.playBtn.disabled = true;
  Elements.nextBtn.style.display = 'none';

  // Update instructions
  Elements.instructions.textContent = `Press LISTEN to hear "${pattern.name}", then TAP to match the rhythm!`;

  // Animate station card
  Elements.stationCard.style.animation = 'none';
  setTimeout(() => {
    Elements.stationCard.style.animation = 'slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 10);
}

// ===== PATTERN PREVIEW UI =====
function buildPatternPreview(pattern) {
  Elements.patternPreview.innerHTML = '';

  pattern.forEach((beat, index) => {
    const indicator = document.createElement('div');
    indicator.className = `beat-indicator ${beat.color}`;
    indicator.dataset.index = index;

    // Add visual label
    if (beat.color === 'rest') {
      indicator.textContent = '•••';
      indicator.style.background = 'transparent';
      indicator.style.border = '3px dashed rgba(255, 255, 255, 0.3)';
    } else {
      indicator.textContent = index + 1;
    }

    Elements.patternPreview.appendChild(indicator);
  });
}

// ===== LISTEN MODE =====
async function handleListen() {
  if (GameState.isListening || GameState.isPlaying) return;

  GameState.isListening = true;
  Elements.listenBtn.disabled = true;
  Elements.playBtn.disabled = true;

  const patternKey = PROGRESSION[GameState.currentPatternIndex];
  const pattern = RHYTHM_PATTERNS[patternKey].pattern;

  // Update instructions
  Elements.instructions.textContent = 'Listen carefully to the rhythm...';

  // Play pattern
  await playPattern(pattern, true);

  // Enable play button
  GameState.isListening = false;
  Elements.playBtn.disabled = false;
  Elements.instructions.textContent = 'Now TAP along to match the rhythm!';
}

// ===== PLAY PATTERN (with animations) =====
async function playPattern(pattern, showVisuals = true) {
  for (let i = 0; i < pattern.length; i++) {
    const beat = pattern[i];
    const indicator = Elements.patternPreview.querySelector(`[data-index="${i}"]`);

    // Visual feedback
    if (showVisuals && indicator) {
      indicator.classList.add('playing');

      // Metronome pulse
      const metronomeBeat = Elements.metronome.querySelector('.metronome-beat');
      metronomeBeat.classList.add('active');
      setTimeout(() => metronomeBeat.classList.remove('active'), 200);
    }

    // Play sound
    soundEngine.playSound(beat.sound, beat.duration / 1000);

    // Glow the staff lines
    if (showVisuals) {
      const staffLines = document.querySelectorAll('.staff-line');
      staffLines.forEach(line => {
        line.classList.add('glow');
        setTimeout(() => line.classList.remove('glow'), 500);
      });
    }

    // Wait for beat duration
    await sleep(beat.duration);

    // Remove playing indicator
    if (showVisuals && indicator) {
      indicator.classList.remove('playing');
      indicator.classList.add('played');
    }

    // Small pause between beats
    await sleep(100);
  }

  // Reset indicators after pattern completes
  if (showVisuals) {
    setTimeout(() => {
      const indicators = Elements.patternPreview.querySelectorAll('.beat-indicator');
      indicators.forEach(ind => ind.classList.remove('played'));
    }, 500);
  }
}

// ===== PLAY MODE START =====
function handlePlayStart() {
  if (GameState.isPlaying || GameState.isListening) return;

  GameState.isPlaying = true;
  GameState.playerTaps = [];
  GameState.currentBeatIndex = 0;

  Elements.playBtn.disabled = true;
  Elements.listenBtn.disabled = true;
  Elements.instructions.textContent = 'TAP the rhythm! 🎵';

  // Highlight tap zone
  Elements.tapCircle.style.animation = 'tap-pulse 0.8s ease-in-out infinite';

  // Start metronome visual guide
  startMetronome();
}

// ===== METRONOME =====
let metronomeInterval = null;

function startMetronome() {
  const patternKey = PROGRESSION[GameState.currentPatternIndex];
  const pattern = RHYTHM_PATTERNS[patternKey];
  const beatInterval = 60000 / pattern.bpm; // ms per beat

  stopMetronome(); // Clear any existing interval

  metronomeInterval = setInterval(() => {
    soundEngine.playMetronome();
    const metronomeBeat = Elements.metronome.querySelector('.metronome-beat');
    metronomeBeat.classList.add('active');
    setTimeout(() => metronomeBeat.classList.remove('active'), 100);
  }, beatInterval);
}

function stopMetronome() {
  if (metronomeInterval) {
    clearInterval(metronomeInterval);
    metronomeInterval = null;
  }
}

// ===== TAP HANDLING =====
function handleTap(event) {
  event.preventDefault();

  if (!GameState.isPlaying) return;

  const tapTime = Date.now();
  GameState.playerTaps.push(tapTime);

  // Visual feedback
  Elements.tapCircle.classList.add('tapped');
  setTimeout(() => Elements.tapCircle.classList.remove('tapped'), 300);

  // Get current beat
  const patternKey = PROGRESSION[GameState.currentPatternIndex];
  const pattern = RHYTHM_PATTERNS[patternKey].pattern;
  const currentBeat = pattern[GameState.currentBeatIndex];

  if (!currentBeat) return;

  // Play sound for feedback
  soundEngine.playSound(currentBeat.sound, currentBeat.duration / 1000);

  // Highlight current beat indicator
  const indicator = Elements.patternPreview.querySelector(`[data-index="${GameState.currentBeatIndex}"]`);
  if (indicator) {
    indicator.classList.add('playing');
    setTimeout(() => {
      indicator.classList.remove('playing');
      indicator.classList.add('played');
    }, 300);
  }

  // Move to next beat
  GameState.currentBeatIndex++;

  // Check if pattern is complete
  if (GameState.currentBeatIndex >= pattern.length) {
    completeTurn();
  }
}

// ===== TURN COMPLETION =====
async function completeTurn() {
  GameState.isPlaying = false;
  Elements.tapCircle.style.animation = '';
  stopMetronome();

  // Analyze performance (simplified - just check if they completed it)
  const patternKey = PROGRESSION[GameState.currentPatternIndex];
  const pattern = RHYTHM_PATTERNS[patternKey].pattern;

  // For now, if they tapped the right number of times, they win!
  const success = GameState.playerTaps.length === pattern.length;

  if (success) {
    await handleSuccess();
  } else {
    handleMiss();
  }
}

// ===== SUCCESS HANDLING =====
async function handleSuccess() {
  // Update combo
  GameState.combo++;
  GameState.perfectHits++;

  if (GameState.combo > GameState.bestCombo) {
    GameState.bestCombo = GameState.combo;
  }

  // Update UI
  Elements.comboNumber.textContent = GameState.combo;
  Elements.comboNumber.parentElement.classList.add('active');
  setTimeout(() => {
    Elements.comboNumber.parentElement.classList.remove('active');
  }, 500);

  // Show feedback
  showFeedback('PERFECT!', 'perfect');

  // Play success sound
  soundEngine.playPerfect();
  await sleep(300);
  soundEngine.playSuccess();

  // Animate train
  Elements.train.classList.add('moving');
  soundEngine.playTrainChug();

  // Update progress
  GameState.progress = ((GameState.currentPatternIndex + 1) / PROGRESSION.length) * 100;
  Elements.progressFill.style.width = `${GameState.progress}%`;

  await sleep(1000);
  Elements.train.classList.remove('moving');

  // Show victory modal
  showVictory();

  // Enable next button
  Elements.nextBtn.style.display = 'block';
  Elements.instructions.textContent = 'Amazing rhythm! Ready for the next challenge?';
}

// ===== MISS HANDLING =====
function handleMiss() {
  GameState.combo = 0;
  GameState.mistakes++;

  Elements.comboNumber.textContent = '0';

  showFeedback('TRY AGAIN!', 'miss');
  soundEngine.playMiss();

  // Reset for retry
  setTimeout(() => {
    const indicators = Elements.patternPreview.querySelectorAll('.beat-indicator');
    indicators.forEach(ind => ind.classList.remove('played'));

    GameState.playerTaps = [];
    GameState.currentBeatIndex = 0;

    Elements.playBtn.disabled = false;
    Elements.listenBtn.disabled = false;
    Elements.instructions.textContent = 'Listen again or try tapping the rhythm!';
  }, 1500);
}

// ===== FEEDBACK DISPLAY =====
function showFeedback(text, type) {
  Elements.feedback.textContent = text;
  Elements.feedback.className = `feedback ${type} show`;

  setTimeout(() => {
    Elements.feedback.classList.remove('show');
  }, 1000);
}

// ===== VICTORY MODAL =====
function showVictory() {
  Elements.victoryModal.classList.add('show');

  // Add sparkle effect to tap zone
  Elements.tapZone.classList.add('perfect-hit');
  setTimeout(() => {
    Elements.tapZone.classList.remove('perfect-hit');
  }, 1000);
}

function hideVictory() {
  Elements.victoryModal.classList.remove('show');
}

// ===== NEXT STATION =====
function handleNextStation() {
  hideVictory();

  // Mark current as completed
  GameState.completed.push(PROGRESSION[GameState.currentPatternIndex]);

  // Move to next pattern
  GameState.currentPatternIndex++;

  if (GameState.currentPatternIndex >= PROGRESSION.length) {
    // Game complete!
    showGameComplete();
    return;
  }

  // Load next pattern
  loadPattern(GameState.currentPatternIndex);
}

// ===== GAME COMPLETE =====
function showGameComplete() {
  Elements.stationIcon.textContent = '🎉';
  Elements.stationName.textContent = 'RHYTHM MASTER!';
  Elements.stationDescription.textContent = 'You\'ve completed all the stations!';
  Elements.instructions.textContent = `You got ${GameState.perfectHits} perfect hits with a best combo of ${GameState.bestCombo}!`;

  Elements.patternPreview.innerHTML = `
    <div style="text-align: center; width: 100%; padding: 2rem; font-size: 1.5rem;">
      🌟 CONGRATULATIONS! 🌟
      <br><br>
      You are a true rhythm master!
      <br><br>
      <button class="btn btn-next" onclick="location.reload()" style="margin: 1rem auto;">
        <span class="btn-icon">🔄</span>
        <span class="btn-text">PLAY AGAIN</span>
      </button>
    </div>
  `;

  Elements.listenBtn.style.display = 'none';
  Elements.playBtn.style.display = 'none';
  Elements.nextBtn.style.display = 'none';
  Elements.tapZone.style.display = 'none';
  Elements.metronome.style.display = 'none';

  // Celebration!
  soundEngine.playSuccess();
  setTimeout(() => soundEngine.playSuccess(), 500);
  setTimeout(() => soundEngine.playSuccess(), 1000);
}

// ===== UTILITY FUNCTIONS =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== RESPONSIVE TOUCH HANDLING =====
// Prevent double-tap zoom on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Prevent pull-to-refresh
document.body.addEventListener('touchmove', (event) => {
  if (event.scale !== 1) {
    event.preventDefault();
  }
}, { passive: false });

console.log('🚂 Rhythm Railway App Loaded!');
