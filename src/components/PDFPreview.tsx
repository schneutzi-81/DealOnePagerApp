import React from 'react';
import type { DealOnePagerFields, TableRow } from '../types';

interface PDFPreviewProps {
  fields: DealOnePagerFields;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const HEADER_BG = '#3B78BB';
const SECTION_BG = '#7BA3C5';
const BORDER = '#B8CEE0';
const LABEL_BG = '#EEF4FB';
const PAGE_W = 794; // A4 portrait px @ 96 dpi (≈210mm)

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
  color: '#1a1a2e',
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
export const PDFPreview: React.FC<PDFPreviewProps> = ({ fields }) => {
  return (
    <div
      id="pdf-preview"
      style={{
        width: `${PAGE_W}px`,
        minHeight: '1123px',
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
          padding: '8px 14px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.85 }}>DEAL ON A PAGE</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontWeight: 800, fontSize: '12px' }}>
          {fields.customerName || '[Customer Name — Deal Description]'}
        </span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontSize: '10px' }}>{fields.opportunityId || '[OPP-XXXX-XXXXX]'}</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontSize: '10px' }}>
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
            <TableSectionHeader label="Commercials \u2013 TCV | CM1" />
            <TwoColRows rows={fields.commercials} min={2} />
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
          backgroundColor: '#fafbfc',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>Software</span>
          <span style={{ color: '#E94E1B' }}>One</span>
        </div>
        <div style={{ fontSize: '8px', color: '#6b7280' }}>
          SoftwareOne Confidential &nbsp;|&nbsp; {today}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '8px' }}>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>RAG Legend:</span>
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
import React from 'react';
import type { DealOnePagerFields, TableRow } from '../types';

interface PDFPreviewProps {
  fields: DealOnePagerFields;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const HEADER_BG = '#3B78BB';
const SECTION_BG = '#7BA3C5';
const BORDER = '#B8CEE0';
const LABEL_BG = '#EEF4FB';
const PAGE_W = 1123; // A4 landscape px @ 96 dpi

// ── Style helpers ─────────────────────────────────────────────────────────────
const sectionHeader = (extra?: React.CSSProperties): React.CSSProperties => ({
  backgroundColor: SECTION_BG,
  color: '#fff',
  fontSize: '8px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  padding: '3px 5px',
  borderBottom: `1px solid ${BORDER}`,
  ...extra,
});

const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: `1px solid ${BORDER}`,
  padding: '2px 4px',
  fontSize: '8.5px',
  color: '#1a1a2e',
  verticalAlign: 'top',
  ...extra,
});

const labelCell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cell(),
  fontWeight: 600,
  backgroundColor: LABEL_BG,
  whiteSpace: 'nowrap',
  width: '40%',
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

/** Simple key-value label row */
const LabelRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <tr>
    <td style={labelCell()}>{label}</td>
    <td style={cell({ width: '60%' })}>{value}</td>
  </tr>
);

/** A section header row spanning all columns */
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

/** Generic 2-column table rows */
const TwoColRows: React.FC<{ rows: TableRow[]; min?: number }> = ({ rows, min = 3 }) => (
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
export const PDFPreview: React.FC<PDFPreviewProps> = ({ fields }) => {
  // Column shared style
  const colStyle: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    borderRight: `1px solid ${BORDER}`,
    overflow: 'hidden',
  };
  const lastColStyle: React.CSSProperties = { ...colStyle, borderRight: 'none' };

  return (
    <div
      id="pdf-preview"
      style={{
        width: `${PAGE_W}px`,
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
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'nowrap',
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.85 }}>DEAL ON A PAGE</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontWeight: 800, fontSize: '12px' }}>
          {fields.customerName || '[Customer Name — Deal Description]'}
        </span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontSize: '10px' }}>{fields.opportunityId || '[OPP-XXXX-XXXXX]'}</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontSize: '10px' }}>
          Business Lines:{' '}
          <span style={{ fontWeight: 600 }}>{fields.businessLines || '[insert business line]'}</span>
        </span>
      </div>

      {/* ── 3-column body ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderTop: `1px solid ${BORDER}` }}>
        {/* ════════════════════════════════════════════════════════════════
            COLUMN 1 – Left
           ════════════════════════════════════════════════════════════════ */}
        <div style={colStyle}>
          {/* CLIENT OVERVIEW */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Client Overview" />
            <LabelRow label="Company" value={fields.company} />
            <LabelRow label="Industry" value={fields.industry} />
            <tr>
              <td style={labelCell({ verticalAlign: 'top' })}>Company Facts &amp; Figures</td>
              <td style={cell({ whiteSpace: 'pre-wrap', fontSize: '8px' })}>
                {fields.companyFacts ||
                  'e.g. employees, revenue, locations/origin, core products/specialities'}
              </td>
            </tr>
          </table>

          {/* SUBJECT / SCOPE */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Subject / Scope of the Deal" />
            <tr>
              <td
                style={cell({
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                  height: '90px',
                })}
                colSpan={2}
              >
                {fields.subjectScope}
              </td>
            </tr>
            <LabelRow label="Contract Term / Timeline" value={fields.contractTerm} />
          </table>

          {/* SUMMARY / KEY POINTS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Summary / Key Points of the Deal" />
            <tr>
              <td style={cell({ minHeight: '60px', whiteSpace: 'pre-wrap', lineHeight: '1.6' })}>
                {fields.summaryKeyPoints
                  ? fields.summaryKeyPoints
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                          <span style={{ flexShrink: 0 }}>•</span>
                          <span>{line.replace(/^[-•*]\s*/, '')}</span>
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
            <TwoColRows rows={fields.risksMitigation} min={5} />
          </table>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            COLUMN 2 – Middle
           ════════════════════════════════════════════════════════════════ */}
        <div style={colStyle}>
          {/* DEAL INFORMATION */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Deal Information" />
            <LabelRow label="Opportunity ID" value={fields.opportunityId} />
            <LabelRow label="Deal Name" value={fields.dealName} />
            <LabelRow label="Client" value={fields.client} />
            <LabelRow label="Business Type" value={fields.businessType} />
            <LabelRow label="TCV" value={fields.tcv} />
            <LabelRow label="Signing Quarter" value={fields.signingQuarter} />
            <LabelRow label="Account Manager" value={fields.accountManager} />
            <LabelRow label="Presales" value={fields.presales} />
            <LabelRow label="Sponsor" value={fields.sponsor} />
          </table>

          {/* CUSTOMER TIMELINE */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Customer Timeline" />
            <tr>
              <td
                colSpan={2}
                style={cell({
                  fontSize: '7.5px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  padding: '2px 4px',
                })}
              >
                Deadline questions, Submission Date, Decision Timeline, etc.
              </td>
            </tr>
            <TwoColRows rows={fields.customerTimeline} min={6} />
          </table>

          {/* COMMERCIALS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Commercials – TCV | CM1" />
            <TwoColRows rows={fields.commercials} min={4} />
          </table>

          {/* HELP NEEDED */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Help Needed" />
            <TwoColRows rows={fields.helpNeeded} min={3} />
          </table>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            COLUMN 3 – Right
           ════════════════════════════════════════════════════════════════ */}
        <div style={lastColStyle}>
          {/* STAKEHOLDER */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '50%' })}>STAKEHOLDER (Customer)</td>
              <td style={sectionHeader({ width: '30%' })}>ROLE</td>
              <td style={sectionHeader({ width: '20%' })}>RAG</td>
            </tr>
            {padRows(fields.stakeholders, 4, 3).map((r, i) => (
              <tr key={i}>
                <td style={cell()}>{r.cols[0]}</td>
                <td style={cell()}>{r.cols[1]}</td>
                <td
                  style={{
                    ...cell({ textAlign: 'center', fontWeight: 700, fontSize: '7.5px' }),
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
              <td style={sectionHeader({ width: '33%' })}>COMPETITION</td>
              <td style={sectionHeader({ width: '25%' })}>RELATION</td>
              <td style={sectionHeader({ width: '42%' })}>SWO DIFFERENTIATOR</td>
            </tr>
            {padRows(fields.competition, 3, 3).map((r, i) => (
              <tr key={i}>
                <td style={cell()}>{r.cols[0]}</td>
                <td style={cell()}>{r.cols[1]}</td>
                <td style={cell()}>{r.cols[2]}</td>
              </tr>
            ))}
          </table>

          {/* ADDITIONAL COMMENTS */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableSectionHeader label="Additional Comments" />
            <tr>
              <td
                style={cell({
                  minHeight: '60px',
                  height: '70px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                })}
              >
                {fields.additionalComments}
              </td>
            </tr>
          </table>

          {/* NEXT STEPS [INTERNAL] */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={sectionHeader({ width: '30%' })}>DATE</td>
              <td style={sectionHeader({ width: '70%' })}>NEXT STEPS [INTERNAL]</td>
            </tr>
            {padRows(fields.nextSteps, 5, 2).map((r, i) => (
              <tr key={i}>
                <td style={cell({ width: '30%', fontSize: '8px' })}>{r.cols[0]}</td>
                <td style={cell({ width: '70%' })}>{r.cols[1]}</td>
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
                <td style={cell({ backgroundColor: LABEL_BG, fontWeight: 600, fontSize: '8px' })}>
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
          padding: '5px 12px',
          borderTop: `1px solid ${BORDER}`,
          backgroundColor: '#fafbfc',
        }}
      >
        {/* SoftwareOne logo (text-based) */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>Software</span>
          <span style={{ color: '#E94E1B' }}>One</span>
        </div>

        {/* Confidentiality */}
        <div style={{ fontSize: '7.5px', color: '#6b7280' }}>
          SoftwareOne Confidential &nbsp;|&nbsp; {today}
        </div>

        {/* RAG Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '7.5px' }}>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>RAG Legend:</span>
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
                fontSize: '7px',
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
