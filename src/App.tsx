import { useState, useCallback } from 'react';
import { MarkdownUploader } from './components/MarkdownUploader';
import { DealForm } from './components/DealForm';
import { PDFPreview } from './components/PDFPreview';
import { parseMarkdownToFields } from './utils/markdownParser';
import { exportToPDF } from './utils/pdfExport';
import type { DealOnePagerFields } from './types';
import { DEFAULT_FIELDS } from './types';

type Tab = 'edit' | 'preview';

function App() {
  const [fields, setFields] = useState<DealOnePagerFields>({ ...DEFAULT_FIELDS });
  const [activeTab, setActiveTab] = useState<Tab>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleFileLoaded = useCallback((content: string) => {
    const parsed = parseMarkdownToFields(content);
    setFields(parsed);
    setActiveTab('edit');
  }, []);

  const handleFieldChange = useCallback(
    (key: keyof DealOnePagerFields, value: DealOnePagerFields[keyof DealOnePagerFields]) => {
      setFields((prev) => ({ ...prev, [key]: value } as DealOnePagerFields));
    },
    []
  );

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all fields to empty? This cannot be undone.')) {
      setFields({ ...DEFAULT_FIELDS });
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    setActiveTab('preview');
    setExportError(null);
    // Give the DOM a tick to render the preview before capturing
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      setIsExporting(true);
      await exportToPDF(
        `${fields.customerName || fields.dealName || 'deal-one-pager'}.pdf`
          .replace(/\s+/g, '-')
          .toLowerCase()
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [fields.customerName, fields.dealName]);

  return (
    <div className="min-h-screen bg-[var(--light-silver)]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--near-black)] text-white font-bold text-sm">
              D1P
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--near-black)] leading-tight">
                Deal One Pager
              </h1>
              <p className="text-xs text-gray-400">RFP Review Builder</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80 disabled:opacity-50 min-h-[44px]"
          >
            {isExporting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {exportError && (
          <div className="mb-6 rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 text-sm text-[var(--near-black)] shadow-sm">
            ⚠ {exportError}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${activeTab === 'preview' ? '' : 'lg:grid-cols-[300px_1fr] lg:gap-8'}`}>
          {/* Left column: uploader (hidden on preview) */}
          <div className={activeTab === 'preview' ? 'hidden' : ''}>
            <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">
                1 · Upload Markdown
              </h2>
              <MarkdownUploader onFileLoaded={handleFileLoaded} />
              <p className="mt-4 text-xs text-gray-400">
                Upload a <code className="rounded bg-[var(--light-silver)] px-1">.md</code> file
                to auto-fill the form. Headings map to fields; unmatched content
                goes to Notes.
              </p>
            </div>

            {/* Sample download */}
            <div className="mt-4 rounded-2xl border border-[var(--soft-gray)] bg-white p-4">
              <a
                href={`${import.meta.env.BASE_URL}sample.md`}
                download="sample.md"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--near-black)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-sm transition hover:bg-[var(--light-silver)] min-h-[44px]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample .md
              </a>
            </div>

            {/* Markdown format guide */}
            <details className="mt-4 rounded-2xl border border-[var(--soft-gray)] bg-white">
              <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-[var(--near-black)] select-none min-h-[44px] flex items-center">
                📋 Markdown Format Guide
              </summary>
              <div className="border-t border-[var(--soft-gray)] px-4 py-3 text-xs text-gray-500 space-y-2">
                <p>Use <code className="rounded bg-[var(--light-silver)] px-1">## Heading</code> for each field. Example:</p>
                <pre className="rounded-lg bg-[var(--light-silver)] p-3 text-[10px] leading-relaxed overflow-x-auto whitespace-pre font-mono text-[var(--near-black)]">{`# Customer Name — Deal Title

## Opportunity ID
OPP-2024-000123

## Company
Acme Corporation

## Industry
Financial Services

## TCV
€ 4,200,000

## Risks & Mitigation
- Risk one | Mitigation one
- Risk two | Mitigation two

## Stakeholder (Customer)
- Name | Role | Positive
- Name | Role | Neutral

## Commercials – TCV | CM1
- Year 1 | € 1,600,000
- Year 2 | € 1,400,000`}</pre>
                <p className="text-gray-400">
                  <strong>Tables:</strong> Use <code className="rounded bg-[var(--light-silver)] px-1">- col1 | col2 | col3</code> list items under the heading.
                </p>
              </div>
            </details>
          </div>

          {/* Right column: form + preview tabs */}
          <div>
            <div className="rounded-2xl bg-white shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-[var(--soft-gray)] px-4 sm:px-6">
                {(['edit', 'preview'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none sm:mr-4 py-4 text-sm font-semibold capitalize transition border-b-2 min-h-[44px] ${
                      activeTab === tab
                        ? 'border-[var(--coral)] text-[var(--near-black)]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'edit' ? '2 · Edit Fields' : '3 · Preview'}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'edit' ? (
                  <>
                    <p className="mb-5 text-sm text-gray-400">
                      Review and edit the auto-filled fields below. All fields
                      are editable.
                    </p>
                    <DealForm
                      fields={fields}
                      onChange={handleFieldChange}
                      onReset={handleReset}
                    />
                  </>
                ) : (
                  <div>
                    <p className="mb-5 text-sm text-gray-400">
                      This is how your one-pager will look in the PDF. Click
                      &quot;Export PDF&quot; to download.
                    </p>
                    <p className="mb-3 text-xs text-gray-400 sm:hidden">
                      ← Scroll horizontally to see full preview →
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-[var(--soft-gray)] bg-[var(--light-silver)] p-4 [-webkit-overflow-scrolling:touch]">
                      <PDFPreview fields={fields} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
