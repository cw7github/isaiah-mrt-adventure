#!/usr/bin/env node
/**
 * assemble-math-content-pack.mjs
 *
 * Assembles the CPA Grade 1 Math content pack from individual domain JSON files.
 *
 * Usage:
 *   node scripts/assemble-math-content-pack.mjs
 *
 * Input files:
 *   - content/cpa-grade1-math/content-pack-shell.json (metadata + station order)
 *   - content/cpa-grade1-math/oa-stations.json
 *   - content/cpa-grade1-math/nbt-stations.json
 *   - content/cpa-grade1-math/md-stations.json
 *   - content/cpa-grade1-math/g-stations.json
 *
 * Output:
 *   - content/cpa-grade1-math/content-pack.v1.json
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const mathContentDir = path.join(repoRoot, 'content/cpa-grade1-math');

// Colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function loadJson(filename) {
  const filepath = path.join(mathContentDir, filename);
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`${RED}Error loading ${filename}: ${err.message}${RESET}`);
    return null;
  }
}

function assemble() {
  console.log(`\n${BOLD}Assembling CPA Grade 1 Math Content Pack${RESET}\n`);

  // Load shell (metadata + station order)
  const shell = loadJson('content-pack-shell.json');
  if (!shell) {
    console.error(`${RED}Failed to load shell. Aborting.${RESET}`);
    process.exit(1);
  }

  // Load domain files
  const domainFiles = [
    'oa-stations.json',
    'nbt-stations.json',
    'md-stations.json',
    'g-stations.json'
  ];

  const allStations = {};
  let totalStations = 0;

  for (const filename of domainFiles) {
    const domainStations = loadJson(filename);
    if (domainStations) {
      const count = Object.keys(domainStations).length;
      console.log(`${CYAN}Loaded ${count} stations from ${filename}${RESET}`);
      Object.assign(allStations, domainStations);
      totalStations += count;
    } else {
      console.log(`${RED}Warning: Could not load ${filename}${RESET}`);
    }
  }

  // Create review stations (placeholder)
  const reviewStations = {
    "review_math_sprint_1": {
      "name": "Math Review Sprint 1",
      "icon": "🏃",
      "level": 2,
      "line": "Review",
      "checklistTargets": ["1.OA.C.6", "1.NBT.B.2", "1.G.A.1"],
      "mathFocus": ["addition", "place value", "shapes"],
      "previewConcepts": [
        { "concept": "Quick Add", "icon": "➕", "example": "5 + 3 = ?" },
        { "concept": "Tens & Ones", "icon": "🔢", "example": "14 = 1 ten + 4 ones" },
        { "concept": "Shapes", "icon": "🔷", "example": "How many sides?" }
      ],
      "pages": [
        {
          "type": "read",
          "sentence": "Let us review what we learned. We will do some quick math!",
          "mathConcept": "Review introduction",
          "mathTip": "Take your time and think."
        },
        {
          "type": "menu",
          "prompt": "Pick a snack for your review break!",
          "menuStory": "Good work! Pick a treat.",
          "items": [
            { "name": "Apple", "icon": "🍎", "description": "Crunchy and red" },
            { "name": "Cookie", "icon": "🍪", "description": "Sweet and round" },
            { "name": "Juice", "icon": "🧃", "description": "Cool and fruity" }
          ]
        },
        {
          "type": "question",
          "questionType": "computation",
          "questionMode": "multipleChoice",
          "question": "What is 4 + 5?",
          "mathContext": "I have 4 apples. I get 5 more.",
          "mathHint": "Count on from the bigger number.",
          "answers": [
            { "name": "9", "icon": "✅" },
            { "name": "8", "icon": "❌" },
            { "name": "10", "icon": "❌" }
          ],
          "correctAnswerName": "9",
          "successMessage": "Yes! 4 + 5 = 9."
        }
      ]
    },
    "review_math_sprint_2": {
      "name": "Math Review Sprint 2",
      "icon": "🏃",
      "level": 3,
      "line": "Review",
      "checklistTargets": ["1.OA.D.8", "1.NBT.C.4", "1.G.A.3"],
      "mathFocus": ["missing numbers", "two-digit addition", "equal parts"],
      "previewConcepts": [
        { "concept": "Find Missing", "icon": "❓", "example": "? + 3 = 7" },
        { "concept": "Add Big Numbers", "icon": "🔢", "example": "23 + 14" },
        { "concept": "Fair Shares", "icon": "🍕", "example": "Cut in halves" }
      ],
      "pages": [
        {
          "type": "read",
          "sentence": "Time for more review! We will practice harder problems.",
          "mathConcept": "Review introduction",
          "mathTip": "You can do it! Think step by step."
        },
        {
          "type": "menu",
          "prompt": "Pick a reward sticker!",
          "menuStory": "Great job reviewing! Pick a sticker.",
          "items": [
            { "name": "Star", "icon": "⭐", "description": "Bright and shiny" },
            { "name": "Heart", "icon": "❤️", "description": "Full of love" },
            { "name": "Trophy", "icon": "🏆", "description": "Winner!" }
          ]
        },
        {
          "type": "question",
          "questionType": "computation",
          "questionMode": "multipleChoice",
          "question": "What number is missing? ____ + 4 = 10",
          "mathContext": "I need 10 stickers. I have 4. How many more do I need?",
          "mathHint": "Think: what plus 4 equals 10?",
          "answers": [
            { "name": "6", "icon": "✅" },
            { "name": "5", "icon": "❌" },
            { "name": "14", "icon": "❌" }
          ],
          "correctAnswerName": "6",
          "successMessage": "Yes! 6 + 4 = 10."
        }
      ]
    }
  };

  Object.assign(allStations, reviewStations);
  totalStations += 2;

  // Assemble final content pack
  const contentPack = {
    ...shell,
    stations: allStations
  };

  // Validate station order matches
  const missingFromOrder = [];
  const missingFromStations = [];

  for (const stationId of shell.stationOrder) {
    if (!allStations[stationId]) {
      missingFromStations.push(stationId);
    }
  }

  for (const stationId of Object.keys(allStations)) {
    if (!shell.stationOrder.includes(stationId)) {
      missingFromOrder.push(stationId);
    }
  }

  if (missingFromStations.length > 0) {
    console.log(`\n${RED}Warning: Stations in order but not found:${RESET}`);
    missingFromStations.forEach(s => console.log(`  - ${s}`));
  }

  if (missingFromOrder.length > 0) {
    console.log(`\n${RED}Warning: Stations found but not in order:${RESET}`);
    missingFromOrder.forEach(s => console.log(`  - ${s}`));
  }

  // Write output
  const outputPath = path.join(mathContentDir, 'content-pack.v1.json');
  fs.writeFileSync(outputPath, JSON.stringify(contentPack, null, 2));

  console.log(`\n${GREEN}${BOLD}Success!${RESET}`);
  console.log(`Total stations assembled: ${totalStations}`);
  console.log(`Output written to: ${CYAN}${outputPath}${RESET}\n`);
}

assemble();
