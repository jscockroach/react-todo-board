import { useState, useMemo, type ReactNode } from 'react';
import type { StatusFilter } from '../types/board';
import { useDebounce } from '../hooks/useDebounce';
import { FilterContext } from './FilterContextDef';

export function FilterProvider({ children }: { children: ReactNode }) {
  const [rawQuery, setRawQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const debouncedSearchQuery = useDebounce(rawQuery, 300);

  const value = useMemo(
    () => ({
      rawSearchQuery: rawQuery,
      debouncedSearchQuery,
      setRawSearchQuery: setRawQuery,
      statusFilter,
      setStatusFilter,
    }),
    [rawQuery, debouncedSearchQuery, statusFilter],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}
