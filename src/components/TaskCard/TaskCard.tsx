import React, { useEffect, useRef, useState } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { Task } from '../../types/board';
import { useBoardState } from '../../hooks/useBoardState';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    const dragEl = ref.current;
    if (!el || !dragEl) return;

    const dragData: TaskDragData = { type: 'task', taskId: task.id, columnId };

    const cleanupDraggable = draggable({
      element: dragEl,
      getInitialData: () => dragData as Record<string, unknown>,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: ({ input }) =>
        attachClosestEdge(dragData as Record<string, unknown>, {
          input,
          element: dragEl,
          allowedEdges: ['top', 'bottom'],
        }),
      canDrop: ({ source }) =>
        isTaskDragData(source.data as Record<string, unknown>) &&
        source.data.taskId !== task.id,
      onDragEnter({ self }) {
        setClosestEdge(extractClosestEdge(self.data));
      },
      onDrag({ self }) {
        setClosestEdge(extractClosestEdge(self.data));
      },
      onDragLeave() {
        setClosestEdge(null);
      },
      onDrop() {
        setClosestEdge(null);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [task.id, columnId]);

  const handleToggle = () =>
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
  const handleDelete = () =>
    dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });

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
        ref={ref}
        className={[
          styles.card,
          task.completed ? styles.completed : '',
          isDragging ? styles.dragging : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className={styles.checkbox}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />

        {isEditing ? (
          <input
            autoFocus
            className={styles.editInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSubmit();
              if (e.key === 'Escape') {
                setEditValue(task.title);
                setIsEditing(false);
              }
            }}
            aria-label={`Edit title for task "${task.title}"`}
          />
        ) : (
          <span
            className={styles.title}
            onDoubleClick={() => {
              if (task.completed) return;
              setEditValue(task.title);
              setIsEditing(true);
            }}
            title={task.completed ? undefined : 'Double-click to edit'}
            role={task.completed ? undefined : 'button'}
            tabIndex={task.completed ? -1 : 0}
            onKeyDown={(e) => {
              if (task.completed) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setEditValue(task.title);
                setIsEditing(true);
              }
            }}
          >
            {task.title}
          </span>
        )}

        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
