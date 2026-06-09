import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface ITeamMember {
  user: Types.ObjectId;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  owner: Types.ObjectId;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  key: string;
  team: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IColumn extends Document {
  _id: Types.ObjectId;
  name: string;
  project: Types.ObjectId;
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IActivity {
  user: Types.ObjectId;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId;
  column: Types.ObjectId;
  assignee?: Types.ObjectId;
  reporter: Types.ObjectId;
  priority: "low" | "medium" | "high" | "urgent";
  type: "task" | "bug" | "story" | "epic";
  taskNumber: number;
  order: number;
  labels?: string[];
  dueDate?: Date;
  comments: IComment[];
  activity: IActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: string;
  message: string;
  task?: Types.ObjectId;
  project?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  team?: ITeam;
  memberRole?: "owner" | "admin" | "member";
}
