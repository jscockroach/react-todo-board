import type { BoardState, Task, Column } from "../types/board";

export type BoardAction =
  | { type: "ADD_TASK"; payload: { columnId: string; task: Task } }
  | { type: "DELETE_TASK"; payload: { taskId: string } }
  | { type: "TOGGLE_TASK"; payload: { taskId: string } }
  | { type: "EDIT_TASK"; payload: { taskId: string; title: string } }
  | { type: "ADD_COLUMN"; payload: { column: Column } }
  | { type: "DELETE_COLUMN"; payload: { columnId: string } }
  | {
      type: "MOVE_TASK";
      payload: {
        sourceColumnId: string;
        destColumnId: string;
        sourceIndex: number;
        destIndex: number;
      };
    }
  | { type: "MOVE_COLUMN"; payload: { sourceIndex: number; destIndex: number } };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "ADD_TASK": {
      const { columnId, task } = action.payload;
      const column = state.columns[columnId];
      if (!column) {
        return state;
      }
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

    case "DELETE_TASK": {
      const { taskId } = action.payload;
      // Find the column that contains this task
      const column = Object.values(state.columns).find((col) =>
        col.taskIds.includes(taskId)
      );
      if (!column) return state;

      const { [taskId]: _, ...remainingTasks } = state.tasks;
      return {
        ...state,
        tasks: remainingTasks,
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        },
      };
    }

    case "TOGGLE_TASK": {
      const { taskId } = action.payload;
      const task = state.tasks[taskId];
      if (!task) {
        // Task does not exist; no state change
        return state;
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            completed: !task.completed,
          },
        },
      };
    }

    case "EDIT_TASK": {
      const { taskId, title } = action.payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: { ...state.tasks[taskId], title },
        },
      };
    }

    case "ADD_COLUMN": {
      const { column } = action.payload;
      return {
        ...state,
        columns: { ...state.columns, [column.id]: column },
        columnOrder: [...state.columnOrder, column.id],
      };
    }

    case "DELETE_COLUMN": {
      const { columnId } = action.payload;
      // Remove all tasks belonging to this column
      const taskIdsToRemove = new Set(state.columns[columnId]?.taskIds ?? []);
      const remainingTasks = Object.fromEntries(
        Object.entries(state.tasks).filter(([id]) => !taskIdsToRemove.has(id))
      );
      const { [columnId]: _, ...remainingColumns } = state.columns;
      return {
        ...state,
        tasks: remainingTasks,
        columns: remainingColumns,
        columnOrder: state.columnOrder.filter((id) => id !== columnId),
      };
    }

    case "MOVE_TASK": {
      const { sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
      const sourceTaskIds = [...state.columns[sourceColumnId].taskIds];

      // Guard against invalid index
      const movedTaskId = sourceTaskIds[sourceIndex];
      if (!movedTaskId) return state;
      sourceTaskIds.splice(sourceIndex, 1);

      if (sourceColumnId === destColumnId) {
        sourceTaskIds.splice(destIndex, 0, movedTaskId);
        return {
          ...state,
          columns: {
            ...state.columns,
            [sourceColumnId]: { ...state.columns[sourceColumnId], taskIds: sourceTaskIds },
          },
        };
      }

      const destTaskIds = [...state.columns[destColumnId].taskIds];
      destTaskIds.splice(destIndex, 0, movedTaskId);
      return {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumnId]: { ...state.columns[sourceColumnId], taskIds: sourceTaskIds },
          [destColumnId]: { ...state.columns[destColumnId], taskIds: destTaskIds },
        },
      };
    }

    case "MOVE_COLUMN": {
      const { sourceIndex, destIndex } = action.payload;
      const newOrder = [...state.columnOrder];
      const [movedColumnId] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(destIndex, 0, movedColumnId);
      return { ...state, columnOrder: newOrder };
    }

    default:
      return state;
  }
}
