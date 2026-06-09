"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
  MessageSquare,
  Activity,
  Clock,
  ArrowRight,
  UserPlus,
  UserMinus,
  Edit3,
  Plus as PlusIcon,
} from "lucide-react";
import api from "@/lib/api";
import { Task, Comment, Activity as ActivityType } from "@/types";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

interface TaskDetailPanelProps {
  task: Task;
  projectKey?: string;
  onClose: () => void;
  onTaskUpdated: () => void;
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

export default function TaskDetailPanel({
  task: initialTask,
  projectKey,
  onClose,
  onTaskUpdated,
}: TaskDetailPanelProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task>(initialTask);
  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments"
  );
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFullTask();
  }, [initialTask._id]);

  const fetchFullTask = async () => {
    setLoadingDetails(true);
    try {
      const res = await api.get<Task>(`/tasks/${initialTask._id}`);
      setTask(res.data);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setSendingComment(true);
    try {
      const res = await api.post<Task>(`/tasks/${task._id}/comments`, {
        text: commentText.trim(),
      });
      setTask(res.data);
      setCommentText("");
      onTaskUpdated();
      // Scroll to bottom
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const typeInfo = typeConfig[task.type || "task"] || typeConfig.task;
  const TypeIcon = typeInfo.icon;
  const taskId = projectKey
    ? `${projectKey}-${task.taskNumber}`
    : `#${task.taskNumber}`;

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <PlusIcon className="h-3 w-3 text-green-600" />;
      case "moved":
        return <ArrowRight className="h-3 w-3 text-blue-600" />;
      case "assigned":
        return <UserPlus className="h-3 w-3 text-primary-600" />;
      case "unassigned":
        return <UserMinus className="h-3 w-3 text-orange-600" />;
      case "commented":
        return <MessageSquare className="h-3 w-3 text-gray-600" />;
      default:
        return <Edit3 className="h-3 w-3 text-gray-600" />;
    }
  };

  const getActivityText = (act: ActivityType) => {
    switch (act.action) {
      case "created":
        return "created this task";
      case "moved":
        return (
          <>
            moved from{" "}
            <span className="font-medium text-gray-700">{act.oldValue}</span> to{" "}
            <span className="font-medium text-gray-700">{act.newValue}</span>
          </>
        );
      case "assigned":
        return "assigned a user";
      case "unassigned":
        return "unassigned a user";
      case "commented":
        return "added a comment";
      case "updated":
        if (act.field === "priority") {
          return (
            <>
              changed priority from{" "}
              <span className="font-medium capitalize">{act.oldValue}</span> to{" "}
              <span className="font-medium capitalize">{act.newValue}</span>
            </>
          );
        }
        if (act.field === "type") {
          return (
            <>
              changed type from{" "}
              <span className="font-medium capitalize">{act.oldValue}</span> to{" "}
              <span className="font-medium capitalize">{act.newValue}</span>
            </>
          );
        }
        if (act.field === "title") {
          return (
            <>
              renamed to{" "}
              <span className="font-medium">{act.newValue}</span>
            </>
          );
        }
        return `updated ${act.field || "task"}`;
      default:
        return act.action;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                typeInfo.bg
              )}
            >
              <TypeIcon className={clsx("h-4 w-4", typeInfo.color)} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-bold text-gray-500">
                  {taskId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {typeInfo.label}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5 line-clamp-1">
                {task.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Details */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center space-x-1.5 text-gray-600">
              <span className="font-medium">Priority:</span>
              <span className="capitalize">{task.priority}</span>
            </div>
            {task.assignee && (
              <div className="flex items-center space-x-1.5 text-gray-600">
                <span className="font-medium">Assignee:</span>
                <span>{task.assignee.name}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1.5 text-gray-600">
                <span className="font-medium">Due:</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("comments")}
            className={clsx(
              "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center space-x-2",
              activeTab === "comments"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments ({task.comments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={clsx(
              "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center space-x-2",
              activeTab === "activity"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Activity className="h-4 w-4" />
            <span>Activity ({task.activity?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "comments" && (
            <div className="space-y-4">
              {(!task.comments || task.comments.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No comments yet. Start the conversation!
                  </p>
                </div>
              )}

              {task.comments?.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      comment.user?.name?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-0">
              {(!task.activity || task.activity.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity recorded yet.</p>
                </div>
              )}

              {task.activity &&
                [...task.activity].reverse().map((act, idx) => (
                  <div
                    key={act._id || idx}
                    className="flex items-start space-x-3 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActivityIcon(act.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {act.user?.name || "Someone"}
                        </span>{" "}
                        {getActivityText(act)}
                      </p>
                      <span className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(act.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Comment Input (always visible when on comments tab) */}
        {activeTab === "comments" && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a comment... (Enter to send)"
                  rows={2}
                  className="input text-sm resize-none pr-10"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || sendingComment}
                  className={clsx(
                    "absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors",
                    commentText.trim()
                      ? "text-primary-600 hover:bg-primary-50"
                      : "text-gray-300"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
