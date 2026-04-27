import React from 'react';
import type { DealOnePagerFields } from '../types';
import { FIELD_LABELS, LONG_FIELDS } from '../types';

interface PDFPreviewProps {
  fields: DealOnePagerFields;
}

const today = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const PDFPreview: React.FC<PDFPreviewProps> = ({ fields }) => {
  return (
    <div
      id="pdf-preview"
      className="mx-auto bg-white"
      style={{ width: '794px', minHeight: '1123px', padding: '48px 56px', fontFamily: 'sans-serif' }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          borderRadius: '8px',
          padding: '28px 32px',
          marginBottom: '32px',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '8px' }}>
          Deal One Pager · RFP Review
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
          {fields.dealName || 'Deal / Project Name'}
        </div>
        <div style={{ fontSize: '15px', opacity: 0.85 }}>
          {fields.clientName && <span>{fields.clientName}</span>}
          {fields.clientName && (fields.date || today) && <span style={{ margin: '0 8px' }}>·</span>}
          <span>{fields.date || today}</span>
        </div>
      </div>

      {/* Quick-info bar */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          marginBottom: '28px',
        }}
      >
        {[
          { label: 'Deal Owner', value: fields.dealOwner },
          { label: 'Deal Size / Value', value: fields.dealSize },
          { label: 'Timeline', value: fields.timeline },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRight: idx < 2 ? '1px solid #e5e7eb' : 'none',
              backgroundColor: '#f9fafb',
            }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280', marginBottom: '4px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {item.value || '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Body sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {LONG_FIELDS.map((key) => {
          const value = fields[key];
          if (!value) return null;
          return (
            <div
              key={key}
              style={{
                gridColumn: key === 'executiveSummary' || key === 'scopeOfWork' ? 'span 2' : 'span 1',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px 18px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#2563eb',
                  fontWeight: 700,
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: '2px solid #dbeafe',
                }}
              >
                {FIELD_LABELS[key]}
              </div>
              <div style={{ fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#9ca3af',
        }}
      >
        <span>Confidential – For Internal Review Only</span>
        <span>Generated {today}</span>
      </div>
    </div>
  );
};
