import { useState, useCallback } from 'react';

const MAX_HISTORY = 50;

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoReturn<T> {
  state: T;
  set: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Replace present without adding to history (e.g. on initial load). */
  reset: (next: T) => void;
}

export function useUndoRedo<T>(initialState: T | (() => T)): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    const present = typeof initialState === 'function'
      ? (initialState as () => T)()
      : initialState;
    return { past: [], present, future: [] };
  });

  const set = useCallback((next: T) => {
    setHistory((h) => {
      const newPast = [...h.past, h.present].slice(-MAX_HISTORY);
      return { past: newPast, present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] });
  }, []);

  // Keep a stable ref outside render for the historyRef — not needed here since
  // all callbacks use functional setState. Removed to satisfy lint rules.

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
  };
}

