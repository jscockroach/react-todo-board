import { createContext, type Dispatch } from 'react';
import type { BoardState, BoardAction } from '../types/board';

export interface BoardContextValue {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue | null>(null);
