import React from 'react';
import type { Column as ColumnType, Task } from '../../types/board';
import { useBoardState } from '../../hooks/useBoardState';
import { TaskCard } from '../TaskCard/TaskCard';
import { AddTask } from '../AddTask/AddTask';
import styles from './Column.module.css';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

/** Renders a single Kanban column with its tasks and controls. */
export const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const { dispatch } = useBoardState();

  const handleDeleteColumn = () => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId: column.id } });
  };

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <button
          className={styles.deleteBtn}
          onClick={handleDeleteColumn}
          aria-label={`Delete column ${column.title}`}
          title="Delete column"
        >
          ✕
        </button>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <AddTask columnId={column.id} />
    </div>
  );
};
