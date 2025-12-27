# GenAI Services Reference Guide

> **For AI Agents**: Comprehensive documentation on GenAI service integrations used across Isaiah School and Bilingual Bible projects.

---

## Table of Contents

1. [Quick Reference: API Keys & Endpoints](#quick-reference-api-keys--endpoints)
2. [OpenRouter (Gemini Models)](#openrouter-gemini-models)
3. [ElevenLabs Text-to-Speech](#elevenlabs-text-to-speech)
4. [Google Cloud Text-to-Speech](#google-cloud-text-to-speech)
5. [Audio Timing & Word Sync](#audio-timing--word-sync)
6. [Parallel Batch Processing](#parallel-batch-processing)
7. [Content Generation Workflows](#content-generation-workflows)
8. [Security Best Practices](#security-best-practices)
9. [Code Examples](#code-examples)

---

## Quick Reference: API Keys & Endpoints

### Available API Keys

| Service | API Key | Notes |
|---------|---------|-------|
| **ElevenLabs** | `d9728b78525b8401450af1acaa97be4bf07cf2faec9624539f5043af6501faea` | TTS with timestamps |
| **OpenRouter** | `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` | Gemini access |
| **Google AI (Gemini)** | `AIzaSyCJtdwybwfBhvKDjf1fo1tHSPslzT4vQLE` | Direct Gemini API |

### Primary Endpoints

| Service | Endpoint | Method |
|---------|----------|--------|
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | POST |
| ElevenLabs TTS | `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/with-timestamps` | POST |
| ElevenLabs Scribe | `https://api.elevenlabs.io/v1/speech-to-text` | POST |
| Google AI | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | POST |
| Google Cloud TTS | `https://texttospeech.googleapis.com/v1/text:synthesize` | POST |

---

## OpenRouter (Gemini Models)

### Overview

OpenRouter provides unified access to multiple LLM providers, including Google's Gemini models. Use it for:
- **Image generation** (Gemini 3 Pro Image Preview)
- **Text content generation** (Gemini Flash)
- **Chinese text preprocessing** (word segmentation, definitions)

### Available Models

| Model ID | Use Case | Cost |
|----------|----------|------|
| `google/gemini-3-pro-image-preview` | Image generation with multimodal output | Paid |
| `google/gemini-3-flash` | Fast text generation | Paid (cheaper) |
| `google/gemini-2.5-flash` | Text processing, word segmentation | Paid |
| `google/gemini-exp-1206:free` | Scene description generation | Free tier |

### Authentication

```javascript
const headers = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://your-app.com',  // Required
  'X-Title': 'Your App Name'                // Recommended
};
```

### Image Generation (Gemini 3 Pro Image Preview)

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Key Parameters for Image Output:**
```javascript
{
  model: 'google/gemini-3-pro-image-preview',
  messages: [{ role: 'user', content: prompt }],
  modalities: ['text', 'image'],  // REQUIRED for image output
  max_tokens: 4096
}
```

**Example Request:**
```javascript
async function generateImage(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-image-preview',
      messages: [{ role: 'user', content: prompt }],
      modalities: ['text', 'image']
    })
  });

  const data = await response.json();
  // Image returned as base64 in response
  return data.choices[0].message.content;
}
```

### Text Generation (Gemini Flash)

**For Fast Processing:**
```javascript
{
  model: 'google/gemini-3-flash',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
  max_tokens: 2048
}
```

**For Chinese Word Segmentation:**
```javascript
const prompt = `Segment this Chinese text into words with pinyin and definitions:
"奉神旨意，作使徒的保羅"

Return JSON: [{ chinese, pinyin, definition, pos }]`;

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })
});
```

### Rate Limiting Best Practices

- **Batch size:** 5 items per request (reduce to 2 for complex content)
- **Delay between requests:** 1000ms minimum
- **Retry logic:** 3 retries with 2s exponential backoff
- **Concurrent requests:** Max 3-5 parallel for image generation

### Image Response Parsing

**Important:** Gemini 3 Pro Image Preview returns images inline in the message content. Parse carefully:

```javascript
async function parseImageResponse(response) {
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error('No content in response');

  // Content may be array of parts or string
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        // Extract base64 from data URL
        const match = part.image_url.url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          return { format: match[1], data: match[2] };
        }
      }
    }
  }

  // Try parsing as markdown image
  const imgMatch = content.match(/!\[.*?\]\((data:image\/(\w+);base64,([^)]+))\)/);
  if (imgMatch) {
    return { format: imgMatch[2], data: imgMatch[3] };
  }

  throw new Error('No image found in response');
}

---

## ElevenLabs Text-to-Speech

### Overview

ElevenLabs provides high-quality TTS with **word-level timing** for karaoke-style highlighting. This is the primary service for both projects.

### Voice IDs

| Voice | ID | Language | Use Case |
|-------|----|----|----------|
| Angela | `lqydY2xVUkg9cEIFmFMU` | English (US) | Educational content |
| Neil Chuang | `auoHciLZJwKTwYUoRTYz` | Mandarin (Taiwan) | Bible narration |

### TTS with Timestamps (Primary Method)

**Endpoint:** `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps`

**Request:**
```javascript
async function generateTTSWithTimings(text, voiceId) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_v3',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      })
    }
  );

  const data = await response.json();

  return {
    audio: data.audio_base64,  // Base64-encoded MP3
    alignment: {
      characters: data.alignment.characters,
      character_start_times_seconds: data.alignment.character_start_times_seconds,
      character_end_times_seconds: data.alignment.character_end_times_seconds
    }
  };
}
```

### Voice Settings for Different Content Types

| Content Type | Stability | Similarity | Style | Notes |
|--------------|-----------|------------|-------|-------|
| Educational | 0.5 | 0.75 | 0.4 | Clear, consistent |
| Emotional narration | 0.35 | 0.75 | 0.6 | More expressive |
| Calm reading | 0.5 | 0.75 | 0.3 | Steady pace |
| Math content | 0.5 | 0.75 | 0.4 | Clear enunciation |

### File Naming Strategy (Content-Addressable)

Use SHA-256 hash of voice+model+text for deterministic, collision-free filenames:

```javascript
import crypto from 'node:crypto';  // ESM syntax - required for Node.js scripts

function getAudioFileName(voiceId, modelId, text) {
  const cacheKey = text.toLowerCase().trim();
  const hash = crypto.createHash('sha256')
    .update([voiceId, modelId, cacheKey].join('|'))
    .digest('hex');
  return `${hash}.mp3`;
}

// Example: "hello world" with Angela voice → "a1b2c3d4...mp3"
```

**Benefits:**
- Same text always produces same filename (idempotent)
- No filename collisions regardless of text content
- Easy to verify if audio already exists
- Works across parallel batch processes

### Emotion Tags for Expressive Audio

ElevenLabs supports emotion tags in text for varied expression:

```javascript
const emotionTaggedText = `
[awe] In the beginning, God created the heavens and the earth.
[calm] The earth was formless and void.
[dramatic] And God said, "Let there be light!"
[gentle] And there was light.
`;
```

**Supported Tags:** `dramatic`, `gentle`, `whisper`, `awe`, `excited`, `calm`, `majestic`, `sad`, `joyful`

### Speech-to-Text (Scribe) for Accurate Timing

When TTS alignment isn't accurate enough, use Scribe to extract precise word timing:

**Endpoint:** `POST https://api.elevenlabs.io/v1/speech-to-text`

```javascript
async function extractTimingWithScribe(audioBuffer) {
  const formData = new FormData();
  formData.append('file', audioBuffer, 'audio.mp3');
  formData.append('model_id', 'scribe_v1');
  formData.append('timestamps_granularity', 'character');
  formData.append('language_code', 'zho');  // or 'eng' for English

  const response = await fetch(
    'https://api.elevenlabs.io/v1/speech-to-text',
    {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: formData
    }
  );

  return await response.json();
  // Returns: { text, words: [{ text, start, end }] }
}
```

---

## Google Cloud Text-to-Speech

### Overview

Lower-cost alternative for real-time TTS (without word timing). Best for on-demand single-verse playback.

### Configuration

```javascript
const googleTTSConfig = {
  endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  voices: {
    mandarin_male: 'cmn-TW-Wavenet-B',
    mandarin_female: 'cmn-TW-Wavenet-A',
    english_male: 'en-US-Wavenet-D',
    english_female: 'en-US-Wavenet-F'
  },
  speakingRate: 0.9,
  volumeGainDb: 1.5  // For male voices
};
```

### Request Format

```javascript
async function synthesize(text, voice = 'cmn-TW-Wavenet-B') {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voice.startsWith('cmn') ? 'cmn-TW' : 'en-US',
          name: voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          volumeGainDb: 1.5
        }
      })
    }
  );

  const data = await response.json();
  return data.audioContent;  // Base64-encoded MP3
}
```

---

## Audio Timing & Word Sync

### Word Timing Data Structure

```typescript
interface WordTiming {
  wordIndex: number;
  startTime: number;   // milliseconds
  endTime: number;     // milliseconds
}

interface VerseTiming {
  verseNumber: number;
  startTime: number;
  endTime: number;
  words: WordTiming[];
}

interface ChapterAudio {
  bookId: string;
  chapter: number;
  audioUrl: string;
  duration: number;
  verses: VerseTiming[];
}
```

### Converting Character Timings to Word Timings

```javascript
function buildWordTimingsFromAlignment(alignment, originalText) {
  const words = [];
  const startMs = [];
  const endMs = [];

  let currentWord = '';
  let wordStartTime = null;
  let wordEndTime = null;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startSec = alignment.character_start_times_seconds[i];
    const endSec = alignment.character_end_times_seconds[i];

    if (/\s/.test(char)) {
      // Whitespace = word boundary
      if (currentWord) {
        words.push(currentWord);
        startMs.push(Math.round(wordStartTime * 1000));
        endMs.push(Math.round(wordEndTime * 1000));
        currentWord = '';
        wordStartTime = null;
      }
    } else {
      currentWord += char;
      if (wordStartTime === null) wordStartTime = startSec;
      wordEndTime = endSec;
    }
  }

  // Don't forget the last word
  if (currentWord) {
    words.push(currentWord);
    startMs.push(Math.round(wordStartTime * 1000));
    endMs.push(Math.round(wordEndTime * 1000));
  }

  // Ensure monotonic (each word starts after previous ends)
  for (let i = 1; i < startMs.length; i++) {
    if (startMs[i] < endMs[i - 1]) {
      startMs[i] = endMs[i - 1];
    }
  }

  return { words, startMs, endMs };
}
```

### Real-Time Word Highlighting

```javascript
class AudioWordHighlighter {
  constructor(audioElement, timings, onWordChange) {
    this.audio = audioElement;
    this.timings = timings;
    this.onWordChange = onWordChange;
    this.animationId = null;
  }

  start() {
    const update = () => {
      const currentTimeMs = this.audio.currentTime * 1000;
      const wordIndex = this.findCurrentWord(currentTimeMs);

      if (wordIndex !== this.lastWordIndex) {
        this.lastWordIndex = wordIndex;
        this.onWordChange(wordIndex);
      }

      if (!this.audio.paused) {
        this.animationId = requestAnimationFrame(update);
      }
    };

    this.animationId = requestAnimationFrame(update);
  }

  findCurrentWord(timeMs) {
    // Binary search for efficiency
    let left = 0;
    let right = this.timings.words.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const timing = this.timings.words[mid];

      if (timeMs >= timing.startTime && timeMs < timing.endTime) {
        return mid;
      } else if (timeMs < timing.startTime) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return -1;
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
```

### Audio Hardware Clock Best Practice

**IMPORTANT:** Always use `AudioContext.currentTime` for synchronization, not `Date.now()` or `setInterval`.

```javascript
const audioContext = new AudioContext();

function scheduleAudioWithSync(audioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  // Schedule with known start time for precise sync
  const startTime = audioContext.currentTime + 0.1;
  source.start(startTime);

  return startTime;
}
```

---

## Parallel Batch Processing

### Overview

For large-scale content generation (1000+ items), parallel batch processing provides 5-10x speedup over sequential processing. This is essential for both image and audio generation at scale.

### Key Principles

1. **Split workload into N batches** (typically 5)
2. **Each batch writes to separate output** (avoid write conflicts)
3. **Merge results after all batches complete**
4. **Check both batch AND main manifest for duplicates**

### Parallel Audio Generation (ElevenLabs)

**Script Configuration:**

```javascript
// Parse batch arguments
const args = process.argv.slice(2);
let BATCH_NUM = 0;
let TOTAL_BATCHES = 1;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batch' && args[i + 1]) BATCH_NUM = parseInt(args[i + 1], 10);
  if (args[i] === '--total-batches' && args[i + 1]) TOTAL_BATCHES = parseInt(args[i + 1], 10);
}

// Each batch writes to separate manifest
const TTS_MANIFEST_PATH = BATCH_NUM > 0
  ? path.join(ROOT, `assets/tts-math/manifest-batch-${BATCH_NUM}.json`)
  : path.join(ROOT, 'assets/tts-math/manifest.json');
```

**Batch Slicing Logic:**

```javascript
const allEntries = Object.entries(manifest.audioMap);
const totalAll = allEntries.length;

let entries;
if (BATCH_NUM > 0 && TOTAL_BATCHES > 1) {
  const batchSize = Math.ceil(totalAll / TOTAL_BATCHES);
  const start = (BATCH_NUM - 1) * batchSize;
  const end = Math.min(start + batchSize, totalAll);
  entries = allEntries.slice(start, end);
  console.log(`Batch ${BATCH_NUM}/${TOTAL_BATCHES}: entries ${start + 1}-${end} of ${totalAll}`);
} else {
  entries = allEntries;
}
```

**Duplicate Checking (Critical!):**

```javascript
// Load BOTH batch manifest AND main manifest to avoid duplicates
let mainManifest = { items: {} };
if (BATCH_NUM > 0) {
  try {
    mainManifest = JSON.parse(await fs.readFile('assets/tts-math/manifest.json', 'utf8'));
  } catch { /* ignore */ }
}

// In processing loop:
const cacheKey = item.text.toLowerCase().trim();
if (ttsManifest.items[cacheKey] || mainManifest.items[cacheKey]) {
  skipped++;
  continue;  // Already exists
}
```

**Running 5 Parallel Batches:**

```bash
# Run all 5 batches concurrently
node scripts/generate-math-audio.mjs --batch 1 --total-batches 5 &
node scripts/generate-math-audio.mjs --batch 2 --total-batches 5 &
node scripts/generate-math-audio.mjs --batch 3 --total-batches 5 &
node scripts/generate-math-audio.mjs --batch 4 --total-batches 5 &
node scripts/generate-math-audio.mjs --batch 5 --total-batches 5 &
wait
echo "ALL BATCHES COMPLETE"
```

### Batch Manifest Merging

```javascript
async function mergeBatchManifests() {
  const TTS_DIR = 'assets/tts-math';
  const mainPath = path.join(TTS_DIR, 'manifest.json');

  // Load existing main manifest
  let mainManifest = { version: 1, voiceId: VOICE_ID, modelId: MODEL_ID, items: {} };
  try {
    mainManifest = JSON.parse(await fs.readFile(mainPath, 'utf8'));
  } catch { /* ignore */ }

  const initialCount = Object.keys(mainManifest.items).length;

  // Find and merge batch manifests
  const files = await fs.readdir(TTS_DIR);
  const batchFiles = files.filter(f => f.startsWith('manifest-batch-') && f.endsWith('.json'));

  for (const batchFile of batchFiles.sort()) {
    const batch = JSON.parse(await fs.readFile(path.join(TTS_DIR, batchFile), 'utf8'));
    console.log(`Merging ${batchFile}: ${Object.keys(batch.items || {}).length} items`);

    // Merge items (don't overwrite existing)
    for (const [key, value] of Object.entries(batch.items || {})) {
      if (!mainManifest.items[key]) {
        mainManifest.items[key] = value;
      }
    }
  }

  // Save and cleanup
  mainManifest.generatedAt = new Date().toISOString();
  await fs.writeFile(mainPath, JSON.stringify(mainManifest, null, 2));

  // Remove batch files
  for (const batchFile of batchFiles) {
    await fs.unlink(path.join(TTS_DIR, batchFile));
  }

  console.log(`Merged ${Object.keys(mainManifest.items).length - initialCount} new items`);
}
```

### Parallel Image Generation (Gemini)

**Filter by Station Prefix:**

```javascript
// Parse --station argument for filtering
let stationFilter = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--station' && args[i + 1]) stationFilter = args[i + 1];
}

// Filter stations by prefix
const filteredStations = Object.entries(STATION_SCENES)
  .filter(([id]) => !stationFilter || id.startsWith(stationFilter));
```

**Running Parallel Image Batches:**

```bash
# Split by domain/prefix (OA=Operations, NBT=Numbers, MD=Measurement, G=Geometry)
node scripts/generate-station-images.mjs --station=oa_ &
node scripts/generate-station-images.mjs --station=nbt_ &
node scripts/generate-station-images.mjs --station=md_ &
node scripts/generate-station-images.mjs --station=g_ &
node scripts/generate-station-images.mjs --station=review_ &
wait
echo "ALL IMAGE BATCHES COMPLETE"
```

### Rate Limiting for Parallel Requests

**ElevenLabs:**
- 100ms delay between requests within each batch
- 2000ms delay on error (before retry)
- ~10 requests/second per batch = ~50 requests/second with 5 batches
- Monitor for 429 errors and increase delays if needed

**OpenRouter (Gemini Images):**
- 500-1000ms delay between image generations
- Gemini has generous rate limits but respect them
- Each image takes 5-15 seconds to generate anyway

### Performance Results

**Audio Generation (1,911 clips):**
| Method | Time | Rate |
|--------|------|------|
| Sequential | ~32 minutes | ~1 clip/sec |
| 5 Parallel Batches | ~6 minutes | ~5 clips/sec |

**Image Generation (30 stations):**
| Method | Time | Rate |
|--------|------|------|
| Sequential | ~7 minutes | ~14 sec/image |
| 5 Parallel Batches | ~2 minutes | ~4 sec/image |

### Text Deduplication Insight

**Important:** Content manifests may have duplicate texts (e.g., repeated phrases like "Great job!" or "Try again"). The TTS cache uses normalized text as the key:

```javascript
const cacheKey = item.text.toLowerCase().trim();
```

This means 1,911 audio manifest entries may only generate ~1,562 unique audio files. Plan storage and costs accordingly.

### Wiring Generated Assets to Content Packs

After generating images/audio, update the content pack JSON to reference them:

```javascript
async function wireImagesToContentPack(contentPackPath, imageDir) {
  const contentPack = JSON.parse(await fs.readFile(contentPackPath, 'utf8'));

  // Find generated images
  const imageFiles = await fs.readdir(imageDir);
  const imageMap = {};
  for (const file of imageFiles) {
    const stationId = file.replace(/\.(png|jpeg|jpg)$/, '');
    imageMap[stationId] = `${imageDir}/${file}`;
  }

  // Wire to stations
  let updated = 0;
  for (const stationId of contentPack.stationOrder || Object.keys(contentPack.stations)) {
    const station = contentPack.stations[stationId];
    if (station && imageMap[stationId]) {
      station.sceneImage = imageMap[stationId];
      updated++;
    }
  }

  await fs.writeFile(contentPackPath, JSON.stringify(contentPack, null, 2));
  console.log(`Updated ${updated} stations with sceneImage`);
}
```

### ESM Module Considerations

**Important:** Use ESM syntax for all Node.js scripts:

```javascript
// CORRECT - ESM syntax
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// INCORRECT - CommonJS (will fail in ESM context)
// const crypto = require('crypto');  // ERROR: require is not defined
```

**Package.json Configuration:**
```json
{
  "type": "module"
}
```

Or use `.mjs` extension for ES module scripts.

---

## Content Generation Workflows

### 1. Educational Lesson Content (Isaiah School)

**ELA Content Pipeline:**
```
1. Define learning standards → CPA Grade 1 ELA
2. Generate station content with Gemini
3. Generate reading passages and comprehension questions
4. Generate audio with ElevenLabs (word timings)
5. Generate scene illustrations with Gemini 3 Pro
6. Wire images to content-pack.v1.json
7. Deploy to Vercel
```

**Math Content Pipeline:**
```
1. Extract audio manifest from content pack → scripts/extract-math-audio-texts.mjs
2. Generate TTS audio in parallel batches → scripts/generate-math-audio.mjs
3. Merge batch manifests → scripts/merge-math-audio-manifests.mjs
4. Generate station images in parallel → scripts/generate-math-station-images.mjs
5. Wire images to content-pack.v1.json
6. Deploy to Vercel
```

**Key Scripts:**
| Script | Purpose |
|--------|---------|
| `extract-math-audio-texts.mjs` | Creates audio manifest from content pack |
| `generate-math-audio.mjs` | ElevenLabs TTS with parallel batch support |
| `merge-math-audio-manifests.mjs` | Combines batch manifests into main |
| `generate-math-station-images.mjs` | Gemini image generation with Ghibli style |
| `generate-station-images.mjs` | ELA station image generation |

**Station Content JSON Schema:**
```json
{
  "rf_f1_print_concepts": {
    "name": "Library Stop",
    "icon": "📚",
    "line": "RF",
    "pages": [
      {
        "type": "read",
        "sentence": "I am at the library. I see many books.",
        "words": ["I", "am", "at", "the", "library.", "I", "see", "many", "books."]
      },
      {
        "type": "readingComprehension",
        "passage": "...",
        "question": "Where is the reader?",
        "choices": ["Library", "Store", "Home", "School"],
        "correctIndex": 0
      }
    ]
  }
}
```

### 2. Bible Word Segmentation (Bilingual Bible)

**Pipeline:**
```
1. Fetch verse from FHL API
2. Clean HTML (remove cross-refs)
3. Send to Gemini for word segmentation
4. Extract: chinese, pinyin, definition, POS, frequency
5. Generate audio with emotion analysis
6. Extract word timings via Scribe
7. Save preprocessed JSON + audio files
```

**Gemini Prompt for Word Segmentation:**
```
Segment this Chinese Bible verse into words. For each word provide:
- chinese: The word
- pinyin: With tone marks (not numbers)
- definition: Brief English definition
- pos: Part of speech (n, v, adj, prep, conj, etc.)
- freq: common, uncommon, rare, or biblical
- tocflLevel: 1-7 (7 if not in TOCFL)

Verse: "奉神旨意，作使徒的保羅"

Return valid JSON array only, no markdown.
```

### 3. Image Generation Prompts

**Ghibli-Style Base Prompt (Reusable):**
```javascript
const GHIBLI_STYLE = `Studio Ghibli style watercolor illustration. Soft watercolor textures with warm pastel colors. Gentle morning lighting, hand-painted feel. Whimsical and magical atmosphere. Child-friendly, no scary elements. No text or writing visible. Horizontal landscape orientation.`;
```

**Educational Station Scenes:**
```javascript
const STATION_PROMPTS = {
  // ELA - Reading/Language stations
  rf_phonics: `${GHIBLI_STYLE}. A cozy MRT reading car filled with floating alphabet letters and gentle light streaming through windows.`,

  // Math - Operations & Algebra
  oa_counting_up_down: `${GHIBLI_STYLE}. A magical train platform with a large colorful number line running along the platform edge, with friendly train cars showing numbers.`,

  // Math - Numbers & Base Ten
  nbt_count_to_120: `${GHIBLI_STYLE}. A cheerful ticket booth with a large display showing numbers 1-120, with stacks of magical tickets organized in neat groups of ten.`,

  // Math - Measurement & Data
  md_compare_lengths: `${GHIBLI_STYLE}. A train maintenance workshop where friendly trains of different lengths line up, with colorful measuring tapes and rulers visible.`,

  // Math - Geometry
  g_2d_shapes: `${GHIBLI_STYLE}. A magical MRT station where the architecture features circles, squares, triangles, and rectangles in whimsical designs.`
};
```

**Math Domain Prefixes:**
| Prefix | Domain | Example Topics |
|--------|--------|----------------|
| `oa_` | Operations & Algebraic Thinking | Counting, addition, subtraction |
| `nbt_` | Number & Operations Base Ten | Place value, tens/ones |
| `md_` | Measurement & Data | Length, time, data |
| `g_` | Geometry | Shapes, fractions |
| `review_` | Review/Assessment | Mixed topics |

**Food Icon Generation:**
```
Create a cute kawaii-style food character:
- Subject: A happy dumpling with cute eyes
- Style: Flat vector illustration
- Colors: Soft pastels with warm tones
- Expression: Friendly and inviting
- Background: Transparent
- Size: Square, centered composition
```

---

## Security Best Practices

### API Key Management

```bash
# .env.local (NEVER commit)
ELEVENLABS_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here

# .env.example (commit this as template)
ELEVENLABS_API_KEY=
OPENROUTER_API_KEY=
```

### Server-Side Proxy for Production

**Why:** Never expose API keys in client-side code.

```javascript
// /api/tts.js (Vercel serverless function)
export default async function handler(req, res) {
  // 1. Verify Firebase ID token
  const token = req.headers.authorization?.replace('Bearer ', '');
  await verifyIdToken(token);

  // 2. Rate limit (30 req/min per user)
  const userId = decodedToken.uid;
  if (isRateLimited(userId)) {
    return res.status(429).json({ error: 'Rate limited' });
  }

  // 3. Forward to ElevenLabs
  const response = await fetch(ELEVENLABS_ENDPOINT, {
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    body: req.body
  });

  // 4. Return response
  res.json(await response.json());
}
```

### Rate Limiting Implementation

```javascript
const rateLimits = new Map();
const RATE_LIMIT = 30;  // requests per minute
const WINDOW_MS = 60000;

function isRateLimited(key) {
  const now = Date.now();
  const record = rateLimits.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count++;
  rateLimits.set(key, record);

  return record.count > RATE_LIMIT;
}
```

### Origin Allowlist

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://your-app.vercel.app',
  'https://your-domain.com'
];

function validateOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin);
}
```

---

## Code Examples

### Complete TTS Generation with Caching

```javascript
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

async function generateTTSCached(text, voiceId) {
  const cacheKey = `${voiceId}:${text}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const result = await generateTTSWithTimings(text, voiceId);

  cache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL
  });

  // LRU eviction
  if (cache.size > 40) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }

  return result;
}
```

### Batch Audio Generation with Retries

```javascript
async function generateAudioBatch(items, options = {}) {
  const {
    delayMs = 1000,
    maxRetries = 3,
    retryDelayMs = 2000
  } = options;

  const results = [];

  for (const item of items) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await generateTTSWithTimings(item.text, item.voiceId);
        results.push({ ...item, ...result, success: true });
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
        await sleep(retryDelayMs * Math.pow(2, attempt));
      }
    }

    if (lastError) {
      results.push({ ...item, error: lastError.message, success: false });
    }

    await sleep(delayMs);
  }

  return results;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### OpenRouter Image Generation

```javascript
async function generateGhibliScene(description) {
  const prompt = `
    Create a Studio Ghibli style watercolor illustration:
    ${description}

    Style requirements:
    - Soft watercolor textures, warm pastel colors
    - Hand-painted feel with gentle lighting
    - Whimsical, magical, child-friendly
    - Horizontal landscape orientation (4:3)
    - No text or writing visible
  `;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.com'
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-image-preview',
      messages: [{ role: 'user', content: prompt }],
      modalities: ['text', 'image'],
      max_tokens: 4096
    })
  });

  const data = await response.json();

  // Extract image from response
  const content = data.choices[0].message.content;
  // Parse base64 image data from content

  return content;
}
```

---

## Environment Variables Summary

```bash
# === REQUIRED ===
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_VOICE_ID=lqydY2xVUkg9cEIFmFMU  # Angela (English)
ELEVENLABS_MODEL_ID=eleven_v3

OPENROUTER_API_KEY=your-openrouter-api-key-here

# === OPTIONAL ===
GOOGLE_CLOUD_TTS_API_KEY=       # For Google Cloud TTS
GOOGLE_AI_API_KEY=              # Direct Gemini API access

# === FIREBASE (if using auth) ===
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=

# === RATE LIMITING ===
TTS_RATE_LIMIT_PER_MINUTE=30
TTS_CACHE_TTL_MS=300000
TTS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

---

## Cost Estimation

| Service | Pricing | Estimate |
|---------|---------|----------|
| ElevenLabs | ~$0.30/1000 chars | 1,911 clips (~100K chars) = ~$30 |
| OpenRouter Gemini Flash | ~$0.10/1M tokens | Minimal for text processing |
| OpenRouter Gemini 3 Pro | ~$1.25/1M input, variable for images | ~$0.05-0.10 per image |
| Google Cloud TTS | Free tier: 1M chars/month | Usually free |

**Actual Generation Costs (Isaiah School):**

| Content | Items | Unique | Estimated Cost |
|---------|-------|--------|----------------|
| ELA Audio (TTS) | 4,541 clips | ~3,800 | ~$35 |
| Math Audio (TTS) | 1,911 clips | 1,562 | ~$15 |
| ELA Station Images | 56 images | 56 | ~$5 |
| Math Station Images | 30 images | 30 | ~$3 |
| **Total** | | | **~$58** |

**Cost Optimization Tips:**
- Deduplicate texts before generating (saves 15-20%)
- Use content-addressable file naming to avoid regenerating
- Check manifest before API calls
- Batch processing doesn't reduce cost but reduces wall-clock time

---

## Quick Start Checklist

- [ ] Set up `.env.local` with API keys
- [ ] Install dependencies: `fetch`, `formData` polyfills if needed
- [ ] Test ElevenLabs connection with simple TTS request
- [ ] Test OpenRouter connection with text completion
- [ ] Implement rate limiting before production
- [ ] Set up server-side proxy for API key protection
- [ ] Configure CORS and origin allowlist

---

## Troubleshooting

### Common Errors

**`require is not defined`**
- Cause: Using CommonJS `require()` in ESM module
- Fix: Use `import crypto from 'node:crypto'` instead of `require('crypto')`

**`API_KEY is empty/undefined`**
- Cause: Setting `API_KEY` at module level before `loadEnv()` runs
- Fix: Make `API_KEY` a `let` variable and set it inside `main()` after `loadEnv()`

```javascript
// WRONG - API_KEY set before loadEnv() runs
const API_KEY = process.env.ELEVENLABS_API_KEY || '';
async function main() {
  await loadEnv();
  // API_KEY is still empty!
}

// CORRECT - Set API_KEY after loadEnv()
let API_KEY = '';
async function main() {
  await loadEnv();
  API_KEY = process.env.ELEVENLABS_API_KEY || '';
}
```

**`No image found in response`**
- Cause: Response format varies between API versions
- Fix: Check both array and markdown formats (see Image Response Parsing section)

**Batch manifests not merging**
- Cause: Race condition or file not found
- Fix: Ensure all batches complete before merging, use `wait` in shell

---

## Related Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `generate-station-images.mjs` | `scripts/` | ELA station Ghibli images |
| `generate-math-station-images.mjs` | `scripts/` | Math station Ghibli images |
| `generate-math-audio.mjs` | `scripts/` | Math TTS with parallel batches |
| `merge-math-audio-manifests.mjs` | `scripts/` | Merge batch TTS manifests |
| `extract-math-audio-texts.mjs` | `scripts/` | Extract audio manifest from content |

---

*Document generated from analysis of Isaiah School and Bilingual Bible projects.*
*Last updated: 2025-12-22*
