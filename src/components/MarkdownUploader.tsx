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
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40'
      }`}
    >
      <svg
        className="mb-4 h-12 w-12 text-blue-400"
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

      <p className="mb-1 text-lg font-semibold text-gray-700">
        {isDragging ? 'Drop your file here' : 'Upload Markdown File'}
      </p>
      <p className="mb-4 text-sm text-gray-500">
        Drag &amp; drop a <code className="rounded bg-gray-200 px-1">.md</code>{' '}
        file here, or click to browse
      </p>

      <label className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
        Browse Files
        <input
          type="file"
          accept=".md,text/markdown"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      {fileName && (
        <p className="mt-4 text-sm text-green-600">
          ✓ Loaded: <span className="font-medium">{fileName}</span>
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-600">⚠ {error}</p>}
    </div>
  );
};
