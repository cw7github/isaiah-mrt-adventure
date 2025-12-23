#!/usr/bin/env node

/**
 * Verify Audio Manifest Completeness
 *
 * Checks that audio-manifest.json includes all text from content-pack.v1.json
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_PATH = join(__dirname, '../content/cpa-grade1-ela/content-pack.v1.json');
const MANIFEST_PATH = join(__dirname, '../content/cpa-grade1-ela/audio-manifest.json');

function extractTextFromContentPack(content) {
  const expectedAudio = new Map();

  // UI defaults
  if (content.uiDefaults?.trainAnnouncementTemplate) {
    expectedAudio.set('ui_train_announcement', {
      text: content.uiDefaults.trainAnnouncementTemplate,
      type: 'ui',
      context: 'train announcement template'
    });
  }

  // Process each station
  Object.keys(content.stations).forEach(stationId => {
    const station = content.stations[stationId];

    // Station announcement
    const announcement = content.uiDefaults.trainAnnouncementTemplate.replace('{stationName}', station.name);
    expectedAudio.set(`${stationId}_announcement`, {
      text: announcement,
      type: 'announcement',
      stationId,
      stationName: station.name
    });

    // Process pages
    if (station.pages) {
      station.pages.forEach((page, pageIndex) => {
        // Sentence
        if (page.sentence) {
          expectedAudio.set(`${stationId}_page${pageIndex}_sentence`, {
            text: page.sentence,
            type: 'sentence',
            stationId,
            pageIndex
          });
        }

        // Reading tip
        if (page.readingTip) {
          expectedAudio.set(`${stationId}_page${pageIndex}_readingtip`, {
            text: page.readingTip,
            type: 'readingTip',
            stationId,
            pageIndex
          });
        }

        // Question
        if (page.question) {
          expectedAudio.set(`${stationId}_page${pageIndex}_question`, {
            text: page.question,
            type: 'question',
            stationId,
            pageIndex
          });
        }

        // Passage
        if (page.passage) {
          expectedAudio.set(`${stationId}_page${pageIndex}_passage`, {
            text: page.passage,
            type: 'passage',
            stationId,
            pageIndex
          });
        }

        // Comprehension hint
        if (page.comprehensionHint) {
          expectedAudio.set(`${stationId}_page${pageIndex}_comprehensionhint`, {
            text: page.comprehensionHint,
            type: 'comprehensionHint',
            stationId,
            pageIndex
          });
        }

        // Success message
        if (page.successMessage) {
          expectedAudio.set(`${stationId}_page${pageIndex}_successmessage`, {
            text: page.successMessage,
            type: 'successMessage',
            stationId,
            pageIndex
          });
        }

        // Answer options (for audio feedback)
        if (page.answers && Array.isArray(page.answers)) {
          page.answers.forEach((answer, answerIndex) => {
            if (answer.name) {
              expectedAudio.set(`${stationId}_page${pageIndex}_answer${answerIndex}`, {
                text: answer.name,
                type: 'answer',
                stationId,
                pageIndex,
                answerIndex
              });
            }
          });
        }

        // Wrong answer feedback
        if (page.wrongAnswerFeedback) {
          expectedAudio.set(`${stationId}_page${pageIndex}_wronganswerfeedback`, {
            text: page.wrongAnswerFeedback,
            type: 'wrongAnswerFeedback',
            stationId,
            pageIndex
          });
        }

        // Phonics note (if it's a full sentence)
        if (page.phonicsNote && page.phonicsNote.length > 20) {
          expectedAudio.set(`${stationId}_page${pageIndex}_phonicsnote`, {
            text: page.phonicsNote,
            type: 'phonicsNote',
            stationId,
            pageIndex
          });
        }
      });
    }

    // Preview words (if they have descriptions)
    if (station.previewWords) {
      station.previewWords.forEach((word, wordIndex) => {
        if (word.phonicsNote && word.phonicsNote.length > 10) {
          expectedAudio.set(`${stationId}_previewword${wordIndex}_phonics`, {
            text: word.phonicsNote,
            type: 'previewWordPhonics',
            stationId,
            wordIndex
          });
        }
      });
    }
  });

  return expectedAudio;
}

function verifyManifest() {
  console.log('Audio Manifest Verification');
  console.log('============================\n');

  // Load files
  const content = JSON.parse(readFileSync(CONTENT_PATH, 'utf-8'));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  // Extract expected audio
  const expectedAudio = extractTextFromContentPack(content);

  console.log(`Expected audio clips: ${expectedAudio.size}`);
  console.log(`Manifest audio clips: ${manifest.totalAudioClips}`);
  console.log(`Manifest map entries: ${Object.keys(manifest.audioMap).length}\n`);

  // Find missing entries
  const missing = [];
  const mismatched = [];
  const extra = [];

  expectedAudio.forEach((expected, id) => {
    if (!manifest.audioMap[id]) {
      missing.push({ id, ...expected });
    } else if (manifest.audioMap[id].text !== expected.text) {
      mismatched.push({
        id,
        expected: expected.text,
        actual: manifest.audioMap[id].text
      });
    }
  });

  // Find extra entries in manifest
  Object.keys(manifest.audioMap).forEach(id => {
    if (!expectedAudio.has(id)) {
      extra.push({
        id,
        text: manifest.audioMap[id].text,
        type: manifest.audioMap[id].type
      });
    }
  });

  // Report results
  console.log('Missing Entries:');
  console.log('================');
  if (missing.length === 0) {
    console.log('✓ No missing entries\n');
  } else {
    console.log(`❌ ${missing.length} missing entries:\n`);
    missing.slice(0, 10).forEach(item => {
      console.log(`  ${item.id}`);
      console.log(`    Text: "${item.text.substring(0, 60)}${item.text.length > 60 ? '...' : ''}"`);
      console.log(`    Type: ${item.type}\n`);
    });
    if (missing.length > 10) {
      console.log(`  ... and ${missing.length - 10} more\n`);
    }
  }

  console.log('Mismatched Text:');
  console.log('================');
  if (mismatched.length === 0) {
    console.log('✓ No text mismatches\n');
  } else {
    console.log(`❌ ${mismatched.length} text mismatches:\n`);
    mismatched.slice(0, 5).forEach(item => {
      console.log(`  ${item.id}`);
      console.log(`    Expected: "${item.expected}"`);
      console.log(`    Actual:   "${item.actual}"\n`);
    });
    if (mismatched.length > 5) {
      console.log(`  ... and ${mismatched.length - 5} more\n`);
    }
  }

  console.log('Extra Entries:');
  console.log('==============');
  if (extra.length === 0) {
    console.log('✓ No extra entries\n');
  } else {
    console.log(`ℹ ${extra.length} extra entries (may be intentional):\n`);
    extra.slice(0, 5).forEach(item => {
      console.log(`  ${item.id}`);
      console.log(`    Text: "${item.text.substring(0, 60)}${item.text.length > 60 ? '...' : ''}"`);
      console.log(`    Type: ${item.type}\n`);
    });
    if (extra.length > 5) {
      console.log(`  ... and ${extra.length - 5} more\n`);
    }
  }

  // Summary
  console.log('Summary:');
  console.log('========');
  if (missing.length === 0 && mismatched.length === 0) {
    console.log('✓ Audio manifest is complete and correct!');
  } else {
    console.log(`❌ Issues found:`);
    if (missing.length > 0) console.log(`   - ${missing.length} missing entries`);
    if (mismatched.length > 0) console.log(`   - ${mismatched.length} mismatched texts`);
  }

  // Return exit code
  return (missing.length === 0 && mismatched.length === 0) ? 0 : 1;
}

// Run verification
const exitCode = verifyManifest();
process.exit(exitCode);
