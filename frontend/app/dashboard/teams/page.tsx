"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Team } from "@/types";
import { Users, Plus, Settings, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TeamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get<Team[]>("/teams");
      setTeams(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
            <p className="text-gray-600">
              Manage your teams and collaborate with others
            </p>
          </div>
          <Link
            href="/dashboard/teams/new"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Team</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first team to start collaborating
            </p>
            <Link
              href="/dashboard/teams/new"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Team</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const userMember = team.members.find(
                (m) =>
                  (typeof m.user === "object" && m.user._id === user?._id) ||
                  (m.user as any) === user?._id
              );
              const userRole = userMember?.role || "member";

              return (
                <div
                  key={team._id}
                  className="card hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => router.push(`/dashboard/teams/${team._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`badge ${getRoleBadgeColor(userRole)} ml-2`}
                    >
                      {userRole}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{team.members.length} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(userRole === "owner" || userRole === "admin") && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/teams/${team._id}/settings`);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
