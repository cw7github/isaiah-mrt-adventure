#!/usr/bin/env node
/**
 * Generate menu "reward" images (shown after choosing an item) using:
 * - OpenRouter + `google/gemini-3-pro-image-preview`
 *
 * Output:
 * - assets/menu_rewards/<stationId>__<slug(itemName)>.<ext>
 *
 * Usage:
 * - node scripts/generate-menu-reward-images.mjs
 * - node scripts/generate-menu-reward-images.mjs --dry-run
 * - node scripts/generate-menu-reward-images.mjs --force
 * - node scripts/generate-menu-reward-images.mjs --station teahouse
 * - node scripts/generate-menu-reward-images.mjs --limit 3
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const INDEX_HTML_PATH = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'assets', 'menu_rewards');

const MODEL = 'google/gemini-3-pro-image-preview';

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    station: null,
    limit: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run' || arg === '--check') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--station') args.station = argv[i + 1] || null;
    else if (arg.startsWith('--station=')) args.station = arg.split('=')[1] || null;
    else if (arg === '--limit') args.limit = Number(argv[i + 1]) || null;
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=')[1]) || null;
  }
  return args;
}

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

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function buildOutputBaseName(stationId, itemName) {
  return `${slugify(stationId || 'station')}__${slugify(itemName || 'item')}`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findExistingForBase(baseName) {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  for (const ext of exts) {
    const candidate = path.join(OUT_DIR, `${baseName}.${ext}`);
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

function buildPrompt({ itemName, itemDescription }) {
  const style =
    'Studio Ghibli style watercolor illustration with soft watercolor textures, warm pastel colors, gentle lighting, hand-painted feel, whimsical and magical atmosphere, suitable for children';
  const descriptor = itemDescription ? ` (${itemDescription})` : '';
  return [
    `${style}.`,
    `Create a cute, sticker-like illustration of ${itemName}${descriptor}.`,
    'Centered single object, simple composition, minimal/no background.',
    'Clean white background.',
    'No text, no watermark, no logo, no border.',
    'Square image, high quality.',
  ].join(' ');
}

function normalizeImageFormat(format) {
  const f = String(format || '').toLowerCase();
  if (f === 'jpeg') return 'jpg';
  if (f === 'jpg' || f === 'png' || f === 'webp') return f;
  return f || 'png';
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestGeminiImage({ apiKey, prompt }) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://isaiah-mrt-adventure.vercel.app',
      'X-Title': 'Isaiah MRT Food Adventure',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenRouter error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  const images = message?.images;
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error('No images returned by model');
  }

  const first = images.find(img => img?.type === 'image_url' && img?.image_url?.url) || images[0];
  const url = first?.image_url?.url;
  if (typeof url !== 'string') throw new Error('Invalid image response payload');

  const match = url.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error('Expected data URL image');

  const format = normalizeImageFormat(match[1]);
  const buffer = Buffer.from(match[2], 'base64');
  return { format, buffer };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await loadEnvFromDotLocal();
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY (set it in .env.local or env)');
    process.exitCode = 1;
    return;
  }

  const html = await fs.readFile(INDEX_HTML_PATH, 'utf8');
  const stationContent = extractStationContentFromIndexHtml(html);

  const jobs = [];
  for (const [stationId, station] of Object.entries(stationContent || {})) {
    if (args.station && stationId !== args.station) continue;
    const pages = Array.isArray(station?.pages) ? station.pages : [];
    for (const page of pages) {
      if (!page || page.type !== 'menu') continue;
      const items = Array.isArray(page.items) ? page.items : [];
      for (const item of items) {
        const itemName = item && item.name ? String(item.name).trim() : '';
        if (!itemName) continue;
        const baseName = buildOutputBaseName(stationId, itemName);
        jobs.push({
          stationId,
          itemName,
          itemDescription: item && item.description ? String(item.description).trim() : '',
          outputBaseName: baseName,
        });
      }
    }
  }

  // Deduplicate in case the same menu item appears multiple times for a station.
  const seen = new Set();
  const uniqueJobs = [];
  for (const job of jobs) {
    const key = `${job.stationId}::${job.outputBaseName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueJobs.push(job);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const toGenerate = [];
  for (const job of uniqueJobs) {
    const existing = await findExistingForBase(job.outputBaseName);
    if (existing && !args.force) continue;
    toGenerate.push(job);
  }

  const limited = Number.isFinite(args.limit) && args.limit > 0 ? toGenerate.slice(0, args.limit) : toGenerate;

  console.log(`Menu reward images: ${uniqueJobs.length} total item(s).`);
  console.log(`Will generate: ${limited.length} item(s)${args.dryRun ? ' (dry-run)' : ''}.`);
  if (args.station) console.log(`Station filter: ${args.station}`);
  if (args.force) console.log('Force: on (regenerating even if files exist).');

  for (let i = 0; i < limited.length; i++) {
    const job = limited[i];
    const label = `${job.stationId} / ${job.itemName}`;
    const prompt = buildPrompt(job);

    console.log(`\n[${i + 1}/${limited.length}] ${label}`);
    console.log(`Prompt: ${prompt}`);

    if (args.dryRun) continue;

    const { format, buffer } = await requestGeminiImage({ apiKey, prompt });
    const outPath = path.join(OUT_DIR, `${job.outputBaseName}.${format}`);
    await fs.writeFile(outPath, buffer);
    console.log(`Saved: ${path.relative(ROOT, outPath)} (${Math.round(buffer.length / 1024)} KB)`);

    // Be gentle with the API.
    if (i < limited.length - 1) await delay(1200);
  }
}

main().catch(err => {
  console.error(err?.stack || err?.message || String(err));
  process.exitCode = 1;
});

