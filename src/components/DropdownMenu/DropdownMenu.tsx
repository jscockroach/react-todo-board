import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './DropdownMenu.module.css';

export interface DropdownMenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onClose: () => void;
  position: { top: number; right: number };
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  onClose,
  position,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Remember the element that was focused before the menu opened.
    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    // Move focus into the menu (prefer the first menu item).
    if (menuRef.current) {
      const firstItem =
        menuRef.current.querySelector<HTMLElement>('button[role="menuitem"]') ??
        menuRef.current;
      firstItem.focus();
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element (typically the trigger).
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.menu}
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={{
        top: position.top,
        right: position.right,
        left: 'auto',
        position: 'fixed',
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          className={[styles.item, item.danger ? styles.danger : '']
            .filter(Boolean)
            .join(' ')}
          role="menuitem"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
};
