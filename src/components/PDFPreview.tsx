import React from 'react';
import type { DealOnePagerFields, TableRow } from '../types';

interface PDFPreviewProps {
  fields: DealOnePagerFields;
  id?: string;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const HEADER_BG = '#0E0E0E';
const SECTION_BG = '#1A1A1A';
const BORDER = '#E5E5E5';
const LABEL_BG = '#F5F5F5';
const CORAL = '#F7675E';
const PAGE_W = 1123; // A4 landscape px @ 96 dpi (≈297mm)

// ── Style helpers ─────────────────────────────────────────────────────────────
const sectionHeader = (extra?: React.CSSProperties): React.CSSProperties => ({
  backgroundColor: SECTION_BG,
  color: '#fff',
  fontSize: '9px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  padding: '4px 6px',
  borderBottom: `1px solid ${BORDER}`,
  ...extra,
});

const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: `1px solid ${BORDER}`,
  padding: '3px 5px',
  fontSize: '9px',
  color: '#0E0E0E',
  verticalAlign: 'top',
  ...extra,
});

const labelCell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cell(),
  fontWeight: 600,
  backgroundColor: LABEL_BG,
  whiteSpace: 'nowrap',
  width: '35%',
  ...extra,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function ragColor(rag: string): string {
  const r = (rag || '').toLowerCase().trim();
  if (r === 'positive') return '#22C55E';
  if (r === 'neutral') return '#F97316';
  if (r === 'issue') return '#EF4444';
  return 'transparent';
}

function padRows(rows: TableRow[], min: number, cols: number): TableRow[] {
  const result = [...rows];
  while (result.length < min) result.push({ cols: Array(cols).fill('') });
  return result;
}

const today = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// ── Sub-components ────────────────────────────────────────────────────────────

const LabelRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <tr>
    <td style={labelCell()}>{label}</td>
    <td style={cell({ width: '65%' })}>{value}</td>
  </tr>
);

const TableSectionHeader: React.FC<{ label: string; colSpan?: number }> = ({
  label,
  colSpan = 2,
}) => (
  <tr>
    <td colSpan={colSpan} style={sectionHeader()}>
      {label}
    </td>
  </tr>
);

const TwoColRows: React.FC<{ rows: TableRow[]; min?: number }> = ({ rows, min = 2 }) => (
  <>
    {padRows(rows, min, 2).map((r, i) => (
      <tr key={i}>
        <td style={cell({ width: '45%' })}>{r.cols[0]}</td>
        <td style={cell({ width: '55%' })}>{r.cols[1]}</td>
      </tr>
    ))}
  </>
);

// ── Main component ────────────────────────────────────────────────────────────
export const PDFPreview: React.FC<PDFPreviewProps> = ({ fields, id = 'pdf-preview' }) => {
  return (
    <div
      id={id}
      style={{
        width: `${PAGE_W}px`,
        minHeight: '794px',
        backgroundColor: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        border: `1px solid ${BORDER}`,
      }}
    >
      {/* ── Top header bar ──────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: HEADER_BG,
          color: '#fff',
          padding: '10px 14px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '9px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>DEAL ON A PAGE</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ fontWeight: 800, fontSize: '12px', color: CORAL }}>
          {fields.customerName || '[Customer Name — Deal Description]'}
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ fontSize: '10px', opacity: 0.8 }}>{fields.opportunityId || '[OPP-XXXX-XXXXX]'}</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          Business Lines:{' '}
          <span style={{ fontWeight: 600 }}>{fields.businessLines || '[insert business line]'}</span>
        </span>
      </div>

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderTop: `1px solid ${BORDER}` }}>
        {/* ═══════════════ LEFT COLUMN ═══════════════ */}
        <div style={{ flex: '1 1 50%', borderRight: `1px solid ${BORDER}` }}>

          {/* CLIENT OVERVIEW */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Client Overview" />
            <LabelRow label="Company" value={fields.company} />
            <LabelRow label="Industry" value={fields.industry} />
            <tr>
              <td style={labelCell({ verticalAlign: 'top' })}>Company Facts</td>
              <td style={cell({ whiteSpace: 'pre-wrap', fontSize: '8.5px' })}>
                {fields.companyFacts || '\u2014'}
              </td>
            </tr>
          </table>

          {/* DEAL INFORMATION */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Deal Information" />
            <LabelRow label="Deal Name" value={fields.dealName} />
            <LabelRow label="Client" value={fields.client} />
            <LabelRow label="Business Type" value={fields.businessType} />
            <LabelRow label="TCV" value={fields.tcv} />
            <LabelRow label="Signing Quarter" value={fields.signingQuarter} />
            <LabelRow label="Account Manager" value={fields.accountManager} />
            <LabelRow label="Presales" value={fields.presales} />
            <LabelRow label="Sponsor" value={fields.sponsor} />
          </table>

          {/* SUBJECT / SCOPE */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Subject / Scope of the Deal" />
            <tr>
              <td
                style={cell({ whiteSpace: 'pre-wrap', lineHeight: '1.5', minHeight: '60px' })}
                colSpan={2}
              >
                {fields.subjectScope}
              </td>
            </tr>
            <LabelRow label="Contract Term" value={fields.contractTerm} />
          </table>

          {/* SUMMARY / KEY POINTS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Summary / Key Points" />
            <tr>
              <td style={cell({ whiteSpace: 'pre-wrap', lineHeight: '1.6' })} colSpan={2}>
                {fields.summaryKeyPoints
                  ? fields.summaryKeyPoints
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                          <span style={{ flexShrink: 0 }}>&bull;</span>
                          <span>{line.replace(/^[-\u2022*]\s*/, '')}</span>
                        </div>
                      ))
                  : null}
              </td>
            </tr>
          </table>

          {/* RISKS | MITIGATION */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '50%' })}>RISKS</td>
              <td style={sectionHeader({ width: '50%' })}>MITIGATION</td>
            </tr>
            <TwoColRows rows={fields.risksMitigation} min={3} />
          </table>

          {/* COMMERCIALS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '40%' })}>ITEM</td>
              <td style={sectionHeader({ width: '35%' })}>VALUE</td>
              <td style={sectionHeader({ width: '25%' })}>MARGIN</td>
            </tr>
            {padRows(fields.commercials, 2, 3).map((r, i) => (
              <tr key={i}>
                <td style={cell()}>{r.cols[0]}</td>
                <td style={cell()}>{r.cols[1]}</td>
                <td style={cell()}>{r.cols[2]}</td>
              </tr>
            ))}
          </table>
        </div>

        {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
        <div style={{ flex: '1 1 50%' }}>

          {/* STAKEHOLDER */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '40%' })}>STAKEHOLDER</td>
              <td style={sectionHeader({ width: '35%' })}>ROLE</td>
              <td style={sectionHeader({ width: '25%' })}>RAG</td>
            </tr>
            {padRows(fields.stakeholders, 4, 3).map((r, i) => (
              <tr key={i}>
                <td style={cell()}>{r.cols[0]}</td>
                <td style={cell()}>{r.cols[1]}</td>
                <td
                  style={{
                    ...cell({ textAlign: 'center', fontWeight: 700, fontSize: '8px' }),
                    backgroundColor: ragColor(r.cols[2]),
                    color: r.cols[2] ? '#fff' : undefined,
                  }}
                >
                  {r.cols[2]}
                </td>
              </tr>
            ))}
          </table>

          {/* COMPETITION */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '30%' })}>COMPETITION</td>
              <td style={sectionHeader({ width: '25%' })}>RELATION</td>
              <td style={sectionHeader({ width: '45%' })}>SWO DIFFERENTIATOR</td>
            </tr>
            {padRows(fields.competition, 3, 3).map((r, i) => (
              <tr key={i}>
                <td style={cell()}>{r.cols[0]}</td>
                <td style={cell()}>{r.cols[1]}</td>
                <td style={cell()}>{r.cols[2]}</td>
              </tr>
            ))}
          </table>

          {/* CUSTOMER TIMELINE */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Customer Timeline" />
            <TwoColRows rows={fields.customerTimeline} min={4} />
          </table>

          {/* HELP NEEDED */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Help Needed" />
            <TwoColRows rows={fields.helpNeeded} min={2} />
          </table>

          {/* ADDITIONAL COMMENTS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Additional Comments" />
            <tr>
              <td
                style={cell({ whiteSpace: 'pre-wrap', lineHeight: '1.5', minHeight: '40px' })}
                colSpan={2}
              >
                {fields.additionalComments}
              </td>
            </tr>
          </table>

          {/* NEXT STEPS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '25%' })}>DATE</td>
              <td style={sectionHeader({ width: '75%' })}>NEXT STEPS [INTERNAL]</td>
            </tr>
            {padRows(fields.nextSteps, 3, 2).map((r, i) => (
              <tr key={i}>
                <td style={cell({ width: '25%', fontSize: '8.5px' })}>{r.cols[0]}</td>
                <td style={cell({ width: '75%' })}>{r.cols[1]}</td>
              </tr>
            ))}
          </table>

          {/* BID RECOMMENDATION */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '35%' })}>BID RECOMMENDATION</td>
              <td style={sectionHeader({ width: '40%' })}>PERSON / UNIT</td>
              <td style={sectionHeader({ width: '25%' })}>SIGN-OFF</td>
            </tr>
            {[
              { role: 'Account Management', val: fields.signOffAccountManagement },
              { role: 'Presales', val: fields.signOffPresales },
              { role: 'Delivery', val: fields.signOffDelivery },
              { role: 'Legal', val: fields.signOffLegal },
            ].map((row, i) => (
              <tr key={i}>
                {i === 0 && (
                  <td
                    rowSpan={4}
                    style={{
                      ...cell({ verticalAlign: 'middle', textAlign: 'center', fontWeight: 700 }),
                      backgroundColor: LABEL_BG,
                    }}
                  >
                    {fields.bidRecommendation}
                  </td>
                )}
                <td style={cell({ backgroundColor: LABEL_BG, fontWeight: 600, fontSize: '8.5px' })}>
                  {row.role}
                </td>
                <td style={cell()}>{row.val}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          borderTop: `1px solid ${BORDER}`,
          backgroundColor: '#FAFAFA',
        }}
      >
        <div style={{ fontSize: '8px', color: '#9CA3AF' }}>
          Confidential &nbsp;|&nbsp; {today}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '8px' }}>
          <span style={{ color: '#9CA3AF', fontWeight: 600 }}>RAG Legend:</span>
          {[
            { label: 'Positive', color: '#22C55E' },
            { label: 'Neutral', color: '#F97316' },
            { label: 'Issue', color: '#EF4444' },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                backgroundColor: item.color,
                color: '#fff',
                padding: '1px 5px',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '7.5px',
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
