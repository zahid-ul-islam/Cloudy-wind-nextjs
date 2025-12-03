# Task Manager Frontend

A modern task management application built with Next.js 16, featuring team collaboration, Kanban boards, and real-time task tracking.

## Features

- **Authentication**: Secure login and registration with JWT
- **Team Management**: Create teams, invite members, manage roles
- **Project Management**: Organize work into projects with custom keys
- **Kanban Boards**: Drag-and-drop task management
- **Task Tracking**: Priorities, assignments, due dates, and labels
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

- Node.js (v18 or higher)
- Backend API running (see backend)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update the environment variable in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── dashboard/
│   │   ├── teams/          # Team management
│   │   ├── projects/       # Project & board views
│   │   └── page.tsx        # Dashboard home
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── auth/               # Authentication components
│   ├── board/              # Kanban board components
│   ├── teams/              # Team components
│   ├── projects/           # Project components
│   └── ui/                 # Reusable UI components
├── context/
│   └── AuthContext.tsx     # Authentication context
├── lib/
│   ├── api.ts              # API client
│   └── validations.ts      # Zod schemas
├── types/
│   └── index.ts            # TypeScript types
└── package.json
```

## Key Features

### Authentication
- JWT-based authentication with automatic token refresh
- Protected routes with middleware
- Persistent sessions with local storage

### Team Collaboration
- Create and manage teams
- Invite members by email
- Role-based permissions (Owner, Admin, Member)
- Team settings and member management

### Kanban Boards
- Drag and drop tasks between columns
- Custom column creation and management
- Real-time board updates
- Visual task organization

### Task Management
- Create and assign tasks
- Set priorities (Low, Medium, High, Urgent)
- Add labels and due dates
- Rich task descriptions
- Task filtering and search

## API Integration

The frontend communicates with the Express backend via REST APIs. All API calls include:
- Automatic token injection
- Token refresh on expiration
- Error handling and retry logic
- Loading and error states

## Styling

Custom Tailwind CSS utilities and components:
- `btn`, `btn-primary`, `btn-secondary`, `btn-danger` - Button styles
- `input`, `label` - Form elements
- `card` - Card container
- `badge` - Status badges with priority colors

## Development

### Adding New Pages
1. Create a new directory in `app/`
2. Add `page.tsx` for the route
3. Optional: Add `layout.tsx` for shared layout

### Adding New Components
1. Create component in appropriate `components/` subdirectory
2. Export from component file
3. Import where needed

### Form Validation
1. Define Zod schema in `lib/validations.ts`
2. Use `react-hook-form` with `zodResolver`
3. Handle errors in UI

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL

## License

ISC
