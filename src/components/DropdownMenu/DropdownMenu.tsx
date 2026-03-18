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

  useEffect(() => {
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
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.menu}
      ref={menuRef}
      role="menu"
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
