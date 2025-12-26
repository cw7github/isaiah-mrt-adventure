/**
 * MRT Map Network - Storybook Transit with Expanded Spacing
 * Features: Generous station spacing, artistic track layouts, themed networks
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

  // Line configurations with rich colors
  LINE_CONFIGS: {
    ela: {
      RF: { name: 'Reading Foundations', shortName: 'RF', color: '#C94C4C', icon: '📖' },
      RL: { name: 'Reading Literature', shortName: 'RL', color: '#2E7D32', icon: '📚' },
      RI: { name: 'Reading Info', shortName: 'RI', color: '#4A6FA5', icon: '📰' },
      L: { name: 'Language', shortName: 'L', color: '#7B4B94', icon: '✏️' },
      Review: { name: 'Review', shortName: 'REV', color: '#D4A373', icon: '⭐' }
    },
    math: {
      OA: { name: 'Operations', shortName: 'OA', color: '#E85D4C', icon: '➕' },
      NBT: { name: 'Numbers', shortName: 'NBT', color: '#2196F3', icon: '🔢' },
      MD: { name: 'Measurement', shortName: 'MD', color: '#00ACC1', icon: '📏' },
      G: { name: 'Geometry', shortName: 'G', color: '#9C27B0', icon: '🔷' },
      Review: { name: 'Review', shortName: 'REV', color: '#D4A373', icon: '⭐' }
    }
  },

  // EXPANDED Layout configuration - much more generous spacing
  LAYOUT: {
    startX: 280,
    startY: 220,
    stationGapX: 260,      // Much larger horizontal gap
    stationGapY: 140,      // Larger vertical offset for curves
    lineGap: 320,          // Much larger gap between lines
    curveTension: 0.4,     // For Bezier curves
    waveAmplitude: 45,     // For wave patterns
    serpentineWidth: 5     // Stations per serpentine segment
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
    console.log('🚇 MRT Map initializing with expanded layout...');
    this.container = document.getElementById('mrtMapContainer');
    if (!this.container) {
      console.error('MRT Map container not found');
      return;
    }

    // Set subject attribute for CSS theming
    this.container.setAttribute('data-subject', this.currentSubject);

    this.showLoading();
    await this.loadContentPack();
    this.buildMap();
    this.setupEventListeners();
    this.hideLoading();

    // Delay centering to allow animations to complete
    setTimeout(() => {
      this.centerOnFirstStation();
    }, 400);
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
      setTimeout(() => loading.remove(), 400);
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

      const pack = await response.json();

      // Validate content pack structure (needed for lesson engine integration)
      if (!pack || typeof pack !== 'object') {
        throw new Error('Invalid content pack: not an object');
      }
      if (!pack.stations || typeof pack.stations !== 'object') {
        throw new Error('Invalid content pack: missing or invalid stations');
      }
      if (!Array.isArray(pack.stationOrder)) {
        throw new Error('Invalid content pack: missing or invalid stationOrder');
      }

      this.contentPack = pack;
      this.organizeStationsByLine();

      // INTEGRATION: Populate global stationContent so the existing lesson engine can render stations.
      // Without this, selectStation(stationId) fails because stationContent[stationId] is undefined.
      if (typeof stationContent !== 'undefined' && this.contentPack && this.contentPack.stations) {
        Object.assign(stationContent, this.contentPack.stations);
      }

      console.log('📦 Content loaded:', Object.keys(this.stationsByLine));
    } catch (error) {
      console.error('Error loading content pack:', error);
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
        let lineKey = station.line.toUpperCase();
        // Map L-G, L-V to L
        if (lineKey === 'L-G' || lineKey === 'L-V') lineKey = 'L';

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
   * Calculate station positions using artistic metro map layout
   * Creates beautiful, readable layouts with generous spacing
   */
  calculateStationPositions() {
    this.stationPositions = {};
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];
    const lines = Object.keys(lineConfig).filter(l =>
      this.stationsByLine[l] && this.stationsByLine[l].length > 0
    );

    const { startX, startY, stationGapX, stationGapY, lineGap, waveAmplitude, serpentineWidth } = this.LAYOUT;

    // Artistic layout patterns for each line - creates visual variety
    const layoutPatterns = [
      'flowing-river',     // Gentle S-curve like a river
      'gentle-hills',      // Rolling hills pattern
      'story-arc',         // Rises and falls like a narrative
      'stepping-stones',   // Diagonal steps
      'serpentine-path'    // Back and forth winding
    ];

    lines.forEach((lineKey, lineIndex) => {
      const stations = this.stationsByLine[lineKey];
      const pattern = layoutPatterns[lineIndex % layoutPatterns.length];
      const baseY = startY + (lineIndex * lineGap);
      const stationCount = stations.length;

      stations.forEach((station, stationIndex) => {
        let x, y;
        const t = stationIndex / Math.max(1, stationCount - 1); // Normalized position 0-1

        switch (pattern) {
          case 'flowing-river':
            // Smooth S-curve like a meandering river
            x = startX + (stationIndex * stationGapX);
            y = baseY + Math.sin(t * Math.PI * 2.5) * waveAmplitude;
            break;

          case 'gentle-hills':
            // Rolling hills - multiple gentle waves
            x = startX + (stationIndex * stationGapX);
            y = baseY + Math.sin(t * Math.PI * 4) * (waveAmplitude * 0.6);
            break;

          case 'story-arc':
            // Rises then falls like a story arc
            x = startX + (stationIndex * stationGapX);
            y = baseY - Math.sin(t * Math.PI) * waveAmplitude * 1.2;
            break;

          case 'stepping-stones':
            // Diagonal stepping pattern with plateaus
            x = startX + (stationIndex * stationGapX);
            const step = Math.floor(stationIndex / 3);
            y = baseY + (step * stationGapY * 0.4);
            break;

          case 'serpentine-path':
            // Winding back and forth path
            const segment = Math.floor(stationIndex / serpentineWidth);
            const posInSegment = stationIndex % serpentineWidth;
            const goingRight = segment % 2 === 0;

            if (goingRight) {
              x = startX + (posInSegment * stationGapX) + (segment * 2 * stationGapX);
            } else {
              x = startX + ((serpentineWidth - 1 - posInSegment) * stationGapX) + (segment * 2 * stationGapX);
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

    // Update content area size based on positions - add generous padding
    let maxX = 0, maxY = 0;
    Object.values(this.stationPositions).forEach(pos => {
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    const contentWidth = maxX + 400;
    const contentHeight = maxY + 400;

    this.contentEl.style.minWidth = `${contentWidth}px`;
    this.contentEl.style.minHeight = `${contentHeight}px`;
    this.tracksSvg.setAttribute('width', contentWidth);
    this.tracksSvg.setAttribute('height', contentHeight);
  },

  /**
   * Render track paths as SVG with artistic Bezier curves
   */
  renderTracks() {
    const lineConfig = this.LINE_CONFIGS[this.currentSubject];

    Object.keys(lineConfig).forEach(lineKey => {
      const stations = this.stationsByLine[lineKey];
      if (!stations || stations.length < 2) return;

      // Build smooth path using Catmull-Rom to Bezier conversion
      const points = stations.map(s => this.stationPositions[s.id]).filter(Boolean);
      if (points.length < 2) return;

      const pathData = this.createSmoothPath(points);

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
   * Create smooth path using Catmull-Rom splines converted to Bezier
   */
  createSmoothPath(points) {
    if (points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Catmull-Rom to Bezier conversion
      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  },

  /**
   * Render station nodes with staggered animation
   */
  renderStations() {
    if (!this.stationsLayer) return;
    this.stationsLayer.innerHTML = '';
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
      stationEl.style.animationDelay = `${stationIndex * 0.04}s`;

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
          20% { transform: translate(-50%, -50%) rotate(-5deg) translateX(-3px); }
          40% { transform: translate(-50%, -50%) rotate(5deg) translateX(3px); }
          60% { transform: translate(-50%, -50%) rotate(-5deg) translateX(-3px); }
          80% { transform: translate(-50%, -50%) rotate(5deg) translateX(3px); }
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
      if (percent === 100) {
        percentEl.textContent = '🎉 100%';
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
    document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoom(1.3));
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoom(0.75));
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
    const friction = 0.93;
    const minVelocity = 0.25;

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
   * Constrain viewport to content bounds with generous padding
   */
  constrainViewport() {
    const containerRect = this.container.getBoundingClientRect();
    const contentWidth = this.contentEl.scrollWidth * this.viewport.scale;
    const contentHeight = this.contentEl.scrollHeight * this.viewport.scale;

    const padding = 150;
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
    const newScale = Math.max(0.35, Math.min(2.8, this.viewport.scale * factor));

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

    // Find current station or first incomplete station
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
    }, 700);
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
    }, 700);

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
      // Defensive: ensure the lesson engine has this station definition (can be missing on first load).
      if (
        typeof stationContent !== 'undefined' &&
        (!stationContent || !stationContent[stationId]) &&
        this.contentPack &&
        this.contentPack.stations
      ) {
        Object.assign(stationContent, this.contentPack.stations);
      }

      // Defensive: if a prior failed transition left the global lock on, clear it before starting.
      if (typeof clearStationTransitionState === 'function') {
        clearStationTransitionState();
      }

      try {
        selectStation(stationId);
      } catch (err) {
        console.error('Failed to start station from MRT map:', err);
        if (typeof clearStationTransitionState === 'function') {
          clearStationTransitionState();
        }
      }
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
      const baseDuration = 200; // ms per station
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
          }, 700);
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
          duration = baseDuration * 1.4;
        }

        setTimeout(animateStep, duration);
      };

      // Start animation
      animateStep();

      // Also center view on target
      setTimeout(() => {
        this.centerOnStation(targetStationId);
      }, 250);
    });
  },

  /**
   * Switch subject (ELA/Math) with transition
   */
  async switchSubject(subject) {
    this.currentSubject = subject;

    // Update subject attribute for CSS theming
    this.container.setAttribute('data-subject', subject);

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
    }, 400);
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
