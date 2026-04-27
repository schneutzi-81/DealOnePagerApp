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
    (key: keyof DealOnePagerFields, value: string) => {
      setFields((prev) => ({ ...prev, [key]: value }));
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
        `${fields.dealName || 'deal-one-pager'}.pdf`
          .replace(/\s+/g, '-')
          .toLowerCase()
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [fields.dealName]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top nav */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              D1P
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Deal One Pager
              </h1>
              <p className="text-xs text-gray-500">RFP Review Builder</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
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

      <main className="mx-auto max-w-screen-xl px-6 py-8">
        {exportError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠ {exportError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column: uploader */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                1 · Upload Markdown
              </h2>
              <MarkdownUploader onFileLoaded={handleFileLoaded} />
              <p className="mt-4 text-xs text-gray-400">
                Upload a <code className="rounded bg-gray-100 px-1">.md</code> file
                to auto-fill the form. Headings map to fields; unmatched content
                goes to Notes.
              </p>
            </div>

            {/* Sample file hint */}
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
              <p className="font-semibold mb-1">💡 Tip</p>
              <p>
                A <code className="rounded bg-blue-100 px-1">sample.md</code> file
                is included in the project root. Use it to test the import.
              </p>
            </div>
          </div>

          {/* Right column: form + preview tabs */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-6">
                {(['edit', 'preview'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`mr-4 py-4 text-sm font-semibold capitalize transition border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'edit' ? '2 · Edit Fields' : '3 · Preview'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'edit' ? (
                  <>
                    <p className="mb-5 text-sm text-gray-500">
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
                    <p className="mb-5 text-sm text-gray-500">
                      This is how your one-pager will look in the PDF. Click
                      &quot;Export PDF&quot; to download.
                    </p>
                    <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
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
