# Project Management SaaS

A full-stack Project Management SaaS application built from scratch as a professional software engineering learning project.

The goal of this project is not only to build a working application, but to understand the architecture, design decisions, and engineering principles behind a real-world SaaS product.

---

## Project Overview

This application will allow companies and teams to manage their work inside shared workspaces.

Core features will include:

- User registration and login
- Workspace creation
- Team member invitations
- Project management
- Task management
- Task assignment
- Task status updates
- Comments
- File attachments
- Roles and permissions
- Dashboards
- Project progress tracking

AI features are intentionally excluded from the initial version. The priority is to first build a strong professional software engineering foundation.

---

## Learning Goal

The main learning goal is to become a stronger software engineer by understanding:

- Why each file exists
- Why each architecture decision is made
- How the frontend, backend, and database communicate
- How to design and build features step by step
- How to write maintainable and scalable code
- How to think like an engineer instead of copying generated code

This project is built as a long-term mentorship-style learning experience.

---

## Tech Stack

### Frontend

- React
- React Router
- CSS
- Tailwind CSS where useful

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### Tools

- Git
- GitHub
- Docker
- Docker Compose
- GitHub Actions

Docker and GitHub Actions will be introduced later after the core application is built.

---

## Architecture

The application uses a monorepo structure with separate frontend and backend applications.

High-level architecture:

Browser
HTTP requests
v
React Frontend
API calls
v
Express Backend
SQL queries
v
PostgreSQL Database:

The frontend never communicates directly with the database.

The backend is responsible for:

- Validating requests
- Applying business rules
- Authenticating users
- Authorizing access
- Reading and writing data
- Protecting the database

---

## Monorepo Structure

Initial repository structure:

project-management-saas/
│
├── client/
│   └── React frontend application
│
├── server/
│   └── Node.js and Express backend API
│
├── database/
│   └── Database migrations, seeds, and schema notes
│
├── docs/
│   └── Architecture notes and engineering decisions
│
├── .gitignore
│
└── README.md


This structure keeps the frontend, backend, database, and documentation clearly separated while allowing the full application to live in one repository.

---

## Development Roadmap

The project will be built in this order:

1. Project Architecture
2. Folder Structure
3. Backend Setup
4. Database Design
5. Authentication
6. User Management
7. Workspaces
8. Projects
9. Tasks
10. Comments
11. File Uploads
12. Notifications
13. Roles and Permissions
14. Security Improvements
15. Testing
16. Docker
17. CI/CD
18. Deployment

Each feature will be built one step at a time.

---

## Running the Project

The project is not runnable yet.

Initial setup instructions will be added after the frontend and backend applications are created.

Later, the application will be runnable using Docker Compose with separate services for:

- Frontend
- Backend
- PostgreSQL database

---

## Engineering Principles

This project will focus on professional engineering practices, including:

- Clean Code
- Separation of Concerns
- REST API Design
- Authentication
- Authorization
- Database Design
- Security Best Practices
- Error Handling
- Scalability
- Maintainability
- Reusability
- Testing
- Documentation

The goal is to understand not only how the code works, but why it is written that way.