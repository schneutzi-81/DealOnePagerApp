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

  return (
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
      {error && <p className="mt-4 text-sm text-[var(--coral)]">⚠ {error}</p>}
    </div>
  );
};
