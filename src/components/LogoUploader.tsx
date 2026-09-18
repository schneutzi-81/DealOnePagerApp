import React, { useCallback, useRef } from 'react';

interface LogoUploaderProps {
  logoDataUrl: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ logoDataUrl, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      {logoDataUrl ? (
        <img
          src={logoDataUrl}
          alt="Brand logo"
          className="h-9 w-auto max-w-[80px] rounded border border-[var(--soft-gray)] object-contain p-0.5"
        />
      ) : (
        <div className="flex h-9 w-16 items-center justify-center rounded border border-dashed border-[var(--soft-gray)] text-xs text-gray-300">
          Logo
        </div>
      )}
      <label className="cursor-pointer rounded-lg border border-[var(--soft-gray)] px-3 py-1.5 text-xs font-semibold text-[var(--near-black)] hover:bg-[var(--light-silver)] min-h-[36px] flex items-center">
        {logoDataUrl ? 'Change' : 'Upload Logo'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
          aria-label="Upload company logo"
        />
      </label>
      {logoDataUrl && (
        <button
          onClick={() => onChange(null)}
          className="text-xs text-gray-400 hover:text-[var(--coral)] min-h-[36px] px-1"
          aria-label="Remove logo"
        >
          Remove
        </button>
      )}
    </div>
  );
};
