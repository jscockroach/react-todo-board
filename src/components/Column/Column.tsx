/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useBoardState } from '../../hooks/useBoardState';
import { TaskCard } from '../TaskCard/TaskCard';
import { isTaskDragData } from '../TaskCard/TaskCard';
import { AddTask } from '../AddTask/AddTask';
import type { Column as ColumnType, Task } from '../../types/board';
import styles from './Column.module.css';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

/** Data attached to a column's task-list drop target. */
export interface ColumnDropData {
  type: 'column-drop';
  columnId: string;
  [key: string]: unknown;
}

export const isColumnDropData = (
  data: Record<string, unknown>,
): data is ColumnDropData => data.type === 'column-drop';

/** Data attached to a dragged column element. */
export interface ColumnDragData {
  type: 'column';
  columnId: string;
  [key: string]: unknown;
}

export const isColumnDragData = (
  data: Record<string, unknown>,
): data is ColumnDragData => data.type === 'column';

/** Renders a single Kanban column with its tasks, drop zone, drag support, and controls. */
export const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const { dispatch } = useBoardState();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);
  const [isColumnDragging, setIsColumnDragging] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  /** Make the column draggable. */
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    const dragData: ColumnDragData = { type: 'column', columnId: column.id };

    return draggable({
      element: el,
      getInitialData: () =>
        dragData as unknown as Record<string | symbol, unknown>,
      onDragStart: () => setIsColumnDragging(true),
      onDrop: () => setIsColumnDragging(false),
    });
  }, [column.id]);

  /** Make the column a drop target for other columns. */
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    const dropData: ColumnDragData = { type: 'column', columnId: column.id };

    return dropTargetForElements({
      element: el,
      getData: () => dropData as unknown as Record<string | symbol, unknown>,
      canDrop: ({ source }) =>
        isColumnDragData(source.data as Record<string, unknown>) &&
        source.data.columnId !== column.id,
      onDragEnter: () => setIsColumnDragOver(true),
      onDragLeave: () => setIsColumnDragOver(false),
      onDrop: () => setIsColumnDragOver(false),
    });
  }, [column.id]);

  /** Register task list as a drop target carrying columnId data. */
  useEffect(() => {
    const el = taskListRef.current;
    if (!el) return;

    const dropData: ColumnDropData = {
      type: 'column-drop',
      columnId: column.id,
    };

    return dropTargetForElements({
      element: el,
      getData: () => dropData as unknown as Record<string | symbol, unknown>,
      canDrop: ({ source }) =>
        isTaskDragData(source.data as Record<string, unknown>),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [column.id]);

  const handleDeleteColumn = () => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId: column.id } });
  };

  return (
    <div
      ref={columnRef}
      className={[
        styles.column,
        isColumnDragging ? styles.dragging : '',
        isColumnDragOver ? styles.columnDragOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <button
          className={styles.deleteBtn}
          onClick={handleDeleteColumn}
          aria-label={`Delete column ${column.title}`}
          title="Delete column"
        >
          ✕
        </button>
      </div>

      <div
        ref={taskListRef}
        className={[styles.taskList, isDragOver ? styles.dragOver : '']
          .filter(Boolean)
          .join(' ')}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>

      <AddTask columnId={column.id} />
    </div>
  );
};
