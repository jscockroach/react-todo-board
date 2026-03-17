import { createContext } from 'react';
import type { FilterContextValue } from '../types/board';

export const FilterContext = createContext<FilterContextValue | null>(null);
