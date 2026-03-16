import React from 'react';
import type { Task } from '../../types/board';
import { useBoardState } from '../../hooks/useBoardState';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

/** Renders a single task card with toggle and delete controls. */
export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { dispatch } = useBoardState();

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });
  };

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className={styles.checkbox}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <span className={styles.title}>{task.title}</span>
      </label>
      <button
        className={styles.deleteBtn}
        onClick={handleDelete}
        aria-label={`Delete task "${task.title}"`}
        title="Delete task"
      >
        ✕
      </button>
    </div>
  );
};
