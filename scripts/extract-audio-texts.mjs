#!/usr/bin/env node

/**
 * Extract all text strings that need TTS audio from content pack
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_PATH = join(__dirname, '../content/cpa-grade1-ela/content-pack.v1.json');
const OUTPUT_PATH = join(__dirname, '../content/cpa-grade1-ela/audio-manifest.json');

function extractAudioTexts(contentPack) {
  const audioMap = {};
  let totalCount = 0;

  // Helper to add audio entry
  const addAudio = (id, text, metadata = {}) => {
    if (!text || text.trim() === '') return;
    audioMap[id] = {
      text: text.trim(),
      audioPath: `assets/audio/ela/${id}.mp3`,
      generated: false,
      ...metadata
    };
    totalCount++;
  };

  // Extract train announcement template
  if (contentPack.uiDefaults?.trainAnnouncementTemplate) {
    addAudio(
      'ui_train_announcement',
      contentPack.uiDefaults.trainAnnouncementTemplate,
      { type: 'ui', context: 'train announcement template' }
    );
  }

  // Process each station
  for (const [stationId, station] of Object.entries(contentPack.stations)) {
    // Station name announcement
    const announcement = contentPack.uiDefaults.trainAnnouncementTemplate.replace(
      '{stationName}',
      station.name
    );
    addAudio(
      `${stationId}_announcement`,
      announcement,
      { type: 'announcement', stationId, stationName: station.name }
    );

    // Process pages
    station.pages?.forEach((page, pageIndex) => {
      const pagePrefix = `${stationId}_page${pageIndex}`;

      if (page.type === 'read') {
        // Read page sentence
        if (page.sentence) {
          addAudio(
            `${pagePrefix}_sentence`,
            page.sentence,
            { type: 'sentence', stationId, pageIndex }
          );
        }

        // Reading tip
        if (page.readingTip) {
          addAudio(
            `${pagePrefix}_readingtip`,
            page.readingTip,
            { type: 'readingTip', stationId, pageIndex }
          );
        }
      } else if (page.type === 'question') {
        // Question text
        if (page.question) {
          addAudio(
            `${pagePrefix}_question`,
            page.question,
            { type: 'question', stationId, pageIndex }
          );
        }

        // Passage
        if (page.passage) {
          addAudio(
            `${pagePrefix}_passage`,
            page.passage,
            { type: 'passage', stationId, pageIndex }
          );
        }

        // Comprehension hint
        if (page.comprehensionHint) {
          addAudio(
            `${pagePrefix}_hint`,
            page.comprehensionHint,
            { type: 'hint', stationId, pageIndex }
          );
        }

        // Answer choices
        page.answers?.forEach((answer, answerIndex) => {
          if (answer.name) {
            addAudio(
              `${pagePrefix}_answer${answerIndex}`,
              answer.name,
              { type: 'answer', stationId, pageIndex, answerIndex }
            );
          }
        });

        // Success message
        if (page.successMessage) {
          addAudio(
            `${pagePrefix}_success`,
            page.successMessage,
            { type: 'success', stationId, pageIndex }
          );
        }

        // Wrong answer feedback
        if (page.wrongAnswerFeedback) {
          addAudio(
            `${pagePrefix}_wrongfeedback`,
            page.wrongAnswerFeedback,
            { type: 'wrongFeedback', stationId, pageIndex }
          );
        }
      } else if (page.type === 'activitySpec') {
        // Activity prompt
        if (page.prompt) {
          addAudio(
            `${pagePrefix}_prompt`,
            page.prompt,
            { type: 'activityPrompt', stationId, pageIndex, activityType: page.activityType }
          );
        }

        // Success criteria (may be useful for TTS feedback)
        if (page.successCriteria && page.successCriteria.length > 20) {
          addAudio(
            `${pagePrefix}_successcriteria`,
            page.successCriteria,
            { type: 'successCriteria', stationId, pageIndex }
          );
        }
      } else if (page.type === 'menu') {
        // Menu prompt
        if (page.prompt) {
          addAudio(
            `${pagePrefix}_prompt`,
            page.prompt,
            { type: 'menuPrompt', stationId, pageIndex }
          );
        }

        // Menu story
        if (page.menuStory) {
          addAudio(
            `${pagePrefix}_menustory`,
            page.menuStory,
            { type: 'menuStory', stationId, pageIndex }
          );
        }

        // Menu items
        page.items?.forEach((item, itemIndex) => {
          if (item.name) {
            addAudio(
              `${pagePrefix}_item${itemIndex}_name`,
              item.name,
              { type: 'menuItemName', stationId, pageIndex, itemIndex }
            );
          }
          if (item.description) {
            addAudio(
              `${pagePrefix}_item${itemIndex}_desc`,
              item.description,
              { type: 'menuItemDescription', stationId, pageIndex, itemIndex }
            );
          }
        });
      }
    });
  }

  return { audioMap, totalCount };
}

// Main execution
try {
  console.log('Reading content pack...');
  const contentPack = JSON.parse(readFileSync(CONTENT_PATH, 'utf-8'));

  console.log('Extracting audio texts...');
  const { audioMap, totalCount } = extractAudioTexts(contentPack);

  const manifest = {
    generatedAt: new Date().toISOString(),
    voice: contentPack.uiDefaults.voice,
    totalAudioClips: totalCount,
    audioMap
  };

  console.log('Writing audio manifest...');
  writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n✓ Audio manifest created at: ${OUTPUT_PATH}`);
  console.log(`✓ Total audio clips needed: ${totalCount}`);

  // Summary by type
  const typeCounts = {};
  Object.values(audioMap).forEach(entry => {
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
  });

  console.log('\nBreakdown by type:');
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
