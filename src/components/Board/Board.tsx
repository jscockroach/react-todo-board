
import React from "react";
import { useBoardState } from "../../hooks/useBoardState";
import { Column } from "../Column/Column";
import { AddColumn } from "../AddColumn/AddColumn";
import styles from "./Board.module.css";

/** Renders the full Kanban board: all columns + add-column control. */
export const Board: React.FC = () => {
  const { state } = useBoardState();
  const { columnOrder, columns, tasks } = state;

  return (
    <div className={styles.board}>
      {columnOrder.map((columnId) => {
        const column = columns[columnId];
        const columnTasks = column.taskIds.map((tid) => tasks[tid]);
        return <Column key={column.id} column={column} tasks={columnTasks} />;
      })}
      <AddColumn />
    </div>
  );
};