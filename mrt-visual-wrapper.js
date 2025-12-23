/**
 * MRT VISUAL WRAPPER
 * Wraps manim animations in MRT-themed frames for seamless integration
 * with Isaiah's MRT Food Adventure
 */

const MRTVisualWrapper = {
  // Station icons for each math line
  lineIcons: {
    OA: '🔢',   // Operations & Algebraic Thinking
    NBT: '📊',  // Number & Base Ten
    MD: '📏',   // Measurement & Data
    G: '🔷'     // Geometry
  },

  // Line display names
  lineNames: {
    OA: 'Number Fun',
    NBT: 'Place Value',
    MD: 'Measure Up',
    G: 'Shape World'
  },

  // Train emojis for celebration
  trainEmojis: ['🚇', '🚊', '🚆', '🚂', '🚃'],

  // Celebration emojis
  celebrationEmojis: ['⭐', '🌟', '✨', '🎉', '🎊', '🏆', '💫', '🎈'],

  /**
   * Create an MRT-themed visual frame
   * @param {Object} options - Configuration options
   * @returns {HTMLElement} - The frame element
   */
  createFrame(options = {}) {
    const {
      line = 'OA',
      stationName = '',
      stationIcon = null,
      showHeader = true,
      showProgress = false,
      totalSteps = 0,
      currentStep = 0
    } = options;

    const frame = document.createElement('div');
    frame.className = 'mrt-visual-frame arriving';
    frame.setAttribute('data-line', line);

    // Station header
    if (showHeader) {
      const header = document.createElement('div');
      header.className = 'mrt-station-header';

      const nameContainer = document.createElement('div');
      nameContainer.className = 'mrt-station-name';

      // Line badge
      const badge = document.createElement('span');
      badge.className = 'mrt-line-badge';
      badge.textContent = line;
      badge.setAttribute('aria-label', `${this.lineNames[line] || line} Line`);
      nameContainer.appendChild(badge);

      // Station name
      const name = document.createElement('span');
      name.textContent = stationName || this.lineNames[line] || 'Math Station';
      nameContainer.appendChild(name);

      header.appendChild(nameContainer);

      // Station icon
      if (stationIcon || this.lineIcons[line]) {
        const icon = document.createElement('span');
        icon.className = 'mrt-station-icon';
        icon.textContent = stationIcon || this.lineIcons[line];
        icon.setAttribute('aria-hidden', 'true');
        header.appendChild(icon);
      }

      frame.appendChild(header);
    }

    // Visual content area
    const content = document.createElement('div');
    content.className = 'mrt-visual-content';
    frame.appendChild(content);

    // Progress bar
    if (showProgress && totalSteps > 0) {
      const progressBar = this.createProgressBar(totalSteps, currentStep, line);
      frame.appendChild(progressBar);
    }

    // Remove arrival animation class after it plays
    frame.addEventListener('animationend', (e) => {
      if (e.animationName === 'station-arrive') {
        frame.classList.remove('arriving');
        // Add a subtle "ding" effect
        frame.classList.add('ding');
        setTimeout(() => frame.classList.remove('ding'), 400);
      }
    }, { once: true });

    return frame;
  },

  /**
   * Create progress indicator bar
   */
  createProgressBar(total, current, line) {
    const bar = document.createElement('div');
    bar.className = 'mrt-progress-bar';

    for (let i = 0; i < total; i++) {
      // Station dot
      const station = document.createElement('div');
      station.className = 'mrt-progress-station';
      if (i < current) {
        station.classList.add('completed');
      } else if (i === current) {
        station.classList.add('current');
      }
      station.setAttribute('aria-label', `Step ${i + 1} of ${total}`);
      bar.appendChild(station);

      // Connector (except after last station)
      if (i < total - 1) {
        const connector = document.createElement('div');
        connector.className = 'mrt-progress-connector';
        if (i < current) {
          connector.classList.add('completed');
        }
        bar.appendChild(connector);
      }
    }

    return bar;
  },

  /**
   * Render a visual inside an MRT frame
   * @param {Object} visual - The visual configuration
   * @param {HTMLElement} container - The target container
   * @param {Object} options - MRT frame options
   * @returns {HTMLElement|null} - The rendered frame
   */
  renderVisual(visual, container, options = {}) {
    if (!visual || !container) {
      console.error('MRTVisualWrapper.renderVisual: visual and container are required');
      return null;
    }

    // Create the MRT frame
    const frame = this.createFrame(options);
    const contentArea = frame.querySelector('.mrt-visual-content');

    // Render the manim visual inside the content area
    if (typeof window.renderManimVisual === 'function') {
      try {
        window.renderManimVisual(visual, contentArea);
      } catch (error) {
        console.error('Error rendering manim visual:', error);
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <p>Visual loading...</p>
          </div>
        `;
      }
    } else {
      console.warn('ManimEngine not loaded, falling back to placeholder');
      this.renderPlaceholder(visual, contentArea);
    }

    // Clear container and add frame
    container.innerHTML = '';
    container.appendChild(frame);

    return frame;
  },

  /**
   * Render a placeholder when ManimEngine isn't available
   */
  renderPlaceholder(visual, container) {
    const typeIcons = {
      numberLine: '📏',
      counters: '🔢',
      tenFrame: '🔟',
      shapes: '🔷',
      '3dShape': '🧊',
      equation: '➕',
      addition: '➕',
      comparison: '⚖️',
      cpa: '🧱',
      clock: '🕐',
      placeValue: '🔢',
      blocks: '🧱',
      pictureGraph: '📊'
    };

    const icon = typeIcons[visual.type] || '📐';
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 16px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
          ${icon}
        </div>
        <p style="font-family: 'Fredoka One', cursive; font-size: 18px; color: #4a4a4a;">
          ${visual.type.charAt(0).toUpperCase() + visual.type.slice(1)} Visual
        </p>
      </div>
    `;
  },

  /**
   * Trigger MRT-themed celebration animation
   * @param {Object} options - Celebration options
   */
  celebrate(options = {}) {
    const {
      line = 'OA',
      intensity = 'normal', // 'subtle', 'normal', 'epic'
      showTrain = true,
      onComplete = null
    } = options;

    const container = document.createElement('div');
    container.className = 'mrt-celebration';
    document.body.appendChild(container);

    // Chime rings
    const ringCount = intensity === 'epic' ? 5 : intensity === 'subtle' ? 2 : 3;
    for (let i = 0; i < ringCount; i++) {
      const ring = document.createElement('div');
      ring.className = 'mrt-chime-ring';
      ring.style.animationDelay = `${i * 0.2}s`;
      container.appendChild(ring);
    }

    // Confetti
    const confettiCount = intensity === 'epic' ? 30 : intensity === 'subtle' ? 10 : 20;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'mrt-confetti';
      confetti.textContent = this.celebrationEmojis[Math.floor(Math.random() * this.celebrationEmojis.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 1}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(confetti);
    }

    // Train zoom
    if (showTrain) {
      const train = document.createElement('div');
      train.className = 'mrt-train-emoji';
      train.textContent = this.trainEmojis[Math.floor(Math.random() * this.trainEmojis.length)];
      train.style.top = `${30 + Math.random() * 40}%`;
      container.appendChild(train);
    }

    // Clean up and callback
    const duration = intensity === 'epic' ? 4000 : intensity === 'subtle' ? 2000 : 3000;
    setTimeout(() => {
      container.remove();
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, duration);
  },

  /**
   * Update progress on an existing frame
   */
  updateProgress(frame, currentStep) {
    if (!frame) return;

    const stations = frame.querySelectorAll('.mrt-progress-station');
    const connectors = frame.querySelectorAll('.mrt-progress-connector');

    stations.forEach((station, idx) => {
      station.classList.remove('completed', 'current');
      if (idx < currentStep) {
        station.classList.add('completed');
      } else if (idx === currentStep) {
        station.classList.add('current');
      }
    });

    connectors.forEach((connector, idx) => {
      connector.classList.remove('completed');
      if (idx < currentStep) {
        connector.classList.add('completed');
      }
    });
  },

  /**
   * Animate frame departure (transition to next visual)
   */
  depart(frame, onComplete) {
    if (!frame) return;

    frame.classList.add('departing');
    frame.addEventListener('animationend', () => {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, { once: true });
  },

  /**
   * Get line color CSS variable
   */
  getLineColor(line) {
    const colors = {
      OA: 'var(--line-oa)',
      NBT: 'var(--line-nbt)',
      MD: 'var(--line-md)',
      G: 'var(--line-g)'
    };
    return colors[line] || colors.OA;
  },

  /**
   * Detect line from station ID
   */
  detectLine(stationId) {
    if (!stationId) return 'OA';

    const id = stationId.toLowerCase();
    if (id.includes('nbt') || id.includes('place') || id.includes('base')) return 'NBT';
    if (id.includes('md') || id.includes('measure') || id.includes('data')) return 'MD';
    if (id.includes('g_') || id.includes('geo') || id.includes('shape')) return 'G';
    return 'OA';
  }
};

// Expose globally
window.MRTVisualWrapper = MRTVisualWrapper;

/**
 * Enhanced render function that wraps visuals in MRT frames
 * Drop-in replacement for direct manim rendering
 */
window.renderMRTVisual = function(visual, container, options = {}) {
  return MRTVisualWrapper.renderVisual(visual, container, options);
};

/**
 * Convenience function for math lesson visuals
 */
window.renderMathLessonVisual = function(visual, container, stationContext = {}) {
  const line = MRTVisualWrapper.detectLine(stationContext.id || stationContext.stationId);

  return MRTVisualWrapper.renderVisual(visual, container, {
    line: stationContext.line || line,
    stationName: stationContext.title || stationContext.name || '',
    stationIcon: stationContext.icon,
    showHeader: true,
    showProgress: !!stationContext.totalPages,
    totalSteps: stationContext.totalPages || 0,
    currentStep: stationContext.currentPage || 0
  });
};

/**
 * Trigger MRT celebration
 */
window.celebrateMRT = function(options) {
  MRTVisualWrapper.celebrate(options);

  // Also trigger manim celebration for extra flair
  if (typeof ManimEngine !== 'undefined' && ManimEngine.celebrate) {
    setTimeout(() => ManimEngine.celebrate(), 300);
  }
};

console.log('[MRTVisualWrapper] Loaded - Math visuals will now use MRT-integrated frames');
