
import { createContext, useReducer, useEffect, type ReactNode } from "react";
import { boardReducer, type BoardAction } from "../store/boardReducer";
import { initialBoardState } from "../store/initialBoardState";
import type { BoardState } from "../types/board";

const STORAGE_KEY = "react-todo-board";

function loadState(): BoardState {
    if (typeof window === "undefined") return initialBoardState;
  
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as BoardState) : initialBoardState;
    } catch {
      return initialBoardState;
    }
  }

export interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue | null>(null);

/** Provides board state and dispatch to the entire component tree */
export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}