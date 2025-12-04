import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  teamId: z.string().min(1, "Team is required"),
});

export const columnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  color: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  project: z.string().min(1, "Project is required"),
  column: z.string().min(1, "Column is required"),
  assignee: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TeamFormData = z.infer<typeof teamSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type ColumnFormData = z.infer<typeof columnSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type AddMemberFormData = z.infer<typeof addMemberSchema>;
