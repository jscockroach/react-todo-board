import { useReducer, useEffect, useMemo } from 'react';
import boardReducer from '../reducers/boardReducer';
import { initialBoardState } from '../store/initialBoardState';
import { STORAGE_KEY, STORAGE_VERSION } from '../constants/storage';
import type { BoardState } from '../types/board';

/** Shape of the persisted object in localStorage */
type PersistedState = {
  version: number;
  data: BoardState;
};

/** Lightweight structural check — no deep validation needed */
function isValidPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; data?: unknown };
  if (candidate.version !== STORAGE_VERSION) return false;
  const data = candidate.data;
  if (!data || typeof data !== 'object') return false;
  const d = data as {
    tasks?: unknown;
    columns?: unknown;
    columnOrder?: unknown;
  };
  return (
    typeof d.tasks === 'object' &&
    d.tasks !== null &&
    !Array.isArray(d.tasks) &&
    typeof d.columns === 'object' &&
    d.columns !== null &&
    !Array.isArray(d.columns) &&
    Array.isArray(d.columnOrder)
  );
}

/** Load and validate state from localStorage; falls back to initialBoardState */
function loadState(): BoardState {
  if (typeof window === 'undefined') return initialBoardState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialBoardState;
    const parsed: unknown = JSON.parse(raw);
    return isValidPersistedState(parsed) ? parsed.data : initialBoardState;
  } catch {
    return initialBoardState;
  }
}

/**
 * Manages board state with automatic localStorage persistence.
 * - Loads initial state from localStorage (with version check + fallback)
 * - Saves state on every change using a structured { version, data } format
 */
export function useLocalStorageBoard() {
  // Lazy initializer so loadState runs only once on mount
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);

  // Serialize once — effect only re-runs when the serialized value actually changes
  const serialized = useMemo(
    () =>
      JSON.stringify({
        version: STORAGE_VERSION,
        data: state,
      } satisfies PersistedState),
    [state],
  );

  // Persist to localStorage only when serialized output changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Ignore write errors (e.g., quota exceeded or disabled storage)
    }
  }, [serialized]);

  return { state, dispatch };
}
