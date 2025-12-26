#!/usr/bin/env node
/**
 * Generate ElevenLabs TTS audio + word timings for all app texts into `assets/tts/`.
 *
 * Output:
 * - assets/tts/manifest.json
 * - assets/tts/<sha256>.mp3 (or other extension if output_format changes)
 *
 * Requirements:
 * - ELEVENLABS_API_KEY env var (or in .env.local)
 *
 * Optional:
 * - ELEVENLABS_VOICE_ID
 * - ELEVENLABS_MODEL_ID
 * - ELEVENLABS_OUTPUT_FORMAT (e.g. mp3_44100_128, pcm_24000)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const ROOT = process.cwd();
const INDEX_HTML_PATH = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'assets', 'tts');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
const EXTRA_EXISTING_MANIFEST_PATHS = [
  // Some repos keep math audio in a separate manifest/folder; treat it as already-generated.
  path.join(ROOT, 'assets', 'tts-math', 'manifest.json'),
];
const CLI_ARGS = new Set(process.argv.slice(2));
const CHECK_ONLY = CLI_ARGS.has('--check') || CLI_ARGS.has('--dry-run');
const CONTENT_PACK_PATHS = [
  path.join(ROOT, 'content', 'cpa-grade1-ela', 'content-pack.v1.json'),
  path.join(ROOT, 'content', 'cpa-grade1-math', 'content-pack.v1.json'),
];

function parseDotEnv(content) {
  const env = {};
  const lines = String(content || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadEnvFromDotLocal() {
  const dotLocalPath = path.join(ROOT, '.env.local');
  try {
    const content = await fs.readFile(dotLocalPath, 'utf8');
    const parsed = parseDotEnv(content);
    for (const [k, v] of Object.entries(parsed)) {
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    // ignore
  }
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function isWhitespaceChar(char) {
  return typeof char === 'string' && /\s/.test(char);
}

function splitSentenceIntoWords(sentence) {
  if (!sentence || typeof sentence !== 'string') return [];
  const matches = sentence.match(/\S+/g);
  return matches ? matches : [];
}

function sanitizeHintTextForSpeech(text) {
  return String(text || '').replace(/[💚🟠🔴]/g, '').trim();
}

function cleanWordTokenForTts(token) {
  return String(token || '')
    .replace(/[“”"]/g, '')
    .replace(/[.,!?]/g, '')
    .trim();
}

function normalizeTextForElevenLabs(text) {
  const raw = String(text || '').trim();
  if (!raw) return raw;

  // Some short tokens can intermittently 500 in ElevenLabs; make them speakable.
  if (raw.toLowerCase() === 'st') return 'S T';

  // ElevenLabs sometimes errors on underscore-heavy tokens; map to a speakable fallback.
  // This is mainly used for phonics patterns like "__ip" in skill practice.
  if (/^_+[A-Za-z]+$/.test(raw)) return raw.replace(/_/g, '');
  if (/^_+$/.test(raw)) return 'blank';

  // Blank markers like "____" appear in cloze questions; make them speakable.
  // (Also avoids ElevenLabs failures on underscore runs.)
  if (/_\_/.test(raw) || /_{2,}/.test(raw)) {
    return raw.replace(/_{2,}/g, 'blank');
  }

  return raw;
}

function normalizeInlineText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blankFirstWordOccurrence(text, word) {
  const source = normalizeInlineText(text);
  const target = String(word || '').trim();
  if (!source || !target) return null;
  const escaped = escapeRegExp(target);
  const re = new RegExp(`(^|[^A-Za-z'])(${escaped})(?=[^A-Za-z']|$)`, 'i');
  if (!re.test(source)) return null;
  return source.replace(re, (_, lead) => `${lead}____`);
}

function buildWordTimingsFromAlignment(alignment) {
  if (!alignment) return null;
  const chars = Array.isArray(alignment.characters) ? alignment.characters : null;
  const starts = Array.isArray(alignment.character_start_times_seconds)
    ? alignment.character_start_times_seconds
    : null;
  const ends = Array.isArray(alignment.character_end_times_seconds) ? alignment.character_end_times_seconds : null;

  if (!chars || !starts || !ends) return null;

  const n = Math.min(chars.length, starts.length, ends.length);
  if (n <= 0) return null;

  const words = [];
  const startMs = [];
  const endMs = [];

  let currentChars = [];
  let currentStartMs = null;
  let currentEndMs = null;

  const pushCurrent = () => {
    if (currentChars.length === 0) return;
    const word = currentChars.join('');
    if (!word) return;
    const s = Number.isFinite(currentStartMs) ? currentStartMs : null;
    const e = Number.isFinite(currentEndMs) ? currentEndMs : null;
    if (s === null || e === null) return;
    words.push(word);
    startMs.push(s);
    endMs.push(e);
    currentChars = [];
    currentStartMs = null;
    currentEndMs = null;
  };

  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    if (isWhitespaceChar(ch)) {
      pushCurrent();
      continue;
    }

    if (currentChars.length === 0) {
      const s = starts[i];
      currentStartMs = Number.isFinite(s) ? s * 1000 : currentStartMs;
    }

    currentChars.push(String(ch));
    const e = ends[i];
    currentEndMs = Number.isFinite(e) ? e * 1000 : currentEndMs;
  }

  pushCurrent();

  if (words.length === 0) return null;

  // Ensure monotonic timings.
  let lastEnd = 0;
  for (let i = 0; i < words.length; i++) {
    const sRaw = startMs[i];
    const eRaw = endMs[i];
    const s = Number.isFinite(sRaw) ? sRaw : lastEnd;
    const e = Number.isFinite(eRaw) ? eRaw : s;
    const s2 = Math.max(s, lastEnd);
    const e2 = Math.max(e, s2);
    startMs[i] = s2;
    endMs[i] = e2;
    lastEnd = e2;
  }

  return { words, startMs, endMs };
}

function getMimeTypeFromOutputFormat(outputFormat) {
  const fmt = String(outputFormat || '').toLowerCase();
  if (!fmt) return 'audio/mpeg';
  if (fmt.startsWith('mp3')) return 'audio/mpeg';
  if (fmt.startsWith('pcm')) return 'audio/L16';
  if (fmt.startsWith('ulaw')) return 'audio/basic';
  if (fmt.startsWith('alaw')) return 'audio/basic';
  if (fmt.startsWith('wav')) return 'audio/wav';
  return 'audio/mpeg';
}

function getFileExtension(outputFormat) {
  const fmt = String(outputFormat || '').toLowerCase();
  if (!fmt) return 'mp3';
  if (fmt.startsWith('mp3')) return 'mp3';
  if (fmt.startsWith('wav')) return 'wav';
  if (fmt.startsWith('pcm')) return 'pcm';
  if (fmt.startsWith('ulaw')) return 'ulaw';
  if (fmt.startsWith('alaw')) return 'alaw';
  return 'mp3';
}

function extractStationContentFromIndexHtml(html) {
  const startMarker = 'const stationContent = {';
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error('stationContent start not found in index.html');

  const afterStart = start + 'const stationContent = '.length;
  const endMarker = '\n\n    // ===== SPEECH SYNTHESIS';
  const end = html.indexOf(endMarker, afterStart);
  if (end === -1) throw new Error('stationContent end not found in index.html');

  const snippet = html.slice(afterStart, end).trim();
  const js = snippet.replace(/;\s*$/, '');
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext('(' + js + ')', sandbox);
}

function extractGuidancePromptsFromIndexHtml(html) {
  const startMarker = '// ===== VOICE GUIDANCE PROMPTS =====';
  const start = html.indexOf(startMarker);
  if (start === -1) return null;

  const endMarker = '// ===== END GUIDANCE PROMPTS =====';
  const end = html.indexOf(endMarker, start);
  if (end === -1) throw new Error('guidancePrompts end not found in index.html');

  const snippet = html.slice(start, end).trim();
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext(`${snippet}\n guidancePrompts`, sandbox);
}

function addTextToMap(texts, text) {
  if (!text || typeof text !== 'string') return;
  const normalized = text.trim();
  if (!normalized) return;
  const cacheKey = normalized.toLowerCase();
  if (!texts.has(cacheKey)) texts.set(cacheKey, normalized);
}

function collectStringsFromObject(value, out = []) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach(v => collectStringsFromObject(v, out));
    return out;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(v => collectStringsFromObject(v, out));
  }
  return out;
}

function addPageLikeToTexts(texts, page, fallbackSentence = '') {
  if (!page || typeof page !== 'object') return;

  const add = text => addTextToMap(texts, text);
  const addWordsFromText = text => {
    if (!text || typeof text !== 'string') return;
    for (const token of splitSentenceIntoWords(text)) {
      const clean = cleanWordTokenForTts(token);
      add(clean);
    }
  };

  if (typeof page.sentence === 'string') add(page.sentence);
  if (typeof page.question === 'string') add(page.question);
  if (typeof page.prompt === 'string') add(page.prompt);
  if (typeof page.menuStory === 'string') add(page.menuStory);

  if (typeof page.comprehensionHint === 'string') {
    add(page.comprehensionHint);
    const combined = sanitizeHintTextForSpeech(`Look here. ${page.comprehensionHint}`);
    if (combined) add(combined);
  }

  if (typeof page.successMessage === 'string') add(page.successMessage);

  if (typeof page.passage === 'string') {
    const passage = normalizeInlineText(page.passage);
    if (passage) add(passage);
    addWordsFromText(page.passage);
  }

  const wordList = Array.isArray(page.words)
    ? page.words
    : splitSentenceIntoWords(page.sentence || fallbackSentence || '');
  for (const w of wordList) {
    const clean = cleanWordTokenForTts(w);
    add(clean);
  }

  if (Array.isArray(page.items)) {
    for (const item of page.items) {
      if (item && typeof item.name === 'string') {
        add(item.name);
        add(`You picked ${item.name}!`);
      }
      if (item && typeof item.description === 'string') add(item.description);
    }
  }

  if (Array.isArray(page.answers)) {
    for (const answer of page.answers) {
      if (answer && typeof answer.name === 'string') add(answer.name);
      if (answer && typeof answer.description === 'string') add(answer.description);
    }
  }
}

function buildTextsToGenerate(stationContent) {
  const texts = new Map(); // cacheKey -> original text
  const add = text => addTextToMap(texts, text);

  for (const station of Object.values(stationContent)) {
    if (!station || typeof station !== 'object') continue;

    // Train ride narration is built dynamically at runtime:
    // `All aboard! Next stop: ${stationName}.`
    // Pre-generate for all station names so we never fall back to browser SpeechSynthesis.
    const stationName = station && station.name ? String(station.name).trim() : '';
    if (stationName) add(`All aboard! Next stop: ${stationName}.`);

    if (Array.isArray(station.previewWords)) {
      for (const item of station.previewWords) {
        if (item && typeof item.word === 'string') add(item.word);
      }
    }

    if (Array.isArray(station.pages)) {
      for (const page of station.pages) {
        addPageLikeToTexts(texts, page, '');

        // If the page has variants, generate audio for all possible variants too.
        // The app randomly selects one per session, so pre-generating avoids runtime API calls.
        if (Array.isArray(page.variants)) {
          for (const variant of page.variants) {
            addPageLikeToTexts(texts, variant, page.sentence || '');
          }
        }

        // Sight-word check pages are generated dynamically at runtime by blanking the first
        // occurrence of the focus word in the session's resolved sentence.
        if (page && page.type === 'read' && page.autoSightWordQuestion !== false && page.sightWordFocus) {
          const baseFocus = String(page.sightWordFocus || '').trim();
          const baseSentence = typeof page.sentence === 'string' ? page.sentence : '';
          const baseBlanked = blankFirstWordOccurrence(baseSentence, baseFocus);
          if (baseBlanked) add(baseBlanked);

          if (Array.isArray(page.variants)) {
            for (const variant of page.variants) {
              if (!variant || typeof variant !== 'object') continue;
              const focus = String(variant.sightWordFocus || baseFocus || '').trim();
              const sentence = typeof variant.sentence === 'string' ? variant.sentence : baseSentence;
              const blanked = blankFirstWordOccurrence(sentence, focus);
              if (blanked) add(blanked);
            }
          }
        }
      }
    }
  }

  // Static UI feedback and dynamically generated prompts (to avoid runtime API calls).
  [
    // Correct feedback (used on correct answers)
    'Yes! Great job!',
    'You got it! Amazing!',
    "That's right! Super!",
    'Wow! You did it!',
    'Perfect! Well done!',
    'Yes! You used the words!',
    'Hooray! You know it!',
    'Great reading!',

    // Incorrect feedback (used on wrong answers)
    'Try again. Use the hint.',
    'Try again. Look back at the passage.',

    // Evidence-based answering + hint ladder (used during comprehension questions)
    'Good. Now you can answer.',
    'Strategy. Look for place words like at and in. Look for a place name.',
    'Strategy. Look for names or pronouns like he, she, and they.',
    'Strategy. Look for time words like first, then, and next.',
    'Strategy. Look for why words like because, so, and since.',
    'Strategy. Think about what the whole story is mostly about.',
    'Strategy. Read the story again. The answer is in the words.',
    'Read the highlighted sentence again. The answer is in that sentence.',
    'The highlighted sentence has your answer. Tap the words you need.',
    'Try this. One remaining answer is correct. Choose the one that matches the story.',

    // Auto sight-word check stems + hints + success message
    'Which sight word completes the sentence?',
    'Read the sentence again. Sight words are words you memorize.',
    'Fill in the blank with the sight word.',
    'Look at the blank. Which word makes the sentence sound right?',
    'Which word fits in the blank?',
    'Try reading the sentence out loud with each word.',
    'Nice! You used the sight word in a sentence.'
  ].forEach(add);

  return texts;
}

async function loadContentPackStations(contentPackPath) {
  try {
    const raw = await fs.readFile(contentPackPath, 'utf8');
    const parsed = JSON.parse(raw);
    const stations = parsed && typeof parsed === 'object' ? parsed.stations : null;
    if (!stations || typeof stations !== 'object') {
      console.warn(`[warn] Content pack missing stations: ${contentPackPath}`);
      return null;
    }
    return stations;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[warn] Failed to load content pack: ${contentPackPath} :: ${msg}`);
    return null;
  }
}

function mergeTextMaps(into, from) {
  if (!into || !(into instanceof Map) || !from || !(from instanceof Map)) return;
  for (const [key, value] of from.entries()) {
    if (!key) continue;
    into.set(key, value);
  }
}

function extractSkillPracticeSnippet(html) {
  const startMarkerA = 'function buildSightWordPracticePassage(word, bank) {';
  const endMarkerA = 'const MIN_QUESTIONS_PER_READING_PASSAGE';
  const startA = html.indexOf(startMarkerA);
  if (startA === -1) return null;
  const endA = html.indexOf(endMarkerA, startA);
  if (endA === -1) throw new Error('Unable to find end of buildSightWordPracticePassage snippet.');

  const startMarkerB = 'function shuffleInPlace(array) {';
  const endMarkerB = 'function setSkillsLevelFilter';
  const startB = html.indexOf(startMarkerB, endA);
  if (startB === -1) throw new Error('Unable to find start of skill practice snippet (shuffleInPlace).');
  const endB = html.indexOf(endMarkerB, startB);
  if (endB === -1) throw new Error('Unable to find end of skill practice snippet (setSkillsLevelFilter).');

  const snippetA = html.slice(startA, endA).trim();
  const snippetB = html.slice(startB, endB).trim();
  return `${snippetA}\n\n${snippetB}\n`;
}

function addSkillPracticeTexts(texts, html) {
  const snippet = extractSkillPracticeSnippet(html);
  if (!snippet) return { skillCount: 0, pages: 0 };

  const seedHelpers = `
    function hashStringToSeed(text) {
      const str = String(text || '');
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function mulberry32(seed) {
      let t = seed >>> 0;
      return () => {
        t += 0x6D2B79F5;
        let x = t;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    }

    function withSeededMathRandom(seedText, fn) {
      const seed = hashStringToSeed(seedText);
      const rng = mulberry32(seed);
      const original = Math.random;
      Math.random = rng;
      try {
        return fn();
      } finally {
        Math.random = original;
      }
    }
  `;

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(seedHelpers, sandbox);
  vm.runInContext(snippet, sandbox);

  const skillIds = vm.runInContext(
    `Array.isArray(skillsCatalog) ? skillsCatalog.map(s => s && s.id).filter(Boolean) : []`,
    sandbox
  );
  const uniqueSkillIds = Array.from(new Set(skillIds));

  let totalPages = 0;

  for (const skillId of uniqueSkillIds) {
    const pages = vm.runInContext(
      `withSeededMathRandom(${JSON.stringify(`skill-practice:${skillId}:v1`)}, () => generateSkillPages(${JSON.stringify(
        skillId
      )}, 10))`,
      sandbox
    );

    if (!Array.isArray(pages)) continue;
    totalPages += pages.length;
    for (const page of pages) {
      addPageLikeToTexts(texts, page, '');
      if (Array.isArray(page && page.variants)) {
        for (const variant of page.variants) addPageLikeToTexts(texts, variant, page.sentence || '');
      }
    }
  }

  return { skillCount: uniqueSkillIds.length, pages: totalPages };
}

async function fetchTtsWithTimestamps({ apiKey, voiceId, modelId, outputFormat, text, maxRetries = 3 }) {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`);
  if (outputFormat) url.searchParams.set('output_format', outputFormat);

  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        const message = `ElevenLabs error: ${response.status} ${response.statusText} ${errText}`.trim();
        lastError = new Error(message);

        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === maxRetries) throw lastError;

        const delayMs = 1200 * attempt;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      return response.json();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      const delayMs = 1200 * attempt;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('ElevenLabs TTS request failed');
}

async function loadExistingManifest() {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // ignore
  }
  return null;
}

async function loadExtraExistingItems() {
  const combined = {};
  for (const manifestPath of EXTRA_EXISTING_MANIFEST_PATHS) {
    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      const parsed = JSON.parse(content);
      const items = parsed && typeof parsed === 'object' ? parsed.items : null;
      if (!items || typeof items !== 'object') continue;
      for (const [key, value] of Object.entries(items)) {
        if (!key || combined[key]) continue;
        combined[key] = value;
      }
      console.log(`[info] Loaded extra existing TTS manifest: ${path.relative(ROOT, manifestPath)}`);
    } catch {
      // ignore
    }
  }
  return combined;
}

async function writeManifest(manifest) {
  const json = JSON.stringify(manifest, null, 2) + '\n';
  await fs.writeFile(MANIFEST_PATH, json, 'utf8');
}

async function main() {
  await loadEnvFromDotLocal();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !CHECK_ONLY) {
    console.error('Missing ELEVENLABS_API_KEY (set it in .env.local or your environment).');
    process.exit(1);
  }

  // Default to a clear, educational US voice for early readers.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'lqydY2xVUkg9cEIFmFMU';
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128';

  const html = await fs.readFile(INDEX_HTML_PATH, 'utf8');
  const stationContent = extractStationContentFromIndexHtml(html);
  const texts = buildTextsToGenerate(stationContent);

  // Also include external JSON content packs so story audio can be fully prebuilt.
  for (const packPath of CONTENT_PACK_PATHS) {
    const stations = await loadContentPackStations(packPath);
    if (!stations) continue;
    mergeTextMaps(texts, buildTextsToGenerate(stations));
    console.log(`[info] Added TTS texts from content pack: ${path.relative(ROOT, packPath)}`);
  }

  const practiceInfo = addSkillPracticeTexts(texts, html);
  if (practiceInfo && practiceInfo.skillCount) {
    console.log(
      `[info] Added skill-practice strings from ${practiceInfo.skillCount} skills (${practiceInfo.pages} pages).`
    );
  }

  const guidancePrompts = extractGuidancePromptsFromIndexHtml(html);
  if (guidancePrompts) {
    const guidanceTexts = collectStringsFromObject(guidancePrompts, []);
    for (const text of guidanceTexts) addTextToMap(texts, text);
    console.log(`[info] Added ${guidanceTexts.length} voice-guidance strings.`);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const existing = await loadExistingManifest();
  const extraExistingItems = await loadExtraExistingItems();
  const manifest = existing && typeof existing === 'object' ? existing : null;
  const existingMatchesConfig =
    manifest &&
    manifest.version === 1 &&
    manifest.voiceId === voiceId &&
    manifest.modelId === modelId &&
    manifest.outputFormat === outputFormat;

  if (manifest && !existingMatchesConfig) {
    console.warn('[info] Existing manifest config differs; regenerating a new manifest.');
  }

  const items =
    existingMatchesConfig && manifest && manifest.items && typeof manifest.items === 'object' ? manifest.items : {};

  const outManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    voiceId,
    modelId,
    outputFormat,
    mimeType: getMimeTypeFromOutputFormat(outputFormat),
    items,
  };

  const total = texts.size;
  let done = 0;
  let skipped = 0;
  let failed = 0;

  if (CHECK_ONLY) {
    let missing = 0;
    const samples = [];
    for (const [cacheKey, text] of texts.entries()) {
      const existingEntry = items[cacheKey];
      if (existingEntry && typeof existingEntry === 'object' && typeof existingEntry.file === 'string') continue;
      const extraEntry = extraExistingItems[cacheKey];
      if (extraEntry && typeof extraEntry === 'object' && typeof extraEntry.file === 'string') continue;
      missing++;
      if (samples.length < 30) samples.push(text);
    }
    console.log(`[check] Total texts: ${total}`);
    console.log(`[check] Already in manifest: ${total - missing}`);
    console.log(`[check] Missing: ${missing}`);
    if (samples.length) {
      console.log('[check] Sample missing texts:');
      for (const s of samples) console.log(`- ${s}`);
    }
    return;
  }

  for (const [cacheKey, text] of texts.entries()) {
    done++;

    const existingEntry = items[cacheKey];
    if (existingEntry && typeof existingEntry === 'object' && typeof existingEntry.file === 'string') {
      skipped++;
      if (done % 25 === 0 || done === total) {
        console.log(`[${done}/${total}] skipped ${skipped}, failed ${failed}`);
      }
      continue;
    }

    const extraEntry = extraExistingItems[cacheKey];
    if (extraEntry && typeof extraEntry === 'object' && typeof extraEntry.file === 'string') {
      skipped++;
      if (done % 25 === 0 || done === total) {
        console.log(`[${done}/${total}] skipped ${skipped}, failed ${failed}`);
      }
      continue;
    }

    const hash = sha256Hex([voiceId, modelId, outputFormat, cacheKey].join('|'));
    const ext = getFileExtension(outputFormat);
    const fileName = `${hash}.${ext}`;
    const relFile = `assets/tts/${fileName}`;
    const absFile = path.join(OUT_DIR, fileName);

    try {
      const elevenText = normalizeTextForElevenLabs(text);
      const res = await fetchTtsWithTimestamps({ apiKey, voiceId, modelId, outputFormat, text: elevenText });
      if (!res || !res.audio_base64) throw new Error('Unexpected ElevenLabs response (missing audio_base64)');

      const audioBuf = Buffer.from(res.audio_base64, 'base64');
      await fs.writeFile(absFile, audioBuf);

      const wordTimings = buildWordTimingsFromAlignment(res.alignment || null);
      items[cacheKey] = {
        text,
        file: relFile,
        mimeType: getMimeTypeFromOutputFormat(outputFormat),
        outputFormat,
        wordTimings,
      };

      // Write manifest periodically so we can resume after interruptions.
      if (done % 10 === 0 || done === total) {
        outManifest.generatedAt = new Date().toISOString();
        await writeManifest(outManifest);
      }

      if (done % 10 === 0 || done === total) {
        console.log(`[${done}/${total}] generated ${done - skipped - failed}, skipped ${skipped}, failed ${failed}`);
      }
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[${done}/${total}] FAILED: ${text} :: ${msg}`);
      outManifest.generatedAt = new Date().toISOString();
      await writeManifest(outManifest);
    }
  }

  outManifest.generatedAt = new Date().toISOString();
  await writeManifest(outManifest);

  console.log(`Done. Total: ${total}, skipped: ${skipped}, failed: ${failed}`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch(err => {
  const msg = err instanceof Error ? err.stack : String(err);
  console.error(msg);
  process.exit(1);
});
