import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MarkdownUploader } from './components/MarkdownUploader';
import { DealForm } from './components/DealForm';
import { PDFPreview } from './components/PDFPreview';
import { DraftsPanel } from './components/DraftsPanel';
import { LogoUploader } from './components/LogoUploader';
import GitHubServices from './components/GitHubServices';
import { parseMarkdownToFields } from './utils/markdownParser';
import { exportToPDF } from './utils/pdfExport';
import type { DealOnePagerFields } from './types';
import { DEFAULT_FIELDS } from './types';
import { useUndoRedo } from './hooks/use-undo-redo';
import {
  loadActiveFields,
  autoSave,
  getActiveDraftId,
  setActiveDraftId,
} from './hooks/use-drafts';
import { REQUIRED_FIELD_KEYS } from './config/pdfTokens';

type Tab = 'edit' | 'preview' | 'github';

function getInitialDraftId(): string {
  return getActiveDraftId() ?? uuidv4();
}

function App() {
  const [activeDraftId, setActiveDraftIdState] = useState<string>(getInitialDraftId);

  const {
    state: fields,
    set: setFields,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<DealOnePagerFields>(() => loadActiveFields());

  const [activeTab, setActiveTab] = useState<Tab>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveDraftId(activeDraftId);
  }, [activeDraftId]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave(activeDraftId, fields);
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [fields, activeDraftId]);

  const handleFileLoaded = useCallback((content: string) => {
    const parsed = parseMarkdownToFields(content);
    setFields(parsed);
    setActiveTab('edit');
  }, [setFields]);

  const handleFieldChange = useCallback(
    (key: keyof DealOnePagerFields, value: DealOnePagerFields[keyof DealOnePagerFields]) => {
      setFields({ ...fields, [key]: value } as DealOnePagerFields);
    },
    [fields, setFields]
  );

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all fields to empty? This cannot be undone.')) {
      setFields({ ...DEFAULT_FIELDS });
    }
  }, [setFields]);

  const handleLoadDraft = useCallback(
    (draftFields: DealOnePagerFields, draftId: string) => {
      resetHistory(draftFields);
      setActiveDraftIdState(draftId);
    },
    [resetHistory]
  );

  const handleNewDraft = useCallback(() => {
    const newId = uuidv4();
    setActiveDraftIdState(newId);
    resetHistory({ ...DEFAULT_FIELDS });
  }, [resetHistory]);

  const validateFields = useCallback((): string[] => {
    const warnings: string[] = [];
    const labels: Record<string, string> = {
      customerName: 'Customer Name',
      tcv: 'TCV',
      company: 'Company',
    };
    for (const key of REQUIRED_FIELD_KEYS) {
      const val = (fields as Record<string, unknown>)[key];
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        warnings.push(`"${labels[key] ?? key}" is required`);
      }
    }
    return warnings;
  }, [fields]);

  const handleExportPDF = useCallback(async () => {
    const warnings = validateFields();
    if (warnings.length) {
      setValidationWarnings(warnings);
      return;
    }
    setValidationWarnings([]);
    setActiveTab('preview');
    setExportError(null);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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
  }, [fields.customerName, fields.dealName, validateFields]);

  // Keyboard shortcuts — ref avoids stale closure without adding handleExportPDF to effect deps
  const handleExportPDFRef = useRef(handleExportPDF);
  useEffect(() => { handleExportPDFRef.current = handleExportPDF; });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'p') { e.preventDefault(); void handleExportPDFRef.current(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

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

          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <button
              onClick={undo}
              disabled={!canUndo}
              className="hidden sm:flex items-center justify-center rounded-lg border border-[var(--soft-gray)] h-9 w-9 text-gray-500 hover:bg-[var(--light-silver)] disabled:opacity-30 transition"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="hidden sm:flex items-center justify-center rounded-lg border border-[var(--soft-gray)] h-9 w-9 text-gray-500 hover:bg-[var(--light-silver)] disabled:opacity-30 transition"
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
            >
              ↪
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80 disabled:opacity-50 min-h-[44px]"
              aria-label={isExporting ? 'Exporting PDF…' : 'Export PDF (Ctrl+P)'}
              title="Export PDF (Ctrl+P)"
            >
              {isExporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Validation warnings */}
        {validationWarnings.length > 0 && (
          <div className="mb-6 rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 shadow-sm" role="alert">
            <p className="mb-1 text-sm font-semibold text-[var(--near-black)]">Please fill in required fields before exporting:</p>
            <ul className="list-disc pl-5 text-sm text-[var(--coral)]">
              {validationWarnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        )}

        {exportError && (
          <div className="mb-6 rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 text-sm text-[var(--near-black)] shadow-sm" role="alert">
            ⚠ {exportError}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${activeTab === 'edit' ? 'lg:grid-cols-[300px_1fr] lg:gap-8' : ''}`}>
          {/* Left column: uploader (hidden on preview and github) */}
          <div className={activeTab === 'preview' || activeTab === 'github' ? 'hidden' : 'space-y-4'}>
            <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">
                Step 1 · Upload or Paste Markdown
              </h2>
              <MarkdownUploader onFileLoaded={handleFileLoaded} />
              <p className="mt-4 text-xs text-gray-400">
                Upload or paste a <code className="rounded bg-[var(--light-silver)] px-1">.md</code> file
                to auto-fill the form. Headings map to fields; unmatched content
                goes to Notes.
              </p>
            </div>

            {/* Logo uploader */}
            <div className="rounded-2xl border border-[var(--soft-gray)] bg-white p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Brand Logo (PDF Header)</h2>
              <LogoUploader logoDataUrl={logoDataUrl} onChange={setLogoDataUrl} />
            </div>

            {/* Drafts */}
            <DraftsPanel
              activeDraftId={activeDraftId}
              currentFields={fields}
              onLoadDraft={handleLoadDraft}
              onNewDraft={handleNewDraft}
            />

            {/* Sample download */}
            <div className="rounded-2xl border border-[var(--soft-gray)] bg-white p-4">
              <a
                href={`${import.meta.env.BASE_URL}sample.md`}
                download="sample.md"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--near-black)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-sm transition hover:bg-[var(--light-silver)] min-h-[44px]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample .md
              </a>
            </div>

            {/* Markdown format guide */}
            <details className="rounded-2xl border border-[var(--soft-gray)] bg-white">
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
                <p className="text-gray-400">
                  <strong>Aliases accepted:</strong> TCO, TCV, Total Contract Value, ACV, ARR, Executive Summary, Scope of Work, etc.
                </p>
                <p className="text-gray-400">
                  <strong>YAML front-matter</strong> (--- blocks) is automatically stripped.
                </p>
              </div>
            </details>
          </div>

          {/* Right column: form + preview tabs */}
          <div>
            <div className="rounded-2xl bg-white shadow-sm">
              {/* Tabs — aligned with step labels */}
              <div className="flex border-b border-[var(--soft-gray)] px-4 sm:px-6">
                {([
                  { id: 'edit', label: 'Step 2 · Edit Fields' },
                  { id: 'preview', label: 'Step 3 · Preview' },
                  { id: 'github', label: 'GitHub Services' },
                ] as { id: Tab; label: string }[]).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 sm:flex-none sm:mr-4 py-4 text-sm font-semibold transition border-b-2 min-h-[44px] ${
                      activeTab === id
                        ? 'border-[var(--coral)] text-[var(--near-black)]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className={activeTab !== 'github' ? 'p-4 sm:p-6' : ''}>
                {/* Edit tab */}
                <div className={activeTab === 'edit' ? '' : 'hidden'}>
                  <p className="mb-5 text-sm text-gray-400">
                    Review and edit the auto-filled fields below. All fields
                    are editable. Changes are auto-saved.
                    {(canUndo || canRedo) && (
                      <span className="ml-2 text-xs text-gray-300">
                        Use Ctrl+Z / Ctrl+Shift+Z to undo/redo.
                      </span>
                    )}
                  </p>
                  <DealForm
                    fields={fields}
                    onChange={handleFieldChange}
                    onReset={handleReset}
                  />
                </div>

                {/* Preview tab */}
                <div className={activeTab === 'preview' ? '' : 'hidden'}>
                  <p className="mb-5 text-sm text-gray-400">
                    This is how your one-pager will look in the PDF. Click
                    &quot;Export PDF&quot; to download.
                  </p>
                  <p className="mb-3 text-xs text-gray-400 sm:hidden">
                    ← Scroll horizontally to see full preview →
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-[var(--soft-gray)] bg-[var(--light-silver)] p-4 [-webkit-overflow-scrolling:touch]">
                    <PDFPreview fields={fields} logoDataUrl={logoDataUrl ?? undefined} />
                  </div>
                </div>

                {/* GitHub Services tab */}
                {activeTab === 'github' && <GitHubServices />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Off-screen PDF capture target — always has layout for html2canvas */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}
      >
        <PDFPreview fields={fields} id="pdf-capture" logoDataUrl={logoDataUrl ?? undefined} />
      </div>
    </div>
  );
}

export default App;

