#!/usr/bin/env node
/**
 * Math Integration Validation Script
 * Validates that all math content and code integration is complete
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}${details ? `: ${details}` : ''}`);
    passed++;
  } else {
    console.log(`❌ ${name}${details ? `: ${details}` : ''}`);
    failed++;
  }
  checks.push({ name, passed: condition, details });
}

console.log('\n🧪 Math Integration Validation\n');
console.log('='.repeat(50));

// 1. Check content pack exists
const contentPackPath = join(ROOT, 'content/cpa-grade1-math/content-pack.v1.json');
check('Content pack exists', existsSync(contentPackPath));

if (existsSync(contentPackPath)) {
  const contentPack = JSON.parse(readFileSync(contentPackPath, 'utf8'));

  check('Schema version is 1', contentPack.schemaVersion === 1);
  check('Has stations object', !!contentPack.stations);
  check('Has station order', Array.isArray(contentPack.stationOrder));
  check('At least 28 stations', Object.keys(contentPack.stations).length >= 28,
    `Found ${Object.keys(contentPack.stations).length}`);

  // Check for math-specific fields
  let hasVisuals = 0;
  let hasMathTip = 0;
  let hasMathConcept = 0;
  let hasNumberSentence = 0;

  Object.values(contentPack.stations).forEach(station => {
    if (station.pages) {
      station.pages.forEach(page => {
        if (page.visual) hasVisuals++;
        if (page.mathTip) hasMathTip++;
        if (page.mathConcept) hasMathConcept++;
        if (page.numberSentence) hasNumberSentence++;
      });
    }
  });

  check('Has visual objects', hasVisuals > 0, `Found ${hasVisuals} pages with visuals`);
  check('Has mathTip fields', hasMathTip > 0, `Found ${hasMathTip} pages with mathTip`);
  check('Has mathConcept fields', hasMathConcept > 0, `Found ${hasMathConcept} pages with mathConcept`);
  check('Has numberSentence fields', hasNumberSentence > 0, `Found ${hasNumberSentence} questions with numberSentence`);
}

// 2. Check index.html for code
const indexPath = join(ROOT, 'index.html');
if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf8');

  check('Has renderMathVisual function', indexContent.includes('function renderMathVisual'));
  check('Has renderNumberLine function', indexContent.includes('function renderNumberLine'));
  check('Has renderCounters function', indexContent.includes('function renderCounters'));
  check('Has renderTenFrame function', indexContent.includes('function renderTenFrame'));
  check('Has render2DShapes function', indexContent.includes('function render2DShapes'));
  check('Has render3DShape function', indexContent.includes('function render3DShape'));
  check('Has CPASystem object', indexContent.includes('CPASystem'));
  check('Has math visual CSS', indexContent.includes('.math-visual-container'));
  check('Has number line CSS', indexContent.includes('.number-line'));
  check('Has ten frame CSS', indexContent.includes('.ten-frame'));
  check('Has 2D shapes CSS', indexContent.includes('.shapes-container'));
  check('Has 3D shapes CSS', indexContent.includes('.shape-3d-container'));
  check('Has CPA progress CSS', indexContent.includes('.cpa-progress-bar'));
}

// 3. Check station-selection.js
const stationSelectionPath = join(ROOT, 'station-selection.js');
if (existsSync(stationSelectionPath)) {
  const ssContent = readFileSync(stationSelectionPath, 'utf8');

  check('Has MATH_LINE_CONFIG', ssContent.includes('MATH_LINE_CONFIG'));
  check('Has CONTENT_PACKS', ssContent.includes('CONTENT_PACKS'));
  check('Has switchSubject function', ssContent.includes('function switchSubject'));
  check('Has math content pack path', ssContent.includes('cpa-grade1-math'));
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All validations passed! Math integration is complete.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some validations failed. Please review and fix.\n');
  process.exit(1);
}
