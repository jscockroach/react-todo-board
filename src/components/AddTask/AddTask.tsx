import React, { useState } from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import styles from './AddTask.module.css';

interface AddTaskProps {
  columnId: string;
}

/** Inline form that adds a new task to the specified column. */
export const AddTask: React.FC<AddTaskProps> = ({ columnId }) => {
  const { dispatch } = useBoardState();
  const [title, setTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const newTask = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Date.now().toString(),
      title: trimmed,
      completed: false,
    };
    dispatch({ type: 'ADD_TASK', payload: { columnId, task: newTask } });
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className={styles.addBtn} onClick={() => setIsOpen(true)}>
        + Add task
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        autoFocus
        className={styles.input}
        type="text"
        placeholder="Task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
      <div className={styles.actions}>
        <button type="submit" className={styles.confirmBtn}>
          Add
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
