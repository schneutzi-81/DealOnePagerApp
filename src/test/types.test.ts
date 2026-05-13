import { describe, it, expect } from 'vitest';
import {
  TABLE_FIELDS,
  TABLE_COL_COUNTS,
  FIELD_LABELS,
  DEFAULT_FIELDS,
} from '../types';

describe('TABLE_FIELDS', () => {
  it('contains all expected table field keys', () => {
    const expected = [
      'risksMitigation',
      'customerTimeline',
      'commercials',
      'helpNeeded',
      'stakeholders',
      'competition',
      'nextSteps',
    ];
    for (const key of expected) {
      expect(TABLE_FIELDS.has(key as never)).toBe(true);
    }
  });
});

describe('TABLE_COL_COUNTS', () => {
  it('commercials has 3 columns', () => {
    expect(TABLE_COL_COUNTS.commercials).toBe(3);
  });

  it('stakeholders has 3 columns', () => {
    expect(TABLE_COL_COUNTS.stakeholders).toBe(3);
  });

  it('risksMitigation has 2 columns', () => {
    expect(TABLE_COL_COUNTS.risksMitigation).toBe(2);
  });
});

describe('FIELD_LABELS', () => {
  it('maps "company" to company field', () => {
    expect(FIELD_LABELS['company']).toBe('company');
  });

  it('maps "risks mitigation" to risksMitigation', () => {
    expect(FIELD_LABELS['risks mitigation']).toBe('risksMitigation');
  });

  it('maps "next steps" to nextSteps', () => {
    expect(FIELD_LABELS['next steps']).toBe('nextSteps');
  });
});

describe('DEFAULT_FIELDS', () => {
  it('has empty string for customerName', () => {
    expect(DEFAULT_FIELDS.customerName).toBe('');
  });

  it('pre-fills risksMitigation with 5 empty rows of 2 cols each', () => {
    expect(DEFAULT_FIELDS.risksMitigation).toHaveLength(5);
    expect(DEFAULT_FIELDS.risksMitigation[0].cols).toHaveLength(2);
    expect(DEFAULT_FIELDS.risksMitigation[0].cols.every(c => c === '')).toBe(true);
  });

  it('pre-fills nextSteps with empty rows', () => {
    expect(DEFAULT_FIELDS.nextSteps.length).toBeGreaterThan(0);
    expect(DEFAULT_FIELDS.nextSteps[0].cols.every(c => c === '')).toBe(true);
  });
});
