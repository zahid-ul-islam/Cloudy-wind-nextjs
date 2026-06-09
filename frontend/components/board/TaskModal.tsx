"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Trash2,
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
} from "lucide-react";
import api from "@/lib/api";
import { taskSchema, TaskFormData } from "@/lib/validations";
import { Task, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

interface TeamMember {
  user: User;
  role: string;
}

interface TaskModalProps {
  task: Task | null;
  projectId: string;
  projectKey?: string;
  columnId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const typeOptions = [
  {
    value: "task",
    label: "Task",
    icon: CheckSquare,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    activeBg: "bg-blue-100 border-blue-400 ring-2 ring-blue-300",
  },
  {
    value: "bug",
    label: "Bug",
    icon: Bug,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    activeBg: "bg-red-100 border-red-400 ring-2 ring-red-300",
  },
  {
    value: "story",
    label: "Story",
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    activeBg: "bg-green-100 border-green-400 ring-2 ring-green-300",
  },
  {
    value: "epic",
    label: "Epic",
    icon: Mountain,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    activeBg: "bg-purple-100 border-purple-400 ring-2 ring-purple-300",
  },
];

export default function TaskModal({
  task,
  projectId,
  projectKey,
  columnId,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || "",
          project: task.project,
          column: task.column,
          assignee: task.assignee?._id || "",
          priority: task.priority,
          type: task.type || "task",
          labels: task.labels || [],
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        }
      : {
          project: projectId,
          column: columnId,
          priority: "medium",
          type: "task",
        },
  });

  const selectedType = watch("type");

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      // Get project to find team
      const projectRes = await api.get(`/projects/${projectId}`);
      const teamId = projectRes.data.team._id || projectRes.data.team;

      // Get team members and roles
      const teamRes = await api.get(`/teams/${teamId}`);
      const members = teamRes.data.members;
      setTeamMembers(members);

      // Find current user's role
      const currentMember = members.find(
        (m: any) => m.user._id === user?._id
      );
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    } catch (err) {
      console.error("Failed to load team members");
    }
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await api.put(`/tasks/${task._id}`, data);
      } else {
        await api.post("/tasks", data);
      }
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;

    setLoading(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            {isEditing && task && (
              <span className="text-sm font-mono text-gray-500 mt-1 inline-block">
                {projectKey
                  ? `${projectKey}-${task.taskNumber}`
                  : `#${task.taskNumber}`}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <input type="hidden" {...register("project")} />
          <input type="hidden" {...register("column")} />

          {/* Task Type Selector */}
          <div>
            <label className="label mb-2">Type</label>
            <div className="grid grid-cols-4 gap-3">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = selectedType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("type", opt.value as TaskFormData["type"])
                    }
                    className={clsx(
                      "flex flex-col items-center justify-center py-3 px-2 rounded-lg border-2 transition-all",
                      isActive ? opt.activeBg : opt.bg,
                      "hover:scale-105"
                    )}
                  >
                    <Icon className={clsx("h-5 w-5 mb-1", opt.color)} />
                    <span
                      className={clsx(
                        "text-xs font-semibold",
                        isActive ? "text-gray-900" : "text-gray-600"
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              Title *
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              className="input"
              placeholder="Task title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={4}
              className="input"
              placeholder="Add a description..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="label">
                Priority
              </label>
              <select {...register("priority")} id="priority" className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label htmlFor="assignee" className="label">
                Assignee
              </label>
              {currentUserRole === "member" ? (
                <div className="input bg-gray-50 text-gray-500 cursor-not-allowed">
                  Members cannot assign tasks
                </div>
              ) : (
                <select
                  {...register("assignee")}
                  id="assignee"
                  className="input"
                  disabled={currentUserRole === "member"}
                >
                  <option value="">Unassigned</option>
                  {teamMembers
                    .filter((member) => {
                      if (currentUserRole === "owner") return true;
                      if (currentUserRole === "admin") return member.role === "member";
                      return false;
                    })
                    .map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name} ({member.role})
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="label">
              Due Date
            </label>
            <input
              {...register("dueDate")}
              type="date"
              id="dueDate"
              className="input"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger flex items-center space-x-2"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Save Changes" : "Create Task"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
