"use client";

import { Task, Column } from "@/types";
import {
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
  AlertCircle,
  Calendar,
  Plus,
  Inbox,
} from "lucide-react";
import clsx from "clsx";

interface BacklogViewProps {
  tasks: Task[];
  columns: Column[];
  projectKey?: string;
  onEditTask: (task: Task) => void;
  onCreateTask: (columnId: string) => void;
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

export default function BacklogView({
  tasks,
  columns,
  projectKey,
  onEditTask,
  onCreateTask,
}: BacklogViewProps) {
  // The backlog contains tasks in the first column (usually "To Do") or unassigned tasks
  const firstColumn = columns.length > 0 ? columns[0] : null;

  // Group tasks: backlog (first column) vs in-progress (other columns)
  const backlogTasks = tasks.filter(
    (t) => firstColumn && t.column === firstColumn._id
  );
  const inProgressTasks = tasks.filter(
    (t) => !firstColumn || t.column !== firstColumn._id
  );

  // Unassigned tasks across all columns
  const unassignedTasks = tasks.filter((t) => !t.assignee);

  const renderTaskRow = (task: Task) => {
    const typeInfo = typeConfig[task.type || "task"] || typeConfig.task;
    const TypeIcon = typeInfo.icon;
    const taskId = projectKey
      ? `${projectKey}-${task.taskNumber}`
      : `#${task.taskNumber}`;
    const colName =
      columns.find((c) => c._id === task.column)?.name || "Unknown";

    return (
      <div
        key={task._id}
        onClick={() => onEditTask(task)}
        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div
            className={clsx(
              "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
              typeInfo.bg
            )}
          >
            <TypeIcon className={clsx("h-3.5 w-3.5", typeInfo.color)} />
          </div>
          <span className="text-xs font-mono font-semibold text-gray-500 flex-shrink-0">
            {taskId}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </span>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
          {/* Status Pill */}
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            {colName}
          </span>

          {/* Priority */}
          <AlertCircle
            className={clsx(
              "h-4 w-4",
              task.priority === "urgent"
                ? "text-red-600"
                : task.priority === "high"
                ? "text-orange-600"
                : task.priority === "medium"
                ? "text-blue-500"
                : "text-gray-400"
            )}
          />

          {/* Assignee */}
          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden"
              title={task.assignee.name}
            >
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                task.assignee.name?.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <span className="text-xs text-gray-500 flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Backlog Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-gray-900">Backlog</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {backlogTasks.length} items
            </span>
          </div>
          {firstColumn && (
            <button
              onClick={() => onCreateTask(firstColumn._id)}
              className="btn btn-primary text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Backlog</span>
            </button>
          )}
        </div>

        {backlogTasks.length > 0 ? (
          <div className="space-y-2">{backlogTasks.map(renderTaskRow)}</div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Inbox className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              Backlog is empty. All tasks are in progress!
            </p>
          </div>
        )}
      </div>

      {/* Unassigned Section */}
      {unassignedTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Unassigned</h2>
            <span className="text-sm text-gray-500 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
              {unassignedTasks.length} items
            </span>
          </div>
          <div className="space-y-2">{unassignedTasks.map(renderTaskRow)}</div>
        </div>
      )}

      {/* In Progress Section */}
      {inProgressTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">In Progress</h2>
            <span className="text-sm text-gray-500 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {inProgressTasks.length} items
            </span>
          </div>
          <div className="space-y-2">
            {inProgressTasks.map(renderTaskRow)}
          </div>
        </div>
      )}
    </div>
  );
}
