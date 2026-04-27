import React from 'react';
import type { DealOnePagerFields, TableRow } from '../types';

interface DealFormProps {
  fields: DealOnePagerFields;
  onChange: (key: keyof DealOnePagerFields, value: DealOnePagerFields[keyof DealOnePagerFields]) => void;
  onReset: () => void;
}

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <div className="mb-3 rounded-t-lg bg-blue-700 px-3 py-1.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
    </div>
    <div className="rounded-b-lg border border-gray-200 bg-white p-4">{children}</div>
  </div>
);

// ── Labelled text input ───────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="grid grid-cols-5 items-center gap-2">
    <label className="col-span-2 text-xs font-semibold text-gray-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? label}
      className="col-span-3 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
    />
  </div>
);

// ── Labelled textarea ─────────────────────────────────────────────────────────
const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  helper?: string;
}> = ({ label, value, onChange, rows = 4, helper }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
    {helper && <p className="mb-1 text-xs text-gray-400">{helper}</p>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={label}
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
    />
  </div>
);

// ── Dynamic table editor ──────────────────────────────────────────────────────
interface TableEditorProps {
  headers: string[];
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
  minRows?: number;
  cellWidths?: string[];
  /** Map column index → list of dropdown options. Columns not listed use a plain text input. */
  dropdownCols?: Record<number, string[]>;
}

const TableEditor: React.FC<TableEditorProps> = ({
  headers,
  rows,
  onChange,
  minRows = 2,
  cellWidths,
  dropdownCols,
}) => {
  const addRow = () =>
    onChange([...rows, { cols: Array(headers.length).fill('') }]);

  const removeRow = (idx: number) => {
    if (rows.length <= minRows) return;
    onChange(rows.filter((_, i) => i !== idx));
  };

  const updateCell = (ri: number, ci: number, val: string) =>
    onChange(
      rows.map((row, r) =>
        r === ri ? { cols: row.cols.map((c, cc) => (cc === ci ? val : c)) } : row
      )
    );

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{ width: cellWidths?.[i] }}
                className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold text-gray-600"
              >
                {h}
              </th>
            ))}
            <th className="w-6 border border-gray-300 bg-gray-100" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => (
                <td key={ci} className="border border-gray-300 p-0">
                  {dropdownCols && dropdownCols[ci] ? (
                    <select
                      value={row.cols[ci] ?? ''}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-full px-2 py-1 text-sm outline-none focus:bg-blue-50 bg-white"
                    >
                      <option value="">— Select —</option>
                      {dropdownCols[ci].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={row.cols[ci] ?? ''}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-full px-2 py-1 text-sm outline-none focus:bg-blue-50"
                    />
                  )}
                </td>
              ))}
              <td className="border border-gray-300 text-center">
                <button
                  onClick={() => removeRow(ri)}
                  disabled={rows.length <= minRows}
                  className="px-1 text-red-300 hover:text-red-500 disabled:opacity-30"
                  title="Remove row"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="mt-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        + Add row
      </button>
    </div>
  );
};

// ── Main form ─────────────────────────────────────────────────────────────────
export const DealForm: React.FC<DealFormProps> = ({ fields, onChange, onReset }) => {
  const str =
    (key: keyof DealOnePagerFields) =>
    (val: string) =>
      onChange(key, val);

  const tbl =
    (key: keyof DealOnePagerFields) =>
    (rows: TableRow[]) =>
      onChange(key, rows);

  return (
    <div className="space-y-1">
      {/* ── Header ── */}
      <Section title="Header">
        <div className="space-y-2">
          <Field label="Customer Name / Deal Description" value={fields.customerName} onChange={str('customerName')} />
          <Field label="Opportunity ID" value={fields.opportunityId} onChange={str('opportunityId')} placeholder="OPP-XXXX-XXXXX" />
          <Field label="Business Lines" value={fields.businessLines} onChange={str('businessLines')} />
        </div>
      </Section>

      {/* ── Client Overview ── */}
      <Section title="Client Overview">
        <div className="space-y-2">
          <Field label="Company" value={fields.company} onChange={str('company')} />
          <Field label="Industry" value={fields.industry} onChange={str('industry')} />
          <TextArea
            label="Company Facts & Figures"
            value={fields.companyFacts}
            onChange={str('companyFacts')}
            rows={3}
            helper="e.g. employees, revenue, locations/origin, core products/specialities"
          />
        </div>
      </Section>

      {/* ── Subject / Scope ── */}
      <Section title="Subject / Scope of the Deal">
        <div className="space-y-2">
          <TextArea label="Scope Description" value={fields.subjectScope} onChange={str('subjectScope')} rows={5} />
          <Field label="Contract Term / Timeline" value={fields.contractTerm} onChange={str('contractTerm')} />
        </div>
      </Section>

      {/* ── Summary ── */}
      <Section title="Summary / Key Points of the Deal">
        <TextArea
          label="Key Points"
          value={fields.summaryKeyPoints}
          onChange={str('summaryKeyPoints')}
          rows={4}
          helper="One bullet point per line (e.g. – Reduced costs by 30%)"
        />
      </Section>

      {/* ── Risks | Mitigation ── */}
      <Section title="Risks & Mitigation">
        <TableEditor
          headers={['Risk', 'Mitigation']}
          rows={fields.risksMitigation}
          onChange={tbl('risksMitigation')}
          minRows={2}
          cellWidths={['50%', '50%']}
        />
      </Section>

      {/* ── Deal Information ── */}
      <Section title="Deal Information">
        <div className="space-y-2">
          <Field label="Opportunity ID" value={fields.opportunityId} onChange={str('opportunityId')} placeholder="OPP-XXXX-XXXXX" />
          <Field label="Deal Name" value={fields.dealName} onChange={str('dealName')} />
          <Field label="Client" value={fields.client} onChange={str('client')} />
          <Field label="Business Type" value={fields.businessType} onChange={str('businessType')} />
          <Field label="TCV" value={fields.tcv} onChange={str('tcv')} placeholder="Total Contract Value" />
          <Field label="Signing Quarter" value={fields.signingQuarter} onChange={str('signingQuarter')} placeholder="e.g. Q3 2024" />
          <Field label="Account Manager" value={fields.accountManager} onChange={str('accountManager')} />
          <Field label="Presales" value={fields.presales} onChange={str('presales')} />
          <Field label="Sponsor" value={fields.sponsor} onChange={str('sponsor')} />
        </div>
      </Section>

      {/* ── Customer Timeline ── */}
      <Section title="Customer Timeline">
        <p className="mb-2 text-xs text-gray-400">Deadline questions, Submission Date, Decision Timeline, etc.</p>
        <TableEditor
          headers={['Milestone / Label', 'Date / Details']}
          rows={fields.customerTimeline}
          onChange={tbl('customerTimeline')}
          minRows={3}
          cellWidths={['45%', '55%']}
        />
      </Section>

      {/* ── Commercials ── */}
      <Section title="Commercials – TCV | CM1">
        <TableEditor
          headers={['Item', 'Value']}
          rows={fields.commercials}
          onChange={tbl('commercials')}
          minRows={2}
          cellWidths={['50%', '50%']}
        />
      </Section>

      {/* ── Help Needed ── */}
      <Section title="Help Needed">
        <TableEditor
          headers={['Help Required', 'Details / Owner']}
          rows={fields.helpNeeded}
          onChange={tbl('helpNeeded')}
          minRows={2}
          cellWidths={['50%', '50%']}
        />
      </Section>

      {/* ── Stakeholders ── */}
      <Section title="Stakeholder (Customer)">
        <p className="mb-2 text-xs text-gray-400">RAG: Positive | Neutral | Issue</p>
        <TableEditor
          headers={['Stakeholder (Customer)', 'Role', 'RAG']}
          rows={fields.stakeholders}
          onChange={tbl('stakeholders')}
          minRows={2}
          cellWidths={['40%', '40%', '20%']}
          dropdownCols={{ 2: ['Positive', 'Neutral', 'Issue'] }}
        />
      </Section>

      {/* ── Competition ── */}
      <Section title="Competition">
        <TableEditor
          headers={['Competition', 'Relation', 'SWO Differentiator']}
          rows={fields.competition}
          onChange={tbl('competition')}
          minRows={2}
          cellWidths={['30%', '25%', '45%']}
        />
      </Section>

      {/* ── Additional Comments ── */}
      <Section title="Additional Comments">
        <TextArea label="Comments" value={fields.additionalComments} onChange={str('additionalComments')} rows={4} />
      </Section>

      {/* ── Next Steps ── */}
      <Section title="Next Steps [Internal]">
        <TableEditor
          headers={['Date', 'Next Step']}
          rows={fields.nextSteps}
          onChange={tbl('nextSteps')}
          minRows={3}
          cellWidths={['25%', '75%']}
        />
      </Section>

      {/* ── Bid Recommendation ── */}
      <Section title="Bid Recommendation">
        <div className="mb-3">
          <Field label="Bid Recommendation" value={fields.bidRecommendation} onChange={str('bidRecommendation')} placeholder="e.g. Recommended / Not Recommended" />
        </div>
        <p className="mb-2 text-xs font-semibold text-gray-500">Sign-offs</p>
        <div className="space-y-2">
          <Field label="Account Management" value={fields.signOffAccountManagement} onChange={str('signOffAccountManagement')} placeholder="Person / Unit" />
          <Field label="Presales" value={fields.signOffPresales} onChange={str('signOffPresales')} placeholder="Person / Unit" />
          <Field label="Delivery" value={fields.signOffDelivery} onChange={str('signOffDelivery')} placeholder="Person / Unit" />
          <Field label="Legal" value={fields.signOffLegal} onChange={str('signOffLegal')} placeholder="Person / Unit" />
        </div>
      </Section>

      {/* ── Reset ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onReset}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          Reset All Fields
        </button>
      </div>
    </div>
  );
};
