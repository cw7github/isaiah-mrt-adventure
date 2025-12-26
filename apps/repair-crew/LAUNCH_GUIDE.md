# ELEVATOR REPAIR CREW - Launch Guide

## Quick Start

Open `index.html` in any modern web browser. That's it!

The app is completely self-contained with no external dependencies.

## First Launch Experience

### What Isaiah Will See

1. **Workshop Header**
   - Big bold "REPAIR CREW HQ" title in orange comic book font
   - Industrial caution stripe
   - Workshop theme with metal grid background

2. **Radio Dispatch Center**
   - Radio box with speaker grilles
   - Big button: "RECEIVE DISPATCH CALL"
   - Beckons with bouncing radio icon

### The First Repair Journey

**Step 1: Dispatch Call** (4 seconds)
- Radio light turns green and blinks
- Trouble ticket slides in with problem details
- Kid reads: "Elevator 3, Floor 5, Door won't close, HIGH urgency"

**Step 2: Travel to Site** (Auto transition)
- Site screen appears
- Tool belt rises from bottom with 5 chunky tools
- Elevator visualization shows stuck door

**Step 3: Inspect** (Active problem-solving)
- Three inspection buttons: "Check Door Track", "Check Motor", "Check Sensor"
- Kid clicks "Check Door Track" → Correct!
- Green feedback: "You found the problem! The track is dirty and blocking the door."
- Repair manual appears with solution

**Step 4: Select Tool** (Tool selection)
- Kid clicks brush in tool belt
- Tool glows orange and wobbles
- Ready to fix!

**Step 5: Fix It** (Satisfying action)
- Kid clicks on the dirty door track
- Sparks fly! Dirt disappears with animation
- Green feedback: "Great job! The track is clean."
- Test button enables

**Step 6: Test** (Verification)
- Kid clicks "TEST DOOR"
- Doors slide smoothly closed then open
- Success!

**Step 7: Celebrate** (Reward)
- Success screen appears
- Giant green checkmark pulses
- Happy passengers wave: "Thank you, little mechanic!"
- Badge stamp rotates in: "DOOR EXPERT 🚪"
- "READY FOR NEXT CALL" button appears

## User Interface Elements

### Tool Belt (Bottom of screen)
```
[🔧 Wrench] [🪛 Screwdriver] [🧹 Brush] [📏 Measure] [🔦 Flashlight]
```

Each tool:
- Chunky blue button with tool icon
- Tool name in uppercase
- Hover effect lifts it up
- Click makes it wobble
- Selected tool glows orange

### Trouble Ticket (White card)
```
┌─────────────────────────────┐
│ TROUBLE TICKET        #001  │
├─────────────────────────────┤
│ LOCATION: Elevator 3, Floor 5
│ PROBLEM:  Door won't close
│ URGENCY:  HIGH (red, pulsing)
└─────────────────────────────┘
```

### Elevator Visualization
- Steel gray frame with border
- Floor indicator at top (glowing green numbers)
- Metal elevator doors (gradient)
- Door track at bottom (interactive)
- Control panel below (test button)

### Inspection Buttons
```
[🔍 Check Door Track]
[🔍 Check Motor]
[🔍 Check Sensor]
```

### Repair Manual (Yellow notepad)
```
┌─────────────────────────────┐
│ 📋 REPAIR MANUAL            │
├─────────────────────────────┤
│ Problem: Stuck Door         │
│ Solution: Check track for   │
│ obstructions like dirt or   │
│ debris. Clean with brush    │
│ if dirty. Test door after.  │
└─────────────────────────────┘
```

## Key Interactions

### Touch/Click Targets
All interactive elements have:
- Minimum 60px touch target
- Clear hover states
- Visual feedback on click
- Satisfying animations

### Feedback System

**Success Feedback** (Green)
- Checkmark icon
- Positive message
- Stays visible

**Hint Feedback** (Yellow)
- Question mark icon
- Helpful guidance
- Fades after 3 seconds

**Tool Required** (Orange)
- Tool icon hint
- "Use the brush to fix this!"

## Problem Progression

The app includes 6 progressively challenging problems:

1. **The Stuck Door** ⭐ PILOT - Easiest
   - Observation and tool selection
   - Clear visual problem (dirt in track)

2. **The Wrong Floor** ⭐⭐
   - Reading and counting
   - Button wiring puzzle

3. **The Weird Noise** ⭐⭐
   - Listening and counting
   - Count 4 wrench turns

4. **Won't Move** ⭐⭐⭐
   - Reading labels carefully
   - Circuit breaker switches

5. **Too Slow** ⭐⭐⭐
   - Simple machines concept
   - Cause and effect

6. **Overloaded** ⭐⭐⭐⭐
   - Math addition
   - Weight calculation

Each repair takes 2-5 minutes depending on child's reading speed.

## Educational Value Tracking

### Skills Practiced Per Problem

**Problem 1: Stuck Door**
- ✓ Reading trouble ticket
- ✓ Visual observation
- ✓ Tool identification
- ✓ Cause-effect reasoning

**Problem 2: Wrong Floor**
- ✓ Number recognition (1-5)
- ✓ Counting sequences
- ✓ Matching
- ✓ Pattern recognition

**Problem 3: Weird Noise**
- ✓ Counting practice (4 turns)
- ✓ Tool usage (wrench)
- ✓ Listening skills
- ✓ Problem diagnosis

**Problem 4: Won't Move**
- ✓ Reading labels
- ✓ If-then logic
- ✓ Switch operation
- ✓ Electrical concepts (basic)

**Problem 5: Too Slow**
- ✓ Simple machines (pulleys)
- ✓ Friction concept
- ✓ Cause-effect
- ✓ Scientific method

**Problem 6: Overloaded**
- ✓ Addition (up to 850)
- ✓ Greater than/less than
- ✓ Weight measurement
- ✓ Safety reasoning

## Parent/Teacher Guidance

### How to Support Learning

**Before Playing:**
- "You're going to be a mechanic today!"
- "Mechanics fix things that are broken."
- "You'll need to read carefully and think about problems."

**During Play:**
- Let child explore independently
- Only help if stuck for 2+ minutes
- Ask guiding questions:
  - "What does the trouble ticket say?"
  - "Which part looks wrong?"
  - "What tool do you think we need?"

**After Completing a Repair:**
- "How did you figure that out?"
- "What was the problem?"
- "Have you seen real mechanics use these tools?"

### Real-World Connections

**Tools:**
- Show real wrench, screwdriver, brush
- Let child hold them (safely)
- Point out tools when seeing construction workers

**Elevators:**
- Next time in an elevator, point out:
  - Floor indicator
  - Door tracks
  - Control panel buttons
  - Weight limit sign

**Problem-Solving:**
- "Just like in the game, real mechanics:"
  - Read error codes
  - Test different parts
  - Use the right tools
  - Make sure their fix works

## Technical Information

### Browser Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Screen Sizes
- **Desktop**: 1024px+ (optimal)
- **Tablet**: 768px+ (great)
- **Mobile**: 375px+ (good)

### Performance
- Loads in < 1 second
- Smooth 60fps animations
- No lag or stuttering
- Lightweight (< 50KB total)

## Troubleshooting

### Common Issues

**Q: Tools won't select**
A: Make sure to click directly on the tool button. Selected tool will glow orange.

**Q: Can't fix the problem**
A: Check three things:
1. Have you inspected and found the problem?
2. Have you selected the correct tool?
3. Are you clicking on the right part?

**Q: Test button is gray/disabled**
A: You need to fix the problem first before you can test.

**Q: Doors won't close**
A: Make sure the dirt in the track is cleaned (should disappear).

## Debug Mode

Open browser console (F12) to access debug commands:

```javascript
// Skip to repair site
debugRepairCrew.skipToRepair()

// Complete current repair
debugRepairCrew.completeRepair()

// Show repair manual
debugRepairCrew.showManual()

// Reset entire app
RepairCrewApp.resetApp()

// View current state
RepairCrewApp.state
```

## What Makes This Different

### NOT a Story
- No narrative to sit through
- Jump straight to problem-solving
- Kid is in control from second one

### NOT Multiple Choice
- No "which answer is correct?"
- Active manipulation and fixing
- Real troubleshooting process

### NOT Arbitrary Rewards
- Rewards directly tied to achievement
- Badge represents actual skill demonstrated
- Passengers happy because YOU fixed it

### IS Hands-On Learning
- Touch, select, interact
- Trial and error is safe
- Learn by doing, not reading

## Success Indicators

Child is learning when they:
- Read the trouble ticket without prompting
- Select tools without trial and error
- Explain what was wrong
- Want to do "just one more repair"
- Talk about tools and fixing things

## Next Steps

After mastering all 6 problems:
- Replay to improve speed
- Explain repairs to parent/sibling
- Draw their own tool belt
- Look for real-world repair scenarios
- Think about what else could break

---

**Remember**: The goal isn't to complete all problems quickly. The goal is to build a problem-solving mindset: "I can figure this out."

Every successful repair builds confidence, competence, and curiosity.

Let them be the mechanic. Let them feel expert. Let them FIX things.
