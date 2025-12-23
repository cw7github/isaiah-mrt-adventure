#!/usr/bin/env node
/**
 * Extract all audio texts from math content pack for TTS generation
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

async function main() {
  const contentPackPath = path.join(ROOT, 'content/cpa-grade1-math/content-pack.v1.json');
  const outputPath = path.join(ROOT, 'content/cpa-grade1-math/audio-manifest.json');

  const contentPack = JSON.parse(await fs.readFile(contentPackPath, 'utf8'));
  const audioMap = {};
  let count = 0;

  // Train announcements
  for (const stationId of contentPack.stationOrder) {
    const station = contentPack.stations[stationId];
    if (!station) continue;

    const stationName = station.name;

    // Announcement
    const announcementKey = `${stationId}_announcement`;
    audioMap[announcementKey] = {
      text: `All aboard! Next stop: ${stationName}.`,
      audioPath: `assets/audio/math/${announcementKey}.mp3`,
      type: 'announcement',
      stationId,
      stationName
    };
    count++;

    // Process pages
    if (!Array.isArray(station.pages)) continue;

    station.pages.forEach((page, pageIndex) => {
      const prefix = `${stationId}_page${pageIndex}`;

      // Sentences
      if (page.sentence) {
        audioMap[`${prefix}_sentence`] = {
          text: page.sentence,
          audioPath: `assets/audio/math/${prefix}_sentence.mp3`,
          type: 'sentence',
          stationId,
          pageIndex
        };
        count++;
      }

      // Math tips
      if (page.mathTip) {
        audioMap[`${prefix}_mathtip`] = {
          text: page.mathTip,
          audioPath: `assets/audio/math/${prefix}_mathtip.mp3`,
          type: 'mathTip',
          stationId,
          pageIndex
        };
        count++;
      }

      // Math concepts
      if (page.mathConcept) {
        audioMap[`${prefix}_mathconcept`] = {
          text: page.mathConcept,
          audioPath: `assets/audio/math/${prefix}_mathconcept.mp3`,
          type: 'mathConcept',
          stationId,
          pageIndex
        };
        count++;
      }

      // Questions
      if (page.question) {
        audioMap[`${prefix}_question`] = {
          text: page.question,
          audioPath: `assets/audio/math/${prefix}_question.mp3`,
          type: 'question',
          stationId,
          pageIndex
        };
        count++;
      }

      // Math context
      if (page.mathContext) {
        audioMap[`${prefix}_mathcontext`] = {
          text: page.mathContext,
          audioPath: `assets/audio/math/${prefix}_mathcontext.mp3`,
          type: 'mathContext',
          stationId,
          pageIndex
        };
        count++;
      }

      // Number sentences
      if (page.numberSentence) {
        audioMap[`${prefix}_numbersentence`] = {
          text: page.numberSentence,
          audioPath: `assets/audio/math/${prefix}_numbersentence.mp3`,
          type: 'numberSentence',
          stationId,
          pageIndex
        };
        count++;
      }

      // Math hints
      if (page.mathHint) {
        audioMap[`${prefix}_mathhint`] = {
          text: page.mathHint,
          audioPath: `assets/audio/math/${prefix}_mathhint.mp3`,
          type: 'mathHint',
          stationId,
          pageIndex
        };
        count++;
      }

      // Success messages
      if (page.successMessage) {
        audioMap[`${prefix}_success`] = {
          text: page.successMessage,
          audioPath: `assets/audio/math/${prefix}_success.mp3`,
          type: 'success',
          stationId,
          pageIndex
        };
        count++;
      }

      // Menu prompts
      if (page.prompt) {
        audioMap[`${prefix}_prompt`] = {
          text: page.prompt,
          audioPath: `assets/audio/math/${prefix}_prompt.mp3`,
          type: 'menuPrompt',
          stationId,
          pageIndex
        };
        count++;
      }

      // Menu story
      if (page.menuStory) {
        audioMap[`${prefix}_menustory`] = {
          text: page.menuStory,
          audioPath: `assets/audio/math/${prefix}_menustory.mp3`,
          type: 'menuStory',
          stationId,
          pageIndex
        };
        count++;
      }

      // Menu items
      if (Array.isArray(page.items)) {
        page.items.forEach((item, itemIndex) => {
          if (item.name) {
            audioMap[`${prefix}_item${itemIndex}_name`] = {
              text: item.name,
              audioPath: `assets/audio/math/${prefix}_item${itemIndex}_name.mp3`,
              type: 'menuItemName',
              stationId,
              pageIndex,
              itemIndex
            };
            count++;
          }
          if (item.description) {
            audioMap[`${prefix}_item${itemIndex}_desc`] = {
              text: item.description,
              audioPath: `assets/audio/math/${prefix}_item${itemIndex}_desc.mp3`,
              type: 'menuItemDescription',
              stationId,
              pageIndex,
              itemIndex
            };
            count++;
          }
        });
      }

      // Answers
      if (Array.isArray(page.answers)) {
        page.answers.forEach((answer, answerIndex) => {
          if (answer.name) {
            audioMap[`${prefix}_answer${answerIndex}`] = {
              text: answer.name,
              audioPath: `assets/audio/math/${prefix}_answer${answerIndex}.mp3`,
              type: 'answer',
              stationId,
              pageIndex,
              answerIndex
            };
            count++;
          }
        });
      }
    });
  }

  // Calculate stats
  const totalChars = Object.values(audioMap).reduce((sum, item) => sum + item.text.length, 0);

  const manifest = {
    generatedAt: new Date().toISOString(),
    voice: 'elevenlabs:angela',
    totalAudioClips: count,
    totalCharacters: totalChars,
    estimatedCost: `$${(totalChars * 0.00003).toFixed(2)}`,
    audioMap
  };

  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated math audio manifest: ${count} clips, ${totalChars} characters`);
  console.log(`Output: ${outputPath}`);
}

main().catch(console.error);
