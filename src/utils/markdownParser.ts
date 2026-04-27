import { marked } from 'marked';
import type { DealOnePagerFields } from '../types';
import { FIELD_LABELS, DEFAULT_FIELDS } from '../types';

/**
 * Normalizes a string for fuzzy matching by lowercasing, removing special
 * characters and collapsing whitespace.
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempts to match a heading string to a field key by fuzzy/substring
 * comparison against the field labels.
 */
function matchHeadingToField(
  heading: string
): keyof DealOnePagerFields | null {
  const normalizedHeading = normalize(heading);

  // Direct label match (normalized)
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    if (normalize(label) === normalizedHeading) {
      return key as keyof DealOnePagerFields;
    }
  }

  // Substring match – heading contains a key portion of the label
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const normalizedLabel = normalize(label);
    if (
      normalizedHeading.includes(normalizedLabel) ||
      normalizedLabel.includes(normalizedHeading)
    ) {
      return key as keyof DealOnePagerFields;
    }
  }

  // Word-overlap match – at least one significant word matches
  const headingWords = normalizedHeading.split(' ').filter((w) => w.length > 3);
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const labelWords = normalize(label)
      .split(' ')
      .filter((w) => w.length > 3);
    const hasOverlap = headingWords.some((w) => labelWords.includes(w));
    if (hasOverlap) {
      return key as keyof DealOnePagerFields;
    }
  }

  return null;
}

/**
 * Parses a Markdown string and maps heading-based sections to DealOnePager
 * fields.  Unmatched sections fall into the "notes" catch-all.
 */
export function parseMarkdownToFields(markdown: string): DealOnePagerFields {
  const fields: DealOnePagerFields = { ...DEFAULT_FIELDS };
  const unmatchedSections: string[] = [];

  // Use marked's lexer to obtain tokens
  const tokens = marked.lexer(markdown);

  let currentField: keyof DealOnePagerFields | null = null;
  let currentContent: string[] = [];

  const flushSection = () => {
    if (currentContent.length === 0) return;
    const content = currentContent.join('\n').trim();
    if (!content) return;

    if (currentField) {
      // Append if field already has content (multiple sections → same field)
      fields[currentField] = fields[currentField]
        ? `${fields[currentField]}\n\n${content}`
        : content;
    } else {
      unmatchedSections.push(content);
    }
    currentContent = [];
  };

  for (const token of tokens) {
    if (token.type === 'heading') {
      flushSection();
      const matched = matchHeadingToField(token.text);
      currentField = matched;
      // If the heading itself contains inline text that looks like a value
      // (e.g. "Client Name: Acme Corp"), try to extract it
      if (matched) {
        const colonIdx = token.text.indexOf(':');
        if (colonIdx !== -1) {
          const inlineValue = token.text.slice(colonIdx + 1).trim();
          if (inlineValue) {
            currentContent.push(inlineValue);
          }
        }
      }
    } else if (token.type === 'space') {
      // skip blank lines between tokens
    } else {
      // All non-heading, non-space tokens contribute raw text
      currentContent.push(token.raw.trim());
    }
  }

  flushSection();

  // Put unmatched content into notes
  if (unmatchedSections.length > 0) {
    const extra = unmatchedSections.join('\n\n');
    fields.notes = fields.notes ? `${fields.notes}\n\n${extra}` : extra;
  }

  return fields;
}
