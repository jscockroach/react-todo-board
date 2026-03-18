# React Todo Board

Kanban-style todo board built with React + TypeScript.

## 🚀 Demo

Live: https://react-todo-board-demo.vercel.app/  
![Demo](./assets/todo-demo.gif)

---

## ⚠️ Development approach

This project was developed with the help of AI tools (including agent-based workflows) to speed up implementation and explore solutions more efficiently.

AI was used as an assistant for:

- generating boilerplate and repetitive code
- exploring architectural approaches
- refining implementation details

All final decisions, code structure, and feature implementations were reviewed and adjusted manually.

Additionally, a minimal CI setup was configured to ensure code quality:

- **Husky** for git hooks
- Pre-commit / pre-push checks:
  - ESLint
  - TypeScript type checking
  - Prettier formatting
- Automated code review via GitHub Copilot

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
