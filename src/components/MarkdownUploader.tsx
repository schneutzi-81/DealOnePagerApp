import React, { useCallback, useState } from 'react';

interface MarkdownUploaderProps {
  onFileLoaded: (content: string) => void;
}

export const MarkdownUploader: React.FC<MarkdownUploaderProps> = ({
  onFileLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.endsWith('.md') && file.type !== 'text/markdown') {
        setError('Please upload a Markdown (.md) file.');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content);
      };
      reader.readAsText(file);
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so same file can be re-uploaded
      e.target.value = '';
    },
    [processFile]
  );

  const handlePasteSubmit = useCallback(() => {
    const text = pasteText.trim();
    if (!text) {
      setError('Please paste some Markdown content first.');
      return;
    }
    setError(null);
    setFileName('pasted content');
    onFileLoaded(text);
    setPasteText('');
    setShowPaste(false);
  }, [pasteText, onFileLoaded]);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPasteText(text);
        setShowPaste(true);
      }
    } catch {
      // Clipboard API may be unavailable – fall back to manual textarea
      setShowPaste(true);
    }
  }, []);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-10 transition-colors ${
          isDragging
            ? 'border-[var(--coral)] bg-[var(--light-silver)]'
            : 'border-[var(--soft-gray)] bg-white hover:border-gray-400 hover:bg-[var(--light-silver)]'
        }`}
      >
        <svg
          className="mb-4 h-8 w-8 sm:h-12 sm:w-12 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="mb-1 text-lg font-semibold text-[var(--near-black)]">
          {isDragging ? 'Drop your file here' : 'Upload Markdown File'}
        </p>
        <p className="mb-4 text-sm text-gray-400">
          Drag &amp; drop a <code className="rounded bg-[var(--light-silver)] px-1">.md</code>{' '}
          file here, or click to browse
        </p>

        <label className="cursor-pointer rounded-xl bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80 w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center">
          Browse Files
          <input
            type="file"
            accept=".md,text/markdown"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {fileName && (
          <p className="mt-4 text-sm text-[var(--near-black)]">
            <span className="text-[var(--coral)]">✓</span> Loaded: <span className="font-medium">{fileName}</span>
          </p>
        )}
        {error && <p className="mt-4 text-sm text-[var(--coral)]" role="alert">⚠ {error}</p>}
      </div>

      {/* Paste Markdown */}
      <div className="mt-3">
        {!showPaste ? (
          <button
            onClick={handleClipboardPaste}
            className="w-full rounded-xl border border-[var(--soft-gray)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--near-black)] shadow-sm transition hover:bg-[var(--light-silver)] min-h-[44px] flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Paste Markdown
          </button>
        ) : (
          <div className="rounded-xl border border-[var(--soft-gray)] bg-white p-3">
            <textarea
              autoFocus
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your Markdown content here…"
              rows={6}
              className="w-full rounded-lg border border-[var(--soft-gray)] px-3 py-2 text-sm font-mono text-[var(--near-black)] outline-none focus:border-[var(--coral)] focus:ring-1 focus:ring-[var(--coral)]/20 resize-y"
              aria-label="Paste markdown content"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handlePasteSubmit}
                className="flex-1 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 min-h-[40px]"
              >
                Import
              </button>
              <button
                onClick={() => { setShowPaste(false); setPasteText(''); setError(null); }}
                className="rounded-lg border border-[var(--soft-gray)] px-4 py-2 text-sm font-semibold text-[var(--near-black)] hover:bg-[var(--light-silver)] min-h-[40px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

