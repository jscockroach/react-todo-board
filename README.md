# React Todo Board

Kanban-style todo board built with React + TypeScript.

## 🚀 Demo

Live: https://react-todo-board-demo.vercel.app/  
![Demo](./assets/todo-demo.gif)

---

## 🛠 Tech stack

- React + TypeScript
- Vite
- Atlassian Pragmatic Drag & Drop

---

## ⚡ Features implemented

### Board & columns

- Add and delete columns
- Reorder columns (drag & drop)

### Tasks

- Add and delete tasks
- Edit task title inline
- Toggle task completed / active
- Reorder tasks inside a column (drag & drop)
- Move tasks between columns (drag & drop)
- Move multiple selected tasks between columns (drag & drop)
- Multi-select tasks (single, multiple, select all in column)
- Mass actions:
  - Delete selected
  - Mark selected as complete / active
  - Move selected tasks

### Search & filters

- Search tasks by title
- Highlight matched text using `<mark>`
- Filter tasks: all / completed / active

### Persistence & UX

- Persist board state in localStorage
- Responsive design (desktop & mobile)
- Completed tasks are visually distinguished (line-through)
- Drag handle for better drag & drop experience

---

## 📦 How to run locally

```bash
npm install
npm run dev
```
