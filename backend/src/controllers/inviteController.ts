import { Response, Request } from "express";
import Invitation from "../models/Invitation";
import Team from "../models/Team";
import User from "../models/User";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  body: any;
  params: any;
}

// @desc    Send invitation
// @route   POST /api/invites
// @access  Private
export const sendInvite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, teamId, role = "member" } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check permissions
    const requester = team.members.find(
      (m) => m.user.toString() === req.user?._id.toString()
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      res.status(403).json({ message: "Not authorized to invite members" });
      return;
    }

    // Check if user is already in team
    const user = await User.findOne({ email });
    if (user) {
      const isMember = team.members.some(
        (m) => m.user.toString() === user._id.toString()
      );
      if (isMember) {
        res.status(400).json({ message: "User is already a member" });
        return;
      }
    }

    // Check for existing pending invite
    const existingInvite = await Invitation.findOne({
      email,
      team: teamId,
      status: "pending",
    });

    if (existingInvite) {
      res.status(400).json({ message: "Invitation already sent" });
      return;
    }

    const invitation = await Invitation.create({
      email,
      team: teamId,
      inviter: req.user?._id,
      role,
    });

    const populatedInvite = await Invitation.findById(invitation._id)
      .populate("team", "name")
      .populate("inviter", "name email avatar");

    res.status(201).json(populatedInvite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get my invitations
// @route   GET /api/invites
// @access  Private
export const getMyInvites = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invites = await Invitation.find({
      email: req.user?.email,
      status: "pending",
    })
      .populate("team", "name description")
      .populate("inviter", "name email avatar")
      .sort("-createdAt");

    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Accept invitation
// @route   PUT /api/invites/:id/accept
// @access  Private
export const acceptInvite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (invite.email !== req.user?.email) {
      res.status(403).json({ message: "This invitation is not for you" });
      return;
    }

    if (invite.status !== "pending") {
      res.status(400).json({ message: "Invitation is not pending" });
      return;
    }

    const team = await Team.findById(invite.team);
    if (!team) {
      res.status(404).json({ message: "Team no longer exists" });
      return;
    }

    // Add user to team
    team.members.push({
      user: req.user._id,
      role: invite.role,
      joinedAt: new Date(),
    });

    await team.save();

    // Update invite status
    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invitation accepted", teamId: team._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Reject invitation
// @route   PUT /api/invites/:id/reject
// @access  Private
export const rejectInvite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (invite.email !== req.user?.email) {
      res.status(403).json({ message: "This invitation is not for you" });
      return;
    }

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invitation rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
