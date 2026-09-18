import React, { useState, useCallback } from 'react';
import type { DraftMeta } from '../hooks/use-drafts';
import { useDrafts } from '../hooks/use-drafts';
import type { DealOnePagerFields } from '../types';

interface DraftsPanelProps {
  activeDraftId: string;
  currentFields: DealOnePagerFields;
  onLoadDraft: (fields: DealOnePagerFields, draftId: string) => void;
  onNewDraft: () => void;
}

export const DraftsPanel: React.FC<DraftsPanelProps> = ({
  activeDraftId,
  currentFields,
  onLoadDraft,
  onNewDraft,
}) => {
  const { listDrafts, saveDraft, loadDraft, deleteDraft, renameDraft } = useDrafts();
  const [drafts, setDrafts] = useState<DraftMeta[]>(() => listDrafts());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const refresh = useCallback(() => {
    setDrafts(listDrafts());
  }, [listDrafts]);

  const handleSaveCurrent = () => {
    const draft = drafts.find((d) => d.id === activeDraftId);
    saveDraft(activeDraftId, draft?.name ?? 'Untitled Draft', currentFields);
    refresh();
  };

  const handleLoadDraft = (id: string) => {
    const fields = loadDraft(id);
    if (fields) onLoadDraft(fields, id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this draft?')) return;
    deleteDraft(id);
    refresh();
  };

  const handleRename = (id: string) => {
    renameDraft(id, editingName.trim() || 'Untitled Draft');
    setEditingId(null);
    refresh();
  };

  const handleNewDraft = () => {
    onNewDraft();
    setTimeout(refresh, 50);
  };

  return (
    <div className="rounded-2xl border border-[var(--soft-gray)] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Saved Drafts</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSaveCurrent}
            className="rounded-lg bg-[var(--near-black)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-80 min-h-[36px]"
            title="Save current draft"
          >
            Save
          </button>
          <button
            onClick={handleNewDraft}
            className="rounded-lg border border-[var(--soft-gray)] px-3 py-1.5 text-xs font-semibold text-[var(--near-black)] hover:bg-[var(--light-silver)] min-h-[36px]"
            title="New empty draft"
          >
            + New
          </button>
        </div>
      </div>

      {drafts.length === 0 && (
        <p className="text-xs text-gray-400 py-2">No drafts saved yet. Click "Save" to save the current form.</p>
      )}

      <ul className="space-y-1">
        {drafts.map((draft) => (
          <li
            key={draft.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
              draft.id === activeDraftId
                ? 'bg-[var(--light-silver)] font-semibold'
                : 'hover:bg-[var(--light-silver)]'
            }`}
          >
            {editingId === draft.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRename(draft.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(draft.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="flex-1 rounded border border-[var(--coral)] px-2 py-0.5 text-xs outline-none"
              />
            ) : (
              <button
                className="flex-1 text-left truncate"
                onClick={() => handleLoadDraft(draft.id)}
                title={`Load: ${draft.name}`}
              >
                {draft.id === activeDraftId && (
                  <span className="mr-1 text-[var(--coral)]">●</span>
                )}
                {draft.name}
                <span className="ml-2 font-normal text-gray-400">
                  {new Date(draft.savedAt).toLocaleDateString()}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingId(draft.id);
                setEditingName(draft.name);
              }}
              className="text-gray-300 hover:text-[var(--near-black)] shrink-0 min-h-[28px] px-1"
              title="Rename draft"
              aria-label="Rename draft"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(draft.id)}
              className="text-gray-300 hover:text-[var(--coral)] shrink-0 min-h-[28px] px-1"
              title="Delete draft"
              aria-label="Delete draft"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
