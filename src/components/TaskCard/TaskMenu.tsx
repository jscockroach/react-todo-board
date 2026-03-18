import React, { useRef, useState } from 'react';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import styles from './TaskCard.module.css';

interface TaskMenuProps {
  completed: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskMenu: React.FC<TaskMenuProps> = ({
  completed,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const items = [
    {
      label: completed ? 'Mark as active' : 'Mark as completed',
      icon: completed ? '↩' : '✓',
      onClick: onToggleComplete,
    },
    { label: 'Edit', icon: '✎', onClick: onEdit },
    { label: 'Delete', icon: '✕', danger: true, onClick: onDelete },
  ];

  return (
    <div className={styles.menuWrapper}>
      <button
        ref={btnRef}
        className={styles.menuBtn}
        aria-label="Task actions"
        aria-haspopup="menu"
        aria-expanded={position !== null}
        title="Task actions"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (position !== null) {
            setPosition(null);
            return;
          }
          const rect = btnRef.current!.getBoundingClientRect();
          setPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
          });
        }}
      >
        ···
      </button>
      {position !== null && (
        <DropdownMenu
          items={items}
          onClose={() => setPosition(null)}
          position={position}
        />
      )}
    </div>
  );
};
