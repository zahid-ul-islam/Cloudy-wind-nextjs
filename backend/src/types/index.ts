import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
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

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId;
  column: Types.ObjectId;
  assignee?: Types.ObjectId;
  reporter: Types.ObjectId;
  priority: "low" | "medium" | "high" | "urgent";
  order: number;
  labels?: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  team?: ITeam;
  memberRole?: "owner" | "admin" | "member";
}
