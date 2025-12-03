"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Check, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface Invitation {
  _id: string;
  team: {
    _id: string;
    name: string;
    description: string;
  };
  inviter: {
    name: string;
    email: string;
    avatar?: string;
  };
  role: string;
  status: string;
  createdAt: string;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await api.get<Invitation[]>("/invites");
      setInvites(response.data);
    } catch (error) {
      console.error("Failed to fetch invites", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await api.put(`/invites/${id}/accept`);
      // Redirect to the team page
      router.push(`/dashboard/teams/${response.data.teamId}`);
    } catch (error) {
      console.error("Failed to accept invite", error);
      alert("Failed to accept invitation");
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/invites/${id}/reject`);
      // Remove from list
      setInvites(invites.filter((invite) => invite._id !== id));
    } catch (error) {
      console.error("Failed to reject invite", error);
      alert("Failed to reject invitation");
    } finally {
      setActionLoading(null);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invitations</h1>

        {invites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No pending invitations
            </h3>
            <p className="text-gray-500">
              When you're invited to a team, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div
                key={invite._id}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Invitation to join {invite.team.name}
                    </h3>
                    <p className="text-gray-600">
                      Invited by{" "}
                      <span className="font-medium">{invite.inviter.name}</span>{" "}
                      as <span className="capitalize">{invite.role}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleReject(invite._id)}
                    disabled={actionLoading === invite._id}
                    className="btn btn-secondary flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleAccept(invite._id)}
                    disabled={actionLoading === invite._id}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {actionLoading === invite._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
