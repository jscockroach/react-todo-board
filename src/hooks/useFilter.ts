import { useContext } from 'react';
import { FilterContext } from '../context/FilterContextDef';
import type { FilterContextValue } from '../types/board';

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
}
