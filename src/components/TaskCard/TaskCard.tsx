/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useBoardState } from '../../hooks/useBoardState';
import { useSelection } from '../../hooks/useSelection';
import { useConfirm } from '../../hooks/useConfirm';
import { useFilter } from '../../hooks/useFilter';
import { highlightText } from '../../utils/highlightText';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
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

// Global Ctrl/Cmd tracking shared across all TaskCard instances to avoid
// registering duplicate window listeners per card.
let globalIsCtrlMetaPressed = false;
const ctrlMetaSubscribers = new Set<(pressed: boolean) => void>();
let ctrlMetaListenersAttached = false;

const notifyCtrlMetaSubscribers = (pressed: boolean) => {
  if (globalIsCtrlMetaPressed === pressed) {
    return;
  }
  globalIsCtrlMetaPressed = pressed;
  ctrlMetaSubscribers.forEach((callback) => {
    callback(pressed);
  });
};

const handleCtrlMetaKey = (event: KeyboardEvent) => {
  // Use the event's modifier flags so we correctly detect both Ctrl (Windows/Linux)
  // and Cmd/Meta (macOS).
  const pressed = event.ctrlKey || event.metaKey;
  notifyCtrlMetaSubscribers(pressed);
};

const ensureCtrlMetaListeners = () => {
  if (ctrlMetaListenersAttached) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  window.addEventListener('keydown', handleCtrlMetaKey);
  window.addEventListener('keyup', handleCtrlMetaKey);
  ctrlMetaListenersAttached = true;
};

const teardownCtrlMetaListenersIfUnused = () => {
  if (!ctrlMetaListenersAttached) {
    return;
  }
  if (ctrlMetaSubscribers.size > 0) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  window.removeEventListener('keydown', handleCtrlMetaKey);
  window.removeEventListener('keyup', handleCtrlMetaKey);
  ctrlMetaListenersAttached = false;
};

const subscribeToCtrlMeta = (callback: (pressed: boolean) => void) => {
  ctrlMetaSubscribers.add(callback);
  // Immediately sync with current global state.
  callback(globalIsCtrlMetaPressed);
  ensureCtrlMetaListeners();
  return () => {
    ctrlMetaSubscribers.delete(callback);
    teardownCtrlMetaListenersIfUnused();
  };
};

const useGlobalCtrlMetaPressed = (): boolean => {
  const [pressed, setPressed] = useState<boolean>(globalIsCtrlMetaPressed);

  useEffect(() => {
    const unsubscribe = subscribeToCtrlMeta(setPressed);
    return () => {
      unsubscribe();
    };
  }, []);

  return pressed;
};

/** Renders a single task card with inline editing, completion toggle, delete, and drag support. */
export const TaskCard: React.FC<TaskCardProps> = ({ task, columnId }) => {
  const { dispatch } = useBoardState();
  const { toggleTaskSelection, isSelected, selectedTaskIds } = useSelection();
  const { confirm } = useConfirm();
  // Read the live search query so we can highlight matches in the title.
  const { rawSearchQuery } = useFilter();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCtrlPressed = useGlobalCtrlMetaPressed();

  const selected = isSelected(task.id);
  const selectionMode = selectedTaskIds.size > 0;
  const checkboxVisible = selectionMode || (isHovered && isCtrlPressed);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    const el = wrapperRef.current;
    const dragEl = ref.current;
    if (!el || !dragEl) return;

    const dragData: TaskDragData = { type: 'task', taskId: task.id, columnId };

    const cleanupDraggable = draggable({
      element: dragEl,
      getInitialData: () => dragData as Record<string, unknown>,
      onDragStart: () => setIsDragging(true),
      onDrop: () => {
        setIsDragging(false);
        setDragPreviewContainer(null);
      },
      onGenerateDragPreview({ nativeSetDragImage, source, location }) {
        const rect = source.element.getBoundingClientRect();
        const mouseX = location.initial.input.clientX;
        const mouseY = location.initial.input.clientY;
        const offsetX = mouseX - rect.left;
        const offsetY = mouseY - rect.top;

        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset() {
            return { x: offsetX, y: offsetY };
          },
          render({ container }) {
            container.style.width = `${rect.width}px`;
            container.style.height = `${rect.height}px`;
            setDragPreviewContainer(container);
          },
        });
      },
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

  const handleDelete = async () => {
    const ok = await confirm({
      message: `Delete task "${task.title}"?`,
    });
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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // If clicked on title, editInput, button or checkbox — don't handle here
    if (
      target.closest('input') ||
      target.closest('button') ||
      target.closest(`.${styles.title}`) ||
      isEditing
    )
      return;

    // Click on card background/padding → toggle selection
    toggleTaskSelection(task.id);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;

    if (e.ctrlKey || e.metaKey) {
      toggleTaskSelection(task.id);
      return;
    }

    // When selection mode is active, title clicks should manage selection,
    // not toggle completion.
    if (selectedTaskIds.size > 0) {
      toggleTaskSelection(task.id);
      return;
    }

    // Delay single-click action to wait and see if dblclick follows
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
    }, 220);
  };

  const handleTitleDoubleClick = () => {
    // Cancel pending single-click toggle
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    setEditValue(task.title);
    setIsEditing(true);
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

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
          selected ? styles.selected : '',
          selectionMode ? styles.selectionMode : '',
          isHovered && isCtrlPressed && !selectionMode ? styles.ctrlHint : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fixed-width checkbox container — always reserves space, visibility via opacity */}
        <div
          className={[
            styles.checkboxContainer,
            checkboxVisible ? styles.checkboxVisible : '',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* prevent card click when clicking container */}
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleTaskSelection(task.id)}
            className={styles.selectionCheckbox}
            aria-label={`Select task "${task.title}"`}
            title={
              selectionMode ? 'Deselect task' : 'Select task (or Ctrl+click)'
            }
          />
        </div>

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
            onClick={handleTitleClick}
            onDoubleClick={handleTitleDoubleClick}
            title={
              task.completed
                ? 'Click to mark active · Double-click to edit'
                : 'Click to complete · Double-click to edit'
            }
            role="button"
            aria-pressed={task.completed}
            aria-label={
              task.completed
                ? `Mark task "${task.title}" as active`
                : `Mark task "${task.title}" as completed`
            }
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch({ type: 'TOGGLE_TASK', payload: { taskId: task.id } });
              }
            }}
          >
            {/*
             * Render the title split into highlighted / un-highlighted segments.
             * highlightText() returns [{text, highlight}, …] — matched segments
             * are wrapped in <mark> so they receive accent styling; unmatched
             * segments are rendered as plain text nodes.
             * When there is no active search query the function returns a single
             * un-highlighted segment, keeping the output identical to before.
             */}
            {highlightText(task.title, rawSearchQuery).map((segment, index) =>
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

        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          ✕
        </button>
      </div>

      {dragPreviewContainer &&
        createPortal(
          <div className={styles.dragPreview}>{task.title}</div>,
          dragPreviewContainer,
        )}
    </div>
  );
};
