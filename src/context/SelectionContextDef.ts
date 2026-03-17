import { createContext } from 'react';

export interface SelectionContextValue {
  selectedTaskIds: Set<string>;
  toggleTaskSelection: (taskId: string) => void;
  selectTasks: (taskIds: string[]) => void;
  deselectTasks: (taskIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (taskId: string) => boolean;
}

export const SelectionContext = createContext<SelectionContextValue | null>(
  null,
);
