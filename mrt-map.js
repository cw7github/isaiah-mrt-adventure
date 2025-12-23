/**
 * MRT Map Network - Joyful Transit Map with Pan/Drag Navigation
 * Features: Pannable map, animated train, station selection, staggered animations
 */

const mrtMap = {
  // State
  currentSubject: 'ela',
  contentPack: null,
  stationsByLine: {},
  selectedStation: null,
  trainPosition: null,
  initialized: false,

  // Viewport state
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    momentumId: null,
    lastTime: 0
  },

  // Station positions (calculated from layout)
  stationPositions: {},

  // Line configurations with cheerful colors
  LINE_CONFIGS: {
    ela: {
      RF: { name: 'Reading Foundations', shortName: 'RF', color: '#E53935', icon: '📖' },
      RL: { name: 'Reading Literature', shortName: 'RL', color: '#00C853', icon: '📚' },
      RI: { name: 'Reading Info', shortName: 'RI', color: '#2979FF', icon: '📰' },
      L: { name: 'Language', shortName: 'L', color: '#AA00FF', icon: '✏️' },
      Review: { name: 'Review', shortName: 'REV', color: '#FF9100', icon: '⭐' }
    },
    math: {
      OA: { name: 'Operations', shortName: 'OA', color: '#FF5252', icon: '➕' },
      NBT: { name: 'Numbers', shortName: 'NBT', color: '#448AFF', icon: '🔢' },
      MD: { name: 'Measurement', shortName: 'MD', color: '#00E676', icon: '📏' },
      G: { name: 'Geometry', shortName: 'G', color: '#E040FB', icon: '🔷' },
      Review: { name: 'Review', shortName: 'REV', color: '#FF9100', icon: '⭐' }
    }
  },

  // Content pack paths
  CONTENT_PATHS: {
    ela: '/content/cpa-grade1-ela/content-pack.v1.json',
    math: '/content/cpa-grade1-math/content-pack.v1.json'
  },

  /**
   * Initialize the MRT map
   */
  async init() {
    console.log('🚇 MRT Map initializing...');
    this.container = document.getElementById('mrtMapContainer');
    if (!this.container) {
      console.error('MRT Map container not found');
      return;
    }

    this.showLoading();
    await this.loadContentPack();
    this.buildMap();
    this.setupEventListeners();
    this.hideLoading();

    // Delay centering to allow animations to complete
    setTimeout(() => {
      this.centerOnFirstStation();
    }, 300);
  },

  /**
   * Show loading state with animated train
   */
  showLoading() {
    const loading = document.createElement('div');
    loading.className = 'mrt-map-loading';
    loading.innerHTML = `
      <div class="loading-train">🚂</div>
      <div class="loading-text">Loading your adventure...</div>
    `;
    this.container.appendChild(loading);
  },

  /**
   * Hide loading state
   */
  hideLoading() {
    const loading = this.container.querySelector('.mrt-map-loading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.remove(), 300);
    }
  },

  /**
   * Load content pack for current subject
   */
  async loadContentPack() {
    try {
      const path = this.CONTENT_PATHS[this.currentSubject];
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

      this.contentPack = await response.json();
      this.organizeStationsByLine();
      console.log('📦 Content loaded:', Object.keys(this.stationsByLine));
    } catch (error) {
      console.error('Error loading content pack:', error);
      // Create empty structure to prevent errors
      this.stationsByLine = {};
    }
  },

  /**
   * Organize stations by line
   */
  organizeStationsByLine() {
    const { stationOrder, stations } = this.contentPack || {};
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];
    this.stationsByLine = {};

    Object.keys(lineConfig).forEach(line => {
      this.stationsByLine[line] = [];
    });

    if (!stationOrder || !stations) return;

    stationOrder.forEach(stationId => {
      const station = stations[stationId];
      if (station && station.line) {
        const lineKey = station.line.toUpperCase();
        if (this.stationsByLine[lineKey]) {
          this.stationsByLine[lineKey].push({
            id: stationId,
            ...station
          });
        }
      }
    });
  },

  /**
   * Build the complete map
   */
  buildMap() {
    this.container.innerHTML = '';

    // Create map structure
    const mapHTML = `
      <div class="mrt-map-viewport" id="mapViewport">
        <div class="mrt-map-content" id="mapContent">
          <svg class="mrt-tracks-svg" id="tracksSvg"></svg>
          <div class="mrt-stations-layer" id="stationsLayer"></div>
          <div class="mrt-train-car" id="trainCar">
            <div class="train-body-top">
              <div class="train-stripe"></div>
              <div class="train-windows-top">
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
              </div>
              <div class="train-windows-bottom">
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
                <div class="train-window-top"></div>
              </div>
              <div class="train-roof-detail">
                <div class="train-ac-top"></div>
                <div class="train-ac-top"></div>
                <div class="train-ac-top"></div>
              </div>
              <div class="train-headlight"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subject Toggle -->
      <div class="mrt-subject-toggle">
        <button class="subject-toggle-btn ${this.currentSubject === 'ela' ? 'active' : ''}" data-subject="ela">
          <span class="subject-icon">📚</span>
          <span>ELA</span>
        </button>
        <button class="subject-toggle-btn ${this.currentSubject === 'math' ? 'active' : ''}" data-subject="math">
          <span class="subject-icon">🔢</span>
          <span>Math</span>
        </button>
      </div>

      <!-- Back Button -->
      <button class="mrt-back-btn" id="mapBackBtn">
        ← Home
      </button>

      <!-- Progress Bar -->
      <div class="map-progress-bar">
        <span class="progress-text">🎯 Progress:</span>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <span class="progress-percent" id="progressPercent">0%</span>
      </div>

      <!-- Legend -->
      <div class="mrt-map-legend" id="mapLegend">
        <div class="legend-title">🗺️ Transit Lines</div>
        <div class="legend-items" id="legendItems"></div>
      </div>

      <!-- Controls -->
      <div class="mrt-map-controls">
        <button class="map-control-btn" id="zoomInBtn" title="Zoom In">+</button>
        <button class="map-control-btn" id="zoomOutBtn" title="Zoom Out">−</button>
        <button class="map-control-btn" id="centerBtn" title="Center Map">⌖</button>
      </div>

      <!-- Station Info Popup -->
      <div class="popup-backdrop" id="popupBackdrop"></div>
      <div class="station-info-popup" id="stationPopup">
        <button class="popup-close" id="popupClose">×</button>
        <div class="popup-header">
          <div class="popup-icon"><span class="popup-icon-inner" id="popupIcon"></span></div>
          <div>
            <div class="popup-title" id="popupTitle"></div>
            <div class="popup-line" id="popupLine"></div>
          </div>
        </div>
        <div class="popup-details" id="popupDetails"></div>
        <div class="popup-actions">
          <button class="popup-action-btn secondary" id="popupCancelBtn">Cancel</button>
          <button class="popup-action-btn primary" id="popupStartBtn">🚀 Let's Go!</button>
        </div>
      </div>
    `;

    this.container.innerHTML = mapHTML;

    // Cache DOM elements
    this.viewportEl = document.getElementById('mapViewport');
    this.contentEl = document.getElementById('mapContent');
    this.tracksSvg = document.getElementById('tracksSvg');
    this.stationsLayer = document.getElementById('stationsLayer');
    this.trainCar = document.getElementById('trainCar');

    // Calculate positions and render
    this.calculateStationPositions();
    this.renderTracks();
    this.renderStations();
    this.renderLegend();
    this.updateProgress();
  },

  /**
   * Calculate station positions using metro map layout algorithm
   * Creates a visually appealing layout with proper spacing
   */
  calculateStationPositions() {
    this.stationPositions = {};
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];
    const lines = Object.keys(lineConfig).filter(l =>
      this.stationsByLine[l] && this.stationsByLine[l].length > 0
    );

    // Layout configuration - generous spacing for readability
    const startX = 180;
    const startY = 140;
    const stationGapX = 140; // Horizontal gap between stations
    const stationGapY = 80;  // Vertical offset for diagonal sections
    const lineGap = 220;     // Vertical gap between lines

    // Different layout patterns for visual interest
    const layoutPatterns = [
      'horizontal',       // Straight horizontal
      'gentle-wave',      // Gentle sine wave
      'diagonal-down',    // Diagonal going down
      'serpentine'        // Back and forth
    ];

    lines.forEach((lineKey, lineIndex) => {
      const stations = this.stationsByLine[lineKey];
      const pattern = layoutPatterns[lineIndex % layoutPatterns.length];
      const baseY = startY + (lineIndex * lineGap);

      stations.forEach((station, stationIndex) => {
        let x, y;

        switch (pattern) {
          case 'horizontal':
            x = startX + (stationIndex * stationGapX);
            y = baseY;
            break;

          case 'gentle-wave':
            x = startX + (stationIndex * stationGapX);
            y = baseY + Math.sin(stationIndex * 0.5) * 25;
            break;

          case 'diagonal-down':
            x = startX + (stationIndex * stationGapX);
            y = baseY + (stationIndex * 18);
            break;

          case 'serpentine':
            // Create a winding path
            const segment = Math.floor(stationIndex / 6);
            const posInSegment = stationIndex % 6;
            const goingRight = segment % 2 === 0;

            if (goingRight) {
              x = startX + (posInSegment * stationGapX) + (segment * 4 * stationGapX);
            } else {
              x = startX + ((5 - posInSegment) * stationGapX) + (segment * 4 * stationGapX);
            }
            y = baseY + (segment * stationGapY);
            break;

          default:
            x = startX + (stationIndex * stationGapX);
            y = baseY;
        }

        this.stationPositions[station.id] = {
          x,
          y,
          lineKey,
          index: stationIndex,
          station
        };
      });
    });

    // Update content area size based on positions
    let maxX = 0, maxY = 0;
    Object.values(this.stationPositions).forEach(pos => {
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    const contentWidth = maxX + 250;
    const contentHeight = maxY + 250;

    this.contentEl.style.minWidth = `${contentWidth}px`;
    this.contentEl.style.minHeight = `${contentHeight}px`;
    this.tracksSvg.setAttribute('width', contentWidth);
    this.tracksSvg.setAttribute('height', contentHeight);
  },

  /**
   * Render track paths as SVG with glow effects
   */
  renderTracks() {
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];

    Object.keys(lineConfig).forEach(lineKey => {
      const stations = this.stationsByLine[lineKey];
      if (!stations || stations.length < 2) return;

      // Build path data with smooth curves
      let pathData = '';
      stations.forEach((station, index) => {
        const pos = this.stationPositions[station.id];
        if (!pos) return;

        if (index === 0) {
          pathData += `M ${pos.x} ${pos.y}`;
        } else {
          const prevPos = this.stationPositions[stations[index - 1].id];
          const dx = pos.x - prevPos.x;
          const dy = pos.y - prevPos.y;

          // Use quadratic curves for smoother paths
          if (Math.abs(dy) > 20) {
            const midX = (prevPos.x + pos.x) / 2;
            pathData += ` Q ${midX} ${prevPos.y}, ${midX} ${(prevPos.y + pos.y) / 2}`;
            pathData += ` T ${pos.x} ${pos.y}`;
          } else {
            pathData += ` L ${pos.x} ${pos.y}`;
          }
        }
      });

      // Create glow path (rendered first, behind main path)
      const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      glowPath.setAttribute('d', pathData);
      glowPath.setAttribute('class', `mrt-track-glow line-${lineKey.toLowerCase()}`);
      this.tracksSvg.appendChild(glowPath);

      // Create main SVG path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', `mrt-track-path line-${lineKey.toLowerCase()}`);
      path.setAttribute('id', `track-${lineKey}`);
      this.tracksSvg.appendChild(path);
    });
  },

  /**
   * Render station nodes with staggered animation
   */
  renderStations() {
    let stationIndex = 0;

    Object.entries(this.stationPositions).forEach(([stationId, pos]) => {
      const { station, lineKey, index } = pos;
      const isCompleted = this.isStationCompleted(stationId);
      const isLocked = this.isStationLocked(stationId, index, this.stationsByLine[lineKey]);
      const isCurrent = this.getCurrentStationId() === stationId;
      const isTerminus = index === 0 || index === this.stationsByLine[lineKey].length - 1;

      const stationEl = document.createElement('div');
      stationEl.className = `mrt-station line-${lineKey.toLowerCase()}`;
      stationEl.dataset.stationId = stationId;

      if (isCompleted) stationEl.classList.add('completed');
      if (isLocked) stationEl.classList.add('locked');
      if (isCurrent) stationEl.classList.add('current');
      if (isTerminus) stationEl.classList.add('terminus');

      stationEl.style.left = `${pos.x}px`;
      stationEl.style.top = `${pos.y}px`;

      // Stagger the entrance animation
      stationEl.style.animationDelay = `${stationIndex * 0.03}s`;

      // Get stars if completed
      let starsHTML = '';
      if (isCompleted) {
        const progress = this.getStationProgress(stationId);
        const starCount = progress?.stars || 0;
        if (starCount > 0) {
          starsHTML = `<div class="station-stars">${'⭐'.repeat(Math.min(starCount, 3))}</div>`;
        }
      }

      stationEl.innerHTML = `
        ${starsHTML}
        <div class="station-node">
          <span class="station-node-icon">${station.icon || '🚇'}</span>
        </div>
        <div class="station-label">${station.name || stationId}</div>
      `;

      stationEl.addEventListener('click', () => {
        if (!isLocked) {
          this.showStationPopup(stationId, station, lineKey);
        } else {
          // Shake animation for locked stations
          stationEl.style.animation = 'none';
          stationEl.offsetHeight; // Trigger reflow
          stationEl.style.animation = 'shake 0.4s ease-in-out';
        }
      });

      this.stationsLayer.appendChild(stationEl);
      stationIndex++;
    });

    // Add shake keyframe if not exists
    if (!document.getElementById('shake-keyframes')) {
      const style = document.createElement('style');
      style.id = 'shake-keyframes';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0); }
          20% { transform: translate(-50%, -50%) rotate(-5deg); }
          40% { transform: translate(-50%, -50%) rotate(5deg); }
          60% { transform: translate(-50%, -50%) rotate(-5deg); }
          80% { transform: translate(-50%, -50%) rotate(5deg); }
        }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * Render line legend
   */
  renderLegend() {
    const legendItems = document.getElementById('legendItems');
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];

    legendItems.innerHTML = '';

    Object.entries(lineConfig).forEach(([lineKey, config]) => {
      const stations = this.stationsByLine[lineKey] || [];
      if (stations.length === 0) return;

      const completedCount = stations.filter(s => this.isStationCompleted(s.id)).length;

      const item = document.createElement('div');
      item.className = `legend-item line-${lineKey.toLowerCase()}`;
      item.innerHTML = `
        <div class="legend-line-color"></div>
        <div class="legend-line-name">${config.icon} ${config.name}</div>
        <div class="legend-station-count">${completedCount}/${stations.length}</div>
      `;

      item.addEventListener('click', () => {
        this.focusOnLine(lineKey);
      });

      legendItems.appendChild(item);
    });
  },

  /**
   * Update progress bar with animation
   */
  updateProgress() {
    let totalStations = 0;
    let completedStations = 0;

    Object.values(this.stationsByLine).forEach(stations => {
      totalStations += stations.length;
      completedStations += stations.filter(s => this.isStationCompleted(s.id)).length;
    });

    const percent = totalStations > 0 ? Math.round((completedStations / totalStations) * 100) : 0;

    const fillEl = document.getElementById('progressFill');
    const percentEl = document.getElementById('progressPercent');

    if (fillEl) {
      fillEl.style.width = `${percent}%`;
    }
    if (percentEl) {
      percentEl.textContent = `${percent}%`;
      // Color based on progress
      if (percent === 100) {
        percentEl.style.color = '#FFD700';
        percentEl.textContent = '🎉 100%';
      } else if (percent >= 75) {
        percentEl.style.color = '#4ECDC4';
      } else if (percent >= 50) {
        percentEl.style.color = '#44A08D';
      } else {
        percentEl.style.color = '#2ECC71';
      }
    }
  },

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Pan/drag with mouse
    this.container.addEventListener('mousedown', (e) => this.startDrag(e));
    this.container.addEventListener('mousemove', (e) => this.drag(e));
    this.container.addEventListener('mouseup', () => this.endDrag());
    this.container.addEventListener('mouseleave', () => this.endDrag());

    // Touch events for mobile
    this.container.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    this.container.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
    this.container.addEventListener('touchend', () => this.endDrag());
    this.container.addEventListener('touchcancel', () => this.endDrag());

    // Mouse wheel zoom
    this.container.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });

    // Subject toggle
    document.querySelectorAll('.subject-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subject = btn.dataset.subject;
        if (subject !== this.currentSubject) {
          this.switchSubject(subject);
        }
      });
    });

    // Controls
    document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoom(1.25));
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoom(0.8));
    document.getElementById('centerBtn')?.addEventListener('click', () => this.centerOnFirstStation());

    // Back button
    document.getElementById('mapBackBtn')?.addEventListener('click', () => {
      if (typeof goToScreen === 'function') {
        goToScreen('welcomeScreen');
      }
    });

    // Popup controls
    document.getElementById('popupClose')?.addEventListener('click', () => this.hideStationPopup());
    document.getElementById('popupBackdrop')?.addEventListener('click', () => this.hideStationPopup());
    document.getElementById('popupCancelBtn')?.addEventListener('click', () => this.hideStationPopup());
    document.getElementById('popupStartBtn')?.addEventListener('click', () => this.startSelectedStation());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideStationPopup();
      }
    });
  },

  /**
   * Start dragging
   */
  startDrag(e) {
    if (e.target.closest('.mrt-station') || e.target.closest('button')) return;

    const point = e.touches ? e.touches[0] : e;
    this.viewport.isDragging = true;
    this.viewport.startX = point.clientX - this.viewport.x;
    this.viewport.startY = point.clientY - this.viewport.y;
    this.viewport.lastX = point.clientX;
    this.viewport.lastY = point.clientY;
    this.viewport.velocityX = 0;
    this.viewport.velocityY = 0;
    this.viewport.lastTime = Date.now();

    if (this.viewport.momentumId) {
      cancelAnimationFrame(this.viewport.momentumId);
      this.viewport.momentumId = null;
    }

    this.viewportEl.classList.add('dragging');
    this.viewportEl.classList.remove('animating');
  },

  /**
   * Handle dragging
   */
  drag(e) {
    if (!this.viewport.isDragging) return;

    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const now = Date.now();
    const dt = Math.max(now - this.viewport.lastTime, 1);

    const newX = point.clientX - this.viewport.startX;
    const newY = point.clientY - this.viewport.startY;

    // Calculate velocity with time-based smoothing
    this.viewport.velocityX = (point.clientX - this.viewport.lastX) / dt * 16;
    this.viewport.velocityY = (point.clientY - this.viewport.lastY) / dt * 16;

    this.viewport.lastX = point.clientX;
    this.viewport.lastY = point.clientY;
    this.viewport.lastTime = now;

    this.setViewportPosition(newX, newY);
  },

  /**
   * End dragging with momentum
   */
  endDrag() {
    if (!this.viewport.isDragging) return;

    this.viewport.isDragging = false;
    this.viewportEl.classList.remove('dragging');

    // Apply momentum with deceleration
    const friction = 0.92;
    const minVelocity = 0.3;

    const applyMomentum = () => {
      if (Math.abs(this.viewport.velocityX) > minVelocity || Math.abs(this.viewport.velocityY) > minVelocity) {
        this.viewport.x += this.viewport.velocityX;
        this.viewport.y += this.viewport.velocityY;
        this.viewport.velocityX *= friction;
        this.viewport.velocityY *= friction;

        this.constrainViewport();
        this.applyViewportTransform();

        this.viewport.momentumId = requestAnimationFrame(applyMomentum);
      }
    };

    if (Math.abs(this.viewport.velocityX) > 1 || Math.abs(this.viewport.velocityY) > 1) {
      applyMomentum();
    }
  },

  /**
   * Set viewport position
   */
  setViewportPosition(x, y) {
    this.viewport.x = x;
    this.viewport.y = y;
    this.constrainViewport();
    this.applyViewportTransform();
  },

  /**
   * Constrain viewport to content bounds with padding
   */
  constrainViewport() {
    const containerRect = this.container.getBoundingClientRect();
    const contentWidth = this.contentEl.scrollWidth * this.viewport.scale;
    const contentHeight = this.contentEl.scrollHeight * this.viewport.scale;

    const padding = 100;
    const maxX = padding;
    const minX = Math.min(padding, containerRect.width - contentWidth - padding);
    const maxY = padding;
    const minY = Math.min(padding, containerRect.height - contentHeight - padding);

    this.viewport.x = Math.max(minX, Math.min(maxX, this.viewport.x));
    this.viewport.y = Math.max(minY, Math.min(maxY, this.viewport.y));
  },

  /**
   * Apply viewport transform
   */
  applyViewportTransform() {
    this.viewportEl.style.transform = `translate(${this.viewport.x}px, ${this.viewport.y}px) scale(${this.viewport.scale})`;
  },

  /**
   * Handle zoom with mouse wheel
   */
  handleZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom(delta, e.clientX, e.clientY);
  },

  /**
   * Zoom in/out with optional focal point
   */
  zoom(factor, centerX, centerY) {
    const newScale = Math.max(0.4, Math.min(2.5, this.viewport.scale * factor));

    if (centerX !== undefined && centerY !== undefined) {
      const containerRect = this.container.getBoundingClientRect();
      const mouseX = centerX - containerRect.left;
      const mouseY = centerY - containerRect.top;

      const scaleChange = newScale / this.viewport.scale;
      this.viewport.x = mouseX - scaleChange * (mouseX - this.viewport.x);
      this.viewport.y = mouseY - scaleChange * (mouseY - this.viewport.y);
    }

    this.viewport.scale = newScale;
    this.constrainViewport();
    this.applyViewportTransform();
  },

  /**
   * Center map on first available station
   */
  centerOnFirstStation() {
    const firstLine = Object.keys(this.stationsByLine).find(l => this.stationsByLine[l]?.length > 0);
    if (!firstLine) return;

    // Find current station or first station
    const currentId = this.getCurrentStationId();
    let targetStation = null;

    if (currentId && this.stationPositions[currentId]) {
      targetStation = { id: currentId };
    } else {
      // Find first incomplete station
      for (const lineKey of Object.keys(this.stationsByLine)) {
        const stations = this.stationsByLine[lineKey];
        for (const station of stations) {
          if (!this.isStationCompleted(station.id)) {
            targetStation = station;
            break;
          }
        }
        if (targetStation) break;
      }
      // Fall back to first station
      if (!targetStation) {
        targetStation = this.stationsByLine[firstLine][0];
      }
    }

    if (targetStation) {
      this.centerOnStation(targetStation.id);
    }
  },

  /**
   * Center map on a specific station with smooth animation
   */
  centerOnStation(stationId) {
    const pos = this.stationPositions[stationId];
    if (!pos) return;

    const containerRect = this.container.getBoundingClientRect();
    const targetX = (containerRect.width / 2) - (pos.x * this.viewport.scale);
    const targetY = (containerRect.height / 2) - (pos.y * this.viewport.scale);

    this.viewportEl.classList.add('animating');
    this.setViewportPosition(targetX, targetY);

    setTimeout(() => {
      this.viewportEl.classList.remove('animating');
    }, 600);
  },

  /**
   * Focus on a specific line
   */
  focusOnLine(lineKey) {
    const stations = this.stationsByLine[lineKey];
    if (!stations || stations.length === 0) return;

    // Find center of line
    let sumX = 0, sumY = 0, count = 0;
    stations.forEach(s => {
      const pos = this.stationPositions[s.id];
      if (pos) {
        sumX += pos.x;
        sumY += pos.y;
        count++;
      }
    });

    if (count === 0) return;

    const centerX = sumX / count;
    const centerY = sumY / count;

    const containerRect = this.container.getBoundingClientRect();
    const targetX = (containerRect.width / 2) - (centerX * this.viewport.scale);
    const targetY = (containerRect.height / 2) - (centerY * this.viewport.scale);

    this.viewportEl.classList.add('animating');
    this.setViewportPosition(targetX, targetY);

    setTimeout(() => {
      this.viewportEl.classList.remove('animating');
    }, 600);

    // Highlight legend item
    document.querySelectorAll('.legend-item').forEach(item => {
      item.classList.toggle('active', item.classList.contains(`line-${lineKey.toLowerCase()}`));
    });
  },

  /**
   * Show station popup with animation
   */
  showStationPopup(stationId, station, lineKey) {
    this.selectedStation = { id: stationId, station, lineKey };

    const lineConfig = this.LINE_CONFIGS[this.currentSubject][lineKey];
    const pageCount = station.pages?.length || 0;
    const estimatedTime = Math.max(1, Math.ceil(pageCount * 0.5));
    const skillCount = station.checklistTargets?.length || 0;

    document.getElementById('popupIcon').textContent = station.icon || '🚇';
    document.getElementById('popupTitle').textContent = station.name || stationId;
    document.getElementById('popupLine').textContent = `${lineConfig.icon} ${lineConfig.name}`;
    document.getElementById('popupLine').style.color = lineConfig.color;

    const popup = document.getElementById('stationPopup');
    popup.style.color = lineConfig.color;

    document.getElementById('popupDetails').innerHTML = `
      <div class="popup-badge">📄 ${pageCount} pages</div>
      <div class="popup-badge">⏱️ ~${estimatedTime} min</div>
      ${skillCount > 0 ? `<div class="popup-badge">🎯 ${skillCount} skills</div>` : ''}
    `;

    document.getElementById('popupBackdrop').classList.add('visible');
    popup.classList.add('visible');

    // Center on this station
    this.centerOnStation(stationId);
  },

  /**
   * Hide station popup
   */
  hideStationPopup() {
    document.getElementById('popupBackdrop').classList.remove('visible');
    document.getElementById('stationPopup').classList.remove('visible');
    this.selectedStation = null;
  },

  /**
   * Start the selected station with train animation
   */
  async startSelectedStation() {
    if (!this.selectedStation) return;

    const { id: stationId, lineKey } = this.selectedStation;
    this.hideStationPopup();

    // Animate train to station
    await this.animateTrainToStation(stationId, lineKey);

    // Start the lesson
    if (typeof selectStation === 'function') {
      selectStation(stationId);
    }
  },

  /**
   * Animate train traveling to a station with smooth movement
   */
  async animateTrainToStation(targetStationId, lineKey) {
    return new Promise((resolve) => {
      const targetPos = this.stationPositions[targetStationId];
      if (!targetPos) {
        resolve();
        return;
      }

      const lineConfig = this.LINE_CONFIGS[this.currentSubject][lineKey];
      const stations = this.stationsByLine[lineKey];
      const targetIndex = targetPos.index;

      // Find starting position
      const startIndex = 0;
      const startStation = stations[startIndex];
      const startPos = this.stationPositions[startStation.id];

      // Show train with line color
      this.trainCar.style.color = lineConfig.color;
      this.trainCar.classList.add('visible', 'traveling');

      // Collect all positions to travel through
      const waypoints = [];
      for (let i = startIndex; i <= targetIndex; i++) {
        const pos = this.stationPositions[stations[i].id];
        if (pos) waypoints.push({ x: pos.x, y: pos.y });
      }

      if (waypoints.length === 0) {
        this.trainCar.classList.remove('visible', 'traveling');
        resolve();
        return;
      }

      // Animate through waypoints smoothly
      let currentWaypoint = 0;
      const baseDuration = 250; // ms per station
      let lastAngle = 0;

      const animateStep = () => {
        if (currentWaypoint >= waypoints.length) {
          // Arrival animation
          this.trainCar.classList.remove('traveling');
          this.trainCar.style.transition = 'transform 0.3s ease-out';

          setTimeout(() => {
            this.trainCar.classList.remove('visible');
            this.trainCar.style.transition = '';
            resolve();
          }, 600);
          return;
        }

        const wp = waypoints[currentWaypoint];
        const prevWp = currentWaypoint > 0 ? waypoints[currentWaypoint - 1] : wp;

        // Calculate rotation angle for train direction
        const dx = wp.x - prevWp.x;
        const dy = wp.y - prevWp.y;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Smooth angle transition
        if (currentWaypoint > 0) {
          const angleDiff = angle - lastAngle;
          if (angleDiff > 180) angle -= 360;
          if (angleDiff < -180) angle += 360;
        }
        lastAngle = angle;

        // Position train with rotation
        this.trainCar.style.left = `${wp.x}px`;
        this.trainCar.style.top = `${wp.y}px`;
        this.trainCar.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

        currentWaypoint++;

        // Variable speed - slower at start and end
        let duration = baseDuration;
        if (currentWaypoint <= 2 || currentWaypoint >= waypoints.length - 1) {
          duration = baseDuration * 1.5;
        }

        setTimeout(animateStep, duration);
      };

      // Start animation
      animateStep();

      // Also center view on target
      setTimeout(() => {
        this.centerOnStation(targetStationId);
      }, 200);
    });
  },

  /**
   * Switch subject (ELA/Math) with transition
   */
  async switchSubject(subject) {
    this.currentSubject = subject;

    // Update toggle buttons
    document.querySelectorAll('.subject-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subject === subject);
    });

    // Reset viewport
    this.viewport.x = 0;
    this.viewport.y = 0;
    this.viewport.scale = 1;

    // Reload and rebuild with animation
    this.showLoading();
    await this.loadContentPack();
    this.buildMap();
    this.setupEventListeners();
    this.hideLoading();

    setTimeout(() => {
      this.centerOnFirstStation();
    }, 300);
  },

  // ===== Helper functions =====

  isStationCompleted(stationId) {
    if (typeof state !== 'undefined' && state.completedStations) {
      return state.completedStations.includes(stationId);
    }
    try {
      const saved = localStorage.getItem('appState');
      if (saved) {
        const savedState = JSON.parse(saved);
        return (savedState.completedStations || []).includes(stationId);
      }
    } catch (e) { /* ignore */ }
    return false;
  },

  isStationLocked(stationId, index, stations) {
    if (typeof state !== 'undefined' && state.unlockAllStations) return false;
    if (index === 0) return false;
    if (index > 0) {
      const prevStation = stations[index - 1];
      return !this.isStationCompleted(prevStation.id);
    }
    return false;
  },

  getCurrentStationId() {
    if (typeof state !== 'undefined' && state.currentStation) {
      return state.currentStation;
    }
    try {
      const saved = localStorage.getItem('appState');
      if (saved) {
        const savedState = JSON.parse(saved);
        return savedState.currentStation || null;
      }
    } catch (e) { /* ignore */ }
    return null;
  },

  getStationProgress(stationId) {
    if (typeof getStationProgress === 'function') {
      return getStationProgress(stationId);
    }
    return null;
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.mrtMap = mrtMap;
}

// Auto-initialize when appropriate container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mrtMapContainer');
  if (container) {
    // Initialize when stationSelectScreen becomes active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const screen = document.getElementById('stationSelectScreen');
          if (screen && screen.classList.contains('active') && !mrtMap.initialized) {
            mrtMap.initialized = true;
            setTimeout(() => mrtMap.init(), 100);
          }
        }
      });
    });

    const screen = document.getElementById('stationSelectScreen');
    if (screen) {
      observer.observe(screen, { attributes: true });

      // Also init immediately if screen is already active
      if (screen.classList.contains('active')) {
        mrtMap.init();
      }
    }

    // Provide manual init trigger for compatibility
    window.initMrtMap = () => {
      if (!mrtMap.initialized) {
        mrtMap.initialized = true;
        mrtMap.init();
      }
    };
  }
});
