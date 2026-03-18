import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { isTaskDragData } from './TaskCard';
import type { TaskDragData } from './TaskCard';

interface UseTaskDragOptions {
  taskId: string;
  columnId: string;
  /** Whether this task is currently selected (part of a multi-select group). */
  selected: boolean;
  /** All currently selected task IDs — used to build draggedTaskIds on drag start. */
  selectedTaskIds: Set<string>;
}

interface UseTaskDragResult {
  /** Attach to the outer wrapper div — used as the drop target. */
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Attach to the card div — used as the draggable element and drag handle. */
  dragHandleRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  /** Edge ('top' | 'bottom') of the drop indicator, or null when not a target. */
  closestEdge: Edge | null;
  /** Portal container provided by setCustomNativeDragPreview, or null. */
  dragPreviewContainer: HTMLElement | null;
}

/**
 * Wires up Pragmatic DnD draggable + drop-target behaviour for a single task card.
 *
 * Drag data (`TaskDragData`) is computed lazily in `getInitialData` so it always
 * reflects the selection state at the moment the drag begins — without
 * needing to re-register the draggable whenever selection changes.
 * This is achieved by storing `selected` and `selectedTaskIds` in refs.
 *
 * Multi-select drag:
 *   - If the dragged card IS selected and there are multiple selected tasks,
 *     `draggedTaskIds` will contain all selected IDs.
 *   - Otherwise `draggedTaskIds` contains only this card's ID.
 */
export const useTaskDrag = ({
  taskId,
  columnId,
  selected,
  selectedTaskIds,
}: UseTaskDragOptions): UseTaskDragResult => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null);

  // Refs keep selection state fresh inside the draggable's getInitialData
  // callback without causing the drag effect to re-run on every selection change.
  const selectedRef = useRef(selected);
  const selectedTaskIdsRef = useRef(selectedTaskIds);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    selectedTaskIdsRef.current = selectedTaskIds;
  }, [selectedTaskIds]);

  // ── Draggable + drop target registration ──────────────────────────────
  // Re-runs only when taskId or columnId change (i.e. almost never).
  useEffect(() => {
    const el = wrapperRef.current;
    const dragEl = dragHandleRef.current;
    if (!el || !dragEl) return;

    const baseData = { type: 'task' as const, taskId, columnId };

    const cleanupDraggable = draggable({
      element: dragEl,
      getInitialData: () => {
        const isSelected = selectedRef.current;
        const ids = selectedTaskIdsRef.current;
        // Carry all selected IDs when dragging a selected card;
        // fall back to just this card when dragging an unselected one.
        const draggedTaskIds =
          isSelected && ids.size > 1 ? Array.from(ids) : [taskId];
        return { ...baseData, draggedTaskIds } satisfies TaskDragData as Record<
          string,
          unknown
        >;
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => {
        setIsDragging(false);
        setDragPreviewContainer(null);
      },
      onGenerateDragPreview({ nativeSetDragImage, source, location }) {
        // Keep the preview anchored to where the user grabbed the card.
        const rect = source.element.getBoundingClientRect();
        const offsetX = location.initial.input.clientX - rect.left;
        const offsetY = location.initial.input.clientY - rect.top;

        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset() {
            return { x: offsetX, y: offsetY };
          },
          render({ container }) {
            // Match the card's exact dimensions so the preview looks identical.
            container.style.width = `${rect.width}px`;
            container.style.height = `${rect.height}px`;
            setDragPreviewContainer(container);
          },
        });
      },
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      // Attach edge data so Board can determine insert position (top / bottom).
      getData: ({ input }) =>
        attachClosestEdge(
          { ...baseData, draggedTaskIds: [taskId] } as Record<string, unknown>,
          { input, element: dragEl, allowedEdges: ['top', 'bottom'] },
        ),
      // Prevent a card from becoming a drop target for itself.
      canDrop: ({ source }) =>
        isTaskDragData(source.data as Record<string, unknown>) &&
        source.data.taskId !== taskId,
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
  }, [taskId, columnId]);

  return {
    wrapperRef,
    dragHandleRef,
    isDragging,
    closestEdge,
    dragPreviewContainer,
  };
};
