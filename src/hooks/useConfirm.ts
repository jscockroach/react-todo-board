import { useContext } from 'react';
import { ConfirmModalContext } from '../context/ConfirmModalContextDef';
import type { ConfirmModalContextValue } from '../types/board';

export const useConfirm = (): ConfirmModalContextValue => {
  const ctx = useContext(ConfirmModalContext);
  if (!ctx)
    throw new Error('useConfirm must be used within ConfirmModalProvider');
  return ctx;
};
