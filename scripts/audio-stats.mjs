#!/usr/bin/env node

/**
 * Audio Manifest Statistics
 *
 * Shows detailed statistics about audio manifest
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIFEST_PATH = join(__dirname, '../content/cpa-grade1-ela/audio-manifest.json');

function formatBytes(bytes) {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function analyzeManifest() {
  console.log('Loading manifest...\n');
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

  // Basic stats
  console.log('═══════════════════════════════════════════════════════');
  console.log('  AUDIO MANIFEST STATISTICS');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Basic Info:');
  console.log(`  Total Audio Clips: ${manifest.totalAudioClips.toLocaleString()}`);
  console.log(`  Voice: ${manifest.voice}`);
  console.log(`  Generated: ${manifest.generatedAt}`);
  if (manifest.lastGeneratedAt) {
    console.log(`  Last Generation: ${manifest.lastGeneratedAt}`);
  }

  // Count by type
  const typeCounts = {};
  const stationCounts = {};
  let totalChars = 0;
  let generatedCount = 0;
  let longestText = { id: '', length: 0, text: '' };
  let shortestText = { id: '', length: Infinity, text: '' };

  Object.entries(manifest.audioMap).forEach(([id, entry]) => {
    // Count by type
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;

    // Count by station
    if (entry.stationId) {
      stationCounts[entry.stationId] = (stationCounts[entry.stationId] || 0) + 1;
    }

    // Character count
    totalChars += entry.text.length;

    // Generated count
    if (entry.generated) {
      generatedCount++;
    }

    // Longest/shortest
    if (entry.text.length > longestText.length) {
      longestText = { id, length: entry.text.length, text: entry.text };
    }
    if (entry.text.length < shortestText.length) {
      shortestText = { id, length: entry.text.length, text: entry.text };
    }
  });

  // Generation status
  console.log('\nGeneration Status:');
  console.log(`  Generated: ${generatedCount.toLocaleString()} (${(generatedCount/manifest.totalAudioClips*100).toFixed(1)}%)`);
  console.log(`  Pending: ${(manifest.totalAudioClips - generatedCount).toLocaleString()} (${((manifest.totalAudioClips - generatedCount)/manifest.totalAudioClips*100).toFixed(1)}%)`);

  // Text statistics
  const avgChars = totalChars / manifest.totalAudioClips;
  const estimatedDuration = totalChars / 15; // Rough estimate: 15 chars/second
  const estimatedCost = (totalChars / 1000) * 0.30; // Rough estimate: $0.30 per 1k chars

  console.log('\nText Statistics:');
  console.log(`  Total Characters: ${totalChars.toLocaleString()}`);
  console.log(`  Average Characters: ${avgChars.toFixed(0)}`);
  console.log(`  Longest Text: ${longestText.length} chars (${longestText.id})`);
  console.log(`  Shortest Text: ${shortestText.length} chars (${shortestText.id})`);

  console.log('\nEstimates:');
  console.log(`  Estimated Duration: ${formatDuration(estimatedDuration)}`);
  console.log(`  Estimated Cost: $${estimatedCost.toFixed(2)} (ElevenLabs approx.)`);

  // Type breakdown
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  BREAKDOWN BY TYPE');
  console.log('───────────────────────────────────────────────────────\n');

  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  sortedTypes.forEach(([type, count]) => {
    const percentage = (count / manifest.totalAudioClips * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(percentage / 2));
    console.log(`  ${type.padEnd(25)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  // Station breakdown (top 10)
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  TOP 10 STATIONS BY AUDIO COUNT');
  console.log('───────────────────────────────────────────────────────\n');

  const sortedStations = Object.entries(stationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedStations.forEach(([stationId, count], index) => {
    console.log(`  ${(index + 1).toString().padStart(2)}. ${stationId.padEnd(30)} ${count.toString().padStart(3)} clips`);
  });

  // Sample texts
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  SAMPLE TEXTS');
  console.log('───────────────────────────────────────────────────────\n');

  console.log('Longest text:');
  console.log(`  ID: ${longestText.id}`);
  console.log(`  Length: ${longestText.length} characters`);
  console.log(`  Text: "${longestText.text.substring(0, 150)}${longestText.text.length > 150 ? '...' : ''}"\n`);

  console.log('Shortest text:');
  console.log(`  ID: ${shortestText.id}`);
  console.log(`  Length: ${shortestText.length} characters`);
  console.log(`  Text: "${shortestText.text}"\n`);

  // Random samples
  const entries = Object.entries(manifest.audioMap);
  console.log('Random samples:');
  for (let i = 0; i < 3; i++) {
    const [id, entry] = entries[Math.floor(Math.random() * entries.length)];
    console.log(`  ${i + 1}. [${entry.type}] ${id}`);
    console.log(`     "${entry.text.substring(0, 80)}${entry.text.length > 80 ? '...' : ''}"\n`);
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

try {
  analyzeManifest();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
