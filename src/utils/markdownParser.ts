import { marked } from 'marked';
import type { DealOnePagerFields, TableRow } from '../types';
import { FIELD_LABELS, TABLE_FIELDS, TABLE_COL_COUNTS, DEFAULT_FIELDS } from '../types';

/** Normalize a string for fuzzy matching. */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Map a heading text to a field key. */
function matchHeading(heading: string): keyof DealOnePagerFields | null {
  const norm = normalize(heading);

  // Direct lookup in FIELD_LABELS
  if (FIELD_LABELS[norm]) return FIELD_LABELS[norm];

  // Try truncating trailing words (handles extra qualifiers like "of the deal")
  const words = norm.split(' ');
  for (let len = words.length - 1; len >= 1; len--) {
    const key = words.slice(0, len).join(' ');
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  }

  // Word-overlap: match if any significant word (>3 chars) overlaps
  const headingWords = words.filter((w) => w.length > 3);
  for (const [labelKey, fieldKey] of Object.entries(FIELD_LABELS)) {
    const labelWords = labelKey.split(' ').filter((w) => w.length > 3);
    if (headingWords.some((w) => labelWords.includes(w))) {
      return fieldKey;
    }
  }

  return null;
}

/** Parse raw text content into TableRow array. */
function textToRows(text: string, colCount: number): TableRow[] {
  const rows: TableRow[] = [];
  for (const line of text.split('\n')) {
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (!cleaned) continue;
    const cols = cleaned.split('|').map((c) => c.trim());
    while (cols.length < colCount) cols.push('');
    rows.push({ cols: cols.slice(0, colCount) });
  }
  return rows;
}

/** Parse a markdown string and populate DealOnePagerFields. */
export function parseMarkdownToFields(markdown: string): DealOnePagerFields {
  // Deep-clone the default (preserves empty row arrays)
  const fields: DealOnePagerFields = JSON.parse(JSON.stringify(DEFAULT_FIELDS));
  const unmatchedParts: string[] = [];

  const tokens = marked.lexer(markdown);
  let currentField: keyof DealOnePagerFields | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentLines.length) return;
    const raw = currentLines.join('\n').trim();
    if (!raw) { currentLines = []; return; }

    if (currentField) {
      if (TABLE_FIELDS.has(currentField)) {
        const colCount = TABLE_COL_COUNTS[currentField] ?? 2;
        const parsed = textToRows(raw, colCount);
        if (parsed.length) {
          (fields[currentField] as TableRow[]) = parsed;
        }
      } else {
        const prev = fields[currentField] as string;
        (fields[currentField] as string) = prev ? `${prev}\n\n${raw}` : raw;
      }
    } else {
      unmatchedParts.push(raw);
    }
    currentLines = [];
  };

  for (const token of tokens) {
    if (token.type === 'heading') {
      flush();
      currentField = matchHeading(token.text);

      // Check for inline value after colon: "## Deal Name: Acme Alpha"
      if (currentField && !TABLE_FIELDS.has(currentField)) {
        const colonIdx = token.text.indexOf(':');
        if (colonIdx !== -1) {
          const inlineVal = token.text.slice(colonIdx + 1).trim();
          if (inlineVal) currentLines.push(inlineVal);
        }
      }
    } else if (token.type === 'space') {
      // ignore blank separators
    } else {
      currentLines.push(token.raw.trim());
    }
  }

  flush();

  if (unmatchedParts.length) {
    const extra = unmatchedParts.join('\n\n');
    fields.additionalComments = fields.additionalComments
      ? `${fields.additionalComments}\n\n${extra}`
      : extra;
  }

  return fields;
}
