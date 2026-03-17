import React, { useEffect, useRef } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useBoardState } from '../../hooks/useBoardState';
import { Column } from '../Column/Column';
import { AddColumn } from '../AddColumn/AddColumn';
import { isTaskDragData } from '../TaskCard/TaskCard';
import { isColumnDropData, isColumnDragData } from '../Column/Column';
import styles from './Board.module.css';

/** Top-level board component. Renders all columns and handles all task and column moves. */
export const Board: React.FC = () => {
  const { state, dispatch } = useBoardState();
  const stateRef = useRef(state);

  // Keep a ref to the latest board state so the drop handler always sees
  // up-to-date data without re-registering the monitor on each change.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const targets = location.current.dropTargets;
        if (targets.length === 0) return;

        const sourceData = source.data as Record<string, unknown>;
        const innerData = targets[0].data as Record<string, unknown>;
        const currentState = stateRef.current;

        // --- Column move ---
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

        // --- Task move --- //
        if (!isTaskDragData(sourceData)) return;

        const sourceTaskId = sourceData.taskId as string;
        const sourceColumnId = sourceData.columnId as string;
        const sourceColumn = currentState.columns[sourceColumnId];
        if (!sourceColumn) return;

        const sourceIndex = sourceColumn.taskIds.indexOf(sourceTaskId);
        if (sourceIndex === -1) return;

        if (isTaskDragData(innerData)) {
          const targetTaskId = innerData.taskId as string;
          const targetColumnId = innerData.columnId as string;
          const destColumn = currentState.columns[targetColumnId];
          if (!destColumn) return;

          let destIndex = destColumn.taskIds.indexOf(targetTaskId);
          if (destIndex === -1) return;

          // Adjust index based on which edge the task was dropped on
          const edge = extractClosestEdge(
            innerData as unknown as Record<string | symbol, unknown>,
          );
          if (edge === 'bottom') destIndex += 1;

          // Normalize for same-column: after removing source, indices shift
          if (sourceColumnId === targetColumnId) {
            if (sourceIndex === destIndex || sourceIndex === destIndex - 1)
              return;
            if (sourceIndex < destIndex) destIndex -= 1;
          }

          dispatch({
            type: 'MOVE_TASK',
            payload: {
              sourceColumnId,
              destColumnId: targetColumnId,
              sourceIndex,
              destIndex,
            },
          });
        } else if (isColumnDropData(innerData)) {
          const targetColumnId = innerData.columnId as string;
          if (sourceColumnId === targetColumnId) return;

          const destColumn = currentState.columns[targetColumnId];
          if (!destColumn) return;

          dispatch({
            type: 'MOVE_TASK',
            payload: {
              sourceColumnId,
              destColumnId: targetColumnId,
              sourceIndex,
              destIndex: destColumn.taskIds.length,
            },
          });
        }
      },
    });
  }, [dispatch]);

  return (
    <div className={styles.board}>
      {state.columnOrder.map((columnId) => {
        const column = state.columns[columnId];
        if (!column) {
          // Skip rendering if the column is missing from state (e.g. corrupted persisted state)
          return null;
        }
        const tasks = column.taskIds
          .map((taskId) => state.tasks[taskId])
          .filter(Boolean);
        return <Column key={columnId} column={column} tasks={tasks} />;
      })}
      <AddColumn />
    </div>
  );
};
