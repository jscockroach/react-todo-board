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
