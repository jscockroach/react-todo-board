import React, { useEffect, useRef } from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    previouslyFocusedElementRef.current =
      (document.activeElement as HTMLElement | null) || null;

    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }

    return () => {
      const el = previouslyFocusedElementRef.current;
      if (el && document.contains(el)) {
        el.focus();
      }
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-describedby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-modal-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
