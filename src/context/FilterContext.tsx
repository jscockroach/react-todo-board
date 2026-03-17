import { useState, useContext, type ReactNode } from 'react';
import type { FilterContextValue, StatusFilter } from '../types/board';
import { useDebounce } from '../hooks/useDebounce';
import { FilterContext } from './FilterContextDef';

export function FilterProvider({ children }: { children: ReactNode }) {
  const [rawQuery, setRawQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const searchQuery = useDebounce(rawQuery, 300);

  return (
    <FilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery: setRawQuery,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
}
