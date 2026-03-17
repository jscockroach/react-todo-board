import React, { useCallback, useState } from 'react';
import { SelectionContext } from './SelectionContextDef';

export {
  SelectionContext,
  type SelectionContextValue,
} from './SelectionContextDef';

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const selectTasks = useCallback((taskIds: string[]) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      taskIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectTasks = useCallback((taskIds: string[]) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      taskIds.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedTaskIds(new Set()), []);

  const isSelected = useCallback(
    (taskId: string) => selectedTaskIds.has(taskId),
    [selectedTaskIds],
  );

  return (
    <SelectionContext.Provider
      value={{
        selectedTaskIds,
        toggleTaskSelection,
        selectTasks,
        deselectTasks,
        clearSelection,
        isSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};
