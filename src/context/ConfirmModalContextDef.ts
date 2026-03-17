import { createContext } from 'react';
import type { ConfirmModalContextValue } from '../types/board';

export const ConfirmModalContext =
  createContext<ConfirmModalContextValue | null>(null);
