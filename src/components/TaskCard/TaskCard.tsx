import React, { useState, useRef, useEffect } from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import type { Task } from '../../types/board';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  /** The task data to display. */
  task: Task;
}

/** Renders a single task card with toggle, inline-edit, and delete controls. */
export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { dispatch } = useBoardState();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever editing mode is activated
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
  };

  const handleDelete = () => {
    dispatch({
      type: 'DELETE_TASK',
      payload: { taskId: task.id },
    });
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) {
      dispatch({
        type: 'EDIT_TASK',
        payload: { taskId: task.id, title: trimmed },
      });
    } else {
      // Revert draft if empty or unchanged
      setDraft(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setDraft(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      {/* Completion toggle */}
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.completed}
        onChange={handleToggle}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Title / inline editor */}
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.editInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          aria-label="Edit task title"
        />
      ) : (
        <span
          className={styles.title}
          onDoubleClick={() => {
            setDraft(task.title);
            setIsEditing(true);
          }}
          title="Double-click to edit"
        >
          {task.title}
        </span>
      )}

      {/* Delete button */}
      <button
        className={styles.deleteBtn}
        onClick={handleDelete}
        aria-label={`Delete task "${task.title}"`}
      >
        ✕
      </button>
    </div>
  );
};
