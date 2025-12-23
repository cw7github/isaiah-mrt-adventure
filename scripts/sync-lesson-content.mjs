import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const canonicalPath = path.join(repoRoot, 'index.html');

function extractLiteral(html, marker, openChar, closeChar) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find marker: ${marker}`);

  const start = html.indexOf(openChar, markerIndex);
  if (start < 0) throw new Error(`Could not find opening ${openChar} after marker: ${marker}`);

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = start; i < html.length; i++) {
    const c = html[i];
    const n = i + 1 < html.length ? html[i + 1] : '';

    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && n === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingle) {
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === '"') inDouble = false;
      continue;
    }
    if (inBacktick) {
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === '`') inBacktick = false;
      continue;
    }

    if (c === '/' && n === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      continue;
    }
    if (c === '`') {
      inBacktick = true;
      continue;
    }

    if (c === openChar) {
      depth += 1;
      continue;
    }
    if (c === closeChar) {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1, literal: html.slice(start, i + 1) };
    }
  }

  throw new Error(`Could not find matching closing ${closeChar} for marker: ${marker}`);
}

function replaceLiteral(html, marker, openChar, closeChar, newLiteral) {
  const found = extractLiteral(html, marker, openChar, closeChar);
  const next = html.slice(0, found.start) + newLiteral + html.slice(found.end);
  return { next, replaced: found.literal !== newLiteral };
}

const sections = [
  { name: 'stationContent', marker: 'const stationContent = {', openChar: '{', closeChar: '}' },
  { name: 'skillWordBanks', marker: 'const skillWordBanks = {', openChar: '{', closeChar: '}' },
  { name: 'skillsCatalog', marker: 'const skillsCatalog = [', openChar: '[', closeChar: ']' },
];

const canonicalHtml = fs.readFileSync(canonicalPath, 'utf8');
const canonicalLiterals = new Map(
  sections.map(section => {
    const extracted = extractLiteral(canonicalHtml, section.marker, section.openChar, section.closeChar);
    return [section.name, extracted.literal];
  }),
);

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('Usage: node scripts/sync-lesson-content.mjs <target.html> [more targets...]');
  process.exitCode = 1;
} else {
  for (const target of targets) {
    const targetPath = path.resolve(repoRoot, target);
    const original = fs.readFileSync(targetPath, 'utf8');

    let updated = original;
    let didReplace = false;

    for (const section of sections) {
      const literal = canonicalLiterals.get(section.name);
      if (!literal) continue;
      const { next, replaced } = replaceLiteral(updated, section.marker, section.openChar, section.closeChar, literal);
      updated = next;
      didReplace = didReplace || replaced;
    }

    if (didReplace) {
      fs.writeFileSync(targetPath, updated, 'utf8');
      console.log(`Synced content sections in ${target}`);
    } else {
      console.log(`No changes needed for ${target}`);
    }
  }
}

