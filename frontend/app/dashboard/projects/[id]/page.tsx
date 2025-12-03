"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Project, Column, Task } from "@/types";
import { Loader2, ArrowLeft, Plus, Settings } from "lucide-react";
import KanbanBoard from "@/components/board/KanbanBoard";
import TaskModal from "@/components/board/TaskModal";
import { useAuth } from "@/context/AuthContext";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, columnsRes, tasksRes] = await Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Column[]>(`/columns/projects/${projectId}/columns`),
        api.get<Task[]>(`/tasks/projects/${projectId}/tasks`),
      ]);

      setProject(projectRes.data);
      setColumns(columnsRes.data);
      setTasks(tasksRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async () => {
    await fetchProjectData();
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTasksReorder = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Project not found"}</p>
          <Link href="/dashboard/teams" className="btn btn-primary">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/teams/${
                  typeof project.team === "string"
                    ? project.team
                    : project.team._id
                }`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                    {project.key}
                  </span>
                  <h1 className="text-xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <button className="btn btn-secondary flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <main className="container mx-auto px-4 py-6">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          projectId={projectId}
          onCreateTask={handleCreateTask}
          onEditTask={handleEditTask}
          onTasksUpdate={handleTasksReorder}
          currentUserId={user?._id}
        />
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          columnId={selectedColumnId || selectedTask?.column || ""}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
}
