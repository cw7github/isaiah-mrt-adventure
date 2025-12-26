# ELEVATOR REPAIR CREW - Design Specification

## Visual Aesthetic: Industrial Toy Workshop

### Color System

```css
Primary Palette:
--safety-orange:  #ff6b35  /* Action, tools, danger */
--mechanic-blue:  #1d3557  /* Machinery, depth */
--warning-yellow: #fee440  /* Alerts, highlights */
--steel-gray:     #6c757d  /* Metal surfaces */
--success-green:  #06d6a0  /* Completion, working */

Supporting Colors:
--rust-red:       #e63946  /* Urgency indicators */
--concrete:       #a8dadc  /* Subtle text */
--dark-metal:     #1a1a1a  /* Shadows, depth */
--bolt-silver:    #c0c0c0  /* Hardware details */
--grease-black:   #2b2d42  /* Background, text */
```

### Typography

**Headers: Bangers**
- Comic book energy
- Bold, impactful
- Skewed slightly for dynamism
- Used for: Titles, buttons, labels

**Body: Rubik**
- Clean, modern, geometric
- Excellent readability
- Wide weight range (400-800)
- Used for: Content, UI text, numbers

### Texture & Material

**Metal Surfaces**
```css
background: linear-gradient(180deg, #d3d3d3 0%, #8c8c8c 50%, #a8a8a8 100%);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.3),  /* shine */
  inset 0 2px 4px rgba(0, 0, 0, 0.2);      /* depth */
```

**Caution Stripe Pattern**
```css
background: repeating-linear-gradient(
  45deg,
  #fee440,           /* yellow */
  #fee440 20px,
  #2b2d42 20px,      /* black */
  #2b2d42 40px
);
```

**Grid Background**
```css
background-image:
  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

## Animation Library

### Tool Animations

**Tool Wobble** - When tool selected
```css
@keyframes tool-wobble {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-5deg); }
  75%      { transform: rotate(5deg); }
}
/* Duration: 0.3s ease */
```

**Tool Pulse** - While tool is selected
```css
@keyframes tool-pulse {
  0%, 100% { box-shadow: 0 0 15px var(--safety-orange); }
  50%      { box-shadow: 0 0 25px var(--safety-orange),
                         0 0 35px rgba(255, 107, 53, 0.5); }
}
/* Duration: 1.5s ease-in-out infinite */
```

**Tool Belt Rise** - Tool belt appears
```css
@keyframes tool-belt-rise {
  from { opacity: 0; transform: translateX(-50%) translateY(100px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
/* Duration: 0.6s ease-out */
```

### Repair Action Animations

**Bolt Tighten** - Wrench turning
```css
@keyframes bolt-tighten {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(90deg); }
}
/* Duration: 0.4s ease-in-out */
/* Repeat 4 times for 4 turns */
```

**Door Slide** - Elevator doors opening/closing
```css
/* Left door */
.door-left.open {
  transform: translateX(-100%);
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

/* Right door */
.door-right.open {
  transform: translateX(100%);
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

**Dirt Clean** - Cleaning track
```css
@keyframes dirt-clean {
  0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
}
/* Duration: 0.5s ease */
```

### Effect Animations

**Sparks Fly** - When fixing something
```css
@keyframes spark-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--spark-x), var(--spark-y)) scale(0.3);
  }
}
/* Duration: 0.8s ease-out forwards */
/* 20 sparks in radial pattern */
```

**Radio Crackle** - Incoming call indicator
```css
@keyframes radio-crackle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.7; transform: scale(0.95); }
}
/* Duration: 2s ease-in-out infinite */
```

**LED Blink** - Active button indicator
```css
@keyframes led-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
/* Duration: 1.5s ease-in-out infinite */
```

### Feedback Animations

**Feedback Pop** - Success/hint message appears
```css
@keyframes feedback-pop {
  0%   { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
/* Duration: 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) */
```

**Badge Stamp** - Badge earned celebration
```css
@keyframes badge-stamp {
  0%  { opacity: 0; transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
/* Duration: 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) */
/* Delay: 0.8s */
```

**Success Pulse** - Success checkmark
```css
@keyframes success-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3),
                0 0 40px rgba(6, 214, 160, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4),
                0 0 60px rgba(6, 214, 160, 0.8);
  }
}
/* Duration: 2s ease-in-out infinite */
```

### UI Transition Animations

**Slide Down** - Headers appearing
```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Duration: 0.8s ease-out */
```

**Ticket Appear** - Trouble ticket slides in
```css
@keyframes ticket-appear {
  from { opacity: 0; transform: translateY(-20px) rotate(-2deg); }
  to   { opacity: 1; transform: translateY(0) rotate(0deg); }
}
/* Duration: 0.6s ease-out */
```

**Manual Slide** - Repair manual appears
```css
@keyframes manual-slide {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
/* Duration: 0.5s ease-out */
```

## Component Design Details

### Tool Belt

**Structure:**
```
┌─────────────────────────────────────┐
│          YOUR TOOLS                 │
├──────┬──────┬──────┬──────┬─────────┤
│  🔧  │  🪛  │  🧹  │  📏  │   🔦    │
│Wrench│Screw │Brush │Measur│Flashlght│
└──────┴──────┴──────┴──────┴─────────┘
```

**Specs:**
- Position: Fixed bottom, centered
- Background: Dark gradient with border
- Tools: 70px wide, 12px gap
- Hover: Lift 4px, glow border
- Selected: Orange gradient, pulse animation

### Trouble Ticket

**Layout:**
```
┌─────────────────────────────────┐
│ TROUBLE TICKET          #001    │ ← Header (orange on white)
├─────────────────────────────────┤
│ LOCATION: Elevator 3, Floor 5   │ ← Blue label, black text
│ PROBLEM:  Door won't close      │
│ URGENCY:  HIGH                  │ ← Red, pulsing if high
└─────────────────────────────────┘
```

**Specs:**
- Background: White (#ffffff)
- Border: 3px solid black
- Padding: 20px
- Shadow: 0 4px 8px rgba(0, 0, 0, 0.3)
- Animation: Slide in from top with slight rotation

### Elevator Visualization

**Frame:**
```
        ┌──────────┐
        │  5  FLOOR│  ← Floor indicator (glowing)
    ┌───┴──────────┴───┐
    │                  │
    │ ┌──────────────┐ │
    │ │              │ │  ← Elevator doors (metal gradient)
    │ │   [  |  ]   │ │     (stuck, open, or closed)
    │ │              │ │
    │ └──────────────┘ │
    │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  ← Door track (with dirt)
    ├──────────────────┤
    │   CONTROLS       │
    │  [TEST DOOR]     │  ← Control panel
    └──────────────────┘
```

**Specs:**
- Overall: 500px max width
- Doors: 300px height, metal gradient
- Track: 20px height, dark with dirt overlay
- Frame border: 4px steel gray
- Indicator: Glowing green text with shadow

### Inspection Buttons

**Design:**
```
┌─────────────────────┐
│  🔍 Check Door Track│  ← Gray gradient, white text
└─────────────────────┘
```

**Specs:**
- Background: Steel gray gradient
- Border: 2px solid concrete
- Padding: 12px 16px
- Hover: Orange border, lift 2px
- Active: Shake animation

### Repair Manual

**Design:**
```
┌─────────────────────────────┐
│ 📋 REPAIR MANUAL            │  ← Yellow background
├─────────────────────────────┤
│ Problem: Stuck Door         │  ← Bold
│ Solution: Check track...    │  ← Regular
└─────────────────────────────┘
```

**Specs:**
- Background: Light yellow (#fffacd)
- Border: 3px warning yellow
- Text: Black on yellow
- Animation: Slide in from left

### Success Screen

**Layout:**
```
        ┌─────┐
        │  ✓  │  ← Giant green circle (120px)
        └─────┘

   REPAIR COMPLETE!  ← Big orange title
   Elevator working  ← Subtitle

   👨‍💼  👩‍⚕️  🧑‍🎓  ← Waving passengers

   "Thank you, little mechanic!"  ← Speech bubble

        ┌─────┐
        │ 🏆  │  ← Badge stamp (160px circle)
        │DOOR │     Yellow background
        │EXPRT│     Orange border
        └─────┘

   [READY FOR NEXT CALL →]  ← Big orange button
```

## Sound Design (Conceptual)

### Sound Effects Mapping

**Radio Dispatch:**
- Static crackle (2s loop)
- Voice: "Dispatch to repair crew!"
- Beep beep (call received)

**Tool Interactions:**
- Wrench: CLUNK CLUNK (metallic)
- Screwdriver: SCRITCH SCRITCH (turning)
- Brush: SWISH SWISH (sweeping)
- Measure: SNAP (extending)
- Flashlight: CLICK (button)

**Repair Actions:**
- Clean dirt: WHOOSH + sparkle
- Tighten bolt: CLANK CLANK (4 times)
- Flip switch: CLUNK CLICK
- Door test: WHOOSH (smooth slide)

**Feedback:**
- Success: DING! (bright, happy)
- Wrong: BONK (gentle, friendly)
- Badge earned: STAMP + DING DING

**Ambient:**
- Workshop hum (very quiet)
- Elevator machinery (when testing)
- Passenger chatter (success screen)

## Responsive Breakpoints

### Desktop (1024px+)
- Full layout, optimal spacing
- Tool belt: 5 tools × 70px + gaps
- Elevator: 500px wide
- Large comfortable touch targets

### Tablet (768px - 1023px)
- Slightly compressed spacing
- Tool belt: 5 tools × 60px + gaps
- Elevator: 100% width (max 500px)
- Maintained comfortable touch

### Mobile (375px - 767px)
- Compact layout
- Tool belt: 5 tools × 60px, smaller gaps
- Elevator: Full width
- Titles smaller (2.5rem → 2rem)
- Passengers: 3rem (smaller)

## Interaction Design

### Touch Targets
- Minimum: 60px × 60px
- Preferred: 70px × 70px
- Spacing: 12px minimum between

### Hover States
All interactive elements have:
1. Cursor change to pointer
2. Visual lift (translateY(-2px to -4px))
3. Border color change or glow
4. Transition: 0.2s ease

### Active/Click States
1. Slight scale down (0.98)
2. Reduced lift
3. Animation trigger (wobble, shake, etc.)
4. Audio feedback (conceptual)

### Disabled States
1. Opacity: 0.5
2. Cursor: not-allowed
3. No hover effects
4. Muted colors

## Performance Optimization

### CSS Animations
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `margin`
- Use `will-change` sparingly
- Keep animations under 1s when possible

### DOM Manipulation
- Minimize reflows
- Batch style changes
- Use CSS classes instead of inline styles
- Cache element references

### Event Handling
- Use event delegation where possible
- Debounce/throttle if needed
- Remove listeners when not needed

## Accessibility Considerations

### Visual
- High contrast colors (WCAG AA minimum)
- Large text (1rem minimum)
- Clear focus indicators
- No reliance on color alone

### Interaction
- Large touch targets (60px+)
- Clear labels (aria-label)
- Keyboard navigation support (future)
- Screen reader friendly (future)

### Cognitive
- Simple, clear instructions
- Immediate feedback
- Forgiving (no penalties)
- Progressive difficulty

---

## Design Philosophy Summary

**Tactile:** Everything should feel grabbable, pressable, turnable
**Industrial:** Metal, grease, bolts, caution stripes
**Playful:** Comic book fonts, bouncing icons, satisfying animations
**Educational:** Every interaction teaches something
**Empowering:** Kid feels like an expert mechanic

The aesthetic should say: "This is serious work, but you can do it!"
