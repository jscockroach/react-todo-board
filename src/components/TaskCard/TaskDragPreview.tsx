import { createPortal } from 'react-dom';
import styles from './TaskCard.module.css';

interface TaskDragPreviewProps {
  /** Portal container provided by setCustomNativeDragPreview. */
  container: HTMLElement;
  /** Task title shown when dragging a single card. */
  title: string;
  /**
   * Number of tasks being dragged.
   * When > 1 a badge is shown instead of the title (e.g. "3 tasks").
   */
  count?: number;
}

/**
 * Custom native drag preview rendered into the browser's drag image layer.
 *
 * Portals into `container` which is sized to match the original card
 * (see `useTaskDrag` → `render`), so the preview looks identical to the card.
 */
export const TaskDragPreview: React.FC<TaskDragPreviewProps> = ({
  container,
  title,
  count = 1,
}) =>
  createPortal(
    <div className={styles.dragPreview}>
      {count > 1 ? (
        <>
          <span className={styles.dragPreviewCount}>{count}</span>
          {' tasks'}
        </>
      ) : (
        title
      )}
    </div>,
    container,
  );
