"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, FolderKanban, Plus, X } from "lucide-react";
import api from "@/lib/api";
import { Team } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showProjectModal) {
      fetchTeams();
    }
  }, [showProjectModal]);

  const fetchTeams = async () => {
    try {
      const response = await api.get<Team[]>("/teams");
      setTeams(response.data);
      if (response.data.length > 0) {
        setSelectedTeamId(response.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/projects", {
        name: projectName,
        description: projectDescription,
        teamId: selectedTeamId,
      });

      router.push(`/dashboard/projects/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your teams and projects</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/teams"
            className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <Users className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Teams
                </h3>
                <p className="text-gray-600 mb-4">
                  Create and manage your teams, invite members, and collaborate
                  together.
                </p>
                <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                  <span>Go to Teams</span>
                  <Plus className="h-5 w-5 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          <div
            onClick={() => setShowProjectModal(true)}
            className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <FolderKanban className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Create Project
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a new project, set up Kanban boards, and start tracking
                  tasks.
                </p>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span>Create New Project</span>
                  <Plus className="h-5 w-5 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Cloudy Wind, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-gray-700 mb-4">
            Get started by creating your first team or joining an existing one.
            Then, create projects and start managing tasks with our intuitive
            Kanban boards.
          </p>
          <Link
            href="/dashboard/teams/new"
            className="btn btn-primary inline-flex"
          >
            Create Your First Team
          </Link>
        </div>
      </main>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="input w-full"
                    required
                  >
                    {teams.length === 0 ? (
                      <option value="">No teams available</option>
                    ) : (
                      teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))
                    )}
                  </select>
                  {teams.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      You need to create a team first.{" "}
                      <Link
                        href="/dashboard/teams/new"
                        className="text-primary-600 hover:underline"
                      >
                        Create Team
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="input w-full"
                    placeholder="My Awesome Project"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="input w-full"
                    rows={3}
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || teams.length === 0}
                    className="btn btn-primary"
                  >
                    {loading ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
