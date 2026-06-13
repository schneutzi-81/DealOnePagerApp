import { useState, useCallback } from 'react';
import type { DealOnePagerFields } from '../types';

interface AIUploadProps {
  onAcceptSuggestions: (fields: Partial<DealOnePagerFields>) => void;
  extractWithAI: (file: File) => Promise<Partial<DealOnePagerFields> | null>;
}

export function AIUpload({ onAcceptSuggestions, extractWithAI }: AIUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<DealOnePagerFields> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file.name);
    setError(null);
    setSuggestions(null);
    setIsProcessing(true);

    try {
      const result = await extractWithAI(file);
      if (result) {
        setSuggestions(result);
      } else {
        setError('No suggestions returned from AI');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  }, [extractWithAI]);

  const handleAcceptAll = useCallback(() => {
    if (suggestions) {
      onAcceptSuggestions(suggestions);
      setSuggestions(null);
      setSelectedFile(null);
    }
  }, [suggestions, onAcceptSuggestions]);

  const handleDismiss = useCallback(() => {
    setSuggestions(null);
    setSelectedFile(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-[var(--soft-gray)] p-6 text-center transition hover:border-[var(--coral)]">
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          id="ai-upload"
          disabled={isProcessing}
        />
        <label htmlFor="ai-upload" className="cursor-pointer">
          <div className="mb-2 text-2xl">🤖</div>
          <p className="text-sm font-medium text-[var(--near-black)]">
            Upload a document for AI extraction
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PDF, Word, text, markdown, or images — AI will suggest field values
          </p>
        </label>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-blue-700">
            Processing "{selectedFile}" with Azure AI…
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 text-sm text-[var(--near-black)]">
          ⚠ {error}
        </div>
      )}

      {/* Suggestions preview */}
      {suggestions && (
        <div className="rounded-xl border border-[var(--soft-gray)] bg-white">
          <div className="border-b border-[var(--soft-gray)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--near-black)]">
              🤖 AI Suggestions from "{selectedFile}"
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Review the extracted fields below. Accept to fill the form, or dismiss.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto px-4 py-3">
            <dl className="space-y-2">
              {Object.entries(suggestions)
                .filter(([, value]) => value && (typeof value === 'string' ? value.trim() : true))
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <dt className="min-w-[120px] text-xs font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </dt>
                    <dd className="text-xs text-[var(--near-black)] truncate">
                      {typeof value === 'string' ? value : JSON.stringify(value).slice(0, 80)}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="flex gap-3 border-t border-[var(--soft-gray)] px-4 py-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              ✓ Accept & Fill Form
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-[var(--soft-gray)] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
