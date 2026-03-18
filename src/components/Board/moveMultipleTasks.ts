import type { BoardState } from '../../types/board';
import type { BoardAction } from '../../types/board';

interface MoveMultipleTasksOptions {
  /** IDs of all tasks being dragged (1 for single drag, N for multi-select drag). */
  draggedTaskIds: string[];
  /** Column the tasks are being dropped into. */
  targetColumnId: string;
  /**
   * Index in the target column where the first task should land.
   * Subsequent tasks are inserted directly after it.
   */
  destIndex: number;
  /** Snapshot of board state at the moment of the drop. */
  currentState: BoardState;
  dispatch: React.Dispatch<BoardAction>;
}

/**
 * Moves one or more tasks to `targetColumnId` starting at `destIndex`.
 *
 * Because the reducer applies each MOVE_TASK action sequentially, we
 * maintain a **virtual** (in-memory) copy of every column's task list.
 * After each simulated move we read indices from the virtual state so
 * that subsequent dispatches always reference correct positions — even
 * when multiple tasks come from the same column.
 *
 * Tasks are inserted in their original relative order (sorted by their
 * current position before any moves begin).
 */
export function moveMultipleTasks({
  draggedTaskIds,
  targetColumnId,
  destIndex,
  currentState,
  dispatch,
}: MoveMultipleTasksOptions): void {
  // ── Build virtual snapshot ──────────────────────────────────────────────
  // This mirrors the reducer state after each successive dispatch.
  const virtual: Record<string, string[]> = {};
  for (const colId of Object.keys(currentState.columns)) {
    virtual[colId] = [...currentState.columns[colId].taskIds];
  }
  if (!virtual[targetColumnId]) return;

  // ── Build task position lookup ──────────────────────────────────────────
  // Maps each taskId to its current column and index within that column.
  const positionByTaskId: Record<string, { columnId: string; index: number }> =
    {};
  for (const [columnId, taskIds] of Object.entries(virtual)) {
    taskIds.forEach((taskId, index) => {
      positionByTaskId[taskId] = { columnId, index };
    });
  }

  // ── Sort tasks by current position ──────────────────────────────────────
  // Preserves relative visual order when tasks land at the destination.
  // Tasks from different columns are kept in draggedTaskIds order (stable).
  const ordered = [...draggedTaskIds].sort((a, b) => {
    const posA = positionByTaskId[a];
    const posB = positionByTaskId[b];

    if (!posA || !posB || posA.columnId !== posB.columnId) {
      // Different columns (or missing data): keep original order.
      return 0;
    }

    return posA.index - posB.index;
  });

  // Clamp so we never insert beyond the current length
  let insertAt = Math.min(destIndex, virtual[targetColumnId].length);

  // Helper to recompute positions for all tasks in a single column
  const updatePositions = (columnId: string): void => {
    const taskIds = virtual[columnId];
    if (!taskIds) return;
    for (let i = 0; i < taskIds.length; i += 1) {
      const id = taskIds[i];
      positionByTaskId[id] = { columnId, index: i };
    }
  };

  // ── Process each task ───────────────────────────────────────────────────
  for (const taskId of ordered) {
    const pos = positionByTaskId[taskId];
    if (!pos) continue;

    const taskSourceColId = pos.columnId;
    const srcIdx = pos.index;

    if (!virtual[taskSourceColId]) continue;
    if (srcIdx < 0 || srcIdx >= virtual[taskSourceColId].length) continue;

    // When the task is removed from the same column before the insert point,
    // the insert index shifts down by one.
    let adjustedInsert = insertAt;
    if (taskSourceColId === targetColumnId && srcIdx < adjustedInsert) {
      adjustedInsert -= 1;
    }

    // Skip no-op: task is already sitting at the target position
    if (taskSourceColId === targetColumnId && srcIdx === adjustedInsert) {
      insertAt = adjustedInsert + 1;
      continue;
    }

    // ── Apply to virtual state then dispatch ────────────────────────────
    // Virtual mutation must mirror exactly what the reducer will do so that
    // the next iteration reads the correct indices.
    virtual[taskSourceColId].splice(srcIdx, 1);
    virtual[targetColumnId].splice(adjustedInsert, 0, taskId);

    // Keep the task position lookup in sync with the virtual state.
    updatePositions(taskSourceColId);
    updatePositions(targetColumnId);

    dispatch({
      type: 'MOVE_TASK',
      payload: {
        sourceColumnId: taskSourceColId,
        destColumnId: targetColumnId,
        sourceIndex: srcIdx,
        destIndex: adjustedInsert,
      },
    });

    // Next task goes immediately after the one we just placed
    insertAt = adjustedInsert + 1;
  }
}
