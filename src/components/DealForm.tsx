import React from 'react';
import type { DealOnePagerFields, TableRow } from '../types';

interface DealFormProps {
  fields: DealOnePagerFields;
  onChange: (key: keyof DealOnePagerFields, value: DealOnePagerFields[keyof DealOnePagerFields]) => void;
  onReset: () => void;
}

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <div className="rounded-t-xl bg-[var(--near-black)] px-4 py-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
    </div>
    <div className="rounded-b-xl border border-[var(--soft-gray)] bg-white p-4">{children}</div>
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
  <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-1 sm:gap-2">
    <label className="sm:col-span-2 text-xs font-semibold text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? label}
      className="sm:col-span-3 rounded-lg border border-[var(--soft-gray)] px-3 py-2 text-sm text-[var(--near-black)] outline-none focus:border-[var(--coral)] focus:ring-1 focus:ring-[var(--coral)]/20 min-h-[44px]"
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
    <label className="mb-1 block text-xs font-semibold text-gray-400">{label}</label>
    {helper && <p className="mb-1 text-xs text-gray-400">{helper}</p>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={label}
      className="w-full rounded-lg border border-[var(--soft-gray)] px-3 py-2 text-sm text-[var(--near-black)] outline-none focus:border-[var(--coral)] focus:ring-1 focus:ring-[var(--coral)]/20"
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
  const dragSrcRef = React.useRef<number | null>(null);

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

  /** Move focus to adjacent cell via keyboard. */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    ri: number,
    ci: number
  ) => {
    const colCount = headers.length;
    const rowCount = rows.length;
    let targetRi = ri;
    let targetCi = ci;

    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      if (ci < colCount - 1) { targetCi = ci + 1; }
      else if (ri < rowCount - 1) { targetRi = ri + 1; targetCi = 0; }
      else return; // let default Tab handle
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      if (ci > 0) { targetCi = ci - 1; }
      else if (ri > 0) { targetRi = ri - 1; targetCi = colCount - 1; }
      else return;
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      if (ri < rowCount - 1) { targetRi = ri + 1; }
      else return;
    } else if (e.key === 'ArrowUp') {
      if (ri > 0) { targetRi = ri - 1; }
      else return;
    } else {
      return;
    }

    if (e.key !== 'Tab') e.preventDefault();
    const table = (e.currentTarget as HTMLElement).closest('table');
    if (!table) return;
    const cell = table.querySelector<HTMLElement>(
      `[data-ri="${targetRi}"][data-ci="${targetCi}"]`
    );
    cell?.focus();
  };

  // Drag-to-reorder handlers
  const handleDragStart = (ri: number) => { dragSrcRef.current = ri; };
  const handleDragOver = (e: React.DragEvent, ri: number) => {
    e.preventDefault();
    if (dragSrcRef.current === null || dragSrcRef.current === ri) return;
    const newRows = [...rows];
    const [moved] = newRows.splice(dragSrcRef.current, 1);
    newRows.splice(ri, 0, moved);
    dragSrcRef.current = ri;
    onChange(newRows);
  };
  const handleDragEnd = () => { dragSrcRef.current = null; };

  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {/* drag handle column */}
            <th className="w-5 border border-[var(--soft-gray)] bg-[var(--light-silver)]" aria-label="Drag to reorder" />
            {headers.map((h, i) => (
              <th
                key={i}
                style={{ width: cellWidths?.[i] }}
                className="border border-[var(--soft-gray)] bg-[var(--light-silver)] px-2 py-1.5 text-left font-semibold text-gray-500"
              >
                {h}
              </th>
            ))}
            <th className="w-6 border border-[var(--soft-gray)] bg-[var(--light-silver)]" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              draggable
              onDragStart={() => handleDragStart(ri)}
              onDragOver={(e) => handleDragOver(e, ri)}
              onDragEnd={handleDragEnd}
              className="group"
            >
              {/* drag handle */}
              <td
                className="border border-[var(--soft-gray)] text-center cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 select-none"
                aria-hidden="true"
                title="Drag to reorder"
              >
                ⠿
              </td>
              {headers.map((_, ci) => (
                <td key={ci} className="border border-[var(--soft-gray)] p-0">
                  {dropdownCols && dropdownCols[ci] ? (
                    <select
                      value={row.cols[ci] ?? ''}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                      data-ri={ri}
                      data-ci={ci}
                      className="w-full px-2 py-2 text-sm outline-none focus:bg-[var(--light-silver)] bg-white min-h-[44px]"
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
                      onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                      data-ri={ri}
                      data-ci={ci}
                      className="w-full px-2 py-2 text-sm outline-none focus:bg-[var(--light-silver)] min-h-[44px]"
                    />
                  )}
                </td>
              ))}
              <td className="border border-[var(--soft-gray)] text-center">
                <button
                  onClick={() => removeRow(ri)}
                  disabled={rows.length <= minRows}
                  className="px-1 text-gray-300 hover:text-[var(--coral)] disabled:opacity-30 min-h-[44px]"
                  title="Remove row"
                  aria-label="Remove row"
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
        className="mt-2 text-xs font-medium text-[var(--coral)] hover:opacity-70 min-h-[44px]"
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
    <div className="space-y-1 sm:space-y-2">
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
          headers={['Item', 'Value', 'Margin']}
          rows={fields.commercials}
          onChange={tbl('commercials')}
          minRows={2}
          cellWidths={['40%', '35%', '25%']}
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
      <div className="flex justify-end pt-4">
        <button
          onClick={onReset}
          className="rounded-xl border border-[var(--near-black)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-sm transition hover:bg-[var(--light-silver)] min-h-[44px]"
        >
          Reset All Fields
        </button>
      </div>
    </div>
  );
};
