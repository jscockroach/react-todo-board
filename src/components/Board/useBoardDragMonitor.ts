import { useEffect, useRef } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { isTaskDragData } from '../TaskCard/TaskCard';
import { isColumnDropData, isColumnDragData } from '../Column/Column';
import { moveMultipleTasks } from './moveMultipleTasks';
import type { BoardState } from '../../types/board';
import type { BoardAction } from '../../types/board';

/**
 * Registers a global drag-and-drop monitor for the board.
 *
 * Handles two kinds of drops:
 *  - Column → Column  : reorders columns
 *  - Task → Task/Column: moves one or many tasks to a new position
 *
 * Uses a ref for `state` so the monitor effect never needs to re-run
 * when state changes — avoiding monitor re-registration on every render.
 */
export function useBoardDragMonitor(
  state: BoardState,
  dispatch: React.Dispatch<BoardAction>,
) {
  // Always-fresh ref so the onDrop closure reads current state
  // without having it as an effect dependency.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    // monitorForElements listens to ALL drag events on the page.
    // Returns a cleanup function that unregisters the monitor.
    return monitorForElements({
      onDrop({ source, location }) {
        const targets = location.current.dropTargets;
        if (targets.length === 0) return;

        const sourceData = source.data as Record<string, unknown>;
        // targets[0] is the innermost drop target (task or column task-list)
        const innerData = targets[0].data as Record<string, unknown>;
        const currentState = stateRef.current;

        // ── Column reorder ──────────────────────────────────────────────────
        if (isColumnDragData(sourceData) && isColumnDragData(innerData)) {
          const sourceColumnId = sourceData.columnId as string;
          const targetColumnId = innerData.columnId as string;
          if (sourceColumnId === targetColumnId) return;

          const sourceIndex = currentState.columnOrder.indexOf(sourceColumnId);
          const destIndex = currentState.columnOrder.indexOf(targetColumnId);
          if (sourceIndex === -1 || destIndex === -1) return;

          dispatch({
            type: 'MOVE_COLUMN',
            payload: { sourceIndex, destIndex },
          });
          return;
        }

        // ── Task move ───────────────────────────────────────────────────────
        if (!isTaskDragData(sourceData)) return;

        const sourceColumnId = sourceData.columnId as string;

        // draggedTaskIds contains all selected task IDs when dragging a
        // selected task, or just [taskId] when dragging a single unselected one.
        const draggedTaskIds = Array.isArray(sourceData.draggedTaskIds)
          ? (sourceData.draggedTaskIds as string[])
          : [sourceData.taskId as string];

        if (isTaskDragData(innerData)) {
          // Dropped on top of another task — insert before/after it
          const targetTaskId = innerData.taskId as string;
          const targetColumnId = innerData.columnId as string;
          const destColumn = currentState.columns[targetColumnId];
          if (!destColumn) return;

          let destIndex = destColumn.taskIds.indexOf(targetTaskId);
          if (destIndex === -1) return;

          // closest edge tells us whether to insert before (top) or after (bottom)
          const edge = extractClosestEdge(
            innerData as unknown as Record<string | symbol, unknown>,
          );
          if (edge === 'bottom') destIndex += 1;

          moveMultipleTasks({
            draggedTaskIds,
            targetColumnId,
            destIndex,
            currentState,
            dispatch,
          });
        } else if (isColumnDropData(innerData)) {
          // Dropped on the empty area of a column — append to the end
          const targetColumnId = innerData.columnId as string;
          const destColumn = currentState.columns[targetColumnId];
          if (!destColumn) return;

          // No-op: single task dropped on its own column's empty area
          if (draggedTaskIds.length === 1 && sourceColumnId === targetColumnId)
            return;

          moveMultipleTasks({
            draggedTaskIds,
            targetColumnId,
            destIndex: destColumn.taskIds.length,
            currentState,
            dispatch,
          });
        }
      },
    });
  }, [dispatch]);
}
