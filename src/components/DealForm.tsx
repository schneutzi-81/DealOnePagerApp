import React from 'react';
import type { DealOnePagerFields } from '../types';
import { FIELD_LABELS, SHORT_FIELDS, LONG_FIELDS } from '../types';

interface DealFormProps {
  fields: DealOnePagerFields;
  onChange: (key: keyof DealOnePagerFields, value: string) => void;
  onReset: () => void;
}

export const DealForm: React.FC<DealFormProps> = ({
  fields,
  onChange,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Short fields – 2-column grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SHORT_FIELDS.map((key) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {FIELD_LABELS[key]}
            </label>
            <input
              type={key === 'date' ? 'date' : 'text'}
              value={fields[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={`Enter ${FIELD_LABELS[key]}`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Long fields – single column textareas */}
      <div className="space-y-5">
        {LONG_FIELDS.map((key) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {FIELD_LABELS[key]}
            </label>
            <textarea
              value={fields[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={`Enter ${FIELD_LABELS[key]}`}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          Reset All Fields
        </button>
      </div>
    </div>
  );
};
