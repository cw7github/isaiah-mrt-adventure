// LOST & FOUND EXPRESS - Case Database
// Each case is a mystery to solve with clues and suspects

const CASES = [
  {
    id: 'blue-umbrella',
    name: 'The Blue Umbrella Mystery',
    difficulty: 1,
    item: {
      name: 'Blue Umbrella',
      emoji: '☂️',
      image: '🌂',
      description: 'A small blue umbrella with star patterns',
      clues: [
        { type: 'color', value: 'blue', text: 'The umbrella is blue' },
        { type: 'pattern', value: 'stars', text: 'It has star patterns on it' },
        { type: 'size', value: 'small', text: 'It\'s a small, child-sized umbrella' },
        { type: 'nametag', value: 'MA_Y', text: 'Name tag is smudged: "MA_Y"' }
      ]
    },
    location: {
      train: '3 Train',
      station: 'Zoo Station',
      time: 'Morning'
    },
    report: 'Found on the 3 Train, left on a seat after the Zoo stop. A conductor turned it in this morning.',
    witness: {
      name: 'Conductor Chen',
      statement: 'I saw a young girl with that umbrella! She was so excited about seeing the pandas at the zoo. She ran off the train when we got to her stop and must have forgotten it.',
      hints: [
        'The owner was a girl',
        'She was going to the zoo',
        'She left it on the 3 Train'
      ]
    },
    suspects: [
      {
        id: 'tommy',
        name: 'Tommy',
        age: 8,
        avatar: '👦',
        report: {
          item: 'red umbrella',
          train: '5 Train',
          description: 'Lost my RED umbrella on the 5 Train yesterday'
        },
        clues: { color: 'red', train: '5 Train', pattern: 'plain' }
      },
      {
        id: 'mary',
        name: 'Mary',
        age: 7,
        avatar: '👧',
        report: {
          item: 'blue umbrella with stars',
          train: '3 Train',
          description: 'Lost my BLUE umbrella with STARS on the 3 Train after visiting the zoo'
        },
        clues: { color: 'blue', train: '3 Train', pattern: 'stars' }
      },
      {
        id: 'jose',
        name: 'Jose',
        age: 9,
        avatar: '🧒',
        report: {
          item: 'blue umbrella',
          train: '2 Train',
          description: 'Lost my BLUE umbrella on the 2 Train this morning'
        },
        clues: { color: 'blue', train: '2 Train', pattern: 'plain' }
      }
    ],
    solution: 'mary',
    reward: {
      badge: 'Junior Detective',
      message: 'My umbrella! Thank you so much! I was so sad without it!',
      emoji: '🎉'
    }
  },
  {
    id: 'lunchbox',
    name: 'The Missing Lunchbox',
    difficulty: 2,
    item: {
      name: 'Lunchbox',
      emoji: '🍱',
      image: '🍱',
      description: 'A red lunchbox with dinosaur stickers',
      clues: [
        { type: 'color', value: 'red', text: 'The lunchbox is red' },
        { type: 'pattern', value: 'dinosaurs', text: 'It has dinosaur stickers all over' },
        { type: 'contents', value: 'sandwich', text: 'Inside: a peanut butter sandwich' },
        { type: 'nametag', value: 'ALEX', text: 'Name clearly written: "ALEX"' }
      ]
    },
    location: {
      train: '7 Train',
      station: 'School Station',
      time: 'Afternoon'
    },
    report: 'Found on the 7 Train heading away from School Station. Left on the overhead rack in the afternoon.',
    witness: {
      name: 'Student Sarah',
      statement: 'I saw someone sitting near that lunchbox! They were reading a book about dinosaurs. They got off at School Station and forgot their lunch!',
      hints: [
        'The owner loves dinosaurs',
        'They were on the 7 Train',
        'They got off at School Station'
      ]
    },
    suspects: [
      {
        id: 'alex',
        name: 'Alex',
        age: 8,
        avatar: '👦',
        report: {
          item: 'red lunchbox with dinosaurs',
          train: '7 Train',
          description: 'Lost my RED lunchbox with DINOSAUR stickers on the 7 Train going to school'
        },
        clues: { color: 'red', train: '7 Train', pattern: 'dinosaurs' }
      },
      {
        id: 'emma',
        name: 'Emma',
        age: 7,
        avatar: '👧',
        report: {
          item: 'pink lunchbox',
          train: '7 Train',
          description: 'Lost my PINK lunchbox with unicorns on the 7 Train'
        },
        clues: { color: 'pink', train: '7 Train', pattern: 'unicorns' }
      },
      {
        id: 'alexis',
        name: 'Alexis',
        age: 9,
        avatar: '👧',
        report: {
          item: 'red lunchbox',
          train: '4 Train',
          description: 'Lost my RED lunchbox on the 4 Train yesterday'
        },
        clues: { color: 'red', train: '4 Train', pattern: 'plain' }
      }
    ],
    solution: 'alex',
    reward: {
      badge: 'Lunch Saver',
      message: 'Oh wow! My lunchbox! Mom made my favorite sandwich! Thank you!',
      emoji: '🦖'
    }
  },
  {
    id: 'teddy-bear',
    name: 'The Lost Teddy',
    difficulty: 3,
    item: {
      name: 'Teddy Bear',
      emoji: '🧸',
      image: '🧸',
      description: 'A brown teddy bear wearing a red bow tie',
      clues: [
        { type: 'color', value: 'brown', text: 'The teddy bear is brown' },
        { type: 'accessory', value: 'red bow tie', text: 'Wearing a red bow tie' },
        { type: 'size', value: 'small', text: 'Small enough to fit in a backpack' },
        { type: 'condition', value: 'worn', text: 'Well-loved, slightly worn fur' }
      ]
    },
    location: {
      train: '1 Train',
      station: 'Park Station',
      time: 'Evening'
    },
    report: 'Found tucked under a seat on the 1 Train. Discovered during evening cleaning near Park Station.',
    witness: {
      name: 'Park Visitor Lily',
      statement: 'I remember seeing a little kid hugging a teddy bear! They were with their family coming back from the park. The child looked very young, maybe 5 or 6 years old.',
      hints: [
        'The owner is very young (5-6 years old)',
        'They were coming from the park',
        'They had the teddy with them on the 1 Train'
      ]
    },
    suspects: [
      {
        id: 'mia',
        name: 'Mia',
        age: 5,
        avatar: '👧',
        report: {
          item: 'brown teddy with red bow',
          train: '1 Train',
          description: 'Lost my BROWN teddy bear with a RED BOW TIE on the 1 Train after the park. He\'s my best friend!'
        },
        clues: { color: 'brown', train: '1 Train', accessory: 'red bow tie' }
      },
      {
        id: 'oliver',
        name: 'Oliver',
        age: 10,
        avatar: '👦',
        report: {
          item: 'brown teddy',
          train: '6 Train',
          description: 'Lost my old BROWN teddy bear on the 6 Train'
        },
        clues: { color: 'brown', train: '6 Train', accessory: 'none' }
      },
      {
        id: 'sophia',
        name: 'Sophia',
        age: 6,
        avatar: '👧',
        report: {
          item: 'white bunny',
          train: '1 Train',
          description: 'Lost my WHITE bunny toy on the 1 Train coming from the park'
        },
        clues: { color: 'white', train: '1 Train', accessory: 'ribbon' }
      }
    ],
    solution: 'mia',
    reward: {
      badge: 'Friendship Detective',
      message: 'Mr. Teddy! You found him! *hugs teddy* Thank you! I missed him so much!',
      emoji: '💝'
    }
  },
  {
    id: 'backpack',
    name: 'The Mystery Backpack',
    difficulty: 4,
    item: {
      name: 'Backpack',
      emoji: '🎒',
      image: '🎒',
      description: 'A green backpack with space rocket patches',
      clues: [
        { type: 'color', value: 'green', text: 'The backpack is green' },
        { type: 'pattern', value: 'space rockets', text: 'Has space rocket patches sewn on' },
        { type: 'contents', value: 'astronomy book', text: 'Inside: an astronomy book' },
        { type: 'contents', value: 'star chart', text: 'Also inside: a folded star chart' },
        { type: 'nametag', value: 'JAM_S', text: 'Name tag partially torn: "JAM_S"' }
      ]
    },
    location: {
      train: '9 Train',
      station: 'Science Museum',
      time: 'Afternoon'
    },
    report: 'Found on the 9 Train after it left Science Museum station. Stored in the lost and found since this afternoon.',
    witness: {
      name: 'Museum Guide Carlos',
      statement: 'I saw a boy with that backpack at the planetarium show! He was so excited about the stars and planets. He asked so many questions about astronomy. I think he was about 9 or 10 years old.',
      hints: [
        'The owner is interested in space and astronomy',
        'They visited the Science Museum planetarium',
        'They took the 9 Train',
        'The owner is a boy around 9-10 years old'
      ]
    },
    suspects: [
      {
        id: 'james',
        name: 'James',
        age: 10,
        avatar: '👦',
        report: {
          item: 'green backpack with rockets',
          train: '9 Train',
          description: 'Lost my GREEN backpack with SPACE ROCKET patches on the 9 Train. I was at the Science Museum planetarium!'
        },
        clues: { color: 'green', train: '9 Train', pattern: 'space rockets' }
      },
      {
        id: 'jamie',
        name: 'Jamie',
        age: 8,
        avatar: '👧',
        report: {
          item: 'green backpack',
          train: '9 Train',
          description: 'Lost my GREEN backpack on the 9 Train yesterday'
        },
        clues: { color: 'green', train: '9 Train', pattern: 'flowers' }
      },
      {
        id: 'lucas',
        name: 'Lucas',
        age: 10,
        avatar: '👦',
        report: {
          item: 'blue backpack with rockets',
          train: '3 Train',
          description: 'Lost my BLUE backpack with ROCKET patches on the 3 Train'
        },
        clues: { color: 'blue', train: '3 Train', pattern: 'space rockets' }
      }
    ],
    solution: 'james',
    reward: {
      badge: 'Space Detective',
      message: 'My backpack! My astronomy book is inside! I need it for my space project! You\'re amazing!',
      emoji: '🚀'
    }
  },
  {
    id: 'special-hat',
    name: 'The Special Hat',
    difficulty: 5,
    item: {
      name: 'Baseball Cap',
      emoji: '🧢',
      image: '🧢',
      description: 'A red baseball cap with a tiger logo',
      clues: [
        { type: 'color', value: 'red', text: 'The cap is red' },
        { type: 'logo', value: 'tiger', text: 'Has a tiger team logo on front' },
        { type: 'condition', value: 'signed', text: 'Has an autograph inside!' },
        { type: 'size', value: 'youth', text: 'Youth size cap' }
      ]
    },
    location: {
      train: '8 Train',
      station: 'Stadium Station',
      time: 'Evening'
    },
    report: 'Found on the 8 Train after a big baseball game. Left on a seat near Stadium Station during evening rush hour.',
    witness: {
      name: 'Baseball Fan Rita',
      statement: 'I was at that game! I saw a kid wearing a Tigers cap just like that one. They were so excited because they got it signed by their favorite player! The kid was with their dad, and they took the 8 Train home after the game.',
      hints: [
        'The owner is a Tigers fan',
        'They got the cap signed at the game',
        'They took the 8 Train from the stadium',
        'They were at the evening game'
      ]
    },
    suspects: [
      {
        id: 'maya',
        name: 'Maya',
        age: 9,
        avatar: '👧',
        report: {
          item: 'red Tigers cap',
          train: '8 Train',
          description: 'Lost my RED baseball cap with TIGER logo on the 8 Train after the game. It has an AUTOGRAPH inside! Please help!'
        },
        clues: { color: 'red', train: '8 Train', logo: 'tiger' }
      },
      {
        id: 'ethan',
        name: 'Ethan',
        age: 8,
        avatar: '👦',
        report: {
          item: 'blue cap',
          train: '8 Train',
          description: 'Lost my BLUE baseball cap on the 8 Train after the game'
        },
        clues: { color: 'blue', train: '8 Train', logo: 'lions' }
      },
      {
        id: 'isabella',
        name: 'Isabella',
        age: 10,
        avatar: '👧',
        report: {
          item: 'red Tigers cap',
          train: '5 Train',
          description: 'Lost my RED TIGERS cap on the 5 Train last week'
        },
        clues: { color: 'red', train: '5 Train', logo: 'tiger' }
      }
    ],
    solution: 'maya',
    reward: {
      badge: 'Master Detective',
      message: 'MY CAP! The signed one! Oh thank you, thank you! This is my most special hat ever!',
      emoji: '⭐'
    }
  }
];

// Get case by ID
function getCaseById(caseId) {
  return CASES.find(c => c.id === caseId);
}

// Get cases by difficulty
function getCasesByDifficulty(difficulty) {
  return CASES.filter(c => c.difficulty === difficulty);
}

// Get all cases
function getAllCases() {
  return CASES;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CASES, getCaseById, getCasesByDifficulty, getAllCases };
}
