"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { Calendar, User, AlertCircle, Lock } from "lucide-react";
import clsx from "clsx";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
  currentUserId?: string;
}

export default function TaskCard({
  task,
  isDragging = false,
  onClick,
  currentUserId,
}: TaskCardProps) {
  // Check if current user is assigned to this task
  const isAssignedToCurrentUser =
    currentUserId &&
    task.assignee &&
    (typeof task.assignee === "string"
      ? task.assignee === currentUserId
      : task.assignee._id === currentUserId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
    disabled: !isAssignedToCurrentUser, // Disable dragging if not assigned
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "badge-urgent";
      case "high":
        return "badge-high";
      case "medium":
        return "badge-medium";
      default:
        return "badge-low";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isAssignedToCurrentUser ? listeners : {})}
      onClick={onClick}
      className={clsx(
        "bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all relative",
        isAssignedToCurrentUser
          ? "cursor-grab active:cursor-grabbing hover:shadow-md"
          : "cursor-pointer opacity-75",
        isSortableDragging && "opacity-50",
        isDragging && "shadow-xl"
      )}
    >
      {/* Lock icon for non-assigned tasks */}
      {!isAssignedToCurrentUser && (
        <div className="absolute top-2 right-2">
          <Lock className="h-3 w-3 text-gray-400" />
        </div>
      )}

      {/* Task Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, index) => (
            <span
              key={index}
              className="badge bg-primary-100 text-primary-700 text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Priority */}
          <div className="flex items-center space-x-1">
            <AlertCircle
              className={clsx("h-3 w-3", getPriorityColor(task.priority))}
            />
            <span
              className={clsx("badge text-xs", getPriorityBadge(task.priority))}
            >
              {task.priority}
            </span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden ring-2 ring-white"
            title={`Assigned to: ${task.assignee.name}`}
          >
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                {task.assignee.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
