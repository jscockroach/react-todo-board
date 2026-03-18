import React from 'react';
import { highlightText } from '../../utils/highlightText';
import { TaskMenu } from './TaskMenu';
import styles from './TaskCard.module.css';

interface TaskCardContentProps {
  taskId: string;
  title: string;
  completed: boolean;
  isEditing: boolean;
  editValue: string;
  selected: boolean;
  selectionMode: boolean;
  checkboxVisible: boolean;
  searchQuery: string;
  onEditChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onToggleSelection: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEditStart: () => void;
}

export const TaskCardContent: React.FC<TaskCardContentProps> = ({
  title,
  completed,
  isEditing,
  editValue,
  selected,
  selectionMode,
  checkboxVisible,
  searchQuery,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onToggleSelection,
  onToggleComplete,
  onDelete,
  onEditStart,
}) => (
  <>
    {/* Fixed-width checkbox container */}
    <div
      className={[
        styles.checkboxContainer,
        checkboxVisible ? styles.checkboxVisible : '',
      ].join(' ')}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelection}
        className={styles.selectionCheckbox}
        aria-label={`Select task "${title}"`}
        title={selectionMode ? 'Deselect task' : 'Select task'}
      />
    </div>

    {isEditing ? (
      <input
        autoFocus
        className={styles.editInput}
        value={editValue}
        onChange={(e) => onEditChange(e.target.value)}
        onBlur={onEditSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEditSubmit();
          if (e.key === 'Escape') onEditCancel();
        }}
        aria-label={`Edit title for task "${title}"`}
      />
    ) : (
      <span
        className={styles.title}
        title="Click to select"
        role="button"
        aria-pressed={completed}
        aria-label={
          completed
            ? `Mark task "${title}" as active`
            : `Mark task "${title}" as completed`
        }
        tabIndex={0}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEditStart();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleComplete();
          }
        }}
      >
        {highlightText(title, searchQuery).map((segment, index) =>
          segment.highlight ? (
            <mark key={index} className={styles.highlight}>
              {segment.text}
            </mark>
          ) : (
            <React.Fragment key={index}>{segment.text}</React.Fragment>
          ),
        )}
      </span>
    )}

    {!isEditing && (
      <TaskMenu
        completed={completed}
        onToggleComplete={onToggleComplete}
        onEdit={onEditStart}
        onDelete={onDelete}
      />
    )}
  </>
);
