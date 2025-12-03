"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Team, Project } from "@/types";
import {
  Users,
  Loader2,
  Settings,
  Plus,
  FolderKanban,
  Mail,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMemberSchema, AddMemberFormData } from "@/lib/validations";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  });

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const [teamRes, projectsRes] = await Promise.all([
        api.get<Team>(`/teams/${teamId}`),
        api.get<Project[]>(`/projects?teamId=${teamId}`),
      ]);
      setTeam(teamRes.data);
      setProjects(projectsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (data: AddMemberFormData) => {
    setInviteLoading(true);
    setInviteError("");

    try {
      await api.post("/invites", {
        email: data.email,
        teamId: teamId,
        role: data.role,
      });
      setShowInviteModal(false);
      reset();
      alert("Invitation sent successfully!");
    } catch (err: any) {
      setInviteError(err.response?.data?.message || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      await fetchTeamData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/teams/${teamId}/members/${userId}/role`, {
        role: newRole,
      });
      await fetchTeamData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update member role");
    }
  };

  const userMember = team?.members.find(
    (m) => (typeof m.user === "string" ? m.user : m.user._id) === user?._id
  );
  const userRole = userMember?.role || "member";
  const canManage = userRole === "owner" || userRole === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Team not found"}</p>
          <Link href="/dashboard/teams" className="btn btn-primary">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/teams"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Teams
            </Link>
            {canManage && (
              <Link
                href={`/dashboard/teams/${teamId}/settings`}
                className="btn btn-secondary flex items-center space-x-2 text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="card mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.name}
              </h1>
              {team.description && (
                <p className="text-gray-600">{team.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              {canManage && (
                <Link
                  href={`/dashboard/projects/new?teamId=${teamId}`}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="card text-center py-12">
                <FolderKanban className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first project to get started
                </p>
                {canManage && (
                  <Link
                    href={`/dashboard/projects/new?teamId=${teamId}`}
                    className="btn btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Project</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/dashboard/projects/${project._id}`}
                    className="card hover:shadow-lg transition-all group cursor-pointer block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                            {project.key}
                          </span>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {project.name}
                          </h3>
                        </div>
                        {project.description && (
                          <p className="text-gray-600 text-sm">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <FolderKanban className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Members</h2>
              {canManage && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn btn-primary flex items-center space-x-2 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>Invite</span>
                </button>
              )}
            </div>

            <div className="card space-y-4">
              {team.members.map((member) => (
                <div
                  key={
                    typeof member.user === "string"
                      ? member.user
                      : member.user._id
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canManage &&
                    member.role !== "owner" &&
                    member.user._id !== user?._id ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateMemberRole(
                            typeof member.user === "string"
                              ? member.user
                              : member.user._id,
                            e.target.value
                          )
                        }
                        className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${
                          member.role === "admin"
                            ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                            : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${
                          member.role === "owner"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role}
                      </span>
                    )}

                    {canManage &&
                      member.role !== "owner" &&
                      member.user._id !== user?._id && (
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              typeof member.user === "string"
                                ? member.user
                                : member.user._id
                            )
                          }
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Invite Member
            </h3>

            <form
              onSubmit={handleSubmit(handleInviteMember)}
              className="space-y-4"
            >
              {inviteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {inviteError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="input w-full"
                  placeholder="colleague@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="label">
                  Role
                </label>
                <select
                  {...register("role")}
                  id="role"
                  className="input w-full"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Inviting...</span>
                    </>
                  ) : (
                    <span>Send Invite</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    reset();
                    setInviteError("");
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
