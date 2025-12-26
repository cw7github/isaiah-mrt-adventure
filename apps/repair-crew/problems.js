/**
 * ELEVATOR REPAIR CREW - Problem Library
 *
 * Each problem is a troubleshooting scenario that teaches different skills:
 * - Reading comprehension (error codes, trouble tickets)
 * - Math (counting, measuring, calculating)
 * - Logic (if-then reasoning, diagnosis)
 * - Science (simple machines, cause and effect)
 * - Sequencing (steps in correct order)
 */

const ELEVATOR_PROBLEMS = [
  {
    id: 1,
    name: "The Stuck Door",
    ticketNumber: "001",
    location: "Elevator 3, Floor 5",
    problem: "Door won't close",
    urgency: "HIGH",
    description: "Passengers are waiting! The elevator door is stuck halfway and won't close all the way.",

    // What's actually wrong
    rootCause: "door-track",
    rootCauseText: "The door track is blocked with dirt!",

    // What the kid needs to do
    solution: {
      inspectionPoint: "door-track",
      inspectionFeedback: "You found the problem! The track is dirty and blocking the door.",
      tool: "brush",
      action: "clean",
      actionText: "Swipe with the brush to clean the track",
      successText: "Great job! The track is clean and the door can move freely now."
    },

    // Educational content
    manualEntry: {
      problem: "Stuck Door",
      solution: "Check the door track for obstructions like dirt or debris. Clean with brush if dirty. Test door movement after cleaning."
    },

    // Test to verify fix worked
    testAction: "test-door",
    testFeedback: "Perfect! The door slides smoothly now. Passengers can board safely!",

    // Badge earned
    badge: {
      icon: "🚪",
      name: "DOOR EXPERT",
      description: "Fixed a stuck elevator door"
    },

    // Skills practiced
    skills: ["observation", "tool-selection", "cleaning", "testing"]
  },

  {
    id: 2,
    name: "The Wrong Floor",
    ticketNumber: "002",
    location: "Elevator 1, Various Floors",
    problem: "Goes to wrong floor when button pressed",
    urgency: "MEDIUM",
    description: "When people press floor 3, the elevator goes to floor 5 instead. The buttons need recalibration!",

    rootCause: "control-panel",
    rootCauseText: "The button wiring is mixed up!",

    solution: {
      inspectionPoint: "control-panel",
      inspectionFeedback: "You found it! The buttons are wired in the wrong order.",
      tool: "screwdriver",
      action: "rewire",
      actionText: "Match each button to its correct floor number",
      successText: "Excellent! The buttons are now wired correctly.",

      // Interactive counting/matching challenge
      challenge: {
        type: "number-matching",
        instruction: "Connect each button to the correct floor (1 to 1, 2 to 2, etc.)",
        buttons: [1, 2, 3, 4, 5],
        correctOrder: [1, 2, 3, 4, 5]
      }
    },

    manualEntry: {
      problem: "Wrong Floor Destination",
      solution: "Open control panel with screwdriver. Check button wiring matches floor numbers 1-5 in order. Test each button."
    },

    testAction: "test-buttons",
    testFeedback: "Perfect calibration! Each button now goes to the right floor!",

    badge: {
      icon: "🔢",
      name: "BUTTON MASTER",
      description: "Fixed button calibration"
    },

    skills: ["counting", "sequences", "matching", "problem-solving"]
  },

  {
    id: 3,
    name: "The Weird Noise",
    ticketNumber: "003",
    location: "Elevator 2, Moving Between Floors",
    problem: "Strange rattling noise when moving",
    urgency: "MEDIUM",
    description: "The elevator makes a loud CLANK CLANK CLANK sound when it moves. Something is loose!",

    rootCause: "pulley-bolt",
    rootCauseText: "The pulley has a loose bolt!",

    solution: {
      inspectionPoint: "motor",
      inspectionFeedback: "Found it! The pulley bolt is loose and rattling.",
      tool: "wrench",
      action: "tighten",
      actionText: "Turn the wrench to tighten the bolt",
      successText: "Nice work! The bolt is tight now.",

      // Counting challenge
      challenge: {
        type: "counting-turns",
        instruction: "Count how many turns to tighten the bolt",
        requiredTurns: 4,
        prompt: "We need to turn the wrench 4 times. Let's count together!"
      }
    },

    manualEntry: {
      problem: "Rattling Noise",
      solution: "Check motor area for loose bolts. Use wrench to tighten. Test elevator movement - should be quiet."
    },

    testAction: "test-movement",
    testFeedback: "Listen! No more rattling. The elevator runs smoothly and quietly now!",

    badge: {
      icon: "🔩",
      name: "BOLT TIGHTENER",
      description: "Fixed loose mechanical parts"
    },

    skills: ["listening", "counting", "tools", "cause-effect"]
  },

  {
    id: 4,
    name: "Won't Move",
    ticketNumber: "004",
    location: "Elevator 4, Stuck on Floor 2",
    problem: "Elevator won't move at all",
    urgency: "HIGH",
    description: "The elevator has power (lights are on) but won't go up or down. The motor won't start!",

    rootCause: "circuit-breaker",
    rootCauseText: "The circuit breaker is turned OFF!",

    solution: {
      inspectionPoint: "control-panel",
      inspectionFeedback: "You spotted it! The circuit breaker switch is in the OFF position.",
      tool: "none",
      action: "flip-switch",
      actionText: "Read the switch labels and flip it to ON",
      successText: "Great reading! You found the right switch!",

      // Reading challenge
      challenge: {
        type: "reading-switches",
        instruction: "Find the switch labeled 'MOTOR POWER' and flip it to ON",
        switches: [
          { label: "LIGHTS", position: "ON" },
          { label: "MOTOR POWER", position: "OFF" },
          { label: "DOOR LOCK", position: "ON" }
        ],
        correctSwitch: "MOTOR POWER"
      }
    },

    manualEntry: {
      problem: "No Movement (Lights On)",
      solution: "Check circuit breaker panel. Look for switches in OFF position. Motor power must be ON for movement."
    },

    testAction: "test-movement",
    testFeedback: "Success! The motor is running and the elevator can move again!",

    badge: {
      icon: "⚡",
      name: "POWER PRO",
      description: "Fixed electrical power issue"
    },

    skills: ["reading", "logic", "if-then-reasoning", "switches"]
  },

  {
    id: 5,
    name: "Too Slow",
    ticketNumber: "005",
    location: "Elevator 5, All Floors",
    problem: "Elevator moves very slowly",
    urgency: "LOW",
    description: "The elevator works but moves like a turtle. It's supposed to be fast! The pulleys need oil.",

    rootCause: "pulley-friction",
    rootCauseText: "The pulleys are dry and have too much friction!",

    solution: {
      inspectionPoint: "motor",
      inspectionFeedback: "Good eye! The pulleys are dry and rusty. They need oil!",
      tool: "oil-can",
      action: "oil",
      actionText: "Apply oil to each pulley to reduce friction",
      successText: "Perfect! The pulleys are oiled and spinning smoothly.",

      // Simple machines learning
      challenge: {
        type: "understanding-pulleys",
        instruction: "A pulley helps lift heavy things with less work. Oil makes it spin easier!",
        visual: true
      }
    },

    manualEntry: {
      problem: "Slow Movement",
      solution: "Check pulleys for rust or dryness. Apply oil to reduce friction. Pulleys should spin freely and smoothly."
    },

    testAction: "test-speed",
    testFeedback: "Wow! Look how fast it moves now! The pulleys are working perfectly!",

    badge: {
      icon: "💨",
      name: "SPEED SPECIALIST",
      description: "Fixed slow elevator movement"
    },

    skills: ["simple-machines", "cause-effect", "lubrication", "friction"]
  },

  {
    id: 6,
    name: "Overloaded",
    ticketNumber: "006",
    location: "Elevator 3, Floor 1",
    problem: "Alarm sounds and won't move",
    urgency: "MEDIUM",
    description: "Too many people tried to get on! The elevator's weight alarm is beeping. We need to calculate if it's safe.",

    rootCause: "weight-limit",
    rootCauseText: "The elevator is over the weight limit!",

    solution: {
      inspectionPoint: "weight-sensor",
      inspectionFeedback: "The weight sensor shows the elevator is too heavy!",
      tool: "measure",
      action: "calculate",
      actionText: "Add up the weights to see if it's over the limit",
      successText: "Great math! You calculated it correctly!",

      // Math challenge
      challenge: {
        type: "addition",
        instruction: "The elevator can hold 800 pounds. Add up the passenger weights:",
        weights: [150, 200, 180, 120, 200], // Total: 850 (over limit)
        limit: 800,
        prompt: "Is 850 pounds more than 800? How many pounds over?"
      }
    },

    manualEntry: {
      problem: "Weight Alarm",
      solution: "Check weight limit sign (800 lbs). Add passenger weights. If over limit, ask someone to wait for next elevator."
    },

    testAction: "test-weight",
    testFeedback: "Perfect! Now it's safe. One passenger will wait for the next elevator!",

    badge: {
      icon: "⚖️",
      name: "MATH MECHANIC",
      description: "Solved weight calculation problem"
    },

    skills: ["addition", "comparison", "greater-than", "safety"]
  }
];

// Helper function to get a problem by ID
function getProblemById(id) {
  return ELEVATOR_PROBLEMS.find(problem => problem.id === id);
}

// Helper function to get a random problem
function getRandomProblem() {
  const randomIndex = Math.floor(Math.random() * ELEVATOR_PROBLEMS.length);
  return ELEVATOR_PROBLEMS[randomIndex];
}

// Helper function to get next problem in sequence
function getNextProblem(currentId) {
  const nextId = currentId + 1;
  if (nextId > ELEVATOR_PROBLEMS.length) {
    return ELEVATOR_PROBLEMS[0]; // Loop back to first problem
  }
  return getProblemById(nextId);
}
