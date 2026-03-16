import React from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import { Column } from '../Column/Column';
import { AddColumn } from '../AddColumn/AddColumn';
import styles from './Board.module.css';

/** Renders the full Kanban board: all columns + add-column control. */
export const Board: React.FC = () => {
  const { state } = useBoardState();
  const { columnOrder, columns, tasks } = state;

  return (
    <div className={styles.board}>
      {columnOrder.map((columnId) => {
        const column = columns[columnId];
        // Skip columns that are missing from state (e.g., due to malformed persisted data)
        if (!column) {
          return null;
        }
        const columnTasks = column.taskIds
          .map((tid) => tasks[tid])
          .filter(Boolean);
        return <Column key={column.id} column={column} tasks={columnTasks} />;
      })}
      <AddColumn />
    </div>
  );
};
