import React from 'react';
import type { StatusFilter } from '../../types/board';
import { useFilter } from '../../hooks/useFilter';
import styles from './Filter.module.css';

const OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export const Filter: React.FC = () => {
  const { statusFilter, setStatusFilter } = useFilter();

  return (
    <div
      className={styles.filter}
      role="group"
      aria-label="Filter tasks by status"
    >
      {OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          className={`${styles.button} ${statusFilter === value ? styles.active : ''}`}
          onClick={() => setStatusFilter(value)}
          aria-pressed={statusFilter === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
