# Task Manager - Complete Project

A full-stack Jira-like task management application with team collaboration and Kanban boards.

## 📁 Project Structure

```
Cloudy_Wind/
├── backend/     # Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth & error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── types/            # TypeScript types
│   │   └── server.ts         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/    # Next.js 16 + TypeScript + Tailwind
│   ├── app/                  # Next.js App Router
│   │   ├── dashboard/        # Protected routes
│   │   │   ├── teams/        # Team management
│   │   │   └── projects/     # Project boards
│   │   ├── login/            # Authentication
│   │   ├── register/
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable components
│   │   └── board/            # Kanban components
│   ├── context/              # React context
│   ├── lib/                  # Utilities
│   ├── types/                # TypeScript types
│   └── package.json
│
└── QUICK_START.md            # This file's sibling - setup guide
```

## 🚀 Quick Start

See **[QUICK_START.md](./QUICK_START.md)** for detailed setup instructions.

**TL;DR:**
```powershell
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`

## ✨ Features

### Authentication
- ✅ JWT-based authentication
- ✅ Secure password hashing (bcrypt)
- ✅ Automatic token refresh
- ✅ Protected routes

### Team Management
- ✅ Create and manage teams
- ✅ Invite members by email
- ✅ Role-based permissions (Owner/Admin/Member)
- ✅ Team settings

### Project Management
- ✅ Create projects with unique keys
- ✅ Multiple projects per team
- ✅ Project descriptions and metadata

### Kanban Boards
- ✅ Drag-and-drop tasks between columns
- ✅ Custom column creation
- ✅ Default columns (To Do, In Progress, Done)
- ✅ Visual task organization

### Task Management
- ✅ Create and edit tasks
- ✅ Assign tasks to team members
- ✅ Set priorities (Low/Medium/High/Urgent)
- ✅ Add due dates
- ✅ Task labels
- ✅ Rich descriptions

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** + Mongoose - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@dnd-kit** - Drag and drop
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📚 Documentation

- **Backend API Docs**: See `backend/README.md`
- **Frontend Docs**: See `frontend/README.md`
- **Setup Guide**: See `QUICK_START.md`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Columns
- `GET /api/columns/projects/:projectId/columns` - List columns
- `POST /api/columns/projects/:projectId/columns` - Create column
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `PUT /api/columns/reorder` - Reorder columns

### Tasks
- `GET /api/tasks/projects/:projectId/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/move` - Move task
- `PUT /api/tasks/reorder` - Reorder tasks

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🧪 Testing

1. Start both backend and frontend
2. Register a new account
3. Create a team
4. Add a project
5. Create tasks on the Kanban board
6. Drag tasks between columns
7. Invite team members
8. Test different user roles

## 📝 License

ISC

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

## ⭐ Key Highlights

- **Full TypeScript** - Frontend and backend
- **Modern Stack** - Latest Next.js 15, React 18
- **Beautiful UI** - Tailwind CSS with custom design
- **Drag & Drop** - Smooth task management
- **Role-Based** - Secure team collaboration
- **Production Ready** - Error handling, validation, auth

---

Built with ❤️ using Next.js 16 and Express
