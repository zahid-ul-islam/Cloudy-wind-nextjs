export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  user: User;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  key: string;
  team: Team | string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  name: string;
  project: string;
  order: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  user: User;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: "assignment" | "mention" | "system";
  message: string;
  task?: string;
  project?: {
    _id: string;
    name: string;
    key: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  column: string;
  assignee?: User;
  reporter: User;
  priority: "low" | "medium" | "high" | "urgent";
  type: "task" | "bug" | "story" | "epic";
  taskNumber: number;
  order: number;
  labels?: string[];
  dueDate?: string;
  comments: Comment[];
  activity: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Invitation {
  _id: string;
  team: {
    _id: string;
    name: string;
  };
  role: "owner" | "admin" | "member";
  status: "pending" | "accepted" | "rejected";
  inviter: User;
  createdAt: string;
}
