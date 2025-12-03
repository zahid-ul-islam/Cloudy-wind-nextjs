"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { projectSchema, ProjectFormData } from "@/lib/validations";
import { Loader2, FolderKanban } from "lucide-react";

export default function NewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      teamId,
    },
  });

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      setTeamName(response.data.name);
    } catch (err) {
      console.error("Failed to load team");
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/projects", data);
      router.push(`/dashboard/projects/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/dashboard/teams/${teamId}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to {teamName || "Team"}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FolderKanban className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Project
            </h1>
            <p className="text-gray-600">
              Set up a project with a Kanban board
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <input type="hidden" {...register("teamId")} value={teamId} />

              <div>
                <label htmlFor="name" className="label">
                  Project Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className="input"
                  placeholder="Website Redesign"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="key" className="label">
                  Project Key *
                </label>
                <input
                  {...register("key")}
                  type="text"
                  id="key"
                  className="input uppercase"
                  placeholder="WEB"
                  maxLength={5}
                />
                <p className="mt-1 text-xs text-gray-500">
                  2-5 uppercase letters. Used for task identifiers (e.g.,
                  WEB-123)
                </p>
                {errors.key && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.key.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description (Optional)
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={4}
                  className="input"
                  placeholder="Describe the project goals..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex items-center space-x-2 flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
                <Link
                  href={`/dashboard/teams/${teamId}`}
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
