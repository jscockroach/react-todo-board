
import type { BoardState } from "../types/board";

export const initialBoardState: BoardState = {
  tasks: {
    "task-1": { id: "task-1", title: "Set up project structure", completed: false },
    "task-2": { id: "task-2", title: "Design database schema", completed: false },
    "task-3": { id: "task-3", title: "Implement authentication", completed: false },
    "task-4": { id: "task-4", title: "Create API endpoints", completed: false },
    "task-5": { id: "task-5", title: "Write unit tests", completed: true },
    "task-6": { id: "task-6", title: "Configure CI/CD pipeline", completed: true },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "Todo",
      taskIds: ["task-1", "task-2"],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      taskIds: ["task-3", "task-4"],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: ["task-5", "task-6"],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};