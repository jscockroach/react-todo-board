import { useContext } from 'react';
import {
  SelectionContext,
  type SelectionContextValue,
} from '../context/SelectionContextDef';

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx)
    throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
