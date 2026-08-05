/**
 * Design tokens for the PDF preview and export.
 * Centralised here so colours, dimensions, and font sizes can be
 * adjusted in one place without touching PDFPreview.tsx.
 */

// ── Colours ───────────────────────────────────────────────────────────────────
export const PDF_HEADER_BG   = '#0E0E0E';
export const PDF_SECTION_BG  = '#1A1A1A';
export const PDF_BORDER      = '#E5E5E5';
export const PDF_LABEL_BG    = '#F5F5F5';
export const PDF_CORAL       = '#F7675E';
export const PDF_PAGE_BG     = '#ffffff';

export const RAG_COLORS: Record<string, string> = {
  positive: '#22C55E',
  neutral:  '#F97316',
  issue:    '#EF4444',
};

// ── Layout ────────────────────────────────────────────────────────────────────
/** A4 landscape width in pixels @ 96 dpi (≈ 297 mm). */
export const PDF_PAGE_W    = 1123;
/** A4 landscape height in mm. */
export const PDF_HEIGHT_MM = 210;
/** A4 landscape width in mm. */
export const PDF_WIDTH_MM  = 297;

// ── Typography ────────────────────────────────────────────────────────────────
export const PDF_FONT_BASE    = 9;   // px – body cells
export const PDF_FONT_HEADER  = 11;  // px – top header bar
export const PDF_FONT_SECTION = 9;   // px – section headers
export const PDF_FONT_FOOTER  = 8;   // px – footer

// ── Required fields (shown as warnings before export) ─────────────────────────
export const REQUIRED_FIELD_KEYS: string[] = [
  'customerName',
  'tcv',
  'company',
];
