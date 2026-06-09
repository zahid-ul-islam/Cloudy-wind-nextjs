"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import {
  Calendar,
  User,
  AlertCircle,
  Lock,
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
  currentUserId?: string;
  projectKey?: string;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  bug: { icon: Bug, color: "text-red-600", bg: "bg-red-100" },
  story: { icon: BookOpen, color: "text-green-600", bg: "bg-green-100" },
  task: { icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-100" },
  epic: { icon: Mountain, color: "text-purple-600", bg: "bg-purple-100" },
};

export default function TaskCard({
  task,
  isDragging = false,
  onClick,
  currentUserId,
  projectKey,
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
    touchAction: isAssignedToCurrentUser
      ? ("none" as const)
      : ("auto" as const),
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

  const typeInfo = typeConfig[task.type || "task"] || typeConfig.task;
  const TypeIcon = typeInfo.icon;
  const taskId = projectKey
    ? `${projectKey}-${task.taskNumber}`
    : `#${task.taskNumber}`;
  const commentCount = task.comments?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isAssignedToCurrentUser ? listeners : {})}
      onClick={onClick}
      className={clsx(
        "bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all relative group",
        isAssignedToCurrentUser
          ? "cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-300"
          : "cursor-pointer hover:shadow-sm",
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

      {/* Type Icon + Task ID row */}
      <div className="flex items-center space-x-2 mb-2">
        <div
          className={clsx(
            "w-5 h-5 rounded flex items-center justify-center",
            typeInfo.bg
          )}
        >
          <TypeIcon className={clsx("h-3 w-3", typeInfo.color)} />
        </div>
        <span className="text-xs font-mono font-semibold text-gray-500">
          {taskId}
        </span>
      </div>

      {/* Task Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
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

          {/* Comment Count */}
          {commentCount > 0 && (
            <div className="flex items-center space-x-1 text-gray-400">
              <MessageSquare className="h-3 w-3" />
              <span>{commentCount}</span>
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
