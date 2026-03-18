import React, { useCallback, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { ConfirmModalContext } from './ConfirmModalContextDef';
import type { ConfirmOptions } from '../types/board';

export const ConfirmModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<{
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    ({ message }: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState((prev) => {
          // If there is an existing pending confirmation, resolve it as cancelled
          if (prev) {
            prev.resolve(false);
          }
          return { message, resolve };
        });
      });
    },
    [],
  );

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  return (
    <ConfirmModalContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmModal
          message={state.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmModalContext.Provider>
  );
};
