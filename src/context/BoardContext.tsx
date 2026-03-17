import { useReducer, useEffect, type ReactNode } from 'react';
import boardReducer from '../reducers/boardReducer';
import { initialBoardState } from '../store/initialBoardState';
import type { BoardState } from '../types/board';
import { BoardContext } from './BoardContextDef';

export { BoardContext, type BoardContextValue } from './BoardContextDef';

const STORAGE_KEY = 'react-todo-board';

function isValidBoardState(value: unknown): value is BoardState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    tasks?: unknown;
    columns?: unknown;
    columnOrder?: unknown;
  };

  if (!candidate.tasks || typeof candidate.tasks !== 'object') {
    return false;
  }

  if (!candidate.columns || typeof candidate.columns !== 'object') {
    return false;
  }

  if (!Array.isArray(candidate.columnOrder)) {
    return false;
  }

  return true;
}

function loadState(): BoardState {
  if (typeof window === 'undefined') return initialBoardState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialBoardState;
    }

    const parsed = JSON.parse(raw);
    return isValidBoardState(parsed) ? parsed : initialBoardState;
  } catch {
    return initialBoardState;
  }
}

/** Provides board state and dispatch to the entire component tree */
export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore write errors (e.g., quota exceeded or disabled storage) to keep UI functional
    }
  }, [state]);
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
