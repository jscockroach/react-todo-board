import { type ReactNode } from 'react';
import { useLocalStorageBoard } from '../hooks/useLocalStorageBoard';
import { BoardContext } from './BoardContextDef';

export { BoardContext, type BoardContextValue } from './BoardContextDef';

/** Provides board state and dispatch to the entire component tree */
export function BoardProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useLocalStorageBoard();

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
