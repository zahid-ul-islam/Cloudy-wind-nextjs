export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
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

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  column: string;
  assignee?: User;
  reporter: User;
  priority: "low" | "medium" | "high" | "urgent";
  order: number;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
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
