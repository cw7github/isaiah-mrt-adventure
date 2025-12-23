# Animation Quick Reference

## Train Animations

| Effect | Class/Selector | Duration | Notes |
|--------|---------------|----------|-------|
| Window Reflection | `.car-window::after` | 4s | Automatic, continuous |
| Accelerating | `.mrt-ride-screen.accelerating` | - | Speeds up parallax |
| Decelerating | `.mrt-ride-screen.decelerating` | - | Slows down parallax |
| Train Accelerate | `trainAccelerate` keyframe | - | Blur + stretch effect |
| Train Decelerate | `trainDecelerate` keyframe | - | Reverse blur effect |

**Quick Use:**
```javascript
// Speed up train
document.querySelector('.mrt-ride-screen').classList.add('accelerating');

// Slow down train
document.querySelector('.mrt-ride-screen').classList.add('decelerating');
```

---

## Elevator Animations

| Effect | Keyframe | Duration | Trigger |
|--------|----------|----------|---------|
| Floor Flip | `floorDigitFlip` | 0.4s | Manual via JS |
| Light Streak 1 | `lightStreakUp1` | 0.6s | `.elevator-moving` class |
| Light Streak 2 | `lightStreakUp2` | 0.8s | `.elevator-moving` class |
| Door Open | `doorSlideOpen` | 0.6s | Manual via JS |
| Door Close | `doorSlideClose` | 0.6s | Manual via JS |
| Ding Pulse | `dingPulseEnhanced` | 0.8s | Manual via JS |
| Joy Hop | `joyHopEnhanced` | 0.6s | `.arrived` class |
| Floor Glow | `floorArrivalGlow` | 0.4s | Manual via JS |

**Quick Use:**
```javascript
// Start elevator movement
elevator.classList.add('elevator-moving');

// Arrival sequence
elevator.classList.remove('elevator-moving');
elevator.classList.add('arrived');
floorDisplay.style.animation = 'dingPulseEnhanced 0.8s ease-out';
```

---

## Lesson Transitions

| Transition | Keyframe | Duration | From → To |
|------------|----------|----------|-----------|
| Station to Lesson | `stationToLesson` | 0.8s | Map → Lesson |
| Page Flip | `pageFlip` | 0.6s | Read → Question |
| Success Ripple | `successRipple` | 0.6s | Answer correct |
| Return to Map | `returnToMap` | 0.6s | Lesson → Map |
| Fade Slide In | `fadeSlideIn` | 0.4s | Any screen enter |
| Fade Slide Out | `fadeSlideIn` reverse | 0.4s | Any screen exit |

**Quick Use:**
```javascript
// Transition between screens
screen1.classList.add('transitioning-out');
setTimeout(() => {
  screen1.classList.remove('active');
  screen2.classList.add('active', 'transitioning-in');
}, 400);
```

---

## Interactive States

| Element | Trigger | Animation | Auto? |
|---------|---------|-----------|-------|
| Station Button | Hover | `pulseGlow` | Yes |
| Answer Button | Hover | `pulseGlow` | Yes |
| Big Button | Hover | `pulseGlow` | Yes |
| Answer Correct | `.correct` class | `celebrationBurst` + `successRipple` | Yes |
| UI Element | On appear | `bounceIn` | Manual |

**Quick Use:**
```javascript
// Correct answer - just add class
button.classList.add('correct');

// Bounce in element
element.style.animation = 'bounceIn 0.4s ease-out';
```

---

## Performance Classes

Apply to ensure 60fps:

```css
/* Already applied to: */
.screen, .mrt-train, .mrt-map-train,
.elevator-shaft, .lesson-page, .answer-btn

/* Contains: */
backface-visibility: hidden;
transform: translateZ(0);
```

---

## Common Patterns

### Pattern 1: Train Journey
```javascript
// Start journey
ride.classList.add('accelerating');
setTimeout(() => ride.classList.remove('accelerating'), 2000);

// Approach station
ride.classList.add('decelerating');
setTimeout(() => ride.classList.remove('decelerating'), 3000);
```

### Pattern 2: Elevator Trip
```javascript
// Start
shaft.classList.add('elevator-moving');

// Arrive (after 3.5s)
shaft.classList.remove('elevator-moving');
shaft.classList.add('arrived');
display.style.animation = 'dingPulseEnhanced 0.8s, floorArrivalGlow 0.4s';
```

### Pattern 3: Screen Transition
```javascript
// Standard transition
old.classList.add('transitioning-out');
setTimeout(() => {
  old.classList.remove('active', 'transitioning-out');
  newScreen.classList.add('active', 'transitioning-in');
}, 400);
```

### Pattern 4: Success Feedback
```javascript
// Already handled by CSS
btn.classList.add('correct');
// Plays: correct-celebrate + celebrationBurst + successRipple
```

---

## Timing Reference

| Animation Type | Typical Duration | Notes |
|---------------|------------------|-------|
| Train acceleration | 2s | Then remove class |
| Train deceleration | 3s | Then remove class |
| Elevator travel | 3.5s | Full floor change |
| Screen transition | 0.4s | In/out combined: 0.8s |
| Success feedback | 0.6-0.8s | Multiple effects |
| Door open/close | 0.6s each | 1.2s total |
| Floor flip | 0.4s | Per digit change |
| Celebration | 1-2s | Can be longer |

---

## Browser DevTools Tips

**View Animations:**
1. Chrome DevTools → Animations tab
2. Trigger animation
3. See timeline, easing, performance

**Check Performance:**
1. DevTools → Performance tab
2. Record while animating
3. Check FPS (target: 60)
4. Look for green bars (GPU accelerated)

**Debug Paint:**
1. DevTools → More tools → Rendering
2. Enable "Paint flashing"
3. Animated elements should NOT flash green (no repaint)

---

## File Location

All animations in: `index.html`

Starting at line: ~14551 (search for "ENHANCED TRANSITION ANIMATIONS")

Total animations: 152 keyframes (21 new + 131 existing)
