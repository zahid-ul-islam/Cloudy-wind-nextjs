# Task Manager - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Backend Dependencies

```powershell
cd C:\Cloudy_Wind\backend
npm install
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your system:
- If installed locally, it should auto-start
- Or run: `mongod` in a separate terminal
- Default connection: `mongodb://localhost:27017`

### Step 3: Start Backend Server

```powershell
# Still in backend directory
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

### Step 4: Install Frontend Dependencies

Open a **new terminal**:

```powershell
cd C:\Cloudy_Wind\frontend
npm install
```

### Step 5: Configure Frontend Environment

```powershell
# Create environment file
copy .env.example .env.local

# The .env.local will have:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 6: Start Frontend Server

```powershell
npm run dev
```

✅ Frontend should now be running on `http://localhost:3000`

---

## 🎯 Try It Out

### 1. Open Your Browser
Navigate to: `http://localhost:3000`

### 2. Create an Account
- Click "Get Started" or "Sign Up"
- Enter your name, email, and password
- Click "Create Account"

### 3. Create Your First Team
- From the dashboard, click "Create Your First Team"
- Enter team name (e.g., "My Team")
- Add description (optional)
- Click "Create Team"

### 4. Add a Project
- On the team page, click "New Project"
- Enter project name (e.g., "Website Redesign")
- Enter project key (e.g., "WEB" - must be 2-5 uppercase letters)
- Add description (optional)
- Click "Create Project"

### 5. Use the Kanban Board
- You'll see 3 default columns: "To Do", "In Progress", "Done"
- Click "+ Add Task" in any column
- Fill in task details:
  - Title (required)
  - Description
  - Priority (Low/Medium/High/Urgent)
  - Assignee (yourself or team members)
  - Due date
- **Drag tasks** between columns!

### 6. Invite Team Members
- Go back to your team page
- Click "Invite" button
- Enter colleague's email
- Select role (Admin or Member)
- They can register with that email to join your team

---

## 🎨 Key Features to Explore

### ✨ Drag and Drop
- Drag tasks between columns to change status
- Tasks automatically update on the server

### 🎯 Task Priorities
- **Urgent** (Red badge)
- **High** (Orange badge)
- **Medium** (Blue badge)
- **Low** (Gray badge)

### 👥 Team Collaboration
- Owner: Full control
- Admin: Can manage projects and members
- Member: Can view and create tasks

### 📊 Project Organization
- Multiple projects per team
- Unique project keys (e.g., WEB-1, WEB-2)
- Color-coded columns

---

## 🛠️ Troubleshooting

### Backend won't start?
- Check if MongoDB is running
- Verify port 5000 is not in use
- Check console for error messages

### Frontend won't start?
- Check if backend is running first
- Verify port 3000 is not in use
- Make sure .env.local exists with correct API URL

### Can't login after registering?
- Check browser console for errors
- Verify backend is accessible at http://localhost:5000
- Try clearing browser cache/localStorage

### Drag and drop not working?
- Make sure you're clicking and holding on the task card
- Browser must support modern JavaScript
- Try refreshing the page

---

## 📝 Sample Data for Testing

### Team Names
- Product Development Team
- Marketing Squad
- Design Team

### Project Examples
- **Website Redesign** (Key: WEB)
- **Mobile App** (Key: APP)
- **API Integration** (Key: API)

### Task Examples
- "Design new homepage layout"
- "Implement user authentication"
- "Write API documentation"
- "Create marketing campaign"

---

## 🎓 What You've Built

✅ **Full-Stack Application**
- TypeScript backend with Express
- Next.js 16 frontend with React
- MongoDB database
- JWT authentication

✅ **Professional Features**
- Team management
- Project organization
- Kanban boards
- Drag-and-drop interface
- Role-based permissions
- Form validation

✅ **Modern Tech Stack**
- React Hook Form
- Zod validation
- @dnd-kit
- Tailwind CSS
- Axios with interceptors

---

## 🚀 Next Steps

Want to enhance your app? Consider adding:

1. **Task Comments** - Discussion threads
2. **File Attachments** - Upload files to tasks
3. **Activity Log** - Track all changes
4. **Email Notifications** - Alert team members
5. **Dark Mode** - Theme switching
6. **Search & Filter** - Find tasks quickly
7. **Sprint Planning** - Agile workflows
8. **Analytics Dashboard** - Progress tracking

---

## 📚 Documentation

- **Backend README**: `C:\Cloudy_Wind\backend\README.md`
- **Frontend README**: `C:\Cloudy_Wind\frontend\README.md`
- **Full Walkthrough**: Check the artifacts in this conversation

---

## ✨ Enjoy Building!

You now have a production-ready task management system. Happy collaborating! 🎉
