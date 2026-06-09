"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Project, Column, Task, User } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Settings,
  LayoutGrid,
  List,
  Inbox,
} from "lucide-react";
import KanbanBoard from "@/components/board/KanbanBoard";
import TaskModal from "@/components/board/TaskModal";
import ListView from "@/components/board/ListView";
import BacklogView from "@/components/board/BacklogView";
import FilterBar, { FilterState } from "@/components/board/FilterBar";
import TaskDetailPanel from "@/components/board/TaskDetailPanel";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

type ViewTab = "board" | "list" | "backlog";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>("board");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    priority: "",
    type: "",
    assignee: "",
  });

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

      // Fetch team members for filter bar
      const teamId =
        typeof projectRes.data.team === "string"
          ? projectRes.data.team
          : projectRes.data.team._id;
      try {
        const teamRes = await api.get(`/teams/${teamId}`);
        setTeamMembers(teamRes.data.members.map((m: any) => m.user));
      } catch (e) {
        console.error("Failed to fetch team members");
      }
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
    setDetailTask(task);
  };

  const handleEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setDetailTask(null);
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

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(search);
        const matchDesc = task.description?.toLowerCase().includes(search);
        const matchId = `${project?.key}-${task.taskNumber}`
          .toLowerCase()
          .includes(search);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) return false;

      // Type filter
      if (filters.type && task.type !== filters.type) return false;

      // Assignee filter
      if (filters.assignee) {
        if (filters.assignee === "unassigned") {
          if (task.assignee) return false;
        } else {
          const assigneeId =
            typeof task.assignee === "string"
              ? task.assignee
              : task.assignee?._id;
          if (assigneeId !== filters.assignee) return false;
        }
      }

      return true;
    });
  }, [tasks, filters, project?.key]);

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

  const viewTabs: { key: ViewTab; label: string; icon: React.ElementType }[] = [
    { key: "board", label: "Board", icon: LayoutGrid },
    { key: "list", label: "List", icon: List },
    { key: "backlog", label: "Backlog", icon: Inbox },
  ];

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

            <div className="flex items-center space-x-3">
              {/* View Tabs */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {viewTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveView(tab.key)}
                      className={clsx(
                        "flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                        activeView === tab.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button className="btn btn-secondary flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            teamMembers={teamMembers}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeView === "board" && (
          <KanbanBoard
            columns={columns}
            tasks={filteredTasks}
            projectId={projectId}
            projectKey={project.key}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onTasksUpdate={handleTasksReorder}
            currentUserId={user?._id}
          />
        )}

        {activeView === "list" && (
          <ListView
            tasks={filteredTasks}
            columns={columns}
            projectKey={project.key}
            onEditTask={handleEditTask}
          />
        )}

        {activeView === "backlog" && (
          <BacklogView
            tasks={filteredTasks}
            columns={columns}
            projectKey={project.key}
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
          />
        )}
      </main>

      {/* Task Modal (for create/edit) */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          projectKey={project.key}
          columnId={selectedColumnId || selectedTask?.column || ""}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmit}
        />
      )}

      {/* Task Detail Panel (slide-out for viewing task details, comments, activity) */}
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          projectKey={project.key}
          onClose={() => setDetailTask(null)}
          onTaskUpdated={fetchProjectData}
        />
      )}
    </div>
  );
}
