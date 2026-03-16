import React, { useState } from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import styles from './AddColumn.module.css';

/** Renders a button/form to add a new column to the board. */
export const AddColumn: React.FC = () => {
  const { dispatch } = useBoardState();
  const [title, setTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const newColumn = {
      id: crypto.randomUUID(),
      title: trimmed,
      taskIds: [],
    };
    dispatch({ type: 'ADD_COLUMN', payload: { column: newColumn } });
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className={styles.addBtn} onClick={() => setIsOpen(true)}>
        + Add column
      </button>
    );
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          autoFocus
          className={styles.input}
          type="text"
          placeholder="Column title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.confirmBtn}>
            Add column
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
    </div>
  );
};
