import { Response, Request } from "express";
import Team from "../models/Team";
import User from "../models/User";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all teams for user
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const teams = await Team.find({
      "members.user": authReq.user?._id,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort("-createdAt");

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeam = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const team = await Team.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if user is a member
    const isMember = team.members.some(
      (member) => member.user._id.toString() === authReq.user?._id.toString()
    );

    if (!isMember) {
      res.status(403).json({ message: "Not authorized to view this team" });
      return;
    }

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: authReq.user?._id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(201).json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { name, description } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if user is owner or admin
    const member = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res.status(403).json({ message: "Not authorized to update this team" });
      return;
    }

    team.name = name || team.name;
    team.description =
      description !== undefined ? description : team.description;

    const updatedTeam = await team.save();
    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
export const deleteTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Only owner can delete team
    if (team.owner.toString() !== authReq.user?._id.toString()) {
      res.status(403).json({ message: "Only the owner can delete this team" });
      return;
    }

    await team.deleteOne();

    res.json({ message: "Team removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Add team member
// @route   POST /api/teams/:id/members
// @access  Private
export const addMember = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { email, role = "member" } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if requester is owner or admin
    const requester = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      res.status(403).json({ message: "Not authorized to add members" });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user is already a member
    const existingMember = team.members.find(
      (m) => m.user.toString() === user._id.toString()
    );

    if (existingMember) {
      res.status(400).json({ message: "User is already a team member" });
      return;
    }

    // Add member
    team.members.push({
      user: user._id,
      role: role as "owner" | "admin" | "member",
      joinedAt: new Date(),
    });

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Remove team member
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
export const removeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if requester is owner or admin
    const requester = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      res.status(403).json({ message: "Not authorized to remove members" });
      return;
    }

    // Cannot remove owner
    if (team.owner.toString() === req.params.userId) {
      res.status(400).json({ message: "Cannot remove team owner" });
      return;
    }

    // Remove member
    team.members = team.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update team member role
// @route   PATCH /api/teams/:id/members/:userId/role
// @access  Private
export const updateMemberRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if requester is owner or admin
    const requester = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (
      !requester ||
      (requester.role !== "owner" && requester.role !== "admin")
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to update member roles" });
      return;
    }

    // Find member to update
    const memberToUpdate = team.members.find(
      (m) => m.user.toString() === req.params.userId
    );

    if (!memberToUpdate) {
      res.status(404).json({ message: "Member not found in this team" });
      return;
    }

    // Prevent changing owner's role
    if (memberToUpdate.role === "owner") {
      res.status(403).json({ message: "Cannot change role of team owner" });
      return;
    }

    // Update role
    memberToUpdate.role = role;

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
