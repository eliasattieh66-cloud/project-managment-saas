# Development Roadmap

This document defines the planned development order for the Project Management SaaS application.

The goal is to build the application in a logical dependency order, starting with the foundation and moving toward production readiness.

---

## Why Development Order Matters

A professional application should be built in an order that respects dependencies.

For example:

- Authentication should come before protected workspaces.
- Workspaces should come before projects.
- Projects should come before tasks.
- Tasks should come before comments and attachments.
- Core functionality should come before dashboards.
- Security and testing should come before deployment.

Following this order keeps the project easier to understand and reduces unnecessary rewrites.

---

## Roadmap

### 1. Project Architecture

Define the high-level structure of the application.

Includes:

- Monorepo decision
- Frontend/backend/database separation
- Backend layering
- Initial architecture documentation

---

### 2. Folder Structure

Create the initial repository structure.

Includes:

- Root documentation
- `.gitignore`
- `docs/` folder
- Architecture and roadmap documents

---

### 3. Backend Setup

Create the initial Express backend.

Includes:

- Node project setup
- Express app setup
- Environment configuration
- Development scripts
- Basic health check route

---

### 4. Database Design

Design the initial PostgreSQL schema.

Includes:

- Users table
- Workspaces table
- Workspace members table
- Projects table
- Tasks table
- Comments table
- Attachments table
- Roles and permissions model

---

### 5. Authentication

Build user registration and login.

Includes:

- Password hashing
- Login validation
- JWT or session decision
- Auth middleware
- Protected routes

---

### 6. User Management

Add user-related functionality.

Includes:

- Current user endpoint
- User profile
- Basic account information

---

### 7. Workspaces

Build workspace functionality.

Includes:

- Create workspace
- List user workspaces
- Workspace membership
- Workspace switching

---

### 8. Projects

Build project management functionality.

Includes:

- Create project
- List projects
- Update project
- Archive project

---

### 9. Tasks

Build task management functionality.

Includes:

- Create task
- Assign task
- Update task status
- Edit task details
- List tasks by project

---

### 10. Comments

Add discussion functionality to tasks.

Includes:

- Add comment
- List task comments
- Edit own comment
- Delete own comment

---

### 11. File Uploads

Add file attachment support.

Includes:

- Upload files
- Attach files to tasks
- Store file metadata
- Download or view attachments

---

### 12. Notifications

Add basic user notifications.

Includes:

- Task assignment notifications
- Comment notifications
- Workspace invitation notifications

---

### 13. Roles and Permissions

Add stronger authorization rules.

Includes:

- Workspace owner
- Admin
- Member
- Viewer
- Permission checks for sensitive actions

---

### 14. Security Improvements

Improve production security.

Includes:

- Rate limiting
- Secure headers
- CORS configuration
- Input sanitization
- Stronger error handling
- Secrets management

---

### 15. Testing

Add automated tests.

Includes:

- Unit tests
- Integration tests
- API endpoint tests
- Test database setup

---

### 16. Docker

Containerize the application.

Includes:

- Backend Dockerfile
- Frontend Dockerfile
- PostgreSQL service
- Docker Compose setup

---

### 17. CI/CD

Add automation with GitHub Actions.

Includes:

- Install dependencies
- Run tests
- Run linting
- Build application

---

### 18. Deployment

Deploy the application.

Includes:

- Production environment setup
- Database hosting
- Backend deployment
- Frontend deployment
- Environment variables
- Deployment checklist

---

## Rule

Do not skip steps.

Each part should be understood, implemented, tested, and committed before moving to the next major step.