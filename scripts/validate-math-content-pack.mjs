#!/usr/bin/env node
/**
 * validate-math-content-pack.mjs
 *
 * Validates the CPA Grade 1 Math content pack.
 *
 * Usage:
 *   node scripts/validate-math-content-pack.mjs
 *
 * Exit codes:
 *   0 = no errors
 *   1 = validation errors found
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const contentPackPath = path.join(repoRoot, 'content/cpa-grade1-math/content-pack.v1.json');

// Colors for terminal output
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function makeIssue({ severity, stationId, pageIndex = null, code, message, suggestion = null }) {
  return { severity, stationId, pageIndex, code, message, suggestion };
}

function validateContentPack() {
  const issues = [];

  // 1. Check JSON parses
  let contentPack;
  try {
    const raw = fs.readFileSync(contentPackPath, 'utf8');
    contentPack = JSON.parse(raw);
  } catch (err) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId: null,
      code: 'JSON_PARSE',
      message: `Failed to parse content pack JSON: ${err.message}`
    }));
    return { issues, stationCount: 0 };
  }

  const stationOrder = contentPack.stationOrder || [];
  const stations = contentPack.stations || {};
  const stationIds = Object.keys(stations);

  // 2. Check stationOrder includes all stations
  const orderSet = new Set(stationOrder);
  const stationSet = new Set(stationIds);

  for (const sid of stationOrder) {
    if (!stationSet.has(sid)) {
      issues.push(makeIssue({
        severity: 'FAIL',
        stationId: sid,
        code: 'STATION_ORDER_MISSING',
        message: `Station "${sid}" is in stationOrder but not defined in stations object.`
      }));
    }
  }

  for (const sid of stationIds) {
    if (!orderSet.has(sid)) {
      issues.push(makeIssue({
        severity: 'FAIL',
        stationId: sid,
        code: 'STATION_NOT_IN_ORDER',
        message: `Station "${sid}" is defined but not in stationOrder array.`
      }));
    }
  }

  // 3. Validate each station
  for (const [stationId, station] of Object.entries(stations)) {
    issues.push(...validateStation(stationId, station));
  }

  return { issues, stationCount: stationIds.length };
}

function validateStation(stationId, station) {
  const issues = [];
  const pages = Array.isArray(station?.pages) ? station.pages : [];

  // Required station fields
  const requiredFields = ['name', 'icon', 'level', 'line', 'checklistTargets', 'pages'];
  for (const field of requiredFields) {
    if (station[field] === undefined) {
      issues.push(makeIssue({
        severity: 'FAIL',
        stationId,
        code: 'STATION_MISSING_FIELD',
        message: `Station missing required field: ${field}`
      }));
    }
  }

  // Valid line check
  const validLines = ['OA', 'NBT', 'MD', 'G', 'Review'];
  if (station.line && !validLines.includes(station.line)) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      code: 'INVALID_LINE',
      message: `Station has invalid line "${station.line}". Expected one of: ${validLines.join(', ')}`
    }));
  }

  // Exactly one menu page per station
  const menuPages = pages.filter((p) => p && p.type === 'menu');
  if (menuPages.length !== 1) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      code: 'MENU_COUNT',
      message: `Expected exactly 1 menu page, found ${menuPages.length}.`
    }));
  }

  // Check menu has exactly 3 items
  for (const menu of menuPages) {
    const items = Array.isArray(menu.items) ? menu.items : [];
    if (items.length !== 3) {
      issues.push(makeIssue({
        severity: 'FAIL',
        stationId,
        code: 'MENU_ITEMS_3',
        message: `Menu must have exactly 3 items, found ${items.length}.`
      }));
    }
  }

  // Validate pages
  pages.forEach((page, pageIndex) => {
    if (!page || typeof page !== 'object') return;

    if (page.type === 'read') {
      issues.push(...validateReadPage(stationId, pageIndex, page));
    }

    if (page.type === 'question') {
      issues.push(...validateQuestionPage(stationId, pageIndex, page));
    }
  });

  return issues;
}

function validateReadPage(stationId, pageIndex, page) {
  const issues = [];

  // Check for sentence
  const sentence = String(page.sentence || '').trim();
  if (!sentence) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      pageIndex,
      code: 'READ_SENTENCE_MISSING',
      message: 'Read page must have a non-empty `sentence`.'
    }));
  }

  // Math tip (recommended)
  const mathTip = String(page.mathTip || '').trim();
  if (!mathTip) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      pageIndex,
      code: 'READ_MATH_TIP_MISSING',
      message: 'Read page should include `mathTip`.'
    }));
  }

  return issues;
}

function validateQuestionPage(stationId, pageIndex, page) {
  const issues = [];

  // Required fields
  const question = String(page.question || '').trim();
  if (!question) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      pageIndex,
      code: 'QUESTION_TEXT',
      message: 'Question page must include non-empty `question`.'
    }));
  }

  // Question type check
  const validQuestionTypes = ['computation', 'wordProblem', 'comparison', 'placeValue', 'measurement', 'geometry', 'sightWord', 'comprehension'];
  const qType = String(page.questionType || '').trim();
  if (!qType) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      pageIndex,
      code: 'QUESTION_TYPE_MISSING',
      message: 'Question page is missing `questionType`.'
    }));
  } else if (!validQuestionTypes.includes(qType)) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      pageIndex,
      code: 'QUESTION_TYPE_INVALID',
      message: `Unknown questionType "${qType}". Expected one of: ${validQuestionTypes.join(', ')}`
    }));
  }

  // Math hint check
  const mathHint = String(page.mathHint || page.comprehensionHint || '').trim();
  if (!mathHint) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      pageIndex,
      code: 'QUESTION_HINT',
      message: 'Question page should include `mathHint`.'
    }));
  }

  // Exactly 3 answers
  const answers = Array.isArray(page.answers) ? page.answers : [];
  if (answers.length !== 3) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      pageIndex,
      code: 'ANSWERS_3',
      message: `Multiple-choice questions must have exactly 3 answers, found ${answers.length}.`
    }));
  }

  // correctAnswerName must match one of the answers
  const correct = String(page.correctAnswerName || '').trim();
  if (!correct) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      pageIndex,
      code: 'CORRECT_ANSWER_MISSING',
      message: 'Question must include `correctAnswerName`.'
    }));
  } else if (!answers.some(a => a && a.name === correct)) {
    issues.push(makeIssue({
      severity: 'FAIL',
      stationId,
      pageIndex,
      code: 'CORRECT_ANSWER_MATCH',
      message: `correctAnswerName "${correct}" must match an answers[].name exactly.`,
      suggestion: `Available answer names: ${answers.map(a => a?.name).filter(Boolean).join(', ')}`
    }));
  }

  // Success message check
  const successMsg = String(page.successMessage || '').trim();
  if (!successMsg) {
    issues.push(makeIssue({
      severity: 'WARN',
      stationId,
      pageIndex,
      code: 'SUCCESS_MESSAGE',
      message: 'Question page should include `successMessage`.'
    }));
  }

  return issues;
}

function printReport(result) {
  const { issues, stationCount } = result;

  const fails = issues.filter(i => i.severity === 'FAIL');
  const warns = issues.filter(i => i.severity === 'WARN');

  console.log(`\n${BOLD}═══════════════════════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}                   CPA Grade 1 Math Content Pack Validator${RESET}`);
  console.log(`${BOLD}═══════════════════════════════════════════════════════════════════════════════${RESET}\n`);

  console.log(`📦 Content pack: ${CYAN}content/cpa-grade1-math/content-pack.v1.json${RESET}`);
  console.log(`📊 Stations validated: ${BOLD}${stationCount}${RESET}`);
  console.log(`\n${'─'.repeat(79)}\n`);

  if (fails.length === 0 && warns.length === 0) {
    console.log(`${GREEN}${BOLD}✅ All validations passed! No issues found.${RESET}\n`);
    return 0;
  }

  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  ${RED}✗ FAIL: ${fails.length}${RESET}`);
  console.log(`  ${YELLOW}⚠ WARN: ${warns.length}${RESET}`);
  console.log(`\n${'─'.repeat(79)}\n`);

  // Group by code
  const byCode = {};
  for (const issue of issues) {
    if (!byCode[issue.code]) byCode[issue.code] = [];
    byCode[issue.code].push(issue);
  }

  console.log(`${BOLD}Issues by Type:${RESET}\n`);
  for (const [code, codeIssues] of Object.entries(byCode).sort((a, b) => b[1].length - a[1].length)) {
    const severity = codeIssues[0].severity;
    const color = severity === 'FAIL' ? RED : YELLOW;
    console.log(`  ${color}${code}${RESET}: ${codeIssues.length} issue(s)`);
  }

  console.log(`\n${'─'.repeat(79)}\n`);
  console.log(`${BOLD}Detailed Issues:${RESET}\n`);

  // Group by station
  const byStation = {};
  for (const issue of issues) {
    const key = issue.stationId || 'GLOBAL';
    if (!byStation[key]) byStation[key] = [];
    byStation[key].push(issue);
  }

  for (const [stationId, stationIssues] of Object.entries(byStation).sort()) {
    const stationFails = stationIssues.filter(i => i.severity === 'FAIL').length;
    const stationWarns = stationIssues.filter(i => i.severity === 'WARN').length;

    console.log(`${BOLD}📍 ${stationId}${RESET} (${RED}${stationFails} FAIL${RESET}, ${YELLOW}${stationWarns} WARN${RESET})`);

    for (const issue of stationIssues) {
      const color = issue.severity === 'FAIL' ? RED : YELLOW;
      const pageInfo = issue.pageIndex !== null ? ` [page ${issue.pageIndex}]` : '';
      console.log(`   ${color}${issue.severity}${RESET} ${issue.code}${pageInfo}`);
      console.log(`        ${issue.message}`);
      if (issue.suggestion) {
        console.log(`        ${CYAN}💡 ${issue.suggestion}${RESET}`);
      }
    }
    console.log();
  }

  console.log(`${'─'.repeat(79)}`);
  console.log(`\n${fails.length > 0 ? RED : GREEN}${BOLD}Total: ${fails.length} failures, ${warns.length} warnings${RESET}\n`);

  return fails.length > 0 ? 1 : 0;
}

// Main execution
const result = validateContentPack();
const exitCode = printReport(result);
process.exit(exitCode);
