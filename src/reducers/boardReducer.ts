import type { BoardState, BoardAction } from '../types/board';

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'ADD_TASK': {
      const { columnId, task } = action.payload;
      const column = state.columns[columnId];
      if (!column) return state;
      return {
        ...state,
        tasks: { ...state.tasks, [task.id]: task },
        columns: {
          ...state.columns,
          [columnId]: {
            ...column,
            taskIds: [...column.taskIds, task.id],
          },
        },
      };
    }

    case 'DELETE_TASK': {
      const { taskId } = action.payload;
      const { [taskId]: _, ...remainingTasks } = state.tasks;
      return {
        ...state,
        tasks: remainingTasks,
        columns: Object.fromEntries(
          Object.entries(state.columns).map(([colId, col]) => [
            colId,
            { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) },
          ]),
        ),
      };
    }

    case 'TOGGLE_TASK': {
      const { taskId } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: { ...task, completed: !task.completed },
        },
      };
    }

    case 'EDIT_TASK': {
      const { taskId, title } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return state;
      return {
        ...state,
        tasks: { ...state.tasks, [taskId]: { ...task, title } },
      };
    }

    case 'ADD_COLUMN': {
      const { column } = action.payload;
      return {
        ...state,
        columns: { ...state.columns, [column.id]: column },
        columnOrder: [...state.columnOrder, column.id],
      };
    }

    case 'DELETE_COLUMN': {
      const { columnId } = action.payload;
      const column = state.columns[columnId];
      if (!column) return state;
      const { [columnId]: _, ...remainingColumns } = state.columns;
      const remainingTasks = Object.fromEntries(
        Object.entries(state.tasks).filter(
          ([taskId]) => !column.taskIds.includes(taskId),
        ),
      );
      return {
        ...state,
        tasks: remainingTasks,
        columns: remainingColumns,
        columnOrder: state.columnOrder.filter((id) => id !== columnId),
      };
    }

    case 'MOVE_TASK': {
      const { sourceColumnId, destColumnId, sourceIndex, destIndex } =
        action.payload;
      const sourceCol = state.columns[sourceColumnId];
      const destCol = state.columns[destColumnId];
      if (!sourceCol || !destCol) return state;

      const sourceTasks = [...sourceCol.taskIds];
      const sourceLength = sourceTasks.length;
      if (sourceIndex < 0 || sourceIndex >= sourceLength) {
        return state;
      }
      const [movedTaskId] = sourceTasks.splice(sourceIndex, 1);
      if (movedTaskId === undefined) {
        return state;
      }

      if (sourceColumnId === destColumnId) {
        const clampedDestIndex = Math.max(
          0,
          Math.min(destIndex, sourceTasks.length),
        );
        sourceTasks.splice(clampedDestIndex, 0, movedTaskId);
        return {
          ...state,
          columns: {
            ...state.columns,
            [sourceColumnId]: { ...sourceCol, taskIds: sourceTasks },
          },
        };
      }

      const destTasks = [...destCol.taskIds];
      const clampedDestIndex = Math.max(
        0,
        Math.min(destIndex, destTasks.length),
      );
      destTasks.splice(clampedDestIndex, 0, movedTaskId);
      return {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumnId]: { ...sourceCol, taskIds: sourceTasks },
          [destColumnId]: { ...destCol, taskIds: destTasks },
        },
      };
    }

    case 'MOVE_COLUMN': {
      const { sourceIndex, destIndex } = action.payload;
      const newOrder = [...state.columnOrder];
      const length = newOrder.length;
      if (sourceIndex < 0 || sourceIndex >= length) {
        return state;
      }
      const [moved] = newOrder.splice(sourceIndex, 1);
      if (moved === undefined) {
        return state;
      }
      const clampedDestIndex = Math.max(
        0,
        Math.min(destIndex, newOrder.length),
      );
      newOrder.splice(clampedDestIndex, 0, moved);
      return { ...state, columnOrder: newOrder };
    }

    case 'DELETE_SELECTED': {
      const ids = new Set(action.payload.taskIds);
      const newTasks = Object.fromEntries(
        Object.entries(state.tasks).filter(([id]) => !ids.has(id)),
      );
      const newColumns = Object.fromEntries(
        Object.entries(state.columns).map(([colId, col]) => [
          colId,
          { ...col, taskIds: col.taskIds.filter((id) => !ids.has(id)) },
        ]),
      );
      return { ...state, tasks: newTasks, columns: newColumns };
    }

    case 'MARK_SELECTED_COMPLETE': {
      const ids = new Set(action.payload.taskIds);
      const newTasks = Object.fromEntries(
        Object.entries(state.tasks).map(([id, task]) => [
          id,
          ids.has(id) ? { ...task, completed: true } : task,
        ]),
      );
      return { ...state, tasks: newTasks };
    }

    case 'MARK_SELECTED_ACTIVE': {
      const ids = new Set(action.payload.taskIds);
      const newTasks = Object.fromEntries(
        Object.entries(state.tasks).map(([id, task]) => [
          id,
          ids.has(id) ? { ...task, completed: false } : task,
        ]),
      );
      return { ...state, tasks: newTasks };
    }

    case 'MOVE_SELECTED': {
      const { taskIds, toColumnId } = action.payload;
      const ids = new Set(taskIds);
      const targetCol = state.columns[toColumnId];
      if (!targetCol) return state;

      // If all selected tasks are already in the target column,
      // avoid removing and re-appending them to prevent reordering.
      const targetTaskIds = new Set(targetCol.taskIds);
      const allInTarget = taskIds.every((id) => targetTaskIds.has(id));
      if (allInTarget) {
        return state;
      }

      const newColumns = Object.fromEntries(
        Object.entries(state.columns).map(([colId, col]) => [
          colId,
          { ...col, taskIds: col.taskIds.filter((id) => !ids.has(id)) },
        ]),
      );
      newColumns[toColumnId] = {
        ...newColumns[toColumnId],
        taskIds: [...newColumns[toColumnId].taskIds, ...taskIds],
      };
      return { ...state, columns: newColumns };
    }

    default:
      return state;
  }
};

export default boardReducer;
