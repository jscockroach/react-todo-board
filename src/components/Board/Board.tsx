import React, { useRef } from 'react';
import { useBoardState } from '../../hooks/useBoardState';
import { Column } from '../Column/Column';
import { AddColumn } from '../AddColumn/AddColumn';
import { SearchBar } from '../SearchBar/SearchBar';
import { Filter } from '../Filter/Filter';
import { SelectionProvider } from '../../context/SelectionContext';
import { BulkActionBar } from '../BulkActionBar/BulkActionBar';
import { ConfirmModalProvider } from '../../context/ConfirmModalContext';
import { useDragScroll } from '../../hooks/useDragScroll';
import { useBoardDragMonitor } from './useBoardDragMonitor';
import styles from './Board.module.css';

export const Board: React.FC = () => {
  const { state, dispatch } = useBoardState();
  const columnsWrapperRef = useRef<HTMLDivElement>(null);

  useDragScroll(columnsWrapperRef);
  useBoardDragMonitor(state, dispatch);

  return (
    <ConfirmModalProvider>
      <SelectionProvider>
        <div className={styles.board}>
          <div className={styles.toolbar}>
            <SearchBar />
            <Filter />
          </div>
          <div
            className={styles.columnsWrapper}
            ref={columnsWrapperRef}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              if (
                !target.closest('input') &&
                !target.closest('textarea') &&
                !target.closest('button')
              ) {
                const active = document.activeElement as HTMLElement | null;
                active?.blur();
              }
            }}
          >
            <div className={styles.columns}>
              {state.columnOrder.map((columnId) => {
                const column = state.columns[columnId];
                if (!column) return null;
                const tasks = column.taskIds
                  .map((taskId) => state.tasks[taskId])
                  .filter(Boolean);
                return <Column key={columnId} column={column} tasks={tasks} />;
              })}
              <AddColumn />
            </div>
          </div>
          <BulkActionBar />
        </div>
      </SelectionProvider>
    </ConfirmModalProvider>
  );
};
