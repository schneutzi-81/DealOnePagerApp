import { describe, it, expect } from 'vitest';
import { parseMarkdownToFields } from '../utils/markdownParser';

describe('parseMarkdownToFields', () => {
  it('parses H1 as customerName', () => {
    const md = '# Acme Corp — Big Deal\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.customerName).toBe('Acme Corp — Big Deal');
  });

  it('parses a simple text field under a heading', () => {
    const md = '## Company\nAcme Corporation\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.company).toBe('Acme Corporation');
  });

  it('parses industry field', () => {
    const md = '## Industry\nManufacturing\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.industry).toBe('Manufacturing');
  });

  it('parses opportunity id', () => {
    const md = '## Opportunity ID\nOPP-2024-00123\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.opportunityId).toBe('OPP-2024-00123');
  });

  it('parses inline value after colon in heading', () => {
    const md = '## Deal Name: Alpha Project\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.dealName).toBe('Alpha Project');
  });

  it('parses risks mitigation as table rows', () => {
    const md = '## Risks Mitigation\n- Budget overrun | Increase contingency\n- Scope creep | Weekly review\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.risksMitigation).toHaveLength(2);
    expect(fields.risksMitigation[0].cols[0]).toBe('Budget overrun');
    expect(fields.risksMitigation[0].cols[1]).toBe('Increase contingency');
  });

  it('parses next steps as table rows', () => {
    const md = '## Next Steps\n- 2024-07-01 | Kick-off meeting\n- 2024-07-15 | Demo\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.nextSteps).toHaveLength(2);
    expect(fields.nextSteps[0].cols[0]).toBe('2024-07-01');
    expect(fields.nextSteps[0].cols[1]).toBe('Kick-off meeting');
  });

  it('parses commercials as 3-column table rows', () => {
    const md = '## Commercials\n- Licenses | 50000 | 40\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.commercials).toHaveLength(1);
    expect(fields.commercials[0].cols).toHaveLength(3);
    expect(fields.commercials[0].cols[2]).toBe('40');
  });

  it('accumulates unmatched sections into additionalComments', () => {
    const md = '## Unknown Section XYZ\nSome random text\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.additionalComments).toContain('Some random text');
  });

  it('returns default empty values when markdown is empty', () => {
    const fields = parseMarkdownToFields('');
    expect(fields.customerName).toBe('');
    expect(fields.risksMitigation.every(r => r.cols.every(c => c === ''))).toBe(true);
  });

  it('matches heading with word overlap (fuzzy)', () => {
    const md = '## Contract Term\n12 months\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.contractTerm).toBe('12 months');
  });

  it('parses summary key points', () => {
    const md = '## Summary Key Points\n- Point one\n- Point two\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.summaryKeyPoints).toContain('Point one');
  });

  it('parses a full document with multiple sections', () => {
    const md = [
      '# TechCorp — Cloud Deal',
      '',
      '## Opportunity ID',
      'OPP-2025-999',
      '',
      '## Company',
      'TechCorp Inc.',
      '',
      '## Industry',
      'Technology',
      '',
      '## Risks Mitigation',
      '- Security risk | Apply encryption',
    ].join('\n');

    const fields = parseMarkdownToFields(md);
    expect(fields.customerName).toBe('TechCorp — Cloud Deal');
    expect(fields.opportunityId).toBe('OPP-2025-999');
    expect(fields.company).toBe('TechCorp Inc.');
    expect(fields.industry).toBe('Technology');
    expect(fields.risksMitigation[0].cols[0]).toBe('Security risk');
  });

  // ── YAML front-matter ───────────────────────────────────────────────────────

  it('strips YAML front-matter before parsing', () => {
    const md = [
      '---',
      'title: My Deal',
      'date: 2025-01-01',
      '---',
      '# Acme Corp — Big Deal',
      '',
      '## Company',
      'Acme Corporation',
    ].join('\n');

    const fields = parseMarkdownToFields(md);
    expect(fields.customerName).toBe('Acme Corp — Big Deal');
    expect(fields.company).toBe('Acme Corporation');
    expect(fields.additionalComments).not.toContain('title: My Deal');
    expect(fields.additionalComments).not.toContain('date: 2025-01-01');
  });

  it('handles document without front-matter unchanged', () => {
    const md = '# Simple Deal\n\n## Company\nAcme\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.customerName).toBe('Simple Deal');
    expect(fields.company).toBe('Acme');
  });

  it('handles front-matter with BOM character', () => {
    const md = '\ufeff---\ntitle: BOM Test\n---\n# BOM Deal\n## Company\nBOM Corp\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.customerName).toBe('BOM Deal');
    expect(fields.company).toBe('BOM Corp');
  });

  // ── Alias support ────────────────────────────────────────────────────────────

  it('maps alias "TCO" to tcv field', () => {
    const md = '## TCO\n€ 3,000,000\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.tcv).toBe('€ 3,000,000');
  });

  it('maps alias "Total Contract Value" to tcv field', () => {
    const md = '## Total Contract Value\n€ 1,500,000\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.tcv).toBe('€ 1,500,000');
  });

  it('maps alias "Executive Summary" to summaryKeyPoints', () => {
    const md = '## Executive Summary\nKey highlights here\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.summaryKeyPoints).toContain('Key highlights here');
  });

  it('maps alias "Scope of Work" to subjectScope', () => {
    const md = '## Scope of Work\nDeliver cloud platform\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.subjectScope).toContain('Deliver cloud platform');
  });

  it('maps alias "Action Items" to nextSteps', () => {
    const md = '## Action Items\n- 2025-01-01 | Schedule meeting\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.nextSteps[0].cols[1]).toContain('Schedule meeting');
  });

  it('maps alias "Competitors" to competition', () => {
    const md = '## Competitors\n- Rival Corp | Strong | Price advantage\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.competition[0].cols[0]).toBe('Rival Corp');
  });

  it('maps alias "Notes" to additionalComments', () => {
    const md = '## Notes\nSome internal note\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.additionalComments).toContain('Some internal note');
  });

  it('maps alias "Financials" to commercials', () => {
    const md = '## Financials\n- Year 1 | 100000 | 35\n';
    const fields = parseMarkdownToFields(md);
    expect(fields.commercials[0].cols[0]).toBe('Year 1');
  });
});
