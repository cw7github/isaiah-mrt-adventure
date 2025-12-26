// ===== TRANSFORMATION STATION - MAIN APP =====
// Experiential learning through first-person transformation

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

  // Shimmer sound for transformations
  playShimmer() {
    const ctx = this.init();
    [800, 1000, 1200, 1400].forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, i * 100);
    });
  },

  // Magical chime
  playMagic() {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }
};

// Initialize on first user interaction
document.addEventListener('click', () => SoundEngine.init(), { once: true });
document.addEventListener('touchstart', () => SoundEngine.init(), { once: true });

class TransformationStation {
  constructor() {
    this.currentScreen = 'lobby';
    this.currentJourney = null;
    this.currentStageIndex = 0;
    this.vocabularyTracker = new VocabularyTracker();
    this.memoryCards = [];

    this.screens = {
      lobby: document.getElementById('lobby'),
      elevator: document.getElementById('elevator'),
      transformation: document.getElementById('transformation'),
      journey: document.getElementById('journey'),
      completion: document.getElementById('completion')
    };

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.showScreen('lobby');
  }

  // ===== SCREEN MANAGEMENT =====

  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    this.screens[screenName].classList.add('active');
    this.currentScreen = screenName;

    // Run screen-specific setup
    if (screenName === 'elevator') {
      this.setupElevator();
    }
  }

  // ===== EVENT LISTENERS =====

  attachEventListeners() {
    // Lobby
    document.getElementById('enterElevator').addEventListener('click', () => {
      this.enterElevator();
    });

    // Elevator
    document.getElementById('backToLobby').addEventListener('click', () => {
      this.showScreen('lobby');
    });

    document.querySelectorAll('.floor-button').forEach(button => {
      button.addEventListener('click', (e) => {
        if (!button.classList.contains('locked')) {
          const journeyId = button.dataset.journey;
          this.selectJourney(journeyId);
        }
      });
    });

    // Journey navigation
    document.getElementById('nextStage').addEventListener('click', () => {
      this.nextStage();
    });

    document.getElementById('prevStage').addEventListener('click', () => {
      this.prevStage();
    });

    // Completion
    document.getElementById('anotherJourney').addEventListener('click', () => {
      this.showScreen('elevator');
    });

    document.getElementById('returnToLobby').addEventListener('click', () => {
      this.showScreen('lobby');
    });
  }

  // ===== ELEVATOR =====

  enterElevator() {
    this.showScreen('elevator');

    // Animate elevator doors opening
    const doors = document.querySelector('.elevator-doors');
    if (doors) {
      setTimeout(() => {
        doors.style.opacity = '0.5';
      }, 500);
    }
  }

  setupElevator() {
    // Reset reflection
    const reflection = document.getElementById('reflection');
    reflection.querySelector('.reflection-body').textContent = '👤';
    reflection.classList.remove('transforming');
  }

  // ===== JOURNEY SELECTION =====

  selectJourney(journeyId) {
    const journey = JOURNEYS[journeyId];

    if (!journey || journey.locked) {
      return;
    }

    this.currentJourney = journey;
    this.currentStageIndex = 0;
    this.vocabularyTracker.clear();
    this.memoryCards = [];

    // Start transformation sequence
    this.startTransformation();
  }

  // ===== TRANSFORMATION SEQUENCE =====

  startTransformation() {
    // Show transformation screen
    this.showScreen('transformation');

    // Play transformation sound
    SoundEngine.playShimmer();

    // Trigger mirror ripple effect
    document.querySelectorAll('.mirror').forEach(mirror => {
      mirror.classList.add('ripple');
    });

    // Animate reflection transforming
    const reflection = document.getElementById('reflection');
    reflection.classList.add('transforming');

    // Update transformation text
    const transformText = document.getElementById('transformText');
    transformText.textContent = `You are becoming ${this.currentJourney.transformText}...`;

    // After transformation animation, start journey
    setTimeout(() => {
      this.startJourney();
    }, 3000);
  }

  // ===== JOURNEY PLAYTHROUGH =====

  startJourney() {
    this.showScreen('journey');
    this.renderStage();
  }

  renderStage() {
    const stage = this.currentJourney.stages[this.currentStageIndex];

    // Update background
    const journeyBg = document.getElementById('journeyBg');
    journeyBg.className = `journey-background ${stage.background}`;

    // Update first-person view
    const formBody = document.getElementById('formBody');
    formBody.className = `form-body ${stage.formClass}`;

    // Update content
    document.getElementById('stageTitle').textContent = stage.title;
    document.getElementById('stageText').textContent = stage.text;

    // Handle interactions
    this.renderInteraction(stage);

    // Update progress dots
    this.updateProgress();

    // Update navigation buttons
    this.updateNavigation();

    // Add particles if specified
    this.addParticles(stage);

    // Add vocabulary if present
    if (stage.vocabulary) {
      stage.vocabulary.forEach(v => {
        this.vocabularyTracker.addWord(v.word, v.definition);
      });
    }

    // Add memory card
    if (stage.memory) {
      this.memoryCards.push(stage.memory);
    }

    // Play sound effect if specified
    if (stage.soundEffect) {
      this.playSoundEffect(stage.soundEffect);
    }

    // Play animation if specified
    if (stage.animation) {
      this.playAnimation(stage.animation);
    }
  }

  renderInteraction(stage) {
    const interactionContainer = document.getElementById('stageInteraction');
    interactionContainer.innerHTML = '';

    if (!stage.interaction) {
      return;
    }

    const interaction = stage.interaction;

    // Create question
    const question = document.createElement('div');
    question.className = 'interaction-question';
    question.style.cssText = `
      font-size: 1.3rem;
      color: white;
      font-weight: 700;
      margin-bottom: 1rem;
      text-align: center;
    `;
    question.textContent = interaction.question;
    interactionContainer.appendChild(question);

    // Create options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    `;

    interaction.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'interaction-button';
      button.textContent = option.text;

      button.addEventListener('click', () => {
        if (option.correct) {
          SoundEngine.playSuccess();
          button.classList.add('correct');

          // Show hint if exists
          if (interaction.hint) {
            const hint = document.createElement('div');
            hint.style.cssText = `
              margin-top: 1rem;
              font-size: 1.1rem;
              color: #4ade80;
              font-weight: 600;
            `;
            hint.textContent = '✓ Correct! ' + interaction.hint;
            interactionContainer.appendChild(hint);
          }

          // Enable next button after short delay
          setTimeout(() => {
            document.getElementById('nextStage').disabled = false;
          }, 1000);
        } else {
          // Shake animation for wrong answer
          SoundEngine.playError();
          button.style.animation = 'shake 0.5s';
          setTimeout(() => {
            button.style.animation = '';
          }, 500);
        }
      });

      optionsContainer.appendChild(button);
    });

    interactionContainer.appendChild(optionsContainer);

    // Disable next button until interaction is completed
    document.getElementById('nextStage').disabled = true;
  }

  addParticles(stage) {
    const particlesContainer = document.getElementById('journeyParticles');
    particlesContainer.innerHTML = '';

    if (stage.particles && ParticleEffects[stage.particles.type]) {
      ParticleEffects[stage.particles.type](particlesContainer);
    }
  }

  updateProgress() {
    const progressContainer = document.getElementById('journeyProgress');
    progressContainer.innerHTML = '';

    this.currentJourney.stages.forEach((stage, index) => {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';

      if (index === this.currentStageIndex) {
        dot.classList.add('active');
      } else if (index < this.currentStageIndex) {
        dot.classList.add('completed');
      }

      progressContainer.appendChild(dot);
    });
  }

  updateNavigation() {
    const prevButton = document.getElementById('prevStage');
    const nextButton = document.getElementById('nextStage');

    // Previous button
    prevButton.disabled = this.currentStageIndex === 0;

    // Next button
    const currentStage = this.currentJourney.stages[this.currentStageIndex];
    if (currentStage.interaction) {
      // Will be enabled when interaction is completed
      nextButton.disabled = true;
    } else {
      nextButton.disabled = false;
    }

    // Change text on last stage
    if (this.currentStageIndex === this.currentJourney.stages.length - 1) {
      nextButton.textContent = 'Complete Journey ✨';
    } else {
      nextButton.textContent = 'Continue →';
    }
  }

  nextStage() {
    if (this.currentStageIndex < this.currentJourney.stages.length - 1) {
      this.currentStageIndex++;
      this.renderStage();
    } else {
      // Journey complete!
      this.completeJourney();
    }
  }

  prevStage() {
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      this.renderStage();
    }
  }

  // ===== ANIMATIONS =====

  playAnimation(animationType) {
    const journeyBg = document.getElementById('journeyBg');

    switch (animationType) {
      case 'rise':
        // Already handled by CSS class
        break;
      case 'fall':
        // Already handled by CSS class
        break;
    }
  }

  playSoundEffect(effectName) {
    // Map stage sound effects to SoundEngine methods
    const soundMap = {
      'whoosh': () => SoundEngine.playWhoosh(),
      'shimmer': () => SoundEngine.playShimmer(),
      'magic': () => SoundEngine.playMagic(),
      'ding': () => SoundEngine.playDing(),
      'success': () => SoundEngine.playSuccess(),
      'click': () => SoundEngine.playClick()
    };

    if (soundMap[effectName]) {
      soundMap[effectName]();
    } else {
      console.log(`Playing sound effect: ${effectName}`);
    }
  }

  // ===== COMPLETION =====

  completeJourney() {
    this.showScreen('completion');

    // Update badge
    const badge = document.getElementById('completionBadge');
    badge.querySelector('.badge-icon').textContent = this.currentJourney.icon;
    badge.querySelector('.badge-title').textContent = this.currentJourney.badgeTitle;
    badge.querySelector('.badge-subtitle').textContent = this.currentJourney.badgeSubtitle;

    // Update completion text
    document.getElementById('completionText').textContent = this.currentJourney.completionText;

    // Render memory cards
    this.renderMemoryCards();

    // Show vocabulary learned (if any)
    this.showVocabulary();
  }

  renderMemoryCards() {
    const memoryStages = document.getElementById('memoryStages');
    memoryStages.innerHTML = '';

    this.memoryCards.forEach(memory => {
      const card = document.createElement('div');
      card.className = 'memory-card';

      const icon = document.createElement('div');
      icon.className = 'memory-icon';
      icon.textContent = memory.icon;

      const label = document.createElement('div');
      label.className = 'memory-label';
      label.textContent = memory.label;

      card.appendChild(icon);
      card.appendChild(label);
      memoryStages.appendChild(card);
    });
  }

  showVocabulary() {
    const words = this.vocabularyTracker.getWords();

    if (words.length > 0) {
      // Add vocabulary section to completion screen
      const completionContent = document.querySelector('.completion-content');

      let vocabSection = document.getElementById('vocabularySection');
      if (!vocabSection) {
        vocabSection = document.createElement('div');
        vocabSection.id = 'vocabularySection';
        vocabSection.style.cssText = `
          margin-top: 2rem;
          width: 100%;
          max-width: 700px;
          animation: fade-in-up 0.8s ease 1.6s backwards;
        `;

        const title = document.createElement('h3');
        title.style.cssText = `
          font-family: 'Comfortaa', cursive;
          font-size: 1.5rem;
          color: white;
          margin-bottom: 1rem;
          text-align: center;
        `;
        title.textContent = 'New Words You Learned:';

        const wordList = document.createElement('div');
        wordList.id = 'wordList';
        wordList.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 1rem;
        `;

        vocabSection.appendChild(title);
        vocabSection.appendChild(wordList);
        completionContent.appendChild(vocabSection);
      }

      const wordList = document.getElementById('wordList');
      wordList.innerHTML = '';

      words.forEach(({ word, definition }) => {
        const wordCard = document.createElement('div');
        wordCard.style.cssText = `
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        `;

        const wordTitle = document.createElement('div');
        wordTitle.style.cssText = `
          font-family: 'Comfortaa', cursive;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        `;
        wordTitle.textContent = word;

        const wordDef = document.createElement('div');
        wordDef.style.cssText = `
          font-size: 1rem;
          color: white;
          line-height: 1.6;
        `;
        wordDef.textContent = definition;

        wordCard.appendChild(wordTitle);
        wordCard.appendChild(wordDef);
        wordList.appendChild(wordCard);

        // Hover effect
        wordCard.addEventListener('mouseenter', () => {
          wordCard.style.background = 'rgba(255, 255, 255, 0.25)';
          wordCard.style.transform = 'translateY(-5px)';
        });

        wordCard.addEventListener('mouseleave', () => {
          wordCard.style.background = 'rgba(255, 255, 255, 0.15)';
          wordCard.style.transform = 'translateY(0)';
        });
      });
    }
  }
}

// ===== ADD SHAKE ANIMATION TO STYLES =====
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// ===== INITIALIZE APP =====
let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new TransformationStation();
  });
} else {
  app = new TransformationStation();
}
