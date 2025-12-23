/**
 * 3D SHAPE DRAG ROTATION ENHANCEMENT
 * Add-on for manim-animations.js
 * Provides interactive drag-to-rotate for 3D shapes
 */

/**
 * Add drag-to-rotate interaction for 3D shapes
 * Supports both mouse (desktop) and touch (mobile)
 */
ManimEngine.addDragRotation = function(shapeEl, shapeType) {
  if (!shapeEl) return;

  // State for tracking rotation
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentRotationX = shapeType === 'cube' ? -20 : 0;
  let currentRotationY = 0;
  let animationPaused = false;

  // Mouse/Touch event handlers
  const startDrag = (e) => {
    isDragging = true;

    // Pause auto-rotation animation
    if (!animationPaused) {
      shapeEl.classList.add('dragging');
      animationPaused = true;
    }

    // Get starting position (works for both mouse and touch)
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    // Prevent text selection while dragging
    e.preventDefault();
  };

  const drag = (e) => {
    if (!isDragging) return;

    // Get current position (works for both mouse and touch)
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    // Calculate rotation based on drag distance
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Update rotation (adjust sensitivity for child-friendly interaction)
    const rotationY = currentRotationY + (deltaX * 0.5);
    const rotationX = currentRotationX - (deltaY * 0.5);

    // Apply rotation based on shape type
    if (shapeType === 'cube') {
      shapeEl.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    } else if (shapeType === 'sphere') {
      shapeEl.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    } else if (shapeType === 'cylinder') {
      shapeEl.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    } else if (shapeType === 'cone') {
      shapeEl.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
    }
  };

  const endDrag = (e) => {
    if (!isDragging) return;

    isDragging = false;

    // Update stored rotation values
    const clientX = e.type.includes('touch') ?
      (e.changedTouches ? e.changedTouches[0].clientX : startX) :
      e.clientX;
    const clientY = e.type.includes('touch') ?
      (e.changedTouches ? e.changedTouches[0].clientY : startY) :
      e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    currentRotationY += deltaX * 0.5;
    currentRotationX -= deltaY * 0.5;

    // Resume auto-rotation after a delay
    setTimeout(() => {
      shapeEl.classList.remove('dragging');
      animationPaused = false;

      // For cube, smoothly transition back to animated rotation
      if (shapeType === 'cube') {
        // Keep the current Y rotation and let animation continue from there
        shapeEl.style.transform = '';
      }
    }, 1500);
  };

  // Add mouse event listeners
  shapeEl.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);

  // Add touch event listeners for mobile
  shapeEl.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
  document.addEventListener('touchcancel', endDrag);

  // Make shape appear interactive
  shapeEl.style.cursor = 'grab';

  const setCursorGrabbing = () => {
    shapeEl.style.cursor = 'grabbing';
  };

  const setCursorGrab = () => {
    shapeEl.style.cursor = 'grab';
  };

  shapeEl.addEventListener('mousedown', setCursorGrabbing);
  shapeEl.addEventListener('mouseup', setCursorGrab);
  shapeEl.addEventListener('touchstart', setCursorGrabbing);
  shapeEl.addEventListener('touchend', setCursorGrab);

  // Store cleanup function for later if needed
  shapeEl._cleanupDragRotation = () => {
    shapeEl.removeEventListener('mousedown', startDrag);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    shapeEl.removeEventListener('touchstart', startDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);
    shapeEl.removeEventListener('mousedown', setCursorGrabbing);
    shapeEl.removeEventListener('mouseup', setCursorGrab);
    shapeEl.removeEventListener('touchstart', setCursorGrabbing);
    shapeEl.removeEventListener('touchend', setCursorGrab);
  };
};

/**
 * Enhanced render3DShape - replaces original with drag rotation support
 */
ManimEngine.render3DShapeEnhanced = function(container, data = {}) {
  if (!container) {
    console.error('ManimEngine.render3DShape: container is required');
    return null;
  }

  const { shape = 'cube', showFaces = true, autoRotate = true } = data;

  const stage = this.createStage();
  const container3d = document.createElement('div');
  container3d.className = 'manim-3d-container';

  let shapeEl;

  if (shape === 'cube') {
    shapeEl = document.createElement('div');
    shapeEl.className = 'manim-cube';
    if (!autoRotate) shapeEl.classList.add('paused');

    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const labels = showFaces ? ['1', '2', '3', '4', '5', '6'] : ['', '', '', '', '', ''];

    faces.forEach((face, idx) => {
      const faceEl = document.createElement('div');
      faceEl.className = `manim-cube-face ${face}`;
      faceEl.textContent = labels[idx];
      shapeEl.appendChild(faceEl);
    });
  } else if (shape === 'sphere') {
    shapeEl = document.createElement('div');
    shapeEl.className = 'manim-sphere';
  } else if (shape === 'cylinder') {
    shapeEl = document.createElement('div');
    shapeEl.className = 'manim-cylinder';
  } else if (shape === 'cone') {
    shapeEl = document.createElement('div');
    shapeEl.className = 'manim-cone';
  }

  container3d.appendChild(shapeEl);
  stage.appendChild(container3d);
  container.appendChild(stage);

  // Add interactive drag-to-rotate functionality
  if (autoRotate) {
    this.addDragRotation(shapeEl, shape);
  }

  return stage;
};

// Replace original render3DShape with enhanced version
ManimEngine.render3DShape = ManimEngine.render3DShapeEnhanced;
