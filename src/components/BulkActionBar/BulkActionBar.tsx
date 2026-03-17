import React from 'react';
import { useSelection } from '../../hooks/useSelection';
import { useBoardState } from '../../hooks/useBoardState';
import styles from './BulkActionBar.module.css';

export const BulkActionBar: React.FC = () => {
  const { selectedTaskIds, clearSelection } = useSelection();
  const { state, dispatch } = useBoardState();

  const count = selectedTaskIds.size;
  const visible = count > 0;

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedTaskIds);
    dispatch({ type: 'DELETE_SELECTED', payload: { taskIds: ids } });
    clearSelection();
  };

  const handleMarkComplete = () => {
    const ids = Array.from(selectedTaskIds);
    dispatch({ type: 'MARK_SELECTED_COMPLETE', payload: { taskIds: ids } });
    clearSelection();
  };

  const handleMoveTo = (toColumnId: string) => {
    const ids = Array.from(selectedTaskIds);
    dispatch({ type: 'MOVE_SELECTED', payload: { taskIds: ids, toColumnId } });
    clearSelection();
  };

  return (
    <div
      className={[styles.bar, visible ? styles.visible : styles.hidden].join(
        ' ',
      )}
      role="toolbar"
      aria-label="Bulk actions"
      aria-hidden={!visible}
    >
      <span className={styles.count}>
        {count} task{count !== 1 ? 's' : ''} selected
      </span>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={handleMarkComplete}
          title="Mark all selected as complete"
        >
          ✔ Mark Complete
        </button>

        <div className={styles.moveWrapper}>
          <label htmlFor="bulk-move-select" className={styles.moveLabel}>
            Move to:
          </label>
          <select
            id="bulk-move-select"
            className={styles.moveSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleMoveTo(e.target.value);
              e.target.value = '';
            }}
          >
            <option value="" disabled>
              Column…
            </option>
            {state.columnOrder.map((colId) => (
              <option key={colId} value={colId}>
                {state.columns[colId].title}
              </option>
            ))}
          </select>
        </div>

        <button
          className={[styles.actionBtn, styles.danger].join(' ')}
          onClick={handleDeleteSelected}
          title="Delete all selected tasks"
        >
          🗑 Delete
        </button>

        <button
          className={styles.clearBtn}
          onClick={clearSelection}
          title="Clear selection"
          aria-label="Clear selection"
        >
          ✕ Deselect all
        </button>
      </div>
    </div>
  );
};
