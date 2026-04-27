---
name: functional-testing
description: 'End-to-end functional audit for the Deal One Pager app. Traces every field from types through Form, Preview, PDF export, and Markdown import. Use when: "test all fields", "functional test", "field audit", "verify form to PDF", "check all fields work", "test functionality", "test if fields update", "audit field mapping", "end to end test", "check markdown import".'
argument-hint: 'Optionally specify a subset of fields or a single layer to audit'
---

# Functional Testing — Full Field Audit

Verify that every field defined in `DealOnePagerFields` flows correctly through all layers:
**Types → Markdown import → Form input → Preview render → PDF export**

## Quick Start — Automated Audit

Run the audit script to get an instant field-coverage report across all layers:

```bash
npx tsx .github/skills/functional-testing/scripts/audit-fields.ts
```

This produces a ✅/❌ matrix for Form, Preview, and Markdown Parser. Use the output to focus manual inspection on ❌ gaps only.

## When to Use

- After adding, removing, or renaming fields
- After changing the form, preview, or export layout
- After modifying `FIELD_LABELS` or the markdown parser
- Before a release or deployment
- When the user reports "edits don't show in the preview/PDF"
- When markdown import silently drops fields
- Periodic health check of the data pipeline

## Procedure

### Phase 1 — Enumerate Fields (Source of Truth)

1. Read `src/types/index.ts` — extract every property of `DealOnePagerFields`
2. Classify each field:
   - **string** fields (single-value inputs / textareas)
   - **TableRow[]** fields (multi-row table editors)
3. Record the full field list as a checklist with field name, type, and section

### Phase 2 — Trace Through Each Layer

For each field, confirm presence and correct binding in all four layers:

| Layer | File | What to check |
|-------|------|---------------|
| **Markdown Import** | `src/utils/markdownParser.ts` + `src/types/index.ts` | Field reachable via `FIELD_LABELS` mapping; table fields listed in `TABLE_FIELDS` and `TABLE_COL_COUNTS` |
| **Form** | `src/components/DealForm.tsx` | Field rendered with correct `value={fields.<key>}` and `onChange` handler bound to the right state key |
| **Preview** | `src/components/PDFPreview.tsx` | Field value rendered in the correct section, using `fields.<key>` |
| **PDF Export** | `src/utils/pdfExport.ts` | Capture element exists and is visible to html2canvas (not `display:none`) |

**For string fields**, verify:
- At least one entry in `FIELD_LABELS` maps to this field key
- `<Field>` or `<TextArea>` in DealForm with matching `value` and `onChange`
- Rendered text or `<span>` / `<p>` in PDFPreview

**For TableRow[] fields**, verify:
- Field key is in `TABLE_FIELDS` set
- Column count in `TABLE_COL_COUNTS` matches actual columns used in Form and Preview
- At least one entry in `FIELD_LABELS` maps to this field key
- `<TableEditor>` in DealForm with matching `value` and `onChange`
- Table rows rendered in PDFPreview via `.map()` over `fields.<key>`

**Special case — `customerName`:**
- Populated from H1 heading in markdown (not via `FIELD_LABELS`)
- Also has `FIELD_LABELS` entries as fallback
- Verify `markdownParser.ts` assigns `fields.customerName` from H1

### Phase 3 — Build the Audit Matrix

Create a markdown table summarizing results:

```
| # | Field               | Type       | Markdown | Form | Preview | Notes          |
|---|---------------------|------------|----------|------|---------|----------------|
| 1 | customerName        | string     | ✅ (H1)  | ✅   | ✅      |                |
| 2 | opportunityId       | string     | ✅       | ✅   | ✅      |                |
| 3 | risksMitigation     | TableRow[] | ✅       | ✅   | ✅      | 2-col table    |
| …                                                                                  |
```

Mark each cell:
- ✅ Present and correctly bound/mapped
- ❌ Missing or broken
- ⚠️ Present but suspect (e.g., duplicate, wrong key, mismatched columns, no FIELD_LABELS entry)

### Phase 4 — Check for Common Pitfalls

These are known gotchas from prior debugging sessions:

1. **Duplicate fields** — Same field rendered in two sections of DealForm (e.g., `opportunityId` in both Header and Deal Information). Remove the duplicate.
2. **html2canvas + display:none** — Elements hidden with `display:none` or conditional rendering (`{condition && <Component>}`) produce blank captures. Use an off-screen element with `position:fixed; left:-9999px` instead.
3. **Duplicate element IDs** — If both the visible preview and the capture target have the same `id`, html2canvas grabs the wrong one. Use distinct IDs (e.g., `pdf-preview` vs `pdf-capture`).
4. **Export timing** — `setTimeout` is unreliable for waiting on React renders. Use double `requestAnimationFrame` for paint synchronization.
5. **Table column mismatch** — `TABLE_COL_COUNTS` in types must match the actual column count in both the `<TableEditor>` and the PDFPreview table render.
6. **Missing onChange binding** — Field displays correctly but edits don't propagate. Verify `onChange={str('<key>')}` for strings or `onChange={table('<key>')}` for tables.
7. **Missing FIELD_LABELS entry** — A field exists in the type and in the form, but markdown import silently skips it because no heading variant maps to the field key. Every field must have at least one entry in `FIELD_LABELS` (except `customerName` which uses H1).
8. **Fuzzy heading match too greedy** — `matchHeading()` uses word-overlap matching. A short heading like "Summary" could match the wrong field if multiple labels share a word. Check for ambiguous overlaps in `FIELD_LABELS`.
9. **TABLE_FIELDS out of sync** — A field is `TableRow[]` in the type but missing from the `TABLE_FIELDS` set, so the parser treats it as a string. Or vice versa.

### Phase 5 — Fix Gaps

For each ❌ or ⚠️ found:

1. Determine root cause (missing render, wrong key, duplicate, display issue)
2. Apply the minimal fix
3. Re-trace that specific field through all layers to confirm

### Phase 6 — Verify PDF Capture Pipeline

After all field fixes:

1. Confirm the off-screen capture element exists in `App.tsx` (or wherever the layout root is)
2. Confirm `pdfExport.ts` targets the correct element ID
3. Confirm the capture element receives the same `fields` prop as the visible preview
4. Check that the export function uses `requestAnimationFrame` (not `setTimeout`)

### Phase 7 — Report

Produce a summary:
- Total fields audited
- Fields that passed all layers
- Fields that required fixes (with brief description of each fix)
- Any remaining known issues or limitations

## Decision Points

- **Field found in types but not in Form?** — Likely needs a new `<Field>` or `<TableEditor>` added to DealForm
- **Field in Form but not in Preview?** — Add render block to PDFPreview in the correct section
- **Field renders in Preview but blank in PDF?** — html2canvas capture issue; check element visibility and ID targeting
- **Table renders wrong number of columns?** — Check `TABLE_COL_COUNTS` and column header arrays in both Form and Preview
- **Field not populated from markdown import?** — Check `FIELD_LABELS` for at least one heading variant that maps to the field key
- **Table field imported as flat string?** — Ensure the field key is in `TABLE_FIELDS` set and has an entry in `TABLE_COL_COUNTS`
- **Markdown heading maps to wrong field?** — Fuzzy word-overlap in `matchHeading()` caused an ambiguous match; add a more specific label

## Completion Criteria

- [ ] Every field in `DealOnePagerFields` has ✅ in Markdown column (reachable via `FIELD_LABELS` or H1)
- [ ] Every field in `DealOnePagerFields` has ✅ in Form column
- [ ] Every field in `DealOnePagerFields` has ✅ in Preview column
- [ ] All `TableRow[]` fields are in `TABLE_FIELDS` set with correct `TABLE_COL_COUNTS`
- [ ] No duplicate fields in DealForm
- [ ] No duplicate element IDs for capture targets
- [ ] PDF capture element is always visible to html2canvas (not display:none)
- [ ] Automated audit script passes with no ❌ gaps
- [ ] Full audit matrix produced and shared with user
