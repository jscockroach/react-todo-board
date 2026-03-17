/** Represents a single todo task */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

/** Represents a kanban column containing tasks */
export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

/** Represents the full board state */
export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

/** All possible actions that can be dispatched to the board reducer. */
export type BoardAction =
  | { type: 'ADD_TASK'; payload: { columnId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'TOGGLE_TASK'; payload: { taskId: string } }
  | { type: 'EDIT_TASK'; payload: { taskId: string; title: string } }
  | { type: 'ADD_COLUMN'; payload: { column: Column } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | {
      type: 'MOVE_TASK';
      payload: {
        sourceColumnId: string;
        destColumnId: string;
        sourceIndex: number;
        destIndex: number;
      };
    }
  | {
      type: 'MOVE_COLUMN';
      payload: { sourceIndex: number; destIndex: number };
    }
  | { type: 'DELETE_SELECTED'; payload: { taskIds: string[] } }
  | { type: 'MARK_SELECTED_COMPLETE'; payload: { taskIds: string[] } }
  | {
      type: 'MOVE_SELECTED';
      payload: { taskIds: string[]; toColumnId: string };
    };

export type StatusFilter = 'all' | 'active' | 'completed';

export interface FilterContextValue {
  rawSearchQuery: string;
  debouncedSearchQuery: string;
  setRawSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
}
