#!/usr/bin/env node
/**
 * Merge batch manifests into main manifest
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TTS_DIR = path.join(ROOT, 'assets/tts-math');
const MAIN_MANIFEST_PATH = path.join(TTS_DIR, 'manifest.json');

async function main() {
  // Load main manifest
  let mainManifest = { version: 1, voiceId: 'lqydY2xVUkg9cEIFmFMU', modelId: 'eleven_v3', items: {} };
  try {
    mainManifest = JSON.parse(await fs.readFile(MAIN_MANIFEST_PATH, 'utf8'));
  } catch { /* ignore */ }

  const initialCount = Object.keys(mainManifest.items).length;
  console.log(`Main manifest has ${initialCount} items`);

  // Find and merge batch manifests
  const files = await fs.readdir(TTS_DIR);
  const batchFiles = files.filter(f => f.startsWith('manifest-batch-') && f.endsWith('.json'));

  for (const batchFile of batchFiles.sort()) {
    const batchPath = path.join(TTS_DIR, batchFile);
    try {
      const batch = JSON.parse(await fs.readFile(batchPath, 'utf8'));
      const batchItems = Object.keys(batch.items || {}).length;
      console.log(`Merging ${batchFile}: ${batchItems} items`);

      // Merge items
      for (const [key, value] of Object.entries(batch.items || {})) {
        if (!mainManifest.items[key]) {
          mainManifest.items[key] = value;
        }
      }
    } catch (err) {
      console.warn(`Failed to read ${batchFile}: ${err.message}`);
    }
  }

  const finalCount = Object.keys(mainManifest.items).length;
  console.log(`\nMerged ${finalCount - initialCount} new items`);
  console.log(`Total items: ${finalCount}`);

  // Save merged manifest
  mainManifest.generatedAt = new Date().toISOString();
  await fs.writeFile(MAIN_MANIFEST_PATH, JSON.stringify(mainManifest, null, 2));
  console.log(`Saved: ${MAIN_MANIFEST_PATH}`);

  // Clean up batch files
  for (const batchFile of batchFiles) {
    await fs.unlink(path.join(TTS_DIR, batchFile));
    console.log(`Removed: ${batchFile}`);
  }
}

main().catch(console.error);
