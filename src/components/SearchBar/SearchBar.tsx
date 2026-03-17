import React, { useState } from 'react';
import { useFilter } from '../../context/FilterContext';
import styles from './SearchBar.module.css';

export const SearchBar: React.FC = () => {
  const { setSearchQuery } = useFilter();
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search tasks…"
        value={inputValue}
        onChange={handleChange}
        aria-label="Search tasks"
      />
      {inputValue && (
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
