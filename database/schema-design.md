# Database Schema Design

This document describes the initial PostgreSQL database design for the Project Management SaaS application.

The goal of the database design is to store application data safely, consistently, and in a way that supports future features such as authentication, workspaces, projects, tasks, comments, attachments, permissions, and dashboards.

---

## Core Tables

The initial database design will include these tables:

1. `users`
2. `workspaces`
3. `workspace_members`
4. `projects`
5. `tasks`
6. `comments`
7. `attachments`

Additional tables may be added later as the application grows.

---

## Table: users

The `users` table stores account information for people who can log in to the application.

### Columns

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

### Notes

- `email` should be unique.
- Passwords should never be stored as plain text.
- `password_hash` stores the hashed password.

---

## Table: workspaces

The `workspaces` table stores companies or team spaces.

### Columns

- `id`
- `name`
- `owner_id`
- `created_at`
- `updated_at`

### Notes

- `owner_id` references the user who created or owns the workspace.
- A workspace can have many members.
- A workspace can have many projects.

---

## Table: workspace_members

The `workspace_members` table connects users to workspaces.

### Columns

- `id`
- `workspace_id`
- `user_id`
- `role`
- `created_at`
- `updated_at`

### Notes

- This table allows a user to belong to many workspaces.
- This table allows a workspace to have many users.
- `role` can later support values like `owner`, `admin`, `member`, and `viewer`.

---

## Table: projects

The `projects` table stores projects inside a workspace.

### Columns

- `id`
- `workspace_id`
- `name`
- `description`
- `status`
- `created_by`
- `created_at`
- `updated_at`

### Notes

- Each project belongs to one workspace.
- `created_by` references the user who created the project.
- `status` can later support values like `active`, `completed`, and `archived`.

---

## Table: tasks

The `tasks` table stores work items inside projects.

### Columns

- `id`
- `project_id`
- `title`
- `description`
- `status`
- `priority`
- `assigned_to`
- `created_by`
- `due_date`
- `created_at`
- `updated_at`

### Notes

- Each task belongs to one project.
- A task may be assigned to a user.
- `status` can later support values like `todo`, `in_progress`, and `done`.
- `priority` can later support values like `low`, `medium`, and `high`.

---

## Table: comments

The `comments` table stores discussions on tasks.

### Columns

- `id`
- `task_id`
- `user_id`
- `content`
- `created_at`
- `updated_at`

### Notes

- Each comment belongs to one task.
- Each comment is written by one user.

---

## Table: attachments

The `attachments` table stores metadata for files attached to tasks.

### Columns

- `id`
- `task_id`
- `uploaded_by`
- `file_name`
- `file_url`
- `file_type`
- `file_size`
- `created_at`

### Notes

- The actual file may be stored in local storage during development or cloud storage later.
- The database stores metadata about the file, not necessarily the file itself.

---

## Relationship Summary

- A user can own many workspaces.
- A user can be a member of many workspaces.
- A workspace can have many members.
- A workspace can have many projects.
- A project belongs to one workspace.
- A project has many tasks.
- A task belongs to one project.
- A task can be assigned to one user.
- A task can have many comments.
- A task can have many attachments.