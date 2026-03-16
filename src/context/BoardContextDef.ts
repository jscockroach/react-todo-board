import { createContext, type Dispatch } from 'react';
import type { BoardAction } from '../store/boardReducer';
import type { BoardState } from '../types/board';

export interface BoardContextValue {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue | null>(null);
