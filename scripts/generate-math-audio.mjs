#!/usr/bin/env node
/**
 * Generate ElevenLabs TTS audio for math content
 * Uses the existing TTS manifest and generates mp3 files with word timings
 *
 * Supports parallel batch processing:
 *   node generate-math-audio.mjs --batch 1 --total-batches 5
 *   node generate-math-audio.mjs --batch 2 --total-batches 5
 *   etc.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'content/cpa-grade1-math/audio-manifest.json');
const AUDIO_DIR = path.join(ROOT, 'assets/audio/math');
const TTS_DIR = path.join(ROOT, 'assets/tts-math');

// Parse batch arguments
const args = process.argv.slice(2);
let BATCH_NUM = 0;
let TOTAL_BATCHES = 1;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batch' && args[i + 1]) BATCH_NUM = parseInt(args[i + 1], 10);
  if (args[i] === '--total-batches' && args[i + 1]) TOTAL_BATCHES = parseInt(args[i + 1], 10);
}

const TTS_MANIFEST_PATH = BATCH_NUM > 0
  ? path.join(ROOT, `assets/tts-math/manifest-batch-${BATCH_NUM}.json`)
  : path.join(ROOT, 'assets/tts-math/manifest.json');

let API_KEY = '';
const VOICE_ID = 'lqydY2xVUkg9cEIFmFMU'; // Angela
const MODEL_ID = 'eleven_v3';

async function loadEnv() {
  try {
    const content = await fs.readFile(path.join(ROOT, '.env.local'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* ignore */ }
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function buildWordTimingsFromAlignment(alignment) {
  if (!alignment) return null;
  const chars = alignment.characters || [];
  const starts = alignment.character_start_times_seconds || [];
  const ends = alignment.character_end_times_seconds || [];

  const n = Math.min(chars.length, starts.length, ends.length);
  if (n <= 0) return null;

  const words = [], startMs = [], endMs = [];
  let currentChars = [], currentStartMs = null, currentEndMs = null;

  const pushCurrent = () => {
    if (currentChars.length === 0) return;
    const word = currentChars.join('');
    if (!word || currentStartMs === null || currentEndMs === null) return;
    words.push(word);
    startMs.push(currentStartMs);
    endMs.push(currentEndMs);
    currentChars = [];
    currentStartMs = null;
    currentEndMs = null;
  };

  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    if (/\s/.test(ch)) {
      pushCurrent();
      continue;
    }
    if (currentChars.length === 0) {
      currentStartMs = Math.round(starts[i] * 1000);
    }
    currentChars.push(ch);
    currentEndMs = Math.round(ends[i] * 1000);
  }
  pushCurrent();

  if (words.length === 0) return null;

  // Ensure monotonic
  let lastEnd = 0;
  for (let i = 0; i < words.length; i++) {
    startMs[i] = Math.max(startMs[i], lastEnd);
    endMs[i] = Math.max(endMs[i], startMs[i]);
    lastEnd = endMs[i];
  }

  return { words, startMs, endMs };
}

async function generateTTS(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  return response.json();
}

async function main() {
  await loadEnv();
  API_KEY = process.env.ELEVENLABS_API_KEY || '';

  if (!API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY');
    process.exit(1);
  }

  await fs.mkdir(TTS_DIR, { recursive: true });

  // Load math audio manifest
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));

  // Load existing TTS manifest if it exists
  let ttsManifest = { version: 1, voiceId: VOICE_ID, modelId: MODEL_ID, items: {} };
  try {
    ttsManifest = JSON.parse(await fs.readFile(TTS_MANIFEST_PATH, 'utf8'));
  } catch { /* ignore */ }

  // Also load main manifest to check for duplicates when in batch mode
  let mainManifest = { items: {} };
  if (BATCH_NUM > 0) {
    try {
      const mainPath = path.join(ROOT, 'assets/tts-math/manifest.json');
      mainManifest = JSON.parse(await fs.readFile(mainPath, 'utf8'));
    } catch { /* ignore */ }
  }

  const allEntries = Object.entries(manifest.audioMap);
  const totalAll = allEntries.length;

  // Calculate batch slice
  let entries;
  if (BATCH_NUM > 0 && TOTAL_BATCHES > 1) {
    const batchSize = Math.ceil(totalAll / TOTAL_BATCHES);
    const start = (BATCH_NUM - 1) * batchSize;
    const end = Math.min(start + batchSize, totalAll);
    entries = allEntries.slice(start, end);
    console.log(`\nMath Audio Generation - Batch ${BATCH_NUM}/${TOTAL_BATCHES}`);
    console.log(`=============================================`);
    console.log(`Processing entries ${start + 1}-${end} of ${totalAll}`);
  } else {
    entries = allEntries;
    console.log(`\nMath Audio Generation`);
    console.log(`=====================`);
  }

  const total = entries.length;
  let done = 0, skipped = 0, failed = 0;

  console.log(`Batch clips: ${total}`);
  console.log(`Voice: Angela (${VOICE_ID})\n`);

  for (const [key, item] of entries) {
    done++;
    const cacheKey = item.text.toLowerCase().trim();

    // Check if already exists (in batch manifest or main manifest)
    if (ttsManifest.items[cacheKey] || mainManifest.items[cacheKey]) {
      skipped++;
      if (done % 50 === 0) console.log(`[${done}/${total}] skipped ${skipped}, failed ${failed}`);
      continue;
    }

    try {
      const result = await generateTTS(item.text);

      if (!result.audio_base64) {
        throw new Error('No audio in response');
      }

      const hash = sha256Hex([VOICE_ID, MODEL_ID, cacheKey].join('|'));
      const fileName = `${hash}.mp3`;
      const buffer = Buffer.from(result.audio_base64, 'base64');

      await fs.writeFile(path.join(TTS_DIR, fileName), buffer);

      const wordTimings = buildWordTimingsFromAlignment(result.alignment);

      ttsManifest.items[cacheKey] = {
        text: item.text,
        file: `assets/tts-math/${fileName}`,
        mimeType: 'audio/mpeg',
        wordTimings
      };

      // Save manifest periodically
      if (done % 10 === 0) {
        ttsManifest.generatedAt = new Date().toISOString();
        await fs.writeFile(TTS_MANIFEST_PATH, JSON.stringify(ttsManifest, null, 2));
      }

      if (done % 25 === 0) console.log(`[${done}/${total}] generated ${done - skipped - failed}, skipped ${skipped}`);

      // Rate limiting
      await new Promise(r => setTimeout(r, 100));

    } catch (error) {
      failed++;
      console.warn(`[${done}/${total}] FAILED: ${item.text.substring(0, 40)}... - ${error.message}`);

      // Retry delay on error
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Final save
  ttsManifest.generatedAt = new Date().toISOString();
  await fs.writeFile(TTS_MANIFEST_PATH, JSON.stringify(ttsManifest, null, 2));

  if (BATCH_NUM > 0) {
    console.log(`\nBATCH ${BATCH_NUM} COMPLETE!`);
  } else {
    console.log(`\nComplete!`);
  }
  console.log(`Generated: ${done - skipped - failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Manifest: ${TTS_MANIFEST_PATH}`);
}

main().catch(console.error);
