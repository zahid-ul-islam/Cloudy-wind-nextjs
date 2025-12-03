# Task Manager Backend

Backend API for a Jira-like task management system built with Express, TypeScript, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Team Management**: Create teams, invite members, assign roles (owner/admin/member)
- **Project Management**: Create projects within teams with unique keys
- **Kanban Boards**: Column-based task organization with drag-and-drop support
- **Task Management**: Create, update, assign, and track tasks with priorities and due dates
- **Role-Based Access Control**: Fine-grained permissions based on team roles

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/refresh` - Refresh access token

### Teams
- `GET /api/teams` - Get user's teams (Protected)
- `POST /api/teams` - Create team (Protected)
- `GET /api/teams/:id` - Get team details (Protected)
- `PUT /api/teams/:id` - Update team (Protected)
- `DELETE /api/teams/:id` - Delete team (Protected)
- `POST /api/teams/:id/members` - Add team member (Protected)
- `DELETE /api/teams/:id/members/:userId` - Remove team member (Protected)

### Projects
- `GET /api/projects?teamId=xxx` - Get team projects (Protected)
- `POST /api/projects` - Create project (Protected)
- `GET /api/projects/:id` - Get project details (Protected)
- `PUT /api/projects/:id` - Update project (Protected)
- `DELETE /api/projects/:id` - Delete project (Protected)

### Columns
- `GET /api/columns/projects/:projectId/columns` - Get project columns (Protected)
- `POST /api/columns/projects/:projectId/columns` - Create column (Protected)
- `PUT /api/columns/:id` - Update column (Protected)
- `DELETE /api/columns/:id` - Delete column (Protected)
- `PUT /api/columns/reorder` - Reorder columns (Protected)

### Tasks
- `GET /api/tasks/projects/:projectId/tasks` - Get project tasks (Protected)
- `POST /api/tasks` - Create task (Protected)
- `GET /api/tasks/:id` - Get task details (Protected)
- `PUT /api/tasks/:id` - Update task (Protected)
- `DELETE /api/tasks/:id` - Delete task (Protected)
- `PUT /api/tasks/:id/move` - Move task to different column (Protected)
- `PUT /api/tasks/reorder` - Reorder tasks (Protected)

## Data Models

### User
- name, email, password (hashed), avatar

### Team
- name, description, owner, members (with roles)

### Project
- name, description, key, team, createdBy

### Column
- name, project, order, color

### Task
- title, description, project, column, assignee, reporter, priority, order, labels, dueDate

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── teamController.ts
│   │   ├── projectController.ts
│   │   ├── columnController.ts
│   │   └── taskController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Team.ts
│   │   ├── Project.ts
│   │   ├── Column.ts
│   │   └── Task.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── teams.ts
│   │   ├── projects.ts
│   │   ├── columns.ts
│   │   └── tasks.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
