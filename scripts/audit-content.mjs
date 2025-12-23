import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const indexPath = path.join(repoRoot, 'index.html');
const standardsPath = 'docs/content-standards.md';
const auditJsonPath = path.join(repoRoot, 'docs/_content_audit_v2.json');
const auditMdPath = path.join(repoRoot, 'docs/content-audit.md');

function normalizeText(input) {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripPunctuation(word) {
  return String(word || '')
    .replace(/[.,!?;"'()[\]{}]/g, '')
    .trim();
}

function splitWords(text) {
  return normalizeText(text)
    .split(/\s+/)
    .map(stripPunctuation)
    .filter(Boolean);
}

function getReadText(page) {
  if (!page || page.type !== 'read') return '';
  if (typeof page.sentence === 'string' && page.sentence.trim()) return page.sentence.trim();
  if (Array.isArray(page.words) && page.words.length) return page.words.join(' ').trim();
  return '';
}

function getVariantReadText(basePage, variant) {
  if (!basePage || basePage.type !== 'read') return '';
  const override = variant && typeof variant === 'object' ? variant : {};
  if (typeof override.sentence === 'string') return override.sentence.trim();
  if (Array.isArray(override.words)) return override.words.join(' ').trim();
  return getReadText(basePage);
}

function extractStationContentObjectLiteral(html) {
  const marker = 'const stationContent = {';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find stationContent marker in index.html');

  const braceStart = html.indexOf('{', markerIndex);
  if (braceStart < 0) throw new Error('Could not find opening brace for stationContent');

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < html.length; i++) {
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

    // Not in string/comment
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

    if (c === '{') {
      depth += 1;
      continue;
    }
    if (c === '}') {
      depth -= 1;
      if (depth === 0) {
        return html.slice(braceStart, i + 1);
      }
    }
  }

  throw new Error('Could not find matching closing brace for stationContent');
}

function loadStationContent() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const literal = extractStationContentObjectLiteral(html);
  const context = vm.createContext({});
  return vm.runInContext(`(${literal})`, context);
}

function makeIssue({ severity, stationId, pageIndex = null, code, message }) {
  return { severity, stationId, pageIndex, code, message };
}

function auditStation(stationId, station) {
  const issues = [];
  const pages = Array.isArray(station?.pages) ? station.pages : [];

  const menuPages = pages
    .map((p, i) => ({ p, i }))
    .filter(x => x.p && x.p.type === 'menu');

  if (menuPages.length !== 1) {
    issues.push(
      makeIssue({
        severity: 'FAIL',
        stationId,
        code: 'MENU_COUNT',
        message: `Expected exactly 1 menu page, found ${menuPages.length}.`,
      }),
    );
  } else {
    const menu = menuPages[0].p;
    const items = Array.isArray(menu.items) ? menu.items : [];
    if (items.length !== 3) {
      issues.push(
        makeIssue({
          severity: 'FAIL',
          stationId,
          pageIndex: menuPages[0].i,
          code: 'MENU_ITEMS_3',
          message: `Menu must have exactly 3 items, found ${items.length}.`,
        }),
      );
    }
  }

  const possibleReadTextsForPage = page => {
    if (!page || page.type !== 'read') return [];
    const variants = Array.isArray(page.variants) ? page.variants : [];
    // Runtime behavior: if variants exist, one variant is always chosen for the session.
    if (variants.length) return variants.map(v => getVariantReadText(page, v)).filter(Boolean);
    return [getReadText(page)].filter(Boolean);
  };

  const anyReadTextUpToContains = (idx, needle) =>
    pages
      .slice(0, idx + 1)
      .filter(p => p && p.type === 'read')
      .some(readPage => possibleReadTextsForPage(readPage).some(t => normalizeText(t).includes(needle)));

  const hasInvariantReadCarrierUpTo = (idx, needle) =>
    pages
      .slice(0, idx + 1)
      .filter(p => p && p.type === 'read')
      .some(readPage => {
        const possible = possibleReadTextsForPage(readPage);
        return possible.length > 0 && possible.every(t => normalizeText(t).includes(needle));
      });

  pages.forEach((page, pageIndex) => {
    if (!page || typeof page !== 'object') return;

    if (page.type === 'read') {
      const text = getReadText(page);
      if (!text) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'READ_TEXT',
            message: 'Read page must have a non-empty `sentence` or `words`.',
          }),
        );
      }

      const targetWords = Array.isArray(page.targetWords) ? page.targetWords : [];
      if (!targetWords.length) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'READ_TARGET_WORDS',
            message: 'Read page must include non-empty `targetWords`.',
          }),
        );
      }

      const focus = String(page.sightWordFocus || '').trim();
      if (!focus) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'READ_SIGHT_WORD_FOCUS',
            message: 'Read page must include `sightWordFocus`.',
          }),
        );
      } else if (text) {
        const words = splitWords(text).map(w => w.toLowerCase());
        if (!words.includes(focus.toLowerCase())) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'READ_FOCUS_IN_TEXT',
              message: `sightWordFocus "${focus}" must appear in the read text.`,
            }),
          );
        }
      }

      const tip = String(page.readingTip || '').trim();
      if (!tip) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'READ_TIP',
            message: 'Read page must include a non-empty `readingTip`.',
          }),
        );
      }

      // Variant integrity: any variant that overrides text must keep required anchors.
      const variants = Array.isArray(page.variants) ? page.variants : [];
      if (variants.length) {
        const teachWord = page.teachWord && typeof page.teachWord === 'object' ? page.teachWord : null;
        const teachToken = teachWord && teachWord.word ? String(teachWord.word).trim() : '';
        variants.forEach((variant, variantIndex) => {
          const vText = getVariantReadText(page, variant);
          if (!vText) return;

          if (focus && !splitWords(vText).map(w => w.toLowerCase()).includes(focus.toLowerCase())) {
            issues.push(
              makeIssue({
                severity: 'FAIL',
                stationId,
                pageIndex,
                code: 'READ_VARIANT_MISSING_FOCUS',
                message: `Variant ${variantIndex} overrides text but omits sightWordFocus "${focus}".`,
              }),
            );
          }

          if (teachToken && !vText.toLowerCase().includes(teachToken.toLowerCase())) {
            issues.push(
              makeIssue({
                severity: 'FAIL',
                stationId,
                pageIndex,
                code: 'READ_VARIANT_MISSING_TEACH_WORD',
                message: `Variant ${variantIndex} overrides text but omits teachWord "${teachToken}".`,
              }),
            );
          }
        });
      }
    }

    if (page.type === 'question') {
      const question = String(page.question || '').trim();
      if (!question) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'QUESTION_TEXT',
            message: 'Question page must include non-empty `question`.',
          }),
        );
      }

      const qType = String(page.questionType || '').trim();
      if (!qType) {
        issues.push(
          makeIssue({
            severity: 'WARN',
            stationId,
            pageIndex,
            code: 'QUESTION_TYPE_MISSING',
            message: 'Question page is missing `questionType` (expected `comprehension` or `sightWord`).',
          }),
        );
      }

      const hint = String(page.comprehensionHint || '').trim();
      if (!hint) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'QUESTION_HINT',
            message: 'Question page must include non-empty `comprehensionHint` (revealed after a miss).',
          }),
        );
      }

      const isMultipleChoice = page.questionMode === 'multipleChoice' || Array.isArray(page.answers);
      if (isMultipleChoice) {
        const answers = Array.isArray(page.answers) ? page.answers : [];
        if (answers.length !== 3) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'ANSWERS_3',
              message: `Multiple-choice questions must have exactly 3 answers, found ${answers.length}.`,
            }),
          );
        }
        const correct = String(page.correctAnswerName || '').trim();
        if (!correct) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'CORRECT_ANSWER_MISSING',
              message: 'Multiple-choice questions must include `correctAnswerName`.',
            }),
          );
        } else if (!answers.some(a => a && a.name === correct)) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'CORRECT_ANSWER_MATCH',
              message: `correctAnswerName "${correct}" must match an answers[].name exactly.`,
            }),
          );
        }
      } else if (menuPages.length === 1) {
        const items = Array.isArray(menuPages[0].p.items) ? menuPages[0].p.items : [];
        if (items.length !== 3) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'MENU_RECALL_ITEMS_3',
              message: `Menu-recall questions require a 3-item menu (found ${items.length}).`,
            }),
          );
        }
      }

      const passage = normalizeText(page.passage || '');
      const questionLower = question.toLowerCase();
      const looksCloze =
        /_{2,}/.test(passage) ||
        questionLower.includes('fill in') ||
        questionLower.includes('blank') ||
        questionLower.includes('completes the sentence') ||
        questionLower.includes('completes this sentence');

      if (looksCloze && !/_{2,}/.test(passage)) {
        issues.push(
          makeIssue({
            severity: 'FAIL',
            stationId,
            pageIndex,
            code: 'CLOZE_BLANK_VISIBLE',
            message: 'Cloze questions must include a visible blank like ____ in `page.passage`.',
          }),
        );
      }

      if (qType === 'comprehension') {
        if (!passage) {
          issues.push(
            makeIssue({
              severity: 'FAIL',
              stationId,
              pageIndex,
              code: 'PASSAGE_REQUIRED',
              message: 'Comprehension questions must include non-empty `passage` (key evidence sentence).',
            }),
          );
        } else {
          if (!anyReadTextUpToContains(pageIndex, passage)) {
            issues.push(
              makeIssue({
                severity: 'FAIL',
                stationId,
                pageIndex,
                code: 'EVIDENCE_MISSING',
                message: 'Key-sentence `passage` does not appear verbatim in any prior read text (including variants).',
              }),
            );
          }

          // Evidence invariance across read-page variants: at least one prior read page must contain the
          // passage in every possible session variant (so highlighting/evidence is reliable).
          if (anyReadTextUpToContains(pageIndex, passage) && !hasInvariantReadCarrierUpTo(pageIndex, passage)) {
            issues.push(
              makeIssue({
                severity: 'FAIL',
                stationId,
                pageIndex,
                code: 'EVIDENCE_VARIANT_DRIFT',
                message: 'Evidence sentence is not guaranteed to appear across read-page variants.',
              }),
            );
          }
        }
      }
    }
  });

  return issues;
}

function generateAudit() {
  const stationContent = loadStationContent();
  const stations = Object.entries(stationContent || {}).filter(([, station]) => !(station && station.isPractice));
  const stationIds = stations.map(([id]) => id).sort();

  const issues = [];
  for (const [stationId, station] of stations) {
    issues.push(...auditStation(stationId, station));
  }

  const bySeverity = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    { FAIL: 0, WARN: 0 },
  );

  return {
    stationCount: stations.length,
    stationIds,
    bySeverity,
    issues: issues.sort((a, b) => {
      if (a.stationId !== b.stationId) return a.stationId.localeCompare(b.stationId);
      const ai = Number.isFinite(a.pageIndex) ? a.pageIndex : -1;
      const bi = Number.isFinite(b.pageIndex) ? b.pageIndex : -1;
      if (ai !== bi) return ai - bi;
      if (a.severity !== b.severity) return a.severity.localeCompare(b.severity);
      return a.code.localeCompare(b.code);
    }),
  };
}

function renderMarkdown(audit) {
  const issuesByStation = {};
  audit.issues.forEach(issue => {
    if (!issuesByStation[issue.stationId]) issuesByStation[issue.stationId] = [];
    issuesByStation[issue.stationId].push(issue);
  });

  const stationsAudited = audit.stationCount;
  const stationsWithFails = Object.entries(issuesByStation).filter(([, list]) => list.some(i => i.severity === 'FAIL')).length;
  const stationsWithIssues = Object.keys(issuesByStation).length;
  const stationsClean = stationsAudited - stationsWithIssues;

  const topCodes = (() => {
    const counts = {};
    audit.issues.forEach(i => {
      const key = i.code;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  })();

  const lines = [];
  lines.push('# Content Audit (Against Content Standards)');
  lines.push('');
  lines.push(`- Standards: \`${standardsPath}\``);
  lines.push(`- Source content: \`index.html\` (\`stationContent\`)`);
  lines.push(`- Audit data: \`docs/_content_audit_v2.json\``);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Stations audited (excluding practice): **${stationsAudited}**`);
  lines.push(`- Stations with FAILs: **${stationsWithFails}**`);
  lines.push(`- Stations clean (0 issues): **${stationsClean}**`);
  lines.push(`- Issues: **${audit.bySeverity.FAIL} FAIL**, **${audit.bySeverity.WARN} WARN** (total **${audit.bySeverity.FAIL + audit.bySeverity.WARN}**)`);
  lines.push('');
  lines.push('### Top Issue Codes');
  lines.push('');
  if (!topCodes.length) {
    lines.push('- (none)');
  } else {
    topCodes.forEach(([code, count]) => {
      lines.push(`- ${code}: ${count}`);
    });
  }

  lines.push('');
  lines.push('## Station-by-Station Findings');
  lines.push('');
  lines.push('> Page numbers below are 0-based `pageIndex` values inside each station’s `pages` array.');
  lines.push('');

  (audit.stationIds || []).forEach(stationId => {
    const stationIssues = issuesByStation[stationId] || [];
    const failCount = stationIssues.filter(i => i.severity === 'FAIL').length;
    const warnCount = stationIssues.filter(i => i.severity === 'WARN').length;
    const status = failCount ? 'FAIL' : warnCount ? 'WARN' : 'PASS';

    lines.push(`### ${stationId} — ${status}`);
    lines.push('');
    lines.push(`- Issues: **${failCount} FAIL**, **${warnCount} WARN**`);
    if (stationIssues.length) {
      stationIssues.forEach(issue => {
        const where = Number.isFinite(issue.pageIndex) ? `pageIndex ${issue.pageIndex}` : 'station';
        lines.push(`- ${issue.severity} ${issue.code} (${where}): ${issue.message}`);
      });
    }
    lines.push('');
  });

  lines.push('---');
  lines.push('');
  lines.push('Generated automatically from `docs/_content_audit_v2.json` + `index.html`.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const audit = generateAudit();
  fs.writeFileSync(auditJsonPath, JSON.stringify(audit, null, 2) + '\n');
  fs.writeFileSync(auditMdPath, renderMarkdown(audit));
  const total = audit.bySeverity.FAIL + audit.bySeverity.WARN;
  // eslint-disable-next-line no-console
  console.log(`Content audit complete: ${audit.stationCount} stations, ${total} issues (${audit.bySeverity.FAIL} FAIL / ${audit.bySeverity.WARN} WARN).`);
  if (audit.bySeverity.FAIL) process.exitCode = 1;
}

main();
