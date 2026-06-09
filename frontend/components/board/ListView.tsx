"use client";

import { Task, Column } from "@/types";
import {
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
  AlertCircle,
  Calendar,
  MessageSquare,
  ArrowUpDown,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  projectKey?: string;
  onEditTask: (task: Task) => void;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  bug: { icon: Bug, color: "text-red-600", bg: "bg-red-100", label: "Bug" },
  story: {
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Story",
  },
  task: {
    icon: CheckSquare,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Task",
  },
  epic: {
    icon: Mountain,
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Epic",
  },
};

const priorityConfig: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  urgent: { color: "text-red-700", bg: "bg-red-100", label: "Urgent" },
  high: { color: "text-orange-700", bg: "bg-orange-100", label: "High" },
  medium: { color: "text-blue-700", bg: "bg-blue-100", label: "Medium" },
  low: { color: "text-gray-700", bg: "bg-gray-100", label: "Low" },
};

type SortKey = "taskNumber" | "title" | "priority" | "assignee" | "dueDate";
type SortDir = "asc" | "desc";

export default function ListView({
  tasks,
  columns,
  projectKey,
  onEditTask,
}: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("taskNumber");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const getColumnName = (columnId: string) => {
    const col = columns.find((c) => c._id === columnId);
    return col?.name || "Unknown";
  };

  const getColumnColor = (columnId: string) => {
    const col = columns.find((c) => c._id === columnId);
    return col?.color || "#3b82f6";
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const priorityWeight: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "taskNumber":
        cmp = a.taskNumber - b.taskNumber;
        break;
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "priority":
        cmp =
          (priorityWeight[a.priority] || 0) -
          (priorityWeight[b.priority] || 0);
        break;
      case "assignee":
        cmp = (a.assignee?.name || "zzz").localeCompare(
          b.assignee?.name || "zzz"
        );
        break;
      case "dueDate":
        cmp =
          new Date(a.dueDate || "9999").getTime() -
          new Date(b.dueDate || "9999").getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortHeader = ({
    label,
    sortKeyName,
    className,
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
  }) => (
    <th
      className={clsx(
        "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none",
        className
      )}
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown
          className={clsx(
            "h-3 w-3",
            sortKey === sortKeyName ? "text-primary-600" : "text-gray-400"
          )}
        />
      </div>
    </th>
  );

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <CheckSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">
          No tasks found. Create a task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                Type
              </th>
              <SortHeader label="ID" sortKeyName="taskNumber" className="w-24" />
              <SortHeader label="Title" sortKeyName="title" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <SortHeader label="Priority" sortKeyName="priority" />
              <SortHeader label="Assignee" sortKeyName="assignee" />
              <SortHeader label="Due Date" sortKeyName="dueDate" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                💬
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedTasks.map((task) => {
              const typeInfo = typeConfig[task.type || "task"] || typeConfig.task;
              const TypeIcon = typeInfo.icon;
              const prioInfo =
                priorityConfig[task.priority] || priorityConfig.medium;
              const taskId = projectKey
                ? `${projectKey}-${task.taskNumber}`
                : `#${task.taskNumber}`;

              return (
                <tr
                  key={task._id}
                  onClick={() => onEditTask(task)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Type Icon */}
                  <td className="px-4 py-3">
                    <div
                      className={clsx(
                        "w-6 h-6 rounded flex items-center justify-center",
                        typeInfo.bg
                      )}
                    >
                      <TypeIcon
                        className={clsx("h-3.5 w-3.5", typeInfo.color)}
                      />
                    </div>
                  </td>

                  {/* Task ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-semibold text-gray-500">
                      {taskId}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {task.title}
                    </span>
                  </td>

                  {/* Status (Column) */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: getColumnColor(task.column) + "20",
                        color: getColumnColor(task.column),
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: getColumnColor(task.column),
                        }}
                      />
                      <span>{getColumnName(task.column)}</span>
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded",
                        prioInfo.bg,
                        prioInfo.color
                      )}
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span className="capitalize">{prioInfo.label}</span>
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
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
                        <span className="text-sm text-gray-700">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className="text-sm text-gray-600 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Comments */}
                  <td className="px-4 py-3">
                    {task.comments?.length > 0 && (
                      <span className="flex items-center space-x-1 text-gray-400 text-xs">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task.comments.length}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
