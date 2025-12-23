#!/usr/bin/env node
/**
 * Generate elevator door reveal scenes using OpenRouter + "Nano Banana Pro" (Gemini 3 Pro Image Preview).
 *
 * Output: assets/elevator_scenes/*.jpg
 *
 * Required:
 * - OPENROUTER_API_KEY
 *
 * Optional:
 * - OPENROUTER_IMAGE_MODEL (default: google/gemini-3-pro-image-preview)
 * - OPENROUTER_IMAGE_ASPECT (prompt hint, default: "Landscape 4:3 aspect ratio")
 * - OPENROUTER_IMAGE_SIZE (max dimension, default: 1400)
 * - OPENROUTER_IMAGE_QUALITY (JPEG quality 0-100, default: 84)
 *
 * Flags:
 * - --force (overwrite existing images)
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'assets', 'elevator_scenes');

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hasSips() {
  try {
    const res = childProcess.spawnSync('sips', ['-h'], { stdio: 'ignore' });
    return res.status === 0 || res.status === 1;
  } catch {
    return false;
  }
}

function sipsConvertToJpeg({ inputPngPath, outputJpgPath, maxSize, quality }) {
  // Resize to max dimension (preserves aspect ratio).
  const resize = childProcess.spawnSync('sips', ['-Z', String(maxSize), inputPngPath, '--out', inputPngPath], {
    encoding: 'utf8',
    stdio: 'ignore',
  });
  if (resize.status !== 0) throw new Error('sips resize failed');

  const convert = childProcess.spawnSync(
    'sips',
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), inputPngPath, '--out', outputJpgPath],
    { encoding: 'utf8', stdio: 'ignore' }
  );
  if (convert.status !== 0) throw new Error('sips convert failed');
}

function extractDataUrlFromOpenRouterResponse(data) {
  const msg = data?.choices?.[0]?.message;
  const images = msg?.images;
  if (!Array.isArray(images) || images.length === 0) return null;

  for (const img of images) {
    const url = img?.image_url?.url;
    if (typeof url === 'string' && url.startsWith('data:image/')) return url;
  }
  return null;
}

async function fetchImageDataUrl({ apiKey, model, prompt, maxRetries = 3 }) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://isaiah-mrt-adventure.vercel.app',
          'X-Title': 'Isaiah MRT Adventure',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You generate a single image. Do not write any text outside the image. Do not add captions.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.65,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        const message = `OpenRouter error: ${response.status} ${response.statusText} ${errText}`.trim();
        lastError = new Error(message);

        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === maxRetries) throw lastError;

        await sleep(1200 * attempt);
        continue;
      }

      const data = await response.json();
      const dataUrl = extractDataUrlFromOpenRouterResponse(data);
      if (!dataUrl) throw new Error('No image data URL found in OpenRouter response');
      return dataUrl;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      await sleep(1200 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('OpenRouter request failed');
}

function buildPrompt({ stationName, stationTheme, variant }) {
  const aspect = process.env.OPENROUTER_IMAGE_ASPECT || 'Landscape 4:3 aspect ratio';
  const baseStyle = [
    `${aspect}.`,
    "High-detail, realistic 3D animated-film background (kid-friendly, not scary).",
    "POV from inside an elevator looking outward as the doors open (wide-angle, not zoomed/cropped).",
    'Warm cinematic lighting, realistic materials and textures, sharp focus.',
    'No people, no faces, no text, no logos, no signage, no letters, no watermarks.',
    'Clean composition, no blur, no distortion, no artifacts.',
  ].join(' ');

  const variantText =
    variant === 'warmup'
      ? [
          'The doors open into a “word warm-up room”: a cozy learning room for a 7-year-old.',
          'Include picture-only flashcards (no letters), a small whiteboard with blank sticky notes (no writing),',
          `and playful props themed around ${stationTheme}.`,
          'Add a few fun “I Spy” details like a tiny toy train or a cute mascot plush hidden on a shelf.',
        ].join(' ')
      : [
          `The doors open into a charming, realistic ${stationName} restaurant space themed around ${stationTheme}.`,
          'Include tables, warm decor, and appetizing food props (no menu text).',
          'Add a few fun “I Spy” details like a tiny toy train or a cute mascot plush hidden somewhere.',
        ].join(' ');

  return `${baseStyle} ${variantText} The scene should look like a real place you can step into from the elevator.`;
}

async function main() {
  await loadEnvFromDotLocal();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY (set it in your environment or .env.local).');
    process.exit(1);
  }

  const model = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3-pro-image-preview';
  const maxSize = Number.parseInt(process.env.OPENROUTER_IMAGE_SIZE || '1400', 10);
  const quality = Number.parseInt(process.env.OPENROUTER_IMAGE_QUALITY || '84', 10);
  const force = process.argv.includes('--force');

  await fs.mkdir(OUT_DIR, { recursive: true });

  const stations = [
    { id: 'fruit', name: 'Fruit Stand', theme: 'fresh fruits like apples, oranges, bananas, and berries' },
    { id: 'drink', name: 'Drink Bar', theme: 'juice bottles, smoothies, milk, tea, and colorful cups' },
    { id: 'bakery', name: 'Bakery', theme: 'cupcakes, cakes, pies, cookies, and warm buns' },
    { id: 'pizza', name: 'Pizza Place', theme: 'pizza oven glow, cheese, tomatoes, basil, and pizza slices' },
    { id: 'icecream', name: 'Ice Cream Shop', theme: 'ice cream tubs, cones, pastel colors, and sprinkles' },
    { id: 'fishshop', name: 'Fish Shop', theme: 'ocean-blue tiles, fresh fish, shrimp, and gentle watery light' },
    { id: 'cheese', name: 'Cheese Shop', theme: 'cheese wheels, sandwiches, warm golden tones' },
    { id: 'noodle', name: 'Noodle House', theme: 'noodle bowls, chopsticks, lantern glow, warm steam' },
  ];

  const variants = [
    { id: 'warmup', label: 'Warm-Up' },
    { id: 'restaurant', label: 'Restaurant' },
  ];

  const total = stations.length * variants.length + 1;
  let done = 0;

  const canUseSips = process.platform === 'darwin' && hasSips();
  if (!canUseSips) {
    console.warn('[info] sips not available; will save raw PNGs instead of optimized JPGs.');
  }

  // Optional lobby scene (generic).
  {
    const name = 'lobby';
    const jpgPath = path.join(OUT_DIR, `${name}.jpg`);
    const pngPath = path.join(OUT_DIR, `${name}.png`);
    done++;

    if (!force && (fsSync.existsSync(jpgPath) || fsSync.existsSync(pngPath))) {
      console.log(`[${done}/${total}] skip lobby (exists)`); // no secret output
    } else {
      if (force) {
        await fs.unlink(jpgPath).catch(() => {});
        await fs.unlink(pngPath).catch(() => {});
      }
      console.log(`[${done}/${total}] generating lobby scene...`);
      const aspect = process.env.OPENROUTER_IMAGE_ASPECT || 'Landscape 4:3 aspect ratio';
      const prompt = [
        `${aspect}.`,
        "High-detail, realistic 3D animated-film background (kid-friendly, not scary).",
        'POV from inside an elevator looking outward as doors open into a cozy, kid-friendly lobby area.',
        'Warm lighting, simple decor, calm and inviting. Realistic materials and textures. Sharp focus.',
        'No text, no signs, no letters, no people.',
      ].join(' ');

      const dataUrl = await fetchImageDataUrl({ apiKey, model, prompt });
      const base64 = dataUrl.split('base64,')[1] || '';
      const pngBuf = Buffer.from(base64, 'base64');
      await fs.writeFile(pngPath, pngBuf);

      if (canUseSips) {
        sipsConvertToJpeg({ inputPngPath: pngPath, outputJpgPath: jpgPath, maxSize, quality });
        await fs.unlink(pngPath).catch(() => {});
      }
    }
  }

  for (const station of stations) {
    for (const variant of variants) {
      done++;
      const baseName = `${station.id}_${variant.id}`;
      const jpgPath = path.join(OUT_DIR, `${baseName}.jpg`);
      const pngPath = path.join(OUT_DIR, `${baseName}.png`);

      if (!force && (fsSync.existsSync(jpgPath) || fsSync.existsSync(pngPath))) {
        console.log(`[${done}/${total}] skip ${baseName} (exists)`);
        continue;
      }

      if (force) {
        await fs.unlink(jpgPath).catch(() => {});
        await fs.unlink(pngPath).catch(() => {});
      }

      console.log(`[${done}/${total}] generating ${station.id} ${variant.label}...`);
      const prompt = buildPrompt({ stationName: station.name, stationTheme: station.theme, variant: variant.id });
      const dataUrl = await fetchImageDataUrl({ apiKey, model, prompt });
      const base64 = dataUrl.split('base64,')[1] || '';
      const pngBuf = Buffer.from(base64, 'base64');
      await fs.writeFile(pngPath, pngBuf);

      if (canUseSips) {
        sipsConvertToJpeg({ inputPngPath: pngPath, outputJpgPath: jpgPath, maxSize, quality });
        await fs.unlink(pngPath).catch(() => {});
      }

      // Be nice to rate limits.
      await sleep(350);
    }
  }

  console.log(`Done. Wrote scenes to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
