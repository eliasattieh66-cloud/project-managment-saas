# Architecture

This document explains the high-level architecture of the Project Management SaaS application.

The goal of the architecture is to keep the system understandable, maintainable, secure, and scalable as the application grows.

---

## System Overview

The application is built as a full-stack monorepo with three main parts:

React Frontend

HTTP API requests
v
Express Backend
SQL queries
v
PostgreSQL Database


Each part has a clear responsibility.

---

## Frontend Responsibility

The frontend is responsible for the user interface and user interactions.

It will handle:

- Pages
- Forms
- Navigation
- Client-side validation
- Loading states
- Error messages
- API calls to the backend

The frontend must not communicate directly with the PostgreSQL database.

---

## Backend Responsibility

The backend is responsible for the application rules and data access.

It will handle:

- API routes
- Request validation
- Authentication
- Authorization
- Business logic
- Database queries
- Error handling
- Security protections

The backend acts as the trusted gatekeeper between the frontend and the database.

---

## Database Responsibility

The database is responsible for storing application data reliably.

It will store data for:

- Users
- Workspaces
- Workspace members
- Projects
- Tasks
- Comments
- Attachments
- Roles and permissions
- Notifications

PostgreSQL will enforce important data integrity rules such as required fields, foreign keys, and unique constraints.

---

## Backend Layering

The backend will be organized using layers:
Route
v
Controller
v
Service
v
Repository
v
Database

This keeps responsibilities separated.

---

## Routes

Routes define the API endpoints.

Example:
POST /api/auth/register

A route decides which controller function should handle a request.

Routes should stay thin and should not contain business logic.

---

## Controllers

Controllers handle HTTP-specific logic.

They are responsible for:

- Reading request data
- Calling the correct service
- Sending the HTTP response
- Choosing the response status code

Controllers should not contain complex business rules.

---

## Services

Services contain business logic.

They answer questions like:

- Can this user perform this action?
- Does this email already exist?
- Should this password be hashed?
- Should this workspace be created?
- What rules apply to this task?

Services are the main place for application behavior.

---

## Repositories

Repositories handle database access.

They are responsible for:

- Running SQL queries
- Creating records
- Updating records
- Finding records
- Deleting records

Repositories should not decide business rules. They should focus on data access.

---

## Frontend Structure

The frontend will be organized around pages, components, API calls, hooks, layouts, and styles.

Initial frontend structure:
client/src/
├── api/
├── components/
├── pages/
├── routes/
├── hooks/
├── layouts/
├── styles/
└── main.jsx

This keeps UI, routing, reusable components, and API communication separated.

---

## Backend Structure

The backend will be organized around application modules.

Initial backend structure:

​
server/src/
├── app.js
├── server.js
├── config/
├── db/
├── middleware/
├── modules/
└── utils/

Feature-specific code will live inside `modules/`.

Example:

​
server/src/modules/auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
└── auth.validation.js

This keeps related code close together.

---

## Key Architectural Principles

This project follows these principles:

- Separation of Concerns
- Clear module boundaries
- Small focused files
- Business logic in services
- Database access in repositories
- HTTP logic in controllers
- Secure backend-controlled data access
- Documentation of important decisions

The goal is to make the application easier to understand, test, maintain, and extend.