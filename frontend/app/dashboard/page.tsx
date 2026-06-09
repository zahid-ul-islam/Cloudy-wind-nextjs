"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, FolderKanban, Plus, X, Mail, Check } from "lucide-react";
import api from "@/lib/api";
import { Team, Project, Invitation } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [teamsRes, projectsRes, invitesRes] = await Promise.all([
        api.get<Team[]>("/teams"),
        api.get<Project[]>("/projects"),
        api.get<Invitation[]>("/invites"),
      ]);
      setTeams(teamsRes.data);
      setProjects(projectsRes.data);
      setInvites(invitesRes.data);
      if (teamsRes.data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamsRes.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoadingData(false);
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

        <div className="mt-12">
          {isLoadingData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Invites Section */}
              {invites.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Pending Invitations</h2>
                    <Link href="/dashboard/invites" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {invites.slice(0, 3).map((invite) => (
                      <div
                        key={invite._id}
                        className="bg-white rounded-lg border border-primary-200 p-4 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Invitation to {invite.team.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Invited by <span className="font-medium">{invite.inviter.name}</span> as <span className="capitalize">{invite.role}</span>
                            </p>
                          </div>
                        </div>
                        <Link href="/dashboard/invites" className="btn btn-primary py-1.5 px-3 text-sm flex items-center">
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <Link
                        key={project._id}
                        href={`/dashboard/projects/${project._id}`}
                        className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {project.description || "No description"}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {project.key}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <FolderKanban className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">You haven't created any projects yet.</p>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="btn btn-primary text-sm"
                    >
                      Create Project
                    </button>
                  </div>
                )}
              </div>

              {/* Your Teams Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Teams</h2>
                  <Link href="/dashboard/teams" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                {teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.slice(0, 5).map((team) => (
                      <Link
                        key={team._id}
                        href={`/dashboard/teams/${team._id}`}
                        className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-500">{team.members?.length || 0} members</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">You are not part of any team yet.</p>
                    <Link href="/dashboard/teams/new" className="btn btn-primary text-sm inline-block">
                      Create Team
                    </Link>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
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
