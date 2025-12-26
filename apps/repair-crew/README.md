# ELEVATOR REPAIR CREW

**A radical educational game where you're a kid mechanic fixing broken elevators!**

## Concept

NOT a story or lesson - it's a **TROUBLESHOOTING SIMULATOR**. Kids learn by FIXING things. Reading error codes, counting parts, logical deduction.

This is active, hands-on learning disguised as satisfying repair work.

## Educational Philosophy

### Hidden Learning Through Play

Every repair teaches multiple skills simultaneously:

- **READING**: Error codes, repair manual entries, trouble tickets
- **MATH**: Counting bolts, measuring cable lengths, calculating weight limits
- **LOGIC**: If-then reasoning for diagnosis
- **SCIENCE**: Simple machines - pulleys, levers, counterweights
- **SEQUENCES**: Steps must be done in order

Kids don't realize they're learning - they just feel like REAL MECHANICS.

## Core Gameplay Loop

```
1. ALARM → An elevator breaks somewhere in the building!
2. DISPATCH → Read the trouble ticket (reading comprehension)
3. DIAGNOSE → Go to the elevator, observe symptoms
4. TROUBLESHOOT → Check different parts, find the problem
5. FIX → Use the right tool, count the right parts
6. TEST → Make sure it works!
7. CELEBRATE → Happy passengers, earn a repair badge!
```

## Aesthetic: Industrial Toy Workshop

**Color Palette:**
- Safety Orange (#ff6b35) - Primary action color
- Mechanic Blue (#1d3557) - Tools and machinery
- Warning Yellow (#fee440) - Alerts and caution
- Steel Gray (#6c757d) - Metal surfaces
- Success Green (#06d6a0) - Completion feedback

**Typography:**
- **Bangers** - Headers (comic book feel, energetic)
- **Rubik** - UI text (clean, readable, modern)

**Feel:**
- Chunky, tactile tools that look fun to use
- Tools have personality - friendly wrench, eager screwdriver
- Control panels with blinking lights, switches, dials
- Satisfying click/clunk sounds for every interaction
- Grease smudges, metal textures, rubber gaskets

## Repair Problems Library

### 1. The Stuck Door (PILOT)
**Skills**: Observation, Tool Selection, Cleaning, Testing
- **Problem**: Door won't close, track is blocked with dirt
- **Solution**: Inspect track → Select brush → Clean dirt → Test door
- **Badge**: 🚪 Door Expert

### 2. The Wrong Floor
**Skills**: Counting, Sequences, Matching, Problem-Solving
- **Problem**: Buttons go to wrong floors (wiring mixed up)
- **Solution**: Open panel → Match buttons to correct floor numbers
- **Badge**: 🔢 Button Master

### 3. The Weird Noise
**Skills**: Listening, Counting, Tools, Cause-Effect
- **Problem**: Rattling noise (loose bolt in pulley)
- **Solution**: Find loose bolt → Count 4 wrench turns to tighten
- **Badge**: 🔩 Bolt Tightener

### 4. Won't Move
**Skills**: Reading, Logic, If-Then Reasoning, Switches
- **Problem**: Elevator has power but won't move (circuit breaker off)
- **Solution**: Read switch labels → Find "MOTOR POWER" → Flip to ON
- **Badge**: ⚡ Power Pro

### 5. Too Slow
**Skills**: Simple Machines, Cause-Effect, Lubrication, Friction
- **Problem**: Elevator moves like a turtle (dry pulleys)
- **Solution**: Inspect pulleys → Apply oil → Reduce friction
- **Badge**: 💨 Speed Specialist

### 6. Overloaded
**Skills**: Addition, Comparison, Greater-Than, Safety
- **Problem**: Weight alarm beeping (too many passengers)
- **Solution**: Add passenger weights → Compare to 800 lb limit → Math!
- **Badge**: ⚖️ Math Mechanic

## The Tool Belt

Always visible, tactile, GRABBABLE:

- 🔧 **Wrench** - For bolts and nuts (counting practice)
- 🪛 **Screwdriver** - For panels and covers
- 🧹 **Brush** - For cleaning tracks and sensors
- 📏 **Tape Measure** - For measuring (numbers)
- 🔦 **Flashlight** - For seeing in dark spaces
- 📋 **Clipboard** - Current trouble ticket

## Key Animations

### Tool Interactions
- `@keyframes tool-wobble` - Tools wiggle when selected
- `@keyframes tool-pulse` - Selected tool pulses with energy

### Repair Actions
- `@keyframes bolt-tighten` - Satisfying rotation when tightening
- `@keyframes door-slide` - Smooth door fix animation
- `@keyframes dirt-clean` - Dirt disappearing when cleaned

### Feedback
- `@keyframes sparks-fly` - When something's being fixed
- `@keyframes badge-stamp` - Earned badge animation
- `@keyframes radio-crackle` - Incoming call pulse

### Success Celebrations
- `@keyframes success-pulse` - Success checkmark pulses
- `@keyframes passenger-wave` - Happy passengers wave
- `@keyframes arrow-bounce` - Next repair button beckons

## Sound Design (Conceptual)

While this app doesn't include actual sound files, here's the audio design concept:

- **Radio static + voice** - Dispatch calls
- **Satisfying CLUNK** - When using wrench
- **WHOOSH** - When door fixed
- **Happy DING** - When problem solved
- **Mechanical hums and clicks** - Ambient background

## Files Structure

```
repair-crew/
├── index.html       - Main HTML structure with 3 screens
├── styles.css       - Industrial toy workshop aesthetic
├── app.js          - Tool mechanics, diagnosis system, repair logic
├── problems.js     - Library of 6 elevator problems with solutions
└── README.md       - This file
```

## How to Use

### For Parents/Teachers

1. **Let kids explore** - The interface is self-explanatory
2. **Encourage reading** - Trouble tickets and manuals have important info
3. **Celebrate problem-solving** - Every fix is an achievement
4. **Discuss real-world connections** - Talk about real mechanics and tools

### For Kids

1. Click "RECEIVE DISPATCH CALL" to start
2. Read the trouble ticket carefully
3. Go to the elevator and inspect different parts
4. Select the right tool from your tool belt
5. Fix the problem (clean, tighten, flip switches, etc.)
6. Test your repair to make sure it works!
7. Celebrate and earn your badge!

## Educational Alignment

### Reading Comprehension
- Trouble tickets provide context clues
- Repair manual teaches technical reading
- Switch labels require careful reading
- Problem-solution text structure

### Mathematics
- Counting (bolt turns, floor numbers)
- Addition (weight calculations)
- Comparison (greater than/less than)
- Measurement concepts

### Science & Engineering
- Simple machines (pulleys, levers)
- Cause and effect relationships
- Friction and lubrication
- Electrical circuits (basic)

### Logic & Critical Thinking
- If-then reasoning (if motor won't run AND lights are on, then...)
- Process of elimination
- Diagnostic thinking
- Sequential problem-solving

## Design Principles

### 1. Every Fix Feels EARNED
No arbitrary rewards. Success comes from actually solving the problem.

### 2. Tools Feel TACTILE
Chunky buttons, satisfying animations, visual feedback for every interaction.

### 3. Problems Are LOGICAL
Kids can figure them out through observation and reasoning.

### 4. Learning Is HIDDEN
They think they're fixing elevators. They're actually doing math and reading.

### 5. Mistakes Are SAFE
Try the wrong tool? Get friendly feedback. No penalties, just try again.

## Future Expansion Ideas

### More Problems
- Stuck between floors (needs rescue procedure)
- Mirror needs cleaning (can't see floor indicator)
- Emergency stop button stuck (spring mechanism)
- Cable fraying (needs replacement and counting)

### Advanced Features
- Multi-step repairs requiring tool sequences
- Part inventory management
- Time pressure (but gentle, not stressful)
- Passenger requests (add narrative)

### Difficulty Levels
- **Apprentice**: Problems clearly labeled
- **Mechanic**: Find problem yourself
- **Expert**: Multiple problems at once

### Progress Tracking
- Badge collection wall
- Repair history log
- Skills mastery indicators
- Parent/teacher dashboard

## Technical Notes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-friendly touch interactions
- No external dependencies (pure HTML/CSS/JS)

### Accessibility
- High contrast colors
- Large touch targets
- Clear visual feedback
- Simple, clean interface

### Performance
- CSS animations (GPU accelerated)
- Minimal DOM manipulation
- Efficient event handling
- Fast load times

## Credits

**Design Philosophy**: Industrial Toy Workshop
**Target Age**: 5-8 years old
**Educational Focus**: Multi-disciplinary (Reading, Math, Logic, Science)
**Interaction Style**: Active troubleshooting, not passive consumption

---

## The Secret Sauce

The magic of this app is that **kids feel competent**.

They're not being "taught" - they're FIXING THINGS. They're mechanics. They're experts. They're solving real problems (in a game world).

Every successful repair builds:
- **Confidence** - "I figured it out!"
- **Competence** - "I know how to use tools!"
- **Curiosity** - "What else can I fix?"

That's the real educational value: Building a mindset of **"I can solve this."**

Make the child feel like a REAL MECHANIC. Every fix should feel EARNED and SATISFYING.
