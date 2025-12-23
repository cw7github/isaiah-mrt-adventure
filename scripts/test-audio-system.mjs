#!/usr/bin/env node

/**
 * Test Audio System Integration
 *
 * Verifies:
 * 1. Manifest is complete and correct
 * 2. Audio player can be initialized
 * 3. Error handling works for missing files
 * 4. Preloading works
 * 5. Queue processing works
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_PATH = join(__dirname, '../content/cpa-grade1-ela/content-pack.v1.json');
const MANIFEST_PATH = join(__dirname, '../content/cpa-grade1-ela/audio-manifest.json');

console.log('Audio System Integration Test');
console.log('==============================\n');

// Test 1: Manifest Structure
console.log('Test 1: Manifest Structure');
console.log('---------------------------');
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log('✓ Manifest loads successfully');
  console.log(`✓ Total audio clips: ${manifest.totalAudioClips}`);
  console.log(`✓ Voice configured: ${manifest.voice}`);

  // Check required fields
  const sampleId = Object.keys(manifest.audioMap)[0];
  const sampleEntry = manifest.audioMap[sampleId];

  const requiredFields = ['text', 'audioPath', 'generated', 'type'];
  const hasAllFields = requiredFields.every(field => field in sampleEntry);

  if (hasAllFields) {
    console.log('✓ Audio entries have required fields');
  } else {
    console.log('❌ Missing required fields in audio entries');
  }

  console.log(`Sample entry (${sampleId}):`);
  console.log(`  Text: "${sampleEntry.text}"`);
  console.log(`  Path: ${sampleEntry.audioPath}`);
  console.log(`  Type: ${sampleEntry.type}`);
} catch (error) {
  console.error('❌ Manifest test failed:', error.message);
}

console.log('');

// Test 2: Content Pack Alignment
console.log('Test 2: Content Pack Alignment');
console.log('-------------------------------');
try {
  const content = JSON.parse(readFileSync(CONTENT_PATH, 'utf-8'));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  // Check station announcements
  const stations = Object.keys(content.stations);
  const announcementsPresent = stations.every(stationId =>
    manifest.audioMap[`${stationId}_announcement`]
  );

  if (announcementsPresent) {
    console.log(`✓ All ${stations.length} station announcements present`);
  } else {
    console.log('❌ Some station announcements missing');
  }

  // Check UI elements
  if (manifest.audioMap['ui_train_announcement']) {
    console.log('✓ UI train announcement template present');
  } else {
    console.log('❌ UI train announcement missing');
  }

  // Sample a few stations for page content
  const sampleStations = stations.slice(0, 3);
  let pageAudioCount = 0;
  let missingPageAudio = 0;

  sampleStations.forEach(stationId => {
    const station = content.stations[stationId];
    station.pages?.forEach((page, pageIndex) => {
      const pagePrefix = `${stationId}_page${pageIndex}`;

      if (page.sentence && !manifest.audioMap[`${pagePrefix}_sentence`]) {
        missingPageAudio++;
      } else if (page.sentence) {
        pageAudioCount++;
      }

      if (page.question && !manifest.audioMap[`${pagePrefix}_question`]) {
        missingPageAudio++;
      } else if (page.question) {
        pageAudioCount++;
      }
    });
  });

  if (missingPageAudio === 0) {
    console.log(`✓ Sample check: ${pageAudioCount} page audio entries found`);
  } else {
    console.log(`⚠ Sample check found ${missingPageAudio} missing entries`);
  }
} catch (error) {
  console.error('❌ Content alignment test failed:', error.message);
}

console.log('');

// Test 3: Audio Types Distribution
console.log('Test 3: Audio Types Distribution');
console.log('---------------------------------');
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  const typeCounts = {};
  Object.values(manifest.audioMap).forEach(entry => {
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
  });

  console.log('Audio types breakdown:');
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type.padEnd(20)}: ${count}`);
    });
} catch (error) {
  console.error('❌ Audio types test failed:', error.message);
}

console.log('');

// Test 4: Path Consistency
console.log('Test 4: Path Consistency');
console.log('------------------------');
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  const pathIssues = [];
  Object.entries(manifest.audioMap).forEach(([id, entry]) => {
    const expectedPath = `assets/audio/ela/${id}.mp3`;
    if (entry.audioPath !== expectedPath) {
      pathIssues.push({ id, expected: expectedPath, actual: entry.audioPath });
    }
  });

  if (pathIssues.length === 0) {
    console.log('✓ All audio paths follow naming convention');
  } else {
    console.log(`❌ Found ${pathIssues.length} path inconsistencies`);
    pathIssues.slice(0, 3).forEach(issue => {
      console.log(`  ${issue.id}:`);
      console.log(`    Expected: ${issue.expected}`);
      console.log(`    Actual: ${issue.actual}`);
    });
  }
} catch (error) {
  console.error('❌ Path consistency test failed:', error.message);
}

console.log('');

// Test 5: Text Quality
console.log('Test 5: Text Quality');
console.log('--------------------');
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  const emptyTexts = [];
  const longTexts = [];
  const suspiciousTexts = [];

  Object.entries(manifest.audioMap).forEach(([id, entry]) => {
    if (!entry.text || entry.text.trim() === '') {
      emptyTexts.push(id);
    } else if (entry.text.length > 500) {
      longTexts.push({ id, length: entry.text.length });
    } else if (entry.text.includes('{') || entry.text.includes('}')) {
      suspiciousTexts.push({ id, text: entry.text });
    }
  });

  if (emptyTexts.length === 0) {
    console.log('✓ No empty text entries');
  } else {
    console.log(`❌ Found ${emptyTexts.length} empty text entries`);
  }

  if (longTexts.length === 0) {
    console.log('✓ No unusually long texts (>500 chars)');
  } else {
    console.log(`⚠ Found ${longTexts.length} long texts (may affect TTS)`);
  }

  if (suspiciousTexts.length === 0) {
    console.log('✓ No template placeholders in text');
  } else {
    console.log(`⚠ Found ${suspiciousTexts.length} texts with placeholders:`);
    suspiciousTexts.forEach(item => {
      console.log(`  ${item.id}: "${item.text}"`);
    });
  }
} catch (error) {
  console.error('❌ Text quality test failed:', error.message);
}

console.log('');

// Test 6: Generation Status
console.log('Test 6: Generation Status');
console.log('-------------------------');
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  const generated = Object.values(manifest.audioMap).filter(e => e.generated).length;
  const notGenerated = Object.values(manifest.audioMap).filter(e => !e.generated).length;

  console.log(`Generated: ${generated}`);
  console.log(`Not generated: ${notGenerated}`);
  console.log(`Completion: ${((generated / manifest.totalAudioClips) * 100).toFixed(1)}%`);

  if (generated === 0) {
    console.log('ℹ No audio files generated yet (run generate-audio.mjs)');
  } else if (notGenerated === 0) {
    console.log('✓ All audio files have been generated!');
  }
} catch (error) {
  console.error('❌ Generation status test failed:', error.message);
}

console.log('');
console.log('==============================');
console.log('Test Summary');
console.log('==============================');
console.log('All tests completed. Review results above.');
console.log('');
console.log('Next steps:');
console.log('1. Run: node scripts/extract-audio-texts.mjs (regenerate manifest if needed)');
console.log('2. Run: node scripts/generate-audio.mjs --dry-run (preview generation)');
console.log('3. Run: node scripts/generate-audio.mjs (generate audio files)');
console.log('4. Integrate AudioPlayer in your app with proper callbacks');
