
import { useContext } from "react";
import { BoardContext, type BoardContextValue } from "../context/BoardContext";

/**
 * Returns board state and dispatch from the nearest BoardProvider.
 * Throws if used outside of BoardProvider.
 */
export function useBoardState(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardState must be used within a BoardProvider");
  }
  return context;
}