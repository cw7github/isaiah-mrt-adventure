/**
 * ELEVATOR REPAIR CREW - Main Application Logic
 * A troubleshooting simulator where kids learn by fixing things!
 */

// Simple Web Audio Sound Engine
const SoundEngine = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  },

  // Success sound - ascending tones
  playSuccess() {
    const ctx = this.init();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  },

  // Error/wrong sound - descending buzz
  playError() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 200;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Click/tap sound
  playClick() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  // Ding/notification sound
  playDing() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  },

  // Whoosh/transition sound
  playWhoosh() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Radio crackle sound
  playRadioCrackle() {
    const ctx = this.init();
    // Create white noise for crackle effect
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    noise.start();
    noise.stop(ctx.currentTime + 0.5);
  },

  // Mechanical buzz/work sound
  playMechanical() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 150;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
};

// Initialize on first user interaction
document.addEventListener('click', () => SoundEngine.init(), { once: true });
document.addEventListener('touchstart', () => SoundEngine.init(), { once: true });

const RepairCrewApp = {
  // App state
  state: {
    currentScreen: 'hq', // 'hq', 'site', 'success'
    currentProblem: null,
    selectedTool: null,
    problemDiagnosed: false,
    problemFixed: false,
    badgesEarned: [],
    repairsCompleted: 0
  },

  // Initialize the app
  init() {
    console.log('🔧 Initializing Repair Crew App...');
    this.setupEventListeners();
    this.state.currentProblem = getProblemById(1); // Start with problem 1
    console.log('✓ Repair Crew App ready!');
  },

  // Setup all event listeners
  setupEventListeners() {
    // Start Repair Button (Receive dispatch call)
    const startBtn = document.getElementById('startRepairBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStartRepair());
    }

    // Tool Belt Items
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(tool => {
      tool.addEventListener('click', (e) => this.handleToolSelection(e));
    });

    // Inspection Points
    const inspectBtns = document.querySelectorAll('.inspect-btn');
    inspectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleInspection(e));
    });

    // Door Track (for cleaning)
    const doorTrack = document.getElementById('doorTrack');
    if (doorTrack) {
      doorTrack.addEventListener('click', () => this.handleDoorTrackClick());
      // Add keyboard navigation
      doorTrack.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleDoorTrackClick();
        }
      });
    }

    // Test Door Button
    const testDoorBtn = document.getElementById('testDoorBtn');
    if (testDoorBtn) {
      testDoorBtn.addEventListener('click', () => this.handleTestDoor());
    }

    // Next Repair Button
    const nextRepairBtn = document.getElementById('nextRepairBtn');
    if (nextRepairBtn) {
      nextRepairBtn.addEventListener('click', () => this.handleNextRepair());
    }
  },

  // Start repair - show trouble ticket and go to site
  handleStartRepair() {
    console.log('📻 Receiving dispatch call...');

    // Activate radio light
    const radioLight = document.getElementById('radioLight');
    radioLight.classList.add('active');

    // Play radio crackle sound effect
    SoundEngine.playRadioCrackle();
    this.playRadioCrackle();

    // Show trouble ticket after brief delay
    setTimeout(() => {
      this.showTroubleTicket();
    }, 1000);

    // Go to repair site after reading ticket
    setTimeout(() => {
      this.showRepairSite();
    }, 4000);
  },

  // Visual radio crackle effect
  playRadioCrackle() {
    const radioBox = document.querySelector('.radio-box');
    if (radioBox) {
      radioBox.style.animation = 'none';
      setTimeout(() => {
        radioBox.style.animation = 'radio-crackle 0.5s ease 3';
      }, 10);
    }
  },

  // Show trouble ticket with current problem details
  showTroubleTicket() {
    const ticket = document.getElementById('troubleTicket');
    const problem = this.state.currentProblem;

    // Populate ticket with problem data
    document.getElementById('ticketNumber').textContent = `#${problem.ticketNumber}`;
    document.getElementById('ticketLocation').textContent = problem.location;
    document.getElementById('ticketProblem').textContent = problem.problem;
    document.getElementById('ticketUrgency').textContent = problem.urgency;

    // Set urgency class
    const urgencyEl = document.getElementById('ticketUrgency');
    urgencyEl.className = 'field-value';
    urgencyEl.classList.add(`urgency-${problem.urgency.toLowerCase()}`);

    // Show ticket
    ticket.classList.remove('hidden');
  },

  // Transition to repair site screen
  showRepairSite() {
    console.log('🔧 Going to repair site...');

    // Hide HQ screen
    document.getElementById('repairHQ').classList.add('hidden');

    // Show repair site screen
    const repairSite = document.getElementById('repairSite');
    repairSite.classList.remove('hidden');

    // Show tool belt
    document.getElementById('toolBelt').classList.remove('hidden');

    // Setup the elevator problem visualization
    this.setupElevatorProblem();

    // Update state
    this.state.currentScreen = 'site';
  },

  // Setup the visual representation of the problem
  setupElevatorProblem() {
    const problem = this.state.currentProblem;

    // Update site title
    document.getElementById('siteTitle').textContent = problem.location;

    // Setup elevator doors based on problem
    const elevatorDoors = document.getElementById('elevatorDoors');

    if (problem.id === 1) {
      // Stuck door problem - doors partially open with dirt in track
      elevatorDoors.classList.add('stuck');
      document.getElementById('trackDirt').style.opacity = '1';
    }

    console.log(`📋 Problem setup: ${problem.name}`);
  },

  // Handle tool selection from tool belt
  handleToolSelection(event) {
    const toolBtn = event.currentTarget;
    const tool = toolBtn.dataset.tool;

    console.log(`🔧 Selected tool: ${tool}`);

    // Remove selection from all tools
    document.querySelectorAll('.tool-item').forEach(t => {
      t.classList.remove('selected');
    });

    // Select this tool
    toolBtn.classList.add('selected');
    this.state.selectedTool = tool;

    // Sound feedback
    SoundEngine.playClick();

    // Visual feedback
    this.playToolWobble(toolBtn);
  },

  // Play tool wobble animation
  playToolWobble(element) {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'tool-wobble 0.3s ease';
    }, 10);
  },

  // Handle inspection of elevator parts
  handleInspection(event) {
    const inspectBtn = event.currentTarget;
    const inspectPoint = inspectBtn.dataset.inspect;
    const problem = this.state.currentProblem;

    console.log(`🔍 Inspecting: ${inspectPoint}`);

    // Check if this is the correct inspection point
    if (inspectPoint === problem.rootCause) {
      // CORRECT! Found the problem
      SoundEngine.playSuccess();
      this.showDiagnosisFeedback(problem.solution.inspectionFeedback, true);
      this.showRepairManual();
      this.state.problemDiagnosed = true;

      // Visual feedback - highlight the problem area
      this.highlightProblemArea(inspectPoint);
    } else {
      // Wrong spot - give hint
      SoundEngine.playClick();
      this.showDiagnosisFeedback('Nothing wrong here. Try checking another part.', false);
    }
  },

  // Show diagnosis feedback
  showDiagnosisFeedback(text, isCorrect) {
    const feedback = document.getElementById('diagnosisFeedback');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackText = document.getElementById('feedbackText');

    feedbackIcon.textContent = isCorrect ? '✓' : '?';
    feedbackText.textContent = text;

    // Announce to screen readers
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = text;
    }

    // Change color based on result
    feedback.style.background = isCorrect
      ? 'linear-gradient(135deg, var(--success-green) 0%, #05b88a 100%)'
      : 'linear-gradient(135deg, var(--warning-yellow) 0%, #f5d420 100%)';

    feedback.classList.remove('hidden');

    // Hide after a few seconds if wrong
    if (!isCorrect) {
      setTimeout(() => {
        feedback.classList.add('hidden');
      }, 3000);
    }
  },

  // Show repair manual
  showRepairManual() {
    const manual = document.getElementById('repairManual');
    const problem = this.state.currentProblem;

    // Populate manual content
    const manualContent = document.getElementById('manualContent');
    manualContent.innerHTML = `
      <p><strong>Problem:</strong> ${problem.manualEntry.problem}</p>
      <p><strong>Solution:</strong> ${problem.manualEntry.solution}</p>
    `;

    manual.classList.remove('hidden');
  },

  // Highlight the problem area visually
  highlightProblemArea(area) {
    if (area === 'door-track') {
      const doorTrack = document.getElementById('doorTrack');
      doorTrack.style.borderColor = 'var(--safety-orange)';
      doorTrack.style.boxShadow = '0 0 20px var(--safety-orange)';
    }
  },

  // Handle clicking on door track (to clean it)
  handleDoorTrackClick() {
    const problem = this.state.currentProblem;

    // Only allow cleaning if problem is diagnosed and correct tool is selected
    if (!this.state.problemDiagnosed) {
      this.showDiagnosisFeedback('First inspect the parts to find the problem!', false);
      return;
    }

    if (this.state.selectedTool !== problem.solution.tool) {
      SoundEngine.playError();
      this.showDiagnosisFeedback(`Use the ${problem.solution.tool} to fix this!`, false);
      return;
    }

    // CORRECT! Clean the track
    console.log('🧹 Cleaning door track...');
    SoundEngine.playMechanical();
    this.cleanDoorTrack();
  },

  // Clean the door track
  cleanDoorTrack() {
    const trackDirt = document.getElementById('trackDirt');
    const problem = this.state.currentProblem;

    // Animate cleaning
    trackDirt.classList.add('cleaned');

    // Play sparks effect
    this.playSparksEffect(document.getElementById('doorTrack'));

    // Show success feedback
    setTimeout(() => {
      this.showDiagnosisFeedback(problem.solution.successText, true);

      // Enable test button
      document.getElementById('testDoorBtn').disabled = false;

      this.state.problemFixed = true;
    }, 500);
  },

  // Play sparks effect at a location
  playSparksEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const sparksContainer = document.getElementById('sparksEffect');

    // Create multiple sparks
    for (let i = 0; i < 20; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark';

      // Random direction
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 50 + Math.random() * 50;
      const sparkX = Math.cos(angle) * distance;
      const sparkY = Math.sin(angle) * distance;

      spark.style.left = centerX + 'px';
      spark.style.top = centerY + 'px';
      spark.style.setProperty('--spark-x', sparkX + 'px');
      spark.style.setProperty('--spark-y', sparkY + 'px');

      sparksContainer.appendChild(spark);

      // Remove after animation
      setTimeout(() => {
        spark.remove();
      }, 800);
    }
  },

  // Handle test door button
  handleTestDoor() {
    if (!this.state.problemFixed) {
      return;
    }

    console.log('🚪 Testing door...');

    // Animate door closing
    const elevatorDoors = document.getElementById('elevatorDoors');
    elevatorDoors.classList.remove('stuck');
    elevatorDoors.classList.add('open');

    // Close doors
    setTimeout(() => {
      elevatorDoors.classList.remove('open');
    }, 1000);

    // Show success after test
    setTimeout(() => {
      this.showRepairSuccess();
    }, 2000);
  },

  // Show repair success screen
  showRepairSuccess() {
    console.log('✓ Repair complete!');
    SoundEngine.playSuccess();

    // Hide repair site
    document.getElementById('repairSite').classList.add('hidden');

    // Hide tool belt
    document.getElementById('toolBelt').classList.add('hidden');

    // Show success screen
    const successScreen = document.getElementById('repairSuccess');
    successScreen.classList.remove('hidden');

    // Update badge
    const problem = this.state.currentProblem;
    document.getElementById('badgeStamp').querySelector('.badge-icon').textContent = problem.badge.icon;
    document.getElementById('badgeName').textContent = problem.badge.name;

    // Add to badges earned
    this.state.badgesEarned.push(problem.badge);
    this.state.repairsCompleted++;

    // Update state
    this.state.currentScreen = 'success';

    console.log(`🏆 Badge earned: ${problem.badge.name}`);
  },

  // Handle next repair button
  handleNextRepair() {
    console.log('📻 Ready for next call...');

    // Get next problem
    this.state.currentProblem = getNextProblem(this.state.currentProblem.id);

    // Reset state
    this.resetRepairState();

    // Go back to HQ
    this.returnToHQ();
  },

  // Reset repair state for next problem
  resetRepairState() {
    this.state.selectedTool = null;
    this.state.problemDiagnosed = false;
    this.state.problemFixed = false;

    // Reset UI elements
    document.querySelectorAll('.tool-item').forEach(t => {
      t.classList.remove('selected');
    });

    document.getElementById('diagnosisFeedback').classList.add('hidden');
    document.getElementById('repairManual').classList.add('hidden');
    document.getElementById('troubleTicket').classList.add('hidden');

    // Reset elevator doors
    const elevatorDoors = document.getElementById('elevatorDoors');
    elevatorDoors.classList.remove('stuck', 'open');

    // Reset door track
    const trackDirt = document.getElementById('trackDirt');
    trackDirt.classList.remove('cleaned');
    trackDirt.style.opacity = '0';

    // Reset test button
    document.getElementById('testDoorBtn').disabled = true;

    // Reset radio light
    document.getElementById('radioLight').classList.remove('active');
  },

  // Return to HQ screen
  returnToHQ() {
    // Hide success screen
    document.getElementById('repairSuccess').classList.add('hidden');

    // Show HQ screen
    document.getElementById('repairHQ').classList.remove('hidden');

    // Update state
    this.state.currentScreen = 'hq';

    console.log('🏠 Back at HQ, ready for next call!');
  },

  // Reset entire app
  resetApp() {
    console.log('🔄 Resetting app...');

    this.state.currentProblem = getProblemById(1);
    this.state.badgesEarned = [];
    this.state.repairsCompleted = 0;

    this.resetRepairState();

    // Hide all screens except HQ
    document.getElementById('repairSite').classList.add('hidden');
    document.getElementById('repairSuccess').classList.add('hidden');
    document.getElementById('toolBelt').classList.add('hidden');

    // Show HQ
    document.getElementById('repairHQ').classList.remove('hidden');

    this.state.currentScreen = 'hq';

    console.log('✓ App reset complete!');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  RepairCrewApp.init();
});

// Expose app globally for debugging
window.RepairCrewApp = RepairCrewApp;
