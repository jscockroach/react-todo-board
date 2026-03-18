import { createPortal } from 'react-dom';
import styles from './TaskCard.module.css';

interface TaskDragPreviewProps {
  container: HTMLElement;
  title: string;
}

export const TaskDragPreview: React.FC<TaskDragPreviewProps> = ({
  container,
  title,
}) =>
  createPortal(<div className={styles.dragPreview}>{title}</div>, container);
