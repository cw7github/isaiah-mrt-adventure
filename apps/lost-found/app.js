// LOST & FOUND EXPRESS - Detective Game Logic
// Kids solve mysteries by matching clues to find item owners

// Simple Web Audio Sound Engine
const SoundEngine = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

// Announce to screen reader
function announceToScreenReader(message) {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}

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

  // Magnify/zoom sound
  playMagnify() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Collect clue sound
  playCollectClue() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
};

// Initialize on first user interaction
document.addEventListener('click', () => SoundEngine.init(), { once: true });
document.addEventListener('touchstart', () => SoundEngine.init(), { once: true });

class LostAndFoundGame {
  constructor() {
    this.currentCase = null;
    this.discoveredClues = [];
    this.solvedCases = [];
    this.currentPhase = 'office'; // office, examine, report, witness, match, solution
    this.selectedSuspect = null;
    this.hintsUsed = 0;

    this.init();
  }

  init() {
    // Load solved cases from localStorage
    const saved = localStorage.getItem('lostFoundSolved');
    if (saved) {
      this.solvedCases = JSON.parse(saved);
    }

    // Set up event listeners
    this.setupEventListeners();

    // Start with office view
    this.showOffice();
  }

  setupEventListeners() {
    // Radio button to start new case
    const radioBtn = document.getElementById('radio-btn');
    if (radioBtn) {
      radioBtn.addEventListener('click', () => this.startNewCase());
    }

    // Magnifying glass to examine item
    const examineBtn = document.getElementById('examine-btn');
    if (examineBtn) {
      examineBtn.addEventListener('click', () => this.examineItem());
    }

    // Read report button
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.readReport());
    }

    // Interview witness button
    const witnessBtn = document.getElementById('witness-btn');
    if (witnessBtn) {
      witnessBtn.addEventListener('click', () => this.interviewWitness());
    }

    // Solve case button
    const solveBtn = document.getElementById('solve-btn');
    if (solveBtn) {
      solveBtn.addEventListener('click', () => this.showMatchPhase());
    }

    // Hint button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint());
    }

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBack());
    }
  }

  showOffice() {
    this.currentPhase = 'office';
    const container = document.getElementById('game-container');

    const solvedCount = this.solvedCases.length;
    const totalCases = CASES.length;

    container.innerHTML = `
      <div class="office-view">
        <div class="office-header">
          <h1 class="office-title">Lost & Found Express</h1>
          <p class="office-subtitle">Detective Isaiah's Office</p>
        </div>

        <div class="office-desk">
          <div class="desk-item magnifying-glass">
            <div class="glass-lens">🔍</div>
          </div>

          <div class="desk-item radio-box">
            <div class="radio-static"></div>
            <button id="radio-btn" class="radio-button">
              📻 Listen for Lost Items
            </button>
          </div>

          <div class="desk-item case-file">
            <h3>📁 Case Files</h3>
            <p class="solved-count">${solvedCount} of ${totalCases} Cases Solved</p>
          </div>
        </div>

        <div class="solved-cases-wall">
          <h3>🏆 Solved Cases</h3>
          <div class="badges-container">
            ${this.renderSolvedBadges()}
          </div>
        </div>

        <div class="detective-badge">
          <p>🕵️ Detective Isaiah</p>
        </div>
      </div>
    `;

    // Re-attach radio button listener
    document.getElementById('radio-btn').addEventListener('click', () => this.startNewCase());
  }

  renderSolvedBadges() {
    if (this.solvedCases.length === 0) {
      return '<p class="no-badges">No cases solved yet. Listen to the radio to start!</p>';
    }

    return this.solvedCases.map(caseId => {
      const caseData = getCaseById(caseId);
      return `
        <div class="badge">
          <div class="badge-emoji">${caseData.item.emoji}</div>
          <div class="badge-name">${caseData.reward.badge}</div>
        </div>
      `;
    }).join('');
  }

  startNewCase() {
    // Find next unsolved case
    const nextCase = CASES.find(c => !this.solvedCases.includes(c.id));

    if (!nextCase) {
      this.showAllCasesSolved();
      return;
    }

    this.currentCase = nextCase;
    this.discoveredClues = [];
    this.selectedSuspect = null;
    this.hintsUsed = 0;

    this.playSound('radio-crackle');
    this.showCaseAlert();
  }

  showCaseAlert() {
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="case-alert">
        <div class="alert-box">
          <div class="radio-waves">📻</div>
          <h2 class="alert-title">NEW CASE!</h2>
          <p class="alert-message">"Lost item reported on the ${this.currentCase.location.train}!"</p>
          <p class="alert-detail">📍 Near ${this.currentCase.location.station}</p>
          <p class="alert-detail">🕐 ${this.currentCase.location.time}</p>
          <button class="btn-primary" id="start-investigation">
            Start Investigation
          </button>
        </div>
      </div>
    `;

    document.getElementById('start-investigation').addEventListener('click', () => {
      this.showCaseBoard();
    });
  }

  showCaseBoard() {
    this.currentPhase = 'board';
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="case-board-view">
        <div class="board-header">
          <h2>🔍 ${this.currentCase.name}</h2>
          <button id="back-btn" class="btn-secondary">← Back to Office</button>
        </div>

        <div class="evidence-board">
          <div class="board-center">
            <div class="lost-item-card">
              <div class="item-emoji">${this.currentCase.item.emoji}</div>
              <h3>${this.currentCase.item.name}</h3>
              <p>${this.currentCase.item.description}</p>
            </div>
          </div>

          <div class="action-buttons">
            <button id="examine-btn" class="action-btn">
              🔍 Examine Item
              ${this.discoveredClues.length > 0 ? '✓' : ''}
            </button>
            <button id="report-btn" class="action-btn">
              📋 Read Report
            </button>
            <button id="witness-btn" class="action-btn">
              👤 Interview Witness
            </button>
          </div>

          <div class="clues-collected">
            <h3>📌 Clues Collected: ${this.discoveredClues.length}</h3>
            <div class="clues-list">
              ${this.renderCluesList()}
            </div>
          </div>

          ${this.discoveredClues.length >= 3 ? `
            <button id="solve-btn" class="btn-primary solve-button">
              ✨ Ready to Solve!
            </button>
          ` : ''}
        </div>

        <button id="hint-btn" class="btn-hint">💡 Need a Hint?</button>
      </div>
    `;

    this.setupEventListeners();
  }

  renderCluesList() {
    if (this.discoveredClues.length === 0) {
      return '<p class="no-clues">Collect clues by examining the item and reading reports!</p>';
    }

    return this.discoveredClues.map(clue => `
      <div class="clue-card">
        <div class="clue-pin">📍</div>
        <p class="clue-text">${clue.text}</p>
      </div>
    `).join('');
  }

  examineItem() {
    this.playSound('magnify');

    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="examine-view">
        <div class="examine-header">
          <h2>🔍 Examining the ${this.currentCase.item.name}</h2>
          <button id="back-btn" class="btn-secondary">← Back</button>
        </div>

        <div class="item-closeup">
          <div class="magnifying-effect">
            <div class="item-large">${this.currentCase.item.emoji}</div>
          </div>
          <h3>${this.currentCase.item.description}</h3>
        </div>

        <div class="examination-clues">
          <h3>🔎 What you notice:</h3>
          <div class="clues-reveal">
            ${this.currentCase.item.clues.map((clue, index) => `
              <div class="clue-item" style="animation-delay: ${index * 0.3}s">
                <div class="clue-icon">✨</div>
                <p>${clue.text}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <button id="collect-clues-btn" class="btn-primary">
          📝 Add to Evidence Board
        </button>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => this.showCaseBoard());
    document.getElementById('collect-clues-btn').addEventListener('click', () => {
      this.currentCase.item.clues.forEach(clue => {
        if (!this.discoveredClues.find(c => c.text === clue.text)) {
          this.discoveredClues.push(clue);
        }
      });
      this.playSound('collect-clue');
      this.showCaseBoard();
    });
  }

  readReport() {
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="report-view">
        <div class="report-header">
          <h2>📋 Lost Item Report</h2>
          <button id="back-btn" class="btn-secondary">← Back</button>
        </div>

        <div class="report-paper">
          <div class="paper-header">
            <p><strong>Case:</strong> ${this.currentCase.name}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="report-content">
            <h3>📍 Location Details:</h3>
            <p><strong>Train Line:</strong> ${this.currentCase.location.train}</p>
            <p><strong>Station:</strong> ${this.currentCase.location.station}</p>
            <p><strong>Time Found:</strong> ${this.currentCase.location.time}</p>
          </div>

          <div class="report-content">
            <h3>📝 Report:</h3>
            <p>${this.currentCase.report}</p>
          </div>
        </div>

        <button id="note-report-btn" class="btn-primary">
          📝 Take Notes
        </button>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => this.showCaseBoard());
    document.getElementById('note-report-btn').addEventListener('click', () => {
      // Add location clues
      const locationClue = {
        type: 'location',
        value: this.currentCase.location.train,
        text: `Found on ${this.currentCase.location.train} near ${this.currentCase.location.station}`
      };
      if (!this.discoveredClues.find(c => c.text === locationClue.text)) {
        this.discoveredClues.push(locationClue);
      }
      this.playSound('collect-clue');
      this.showCaseBoard();
    });
  }

  interviewWitness() {
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="witness-view">
        <div class="witness-header">
          <h2>👤 Witness Interview</h2>
          <button id="back-btn" class="btn-secondary">← Back</button>
        </div>

        <div class="witness-card">
          <div class="witness-avatar">👤</div>
          <h3>${this.currentCase.witness.name}</h3>
          <div class="speech-bubble">
            <p>${this.currentCase.witness.statement}</p>
          </div>
        </div>

        <div class="witness-hints">
          <h3>🗒️ Key Information:</h3>
          ${this.currentCase.witness.hints.map((hint, index) => `
            <div class="hint-item" style="animation-delay: ${index * 0.2}s">
              <span class="hint-bullet">•</span> ${hint}
            </div>
          `).join('')}
        </div>

        <button id="record-testimony-btn" class="btn-primary">
          📝 Record Testimony
        </button>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => this.showCaseBoard());
    document.getElementById('record-testimony-btn').addEventListener('click', () => {
      // Add witness clues
      this.currentCase.witness.hints.forEach(hint => {
        const witnessClue = {
          type: 'witness',
          value: hint,
          text: hint
        };
        if (!this.discoveredClues.find(c => c.text === witnessClue.text)) {
          this.discoveredClues.push(witnessClue);
        }
      });
      this.playSound('collect-clue');
      this.showCaseBoard();
    });
  }

  showMatchPhase() {
    this.currentPhase = 'match';
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="match-view">
        <div class="match-header">
          <h2>🎯 Who Does It Belong To?</h2>
          <button id="back-btn" class="btn-secondary">← Back</button>
        </div>

        <div class="match-layout">
          <div class="item-to-match">
            <div class="item-card">
              <div class="item-emoji">${this.currentCase.item.emoji}</div>
              <h3>${this.currentCase.item.name}</h3>
            </div>
            <div class="clues-reminder">
              <h4>📌 Your Clues:</h4>
              ${this.discoveredClues.slice(0, 5).map(clue => `
                <p class="clue-reminder">• ${clue.text}</p>
              `).join('')}
            </div>
          </div>

          <div class="suspects-list">
            <h3>👥 Missing Item Reports:</h3>
            ${this.currentCase.suspects.map(suspect => `
              <div class="suspect-card ${this.selectedSuspect === suspect.id ? 'selected' : ''}"
                   data-suspect="${suspect.id}">
                <div class="suspect-avatar">${suspect.avatar}</div>
                <div class="suspect-info">
                  <h4>${suspect.name} (${suspect.age})</h4>
                  <p class="suspect-report">"${suspect.report.description}"</p>
                  <div class="suspect-clues">
                    <span class="clue-tag">Color: ${suspect.clues.color}</span>
                    <span class="clue-tag">Train: ${suspect.clues.train}</span>
                    ${suspect.clues.pattern ? `<span class="clue-tag">Pattern: ${suspect.clues.pattern}</span>` : ''}
                    ${suspect.clues.logo ? `<span class="clue-tag">Logo: ${suspect.clues.logo}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${this.selectedSuspect ? `
          <button id="submit-solution-btn" class="btn-primary">
            ✅ Return to ${this.currentCase.suspects.find(s => s.id === this.selectedSuspect).name}
          </button>
        ` : ''}
      </div>
    `;

    // Add click handlers for suspect cards
    document.querySelectorAll('.suspect-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const suspectId = card.dataset.suspect;
        this.selectedSuspect = suspectId;
        document.querySelectorAll('.suspect-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Show submit button
        const existingBtn = document.getElementById('submit-solution-btn');
        if (existingBtn) existingBtn.remove();

        const suspect = this.currentCase.suspects.find(s => s.id === suspectId);
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submit-solution-btn';
        submitBtn.className = 'btn-primary';
        submitBtn.textContent = `✅ Return to ${suspect.name}`;
        submitBtn.addEventListener('click', () => this.checkSolution());
        document.querySelector('.match-view').appendChild(submitBtn);
      });
    });

    document.getElementById('back-btn').addEventListener('click', () => this.showCaseBoard());
  }

  checkSolution() {
    const isCorrect = this.selectedSuspect === this.currentCase.solution;

    if (isCorrect) {
      this.playSound('success');
      this.showSuccess();
    } else {
      this.playSound('error');
      this.showTryAgain();
    }
  }

  showSuccess() {
    const suspect = this.currentCase.suspects.find(s => s.id === this.selectedSuspect);
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="success-view">
        <div class="success-animation">
          <div class="stamp-effect">CASE SOLVED!</div>
        </div>

        <div class="reunion-scene">
          <div class="happy-owner">
            <div class="owner-avatar">${suspect.avatar}</div>
            <h2>${suspect.name}</h2>
            <div class="speech-bubble success-bubble">
              <p>${this.currentCase.reward.message}</p>
            </div>
          </div>

          <div class="item-returned">
            <div class="item-emoji happy-bounce">${this.currentCase.item.emoji}</div>
          </div>
        </div>

        <div class="reward-section">
          <h3>🏆 Badge Earned!</h3>
          <div class="badge-earned">
            <div class="badge-emoji">${this.currentCase.reward.emoji}</div>
            <p>${this.currentCase.reward.badge}</p>
          </div>
        </div>

        <button id="return-office-btn" class="btn-primary">
          Return to Office
        </button>
      </div>
    `;

    // Save solved case
    if (!this.solvedCases.includes(this.currentCase.id)) {
      this.solvedCases.push(this.currentCase.id);
      localStorage.setItem('lostFoundSolved', JSON.stringify(this.solvedCases));
    }

    document.getElementById('return-office-btn').addEventListener('click', () => {
      this.showOffice();
    });
  }

  showTryAgain() {
    const container = document.getElementById('game-container');

    const overlay = document.createElement('div');
    overlay.className = 'try-again-overlay';
    overlay.innerHTML = `
      <div class="try-again-box">
        <h3>🤔 Not quite right...</h3>
        <p>Check the clues again! Compare each detail carefully.</p>
        <button id="try-again-btn" class="btn-primary">Try Again</button>
        <button id="show-hint-btn" class="btn-secondary">Show Hint</button>
      </div>
    `;

    container.appendChild(overlay);

    document.getElementById('try-again-btn').addEventListener('click', () => {
      overlay.remove();
      this.selectedSuspect = null;
    });

    document.getElementById('show-hint-btn').addEventListener('click', () => {
      overlay.remove();
      this.showHint();
      setTimeout(() => this.showMatchPhase(), 2000);
    });
  }

  showHint() {
    this.hintsUsed++;

    let hintText = '';
    const correctSuspect = this.currentCase.suspects.find(s => s.id === this.currentCase.solution);

    if (this.hintsUsed === 1) {
      hintText = `Look carefully at the train line. The item was found on the ${this.currentCase.location.train}.`;
    } else if (this.hintsUsed === 2) {
      hintText = `Check the color and pattern. Does it match ${correctSuspect.name}'s description?`;
    } else {
      hintText = `The answer is ${correctSuspect.name}! Compare their report with all your clues.`;
    }

    const hintBox = document.createElement('div');
    hintBox.className = 'hint-popup';
    hintBox.innerHTML = `
      <div class="hint-content">
        <h4>💡 Detective Tip:</h4>
        <p>${hintText}</p>
      </div>
    `;

    document.body.appendChild(hintBox);

    setTimeout(() => {
      hintBox.classList.add('fade-out');
      setTimeout(() => hintBox.remove(), 500);
    }, 4000);
  }

  showAllCasesSolved() {
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="victory-view">
        <h1 class="victory-title">🎉 MASTER DETECTIVE! 🎉</h1>
        <p class="victory-message">You've solved all ${CASES.length} cases!</p>

        <div class="all-badges">
          ${this.solvedCases.map(caseId => {
            const caseData = getCaseById(caseId);
            return `
              <div class="badge-display">
                <div class="badge-emoji">${caseData.item.emoji}</div>
                <p>${caseData.reward.badge}</p>
              </div>
            `;
          }).join('')}
        </div>

        <button id="play-again-btn" class="btn-primary">
          🔄 Play Again
        </button>
      </div>
    `;

    document.getElementById('play-again-btn').addEventListener('click', () => {
      if (confirm('This will reset all your progress. Are you sure?')) {
        this.solvedCases = [];
        localStorage.removeItem('lostFoundSolved');
        this.showOffice();
      }
    });
  }

  goBack() {
    this.showCaseBoard();
  }

  playSound(type) {
    // Map sound types to SoundEngine methods
    const soundMap = {
      'radio-crackle': () => SoundEngine.playRadioCrackle(),
      'magnify': () => SoundEngine.playMagnify(),
      'collect-clue': () => SoundEngine.playCollectClue(),
      'success': () => SoundEngine.playSuccess(),
      'error': () => SoundEngine.playError(),
      'click': () => SoundEngine.playClick(),
      'ding': () => SoundEngine.playDing(),
      'whoosh': () => SoundEngine.playWhoosh()
    };

    if (soundMap[type]) {
      soundMap[type]();
    } else {
      console.log(`Sound: ${type}`);
    }
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.game = new LostAndFoundGame();
});
