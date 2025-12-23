# Animation Usage Examples

## How to Use the New Animations

### 1. Train Speed Variations

To make the train accelerate when starting a journey:
```javascript
const rideScreen = document.querySelector('.mrt-ride-screen');
rideScreen.classList.add('accelerating');

// After 2 seconds, switch to normal speed
setTimeout(() => {
  rideScreen.classList.remove('accelerating');
}, 2000);
```

To make the train decelerate when approaching a station:
```javascript
rideScreen.classList.add('decelerating');

// Remove after arriving
setTimeout(() => {
  rideScreen.classList.remove('decelerating');
}, 3000);
```

### 2. Window Reflections

Window reflections are automatic! They continuously animate on:
- `.car-window::after`
- `.head-window::after`  
- `.mrt-window::after`

No JavaScript needed - they run automatically with a 4-second cycle.

### 3. Elevator Floor Changes

To animate floor number changes:
```javascript
const floorDisplay = document.querySelector('.floor-display');

// Add flip animation
floorDisplay.style.animation = 'floorDigitFlip 0.4s ease-in-out';

// Update the number mid-flip
setTimeout(() => {
  floorDisplay.textContent = newFloorNumber;
}, 200);

// Clear animation after completion
setTimeout(() => {
  floorDisplay.style.animation = '';
}, 400);
```

### 4. Elevator Light Streaks

Light streaks activate automatically when the elevator is moving:
```javascript
const elevatorShaft = document.querySelector('.elevator-shaft');

// Start moving
elevatorShaft.classList.add('elevator-moving');

// Stop after arrival (3.5 seconds typical)
setTimeout(() => {
  elevatorShaft.classList.remove('elevator-moving');
}, 3500);
```

### 5. Elevator Arrival Effects

Combine multiple effects for a satisfying arrival:
```javascript
const elevatorShaft = document.querySelector('.elevator-shaft');
const floorDisplay = document.querySelector('.floor-display');

// Remove moving state
elevatorShaft.classList.remove('elevator-moving');

// Add arrival hop
elevatorShaft.classList.add('arrived');

// Add floor pulse and chime
floorDisplay.classList.add('floor-pulse', 'chime');

// Add ding pulse (visual)
floorDisplay.style.animation = 'dingPulseEnhanced 0.8s ease-out';

// Clean up after animations
setTimeout(() => {
  elevatorShaft.classList.remove('arrived');
  floorDisplay.classList.remove('floor-pulse', 'chime');
  floorDisplay.style.animation = '';
}, 1000);
```

### 6. Screen Transitions

For smooth page transitions:
```javascript
// Transition out current screen
currentScreen.classList.add('transitioning-out');

setTimeout(() => {
  currentScreen.classList.remove('active');
  currentScreen.classList.remove('transitioning-out');
  
  // Transition in new screen
  newScreen.classList.add('active', 'transitioning-in');
  
  setTimeout(() => {
    newScreen.classList.remove('transitioning-in');
  }, 400);
}, 400);
```

### 7. Station to Lesson Transition

```javascript
const mapScreen = document.querySelector('.map-screen');
const lessonScreen = document.querySelector('.lesson-screen');

// Animate transition
mapScreen.style.animation = 'stationToLesson 0.8s ease-in-out';

setTimeout(() => {
  mapScreen.classList.remove('active');
  lessonScreen.classList.add('active');
  mapScreen.style.animation = '';
}, 800);
```

### 8. Read to Question Page Flip

```javascript
const readPage = document.querySelector('.read-page');
const questionPage = document.querySelector('.question-page');

// 3D page flip
readPage.style.animation = 'pageFlip 0.6s ease-in-out';

setTimeout(() => {
  readPage.classList.remove('active');
  questionPage.classList.add('active');
  readPage.style.animation = '';
}, 600);
```

### 9. Correct Answer Celebration

The success ripple is already applied via CSS:
```css
.answer-btn.correct {
  animation: correct-celebrate 0.6s var(--ease-bounce), 
             celebrationBurst 0.8s ease-out, 
             successRipple 0.6s ease-out;
}
```

Just add the class:
```javascript
answerButton.classList.add('correct');
```

### 10. Lesson Completion

```javascript
const lessonScreen = document.querySelector('.lesson-screen');

// Start completion animation
lessonScreen.classList.add('completing');

// Return to map after animation
setTimeout(() => {
  lessonScreen.classList.remove('active', 'completing');
  mapScreen.classList.add('active');
}, 600);
```

### 11. Interactive Element Hover Glow

Automatic on hover for:
```css
.station-btn:hover,
.answer-btn:hover,
.big-btn:hover {
  animation: pulseGlow 1.5s ease-in-out infinite;
}
```

### 12. Confetti Burst (Optional)

Create confetti elements dynamically:
```javascript
function createConfetti() {
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animation = 'confettiBurst 2s ease-out forwards';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 2000);
  }
}
```

---

## Performance Tips

1. **Remove animation classes after completion** to prevent memory leaks
2. **Use CSS transitions for simple states** (hover, focus)
3. **Reserve JavaScript animations for complex sequences**
4. **Test on mobile devices** to ensure 60fps performance
5. **Use Chrome DevTools Performance tab** to identify bottlenecks

---

## Browser Testing Checklist

- [ ] Chrome/Edge (Chromium) - Test GPU acceleration
- [ ] Firefox - Test transform smoothness  
- [ ] Safari (iOS) - Test WebKit prefixes
- [ ] Mobile Safari - Test 60fps performance
- [ ] Chrome Android - Test parallax smoothness

---

## Debugging Animations

View active animations in Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Animations" tab
3. Trigger animation
4. Inspect timing, easing, and performance

Check GPU acceleration:
1. Open DevTools > More tools > Rendering
2. Enable "Paint flashing" 
3. Ensure animated elements don't cause full repaints

