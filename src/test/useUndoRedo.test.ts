import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from '../hooks/use-undo-redo';

describe('useUndoRedo', () => {
  it('initialises with the provided state', () => {
    const { result } = renderHook(() => useUndoRedo(42));
    expect(result.current.state).toBe(42);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('updates state with set()', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(true);
  });

  it('undoes the last change', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    expect(result.current.state).toBe(1);
    expect(result.current.canRedo).toBe(true);
  });

  it('redoes after undo', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state).toBe('c');
    expect(result.current.canRedo).toBe(false);
  });

  it('clears future on new set() after undo', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    act(() => result.current.set(99));
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toBe(99);
  });

  it('reset() replaces state without creating history', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.reset(100));
    expect(result.current.state).toBe(100);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('does nothing on undo when history is empty', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    act(() => result.current.undo());
    expect(result.current.state).toBe('initial');
  });

  it('does nothing on redo when future is empty', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    act(() => result.current.redo());
    expect(result.current.state).toBe('initial');
  });
});
