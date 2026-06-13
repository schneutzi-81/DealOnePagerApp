import { useState, useCallback } from 'react';
import { MarkdownUploader } from './components/MarkdownUploader';
import { DealForm } from './components/DealForm';
import { PDFPreview } from './components/PDFPreview';
import { ApprovalDashboard } from './components/ApprovalDashboard';
import { AIUpload } from './components/AIUpload';
import { parseMarkdownToFields } from './utils/markdownParser';
import { exportToPDF } from './utils/pdfExport';
import { useAuth } from './hooks/useAuth';
import { useDeals, type DealRecord } from './hooks/useDeals';
import type { DealOnePagerFields } from './types';
import { DEFAULT_FIELDS } from './types';

type Tab = 'edit' | 'preview' | 'approvals';

function App() {
  const { isAuthenticated, isLoading: authLoading, login, logout, userName } = useAuth();
  const { saveDeal, submitForApproval, extractWithAI, error: dealsError } = useDeals();

  const [fields, setFields] = useState<DealOnePagerFields>({ ...DEFAULT_FIELDS });
  const [activeTab, setActiveTab] = useState<Tab>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [currentDealId, setCurrentDealId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setCurrentDealId(null);
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
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
  }, [fields.customerName, fields.dealName]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await saveDeal(fields, currentDealId || undefined);
    if (result) {
      setCurrentDealId(result.id);
    }
    setIsSaving(false);
  }, [fields, currentDealId, saveDeal]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!currentDealId) {
      // Save first
      const result = await saveDeal(fields);
      if (!result) return;
      setCurrentDealId(result.id);
      setIsSubmitting(true);
      await submitForApproval(result.id);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(true);
      await saveDeal(fields, currentDealId);
      await submitForApproval(currentDealId);
      setIsSubmitting(false);
    }
  }, [currentDealId, fields, saveDeal, submitForApproval]);

  const handleEditDeal = useCallback((deal: DealRecord) => {
    setFields(deal.fields as unknown as DealOnePagerFields);
    setCurrentDealId(deal.id);
    setActiveTab('edit');
  }, []);

  const handleAISuggestions = useCallback((suggestions: Partial<DealOnePagerFields>) => {
    setFields(prev => ({ ...prev, ...suggestions } as DealOnePagerFields));
    setActiveTab('edit');
  }, []);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--light-silver)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--coral)] border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--light-silver)]">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--near-black)] text-white font-bold text-xl">
            D1P
          </div>
          <h1 className="mt-4 text-xl font-bold text-[var(--near-black)]">Deal One Pager</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in with your corporate account to continue</p>
          <button
            onClick={login}
            className="mt-6 w-full rounded-xl bg-[var(--coral)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-3">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--soft-gray)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-sm transition hover:bg-[var(--light-silver)] disabled:opacity-50 min-h-[44px]"
            >
              {isSaving ? 'Saving…' : '💾 Save Draft'}
            </button>

            {/* Submit for approval */}
            <button
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? 'Submitting…' : '📤 Submit for Approval'}
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80 disabled:opacity-50 min-h-[44px]"
            >
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2 rounded-xl bg-[var(--light-silver)] px-3 py-2">
              <span className="text-xs font-medium text-gray-600 hidden sm:inline">{userName}</span>
              <button onClick={logout} className="text-xs text-gray-400 hover:text-[var(--coral)]">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {(exportError || dealsError) && (
          <div className="mb-6 rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 text-sm text-[var(--near-black)] shadow-sm">
            ⚠ {exportError || dealsError}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${activeTab === 'edit' ? 'lg:grid-cols-[300px_1fr] lg:gap-8' : ''}`}>
          {/* Left column: uploader (hidden on preview/approvals) */}
          <div className={activeTab !== 'edit' ? 'hidden' : ''}>
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

            {/* AI Upload */}
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">
                🤖 AI Extract
              </h2>
              <AIUpload onAcceptSuggestions={handleAISuggestions} extractWithAI={extractWithAI} />
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
          </div>

          {/* Right column: form + preview + approvals */}
          <div>
            <div className="rounded-2xl bg-white shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-[var(--soft-gray)] px-4 sm:px-6">
                {(['edit', 'preview', 'approvals'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none sm:mr-4 py-4 text-sm font-semibold transition border-b-2 min-h-[44px] ${
                      activeTab === tab
                        ? 'border-[var(--coral)] text-[var(--near-black)]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'edit' ? '✏️ Edit' : tab === 'preview' ? '👁️ Preview' : '📋 Approvals'}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {/* Edit tab */}
                <div className={activeTab === 'edit' ? '' : 'hidden'}>
                  <p className="mb-5 text-sm text-gray-400">
                    Review and edit the fields below. All fields are editable. Save as draft or submit for approval.
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
                    <PDFPreview fields={fields} />
                  </div>
                </div>

                {/* Approvals tab */}
                {activeTab === 'approvals' && (
                  <ApprovalDashboard onEditDeal={handleEditDeal} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Off-screen PDF capture target */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}
      >
        <PDFPreview fields={fields} id="pdf-capture" />
      </div>
    </div>
  );
}

export default App;
