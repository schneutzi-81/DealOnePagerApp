import { useCallback } from 'react';
import type { DealOnePagerFields } from '../types';
import { DEFAULT_FIELDS } from '../types';

const LS_DRAFTS_KEY = 'deal1p_drafts';
const LS_ACTIVE_KEY = 'deal1p_active_draft';

export interface DraftMeta {
  id: string;
  name: string;
  savedAt: string; // ISO string
}

export interface DraftStore {
  drafts: DraftMeta[];
  /** fields keyed by draft id */
  data: Record<string, DealOnePagerFields>;
}

function loadStore(): DraftStore {
  try {
    const raw = localStorage.getItem(LS_DRAFTS_KEY);
    if (raw) return JSON.parse(raw) as DraftStore;
  } catch {
    // ignore corrupt data
  }
  return { drafts: [], data: {} };
}

function saveStore(store: DraftStore): void {
  try {
    localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded – silently ignore
  }
}

export function getActiveDraftId(): string | null {
  return localStorage.getItem(LS_ACTIVE_KEY);
}

export function setActiveDraftId(id: string | null): void {
  if (id) {
    localStorage.setItem(LS_ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(LS_ACTIVE_KEY);
  }
}

/** Returns the fields for the active draft, or DEFAULT_FIELDS if none saved. */
export function loadActiveFields(): DealOnePagerFields {
  const id = getActiveDraftId();
  if (!id) return { ...DEFAULT_FIELDS };
  const store = loadStore();
  return store.data[id] ?? { ...DEFAULT_FIELDS };
}

/** Persist the current fields into the active draft (auto-save). */
export function autoSave(id: string, fields: DealOnePagerFields): void {
  const store = loadStore();
  // Upsert meta
  const existing = store.drafts.find((d) => d.id === id);
  if (existing) {
    existing.savedAt = new Date().toISOString();
  } else {
    store.drafts.push({ id, name: 'Untitled Draft', savedAt: new Date().toISOString() });
  }
  store.data[id] = fields;
  saveStore(store);
}

export function useDrafts() {
  const listDrafts = useCallback((): DraftMeta[] => {
    return loadStore().drafts;
  }, []);

  const saveDraft = useCallback(
    (id: string, name: string, fields: DealOnePagerFields): void => {
      const store = loadStore();
      const existing = store.drafts.find((d) => d.id === id);
      if (existing) {
        existing.name = name;
        existing.savedAt = new Date().toISOString();
      } else {
        store.drafts.push({ id, name, savedAt: new Date().toISOString() });
      }
      store.data[id] = fields;
      saveStore(store);
    },
    []
  );

  const loadDraft = useCallback((id: string): DealOnePagerFields | null => {
    const store = loadStore();
    return store.data[id] ?? null;
  }, []);

  const deleteDraft = useCallback((id: string): void => {
    const store = loadStore();
    store.drafts = store.drafts.filter((d) => d.id !== id);
    delete store.data[id];
    saveStore(store);
  }, []);

  const renameDraft = useCallback((id: string, name: string): void => {
    const store = loadStore();
    const meta = store.drafts.find((d) => d.id === id);
    if (meta) {
      meta.name = name;
      meta.savedAt = new Date().toISOString();
      saveStore(store);
    }
  }, []);

  const clearAllDrafts = useCallback((): void => {
    localStorage.removeItem(LS_DRAFTS_KEY);
    localStorage.removeItem(LS_ACTIVE_KEY);
  }, []);

  return { listDrafts, saveDraft, loadDraft, deleteDraft, renameDraft, clearAllDrafts };
}
