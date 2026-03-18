/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import { useSelection } from '../../hooks/useSelection';
import { useConfirm } from '../../hooks/useConfirm';
import { useFilter } from '../../hooks/useFilter';
import { useTaskDrag } from './useTaskDrag';
import { TaskDragPreview } from './TaskDragPreview';
import { TaskCardContent } from './TaskCardContent';

import type { Task } from '../../types/board';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  columnId: string;
}

/** Data attached to a dragged task element. */
export interface TaskDragData {
  type: 'task';
  taskId: string;
  columnId: string;
  [key: string]: unknown;
}

export const isTaskDragData = (
  data: Record<string, unknown>,
): data is TaskDragData => data.type === 'task';

/** Renders a single task card with inline editing, completion toggle, delete, and drag support. */
export const TaskCard: React.FC<TaskCardProps> = ({ task, columnId }) => {
  const { dispatch } = useBoardState();
  const { toggleTaskSelection, isSelected, selectedTaskIds } = useSelection();
  const { confirm } = useConfirm();
  const { debouncedSearchQuery: rawSearchQuery } = useFilter();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const {
    wrapperRef,
    dragHandleRef,
    isDragging,
    closestEdge,
    dragPreviewContainer,
  } = useTaskDrag({ taskId: task.id, columnId });

  const selected = isSelected(task.id);
  const selectionMode = selectedTaskIds.size > 0;

  const handleDelete = async () => {
    const ok = await confirm({ message: `Delete task "${task.title}"?` });
    if (!ok) return;
    dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      dispatch({
        type: 'EDIT_TASK',
        payload: { taskId: task.id, title: trimmed },
      });
    } else {
      setEditValue(task.title);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  const handleEditStart = () => {
    setEditValue(task.title);
    setIsEditing(true);
  };

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('input') ||
      target.closest('button') ||
      target.closest(`.${styles.menuWrapper}`) ||
      isEditing
    )
      return;
    toggleTaskSelection(task.id);
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {closestEdge && (
        <div
          className={[
            styles.dropIndicator,
            closestEdge === 'top' ? styles.top : styles.bottom,
          ].join(' ')}
        />
      )}
      <div
        ref={dragHandleRef}
        className={[
          styles.card,
          task.completed ? styles.completed : '',
          isDragging ? styles.dragging : '',
          selected ? styles.selected : '',
          selectionMode ? styles.selectionMode : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleCardClick}
      >
        <TaskCardContent
          taskId={task.id}
          title={task.title}
          completed={task.completed}
          isEditing={isEditing}
          editValue={editValue}
          selected={selected}
          selectionMode={selectionMode}
          checkboxVisible={selectionMode}
          searchQuery={rawSearchQuery}
          onEditChange={setEditValue}
          onEditSubmit={handleEditSubmit}
          onEditCancel={handleEditCancel}
          onToggleSelection={() => toggleTaskSelection(task.id)}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onEditStart={handleEditStart}
        />
      </div>

      {dragPreviewContainer && (
        <TaskDragPreview container={dragPreviewContainer} title={task.title} />
      )}
    </div>
  );
};
