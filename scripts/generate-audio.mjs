#!/usr/bin/env node

/**
 * Generate TTS audio files using ElevenLabs API
 *
 * Usage:
 *   node generate-audio.mjs                    # Generate all missing audio
 *   node generate-audio.mjs --dry-run          # Show what would be generated
 *   node generate-audio.mjs --station rf_f1    # Generate for specific station
 *   node generate-audio.mjs --force            # Regenerate all audio (even existing)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIFEST_PATH = join(__dirname, '../content/cpa-grade1-ela/audio-manifest.json');
const AUDIO_DIR = join(__dirname, '../assets/audio/ela');
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// ElevenLabs voice IDs
const VOICE_IDS = {
  'elevenlabs:angela': 'lqydY2xVUkg9cEIFmFMU' // Angela - warm, educational US voice
};

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const stationFilter = args.find(arg => arg.startsWith('--station='))?.split('=')[1];

// Rate limiting
const RATE_LIMIT_MS = 1000; // 1 request per second (adjust based on your plan)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Make API request to ElevenLabs TTS
 */
async function generateTTS(text, voiceId) {
  const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${voiceId}`,
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    }
  };

  const body = JSON.stringify({
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => chunks.push(chunk));

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(Buffer.concat(chunks));
        } else {
          const errorBody = Buffer.concat(chunks).toString();
          reject(new Error(`API Error ${res.statusCode}: ${errorBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Generate audio with retry logic
 */
async function generateWithRetry(text, voiceId, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await generateTTS(text, voiceId);
    } catch (error) {
      if (attempt === retries - 1) throw error;

      console.log(`  ⚠ Retry ${attempt + 1}/${retries - 1} after error: ${error.message}`);
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main generation function
 */
async function generateAudio() {
  // Validate API key
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ Error: ELEVENLABS_API_KEY environment variable not set');
    console.error('   Set it with: export ELEVENLABS_API_KEY=your_key_here');
    process.exit(1);
  }

  // Load manifest
  console.log('Loading audio manifest...');
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const voiceId = VOICE_IDS[manifest.voice];

  if (!voiceId) {
    console.error(`❌ Error: Unknown voice "${manifest.voice}"`);
    console.error('   Update VOICE_IDS mapping in this script');
    process.exit(1);
  }

  // Ensure audio directory exists
  if (!dryRun) {
    mkdirSync(AUDIO_DIR, { recursive: true });
  }

  // Filter audio clips to generate
  let audioEntries = Object.entries(manifest.audioMap);

  if (stationFilter) {
    audioEntries = audioEntries.filter(([id]) => id.startsWith(stationFilter));
    console.log(`Filtering to station: ${stationFilter}`);
  }

  if (!force) {
    audioEntries = audioEntries.filter(([id, entry]) => {
      const audioPath = join(__dirname, '..', entry.audioPath);
      return !existsSync(audioPath);
    });
  }

  const total = audioEntries.length;

  if (total === 0) {
    console.log('✓ All audio files already exist. Use --force to regenerate.');
    return;
  }

  console.log(`\n${dryRun ? 'Would generate' : 'Generating'} ${total} audio files...`);
  console.log(`Voice: ${manifest.voice} (${voiceId})`);
  console.log(`Rate limit: ${RATE_LIMIT_MS}ms between requests\n`);

  if (dryRun) {
    console.log('DRY RUN - No files will be generated\n');
    audioEntries.forEach(([id, entry], index) => {
      console.log(`${index + 1}/${total} ${id}`);
      console.log(`  Text: "${entry.text.substring(0, 60)}${entry.text.length > 60 ? '...' : ''}"`);
      console.log(`  Type: ${entry.type}`);
      console.log(`  Path: ${entry.audioPath}\n`);
    });
    return;
  }

  // Generate audio files
  let generated = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < audioEntries.length; i++) {
    const [id, entry] = audioEntries[i];
    const audioPath = join(__dirname, '..', entry.audioPath);
    const progress = `[${i + 1}/${total}]`;

    console.log(`${progress} ${id}`);
    console.log(`  "${entry.text.substring(0, 80)}${entry.text.length > 80 ? '...' : ''}"`);

    try {
      const audioBuffer = await generateWithRetry(entry.text, voiceId);

      // Ensure directory exists
      const audioDir = dirname(audioPath);
      mkdirSync(audioDir, { recursive: true });

      writeFileSync(audioPath, audioBuffer);

      // Update manifest
      manifest.audioMap[id].generated = true;
      manifest.audioMap[id].generatedAt = new Date().toISOString();

      generated++;
      console.log(`  ✓ Saved to ${entry.audioPath}`);
    } catch (error) {
      failed++;
      console.error(`  ❌ Failed: ${error.message}`);
    }

    // Rate limiting (except for last item)
    if (i < audioEntries.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Save updated manifest
  manifest.lastGeneratedAt = new Date().toISOString();
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generation complete in ${elapsed}s`);
  console.log(`  ✓ Generated: ${generated}`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed}`);
  }
  console.log(`  Manifest updated: ${MANIFEST_PATH}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Run
generateAudio().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
