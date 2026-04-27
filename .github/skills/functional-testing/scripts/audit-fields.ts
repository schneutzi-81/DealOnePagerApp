#!/usr/bin/env npx tsx
/**
 * Field Audit Script — scans source files for every DealOnePagerFields key
 * and reports coverage across Form, Preview, and Markdown layers.
 *
 * Usage:  npx tsx .github/skills/functional-testing/scripts/audit-fields.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Paths (relative to project root) ──────────────────────────────────────────
const ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
const TYPES_PATH = resolve(ROOT, 'src/types/index.ts');
const FORM_PATH = resolve(ROOT, 'src/components/DealForm.tsx');
const PREVIEW_PATH = resolve(ROOT, 'src/components/PDFPreview.tsx');

// ── Read source files ─────────────────────────────────────────────────────────
const typesSource = readFileSync(TYPES_PATH, 'utf-8');
const formSource = readFileSync(FORM_PATH, 'utf-8');
const previewSource = readFileSync(PREVIEW_PATH, 'utf-8');

// ── Extract field keys from the DealOnePagerFields interface ──────────────────
const interfaceMatch = typesSource.match(
  /export interface DealOnePagerFields\s*\{([\s\S]*?)\n\}/
);
if (!interfaceMatch) {
  console.error('❌ Could not find DealOnePagerFields interface in types.');
  process.exit(1);
}

const fieldLines = interfaceMatch[1].matchAll(/^\s+(\w+)\s*:/gm);
const fields: { key: string; type: 'string' | 'TableRow[]' }[] = [];

for (const m of fieldLines) {
  const key = m[1];
  const lineIdx = interfaceMatch[1].indexOf(m[0]);
  const lineText = interfaceMatch[1].slice(lineIdx, interfaceMatch[1].indexOf('\n', lineIdx));
  const isTable = lineText.includes('TableRow[]');
  fields.push({ key, type: isTable ? 'TableRow[]' : 'string' });
}

// ── Extract FIELD_LABELS values (which field keys are reachable from markdown)
const labelMatches = typesSource.matchAll(/'(\w+)'/g);
const fieldLabelValues = new Set<string>();
// More precise: find lines like  'some label': 'fieldKey',
const labelLineMatches = typesSource.matchAll(/:\s*'(\w+)'\s*[,;]/g);
for (const m of labelLineMatches) {
  fieldLabelValues.add(m[1]);
}

// ── Extract TABLE_FIELDS entries ──────────────────────────────────────────────
const tableFieldsMatch = typesSource.match(
  /TABLE_FIELDS\s*=\s*new Set[^(]*\(\[([\s\S]*?)\]\)/
);
const tableFieldKeys = new Set<string>();
if (tableFieldsMatch) {
  for (const m of tableFieldsMatch[1].matchAll(/'(\w+)'/g)) {
    tableFieldKeys.add(m[1]);
  }
}

// ── Extract TABLE_COL_COUNTS entries ──────────────────────────────────────────
const colCountsMatch = typesSource.match(
  /TABLE_COL_COUNTS[^{]*\{([\s\S]*?)\}/
);
const tableColCounts: Record<string, number> = {};
if (colCountsMatch) {
  for (const m of colCountsMatch[1].matchAll(/(\w+)\s*:\s*(\d+)/g)) {
    tableColCounts[m[1]] = parseInt(m[2], 10);
  }
}

// ── Check each field across layers ────────────────────────────────────────────
interface AuditRow {
  index: number;
  key: string;
  type: string;
  markdown: '✅' | '❌' | '⚠️';
  form: '✅' | '❌' | '⚠️';
  preview: '✅' | '❌' | '⚠️';
  notes: string[];
}

const rows: AuditRow[] = [];

for (let i = 0; i < fields.length; i++) {
  const { key, type } = fields[i];
  const notes: string[] = [];

  // ── Markdown layer ──────────────────────────────────────────────────────
  let markdown: AuditRow['markdown'] = '❌';
  if (key === 'customerName') {
    // Special case: populated from H1
    markdown = '✅';
    notes.push('H1 mapping');
  } else if (fieldLabelValues.has(key)) {
    markdown = '✅';
  } else {
    notes.push('no FIELD_LABELS entry');
  }

  // Table-specific markdown checks
  if (type === 'TableRow[]') {
    if (!tableFieldKeys.has(key)) {
      markdown = '⚠️';
      notes.push('missing from TABLE_FIELDS');
    }
    if (!(key in tableColCounts)) {
      markdown = '⚠️';
      notes.push('missing from TABLE_COL_COUNTS');
    }
  }

  // ── Form layer ──────────────────────────────────────────────────────────
  // Look for fields.<key> pattern in form source
  const formPattern = new RegExp(`fields\\.${key}\\b`);
  let form: AuditRow['form'] = formPattern.test(formSource) ? '✅' : '❌';
  if (form === '❌') notes.push('not in DealForm');

  // Check for duplicate occurrences (same field bound twice)
  const formOccurrences = formSource.match(new RegExp(`fields\\.${key}`, 'g'));
  if (formOccurrences && formOccurrences.length > 2) {
    // >2 because a field typically appears in value={} and onChange={} = 2 refs
    form = '⚠️';
    notes.push(`${formOccurrences.length} refs in form (possible duplicate)`);
  }

  // ── Preview layer ───────────────────────────────────────────────────────
  const previewPattern = new RegExp(`fields\\.${key}\\b`);
  let preview: AuditRow['preview'] = previewPattern.test(previewSource) ? '✅' : '❌';
  if (preview === '❌') notes.push('not in PDFPreview');

  rows.push({
    index: i + 1,
    key,
    type,
    markdown,
    form,
    preview,
    notes,
  });
}

// ── Print the audit matrix ────────────────────────────────────────────────────
const COL_W = { idx: 3, key: 26, type: 12, md: 8, form: 6, prev: 8, notes: 40 };

function pad(s: string, w: number) {
  return s.padEnd(w);
}

const header = `| ${pad('#', COL_W.idx)} | ${pad('Field', COL_W.key)} | ${pad('Type', COL_W.type)} | ${pad('MD', COL_W.md)} | ${pad('Form', COL_W.form)} | ${pad('Preview', COL_W.prev)} | ${pad('Notes', COL_W.notes)} |`;
const sep = `| ${'-'.repeat(COL_W.idx)} | ${'-'.repeat(COL_W.key)} | ${'-'.repeat(COL_W.type)} | ${'-'.repeat(COL_W.md)} | ${'-'.repeat(COL_W.form)} | ${'-'.repeat(COL_W.prev)} | ${'-'.repeat(COL_W.notes)} |`;

console.log('\n🔍 Deal One Pager — Field Audit Report\n');
console.log(header);
console.log(sep);

let passCount = 0;
let warnCount = 0;
let failCount = 0;

for (const r of rows) {
  const allPass = r.markdown === '✅' && r.form === '✅' && r.preview === '✅';
  const hasFail = r.markdown === '❌' || r.form === '❌' || r.preview === '❌';

  if (allPass) passCount++;
  else if (hasFail) failCount++;
  else warnCount++;

  console.log(
    `| ${pad(String(r.index), COL_W.idx)} | ${pad(r.key, COL_W.key)} | ${pad(r.type, COL_W.type)} | ${pad(r.markdown, COL_W.md)} | ${pad(r.form, COL_W.form)} | ${pad(r.preview, COL_W.prev)} | ${pad(r.notes.join('; '), COL_W.notes)} |`
  );
}

console.log('');
console.log(`Total: ${fields.length} fields | ✅ ${passCount} pass | ⚠️ ${warnCount} warn | ❌ ${failCount} fail`);

if (failCount > 0) {
  console.log('\n❌ AUDIT FAILED — gaps found. See rows marked ❌ above.');
  process.exit(1);
} else if (warnCount > 0) {
  console.log('\n⚠️  AUDIT PASSED WITH WARNINGS — review rows marked ⚠️ above.');
  process.exit(0);
} else {
  console.log('\n✅ AUDIT PASSED — all fields covered in all layers.');
  process.exit(0);
}
