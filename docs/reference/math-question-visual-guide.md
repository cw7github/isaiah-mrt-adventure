# Math Question Visual Guide

## Visual Hierarchy

When a computation or word problem question is displayed, the elements appear in this order:

```
┌─────────────────────────────────────────────────────┐
│         Question Type Badge: 🔢 Computation         │
│                 (or 📝 Word Problem)                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📍 Math Context (if present)                        │
│ "I am counting on the number line."                 │
│ - Gray gradient background                          │
│ - Italic, smaller font                              │
│ - Left blue border accent                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            Question Text (Bold, Large)              │
│  "I start at 7. I count up two numbers.             │
│   Where do I land?"                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          Number Sentence Box (if present)           │
│                                                      │
│           7 + 1 + 1 = [____]                        │
│                                                      │
│ - Golden gradient background                        │
│ - 32px bold font                                    │
│ - Blank box with pulsing dashed border             │
│ - Pop-in animation on load                          │
└─────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┐
│     9     │     8     │    10     │
│           │           │           │
│  Answer   │  Answer   │  Answer   │
│  Button   │  Button   │  Button   │
└───────────┴───────────┴───────────┘

        ↓ (if wrong answer selected)

┌─────────────────────────────────────────────────────┐
│ 💡 Math Hint Box                                    │
│ "Start at seven. Count up one, then up one more."  │
│ - Green gradient background                         │
│ - Slides in from top                                │
│ - Only appears after wrong answer                   │
└─────────────────────────────────────────────────────┘
```

## Color Scheme

### Question Type Badges
- **Computation (🔢)**: Golden theme (#fff3cd background, #f39c12 border, #d68910 text)
- **Word Problem (📝)**: Purple theme (#e8daef background, #a569bd border, #7d3c98 text)

### Math Elements
- **Math Context**: Gray gradient (#f8f9fa → #e9ecef) with blue left border (#3498db)
- **Number Sentence Box**: Golden gradient (#fff3cd → #ffeeba) with orange border (#f39c12)
- **Blank Space**: White background with pulsing red dashed border (#e74c3c → #f39c12)
- **Math Hint Box**: Green gradient (#d4edda → #c3e6cb) with green left border (#28a745)

### Answer Buttons
- **Default**: White to light gray gradient
- **Hover**: Blue border (#3498db) with scale effect
- **Correct**: Green gradient (#2ecc71 → #27ae60) with bounce animation
- **Incorrect**: Red gradient (#e74c3c → #c0392b) with shake animation

## Animations

### sentenceAppear (Number Sentence Box)
```css
0%   → Scale: 0.8, Opacity: 0
100% → Scale: 1.0, Opacity: 1
Duration: 0.5s ease-out
```

### blankPulse (Blank Space)
```css
0%, 100% → Border: #e74c3c (red)
50%      → Border: #f39c12 (orange) with glow
Duration: 2s ease-in-out infinite
```

### hintSlide (Math Hint Box)
```css
0%   → TranslateY: -10px, Opacity: 0
100% → TranslateY: 0, Opacity: 1
Duration: 0.4s ease-out
```

### correctBounce (Correct Answer)
```css
0%, 100% → Scale: 1.0
50%      → Scale: 1.1
Duration: 0.5s ease
```

### shake (Wrong Answer)
```css
Uses translateX to shake left and right
Duration: 0.4s ease
```

## Typography

- **Question Text**: Comic Sans MS or fallback system font
  - Computation: 20px
  - Word Problem: 22px with 1.6 line height
- **Number Sentence**: 32px bold Comic Sans MS
- **Math Context**: 18px italic Comic Sans MS
- **Math Hint**: 16px Comic Sans MS
- **Answer Buttons**: 28px bold Comic Sans MS

## Responsive Behavior

The layout is designed to work on both desktop and tablet screens:
- Answer grid automatically adjusts from 3 columns to 2 columns on narrow screens
- Font sizes use clamp() for fluid scaling
- Touch-friendly button sizes (minimum 80px width)
- Comfortable spacing between interactive elements

## Interactive States

### Initial Load
1. Question type badge appears
2. Math context fades in (if present)
3. Question text displays
4. Number sentence box pops in with animation (if present)
5. Answer buttons appear in random order

### Wrong Answer Selected
1. Button shows red gradient with shake animation
2. Button becomes disabled
3. Math hint box slides in (if present)
4. Other buttons remain active
5. Student can try again

### Correct Answer Selected
1. Button shows green gradient with bounce animation
2. All other buttons become disabled
3. Math hint box hides (if visible)
4. Celebration animation plays
5. Success message displays
6. Continue button appears after 1 second

## Accessibility Features

- **High Contrast**: All text meets WCAG AA contrast requirements
- **Large Touch Targets**: Buttons are minimum 80px wide
- **Clear Visual Feedback**: Distinct colors for correct/incorrect states
- **Progressive Disclosure**: Hints only appear when needed
- **Readable Fonts**: Comic Sans MS chosen for dyslexia-friendly readability
- **Visual Hierarchy**: Clear separation between question elements
- **Animations**: Smooth but not distracting, reinforce user actions
