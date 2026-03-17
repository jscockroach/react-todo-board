import React from 'react';
import { useFilter } from '../../hooks/useFilter';
import styles from './SearchBar.module.css';

export const SearchBar: React.FC = () => {
  const { rawSearchQuery, setRawSearchQuery } = useFilter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setRawSearchQuery('');
  };

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search tasks…"
        value={rawSearchQuery}
        onChange={handleChange}
        aria-label="Search tasks"
      />
      {rawSearchQuery && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};
