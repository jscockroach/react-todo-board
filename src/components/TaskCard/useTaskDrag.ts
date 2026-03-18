import { useEffect, useRef, useState } from 'react';
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
}

interface UseTaskDragResult {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  dragHandleRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  closestEdge: Edge | null;
  dragPreviewContainer: HTMLElement | null;
}

export const useTaskDrag = ({
  taskId,
  columnId,
}: UseTaskDragOptions): UseTaskDragResult => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    const dragEl = dragHandleRef.current;
    if (!el || !dragEl) return;

    const dragData: TaskDragData = { type: 'task', taskId, columnId };

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
        const offsetX = location.initial.input.clientX - rect.left;
        const offsetY = location.initial.input.clientY - rect.top;

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
