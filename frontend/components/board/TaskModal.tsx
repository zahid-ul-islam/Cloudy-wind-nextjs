"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { taskSchema, TaskFormData } from "@/lib/validations";
import { Task, User } from "@/types";

interface TaskModalProps {
  task: Task | null;
  projectId: string;
  columnId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function TaskModal({
  task,
  projectId,
  columnId,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
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
          labels: task.labels || [],
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        }
      : {
          project: projectId,
          column: columnId,
          priority: "medium",
        },
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      // Get project to find team
      const projectRes = await api.get(`/projects/${projectId}`);
      const teamId = projectRes.data.team._id || projectRes.data.team;

      // Get team members
      const teamRes = await api.get(`/teams/${teamId}`);
      setTeamMembers(teamRes.data.members.map((m: any) => m.user));
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <select {...register("assignee")} id="assignee" className="input">
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
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
