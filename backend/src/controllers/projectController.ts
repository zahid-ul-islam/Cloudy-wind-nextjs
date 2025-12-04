import { Response, Request } from "express";
import Project from "../models/Project";
import Column from "../models/Column";
import Team from "../models/Team";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  query: any;
  params: any;
  body: any;
}

// @desc    Get all projects for a team
// @route   GET /api/projects?teamId=xxx
// @access  Private
export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { teamId } = req.query;

    if (!teamId) {
      res.status(400).json({ message: "Team ID required" });
      return;
    }

    // Verify user is team member
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const isMember = team.members.some(
      (member) => member.user.toString() === authReq.user?._id.toString()
    );

    if (!isMember) {
      res.status(403).json({ message: "Not a team member" });
      return;
    }

    const projects = await Project.find({ team: teamId })
      .populate("createdBy", "name email avatar")
      .populate("team", "name")
      .sort("-createdAt");

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("team", "name");

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify user is team member
    const team = await Team.findById(project.team);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const isMember = team.members.some(
      (member) => member.user.toString() === authReq.user?._id.toString()
    );

    if (!isMember) {
      res.status(403).json({ message: "Not authorized to view this project" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { name, description, teamId } = req.body;

    // Verify user is team member
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const member = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (!member) {
      res.status(403).json({ message: "Not a team member" });
      return;
    }

    // Auto-generate project key from name
    // Take first 2-5 characters (letters only) from the project name
    let baseKey = name
      .replace(/[^a-zA-Z]/g, "") // Remove non-letters
      .substring(0, 5)
      .toUpperCase();

    // Ensure key is at least 2 characters
    if (baseKey.length < 2) {
      baseKey = "PRJ"; // Default fallback
    }

    // Check for uniqueness and append number if needed
    let key = baseKey;
    let suffix = 1;
    let isUnique = false;

    while (!isUnique) {
      const existingProject = await Project.findOne({ team: teamId, key });
      if (!existingProject) {
        isUnique = true;
      } else {
        key = `${baseKey}${suffix}`;
        suffix++;
      }
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      key,
      team: teamId,
      createdBy: authReq.user?._id,
    });

    // Create default columns
    const defaultColumns = [
      { name: "To Do", order: 0, color: "#94a3b8" },
      { name: "In Progress", order: 1, color: "#3b82f6" },
      { name: "Done", order: 2, color: "#22c55e" },
    ];

    for (const col of defaultColumns) {
      await Column.create({
        ...col,
        project: project._id,
      });
    }

    const populatedProject = await Project.findById(project._id)
      .populate("createdBy", "name email avatar")
      .populate("team", "name");

    res.status(201).json(populatedProject);
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Project key already exists for this team" });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify user is team member with admin/owner role
    const team = await Team.findById(project.team);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const member = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res
        .status(403)
        .json({ message: "Not authorized to update this project" });
      return;
    }

    project.name = name || project.name;
    project.description =
      description !== undefined ? description : project.description;

    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id)
      .populate("createdBy", "name email avatar")
      .populate("team", "name");

    res.json(populatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify user is team owner or admin
    const team = await Team.findById(project.team);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const member = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
      return;
    }

    // Delete associated columns and tasks
    await Column.deleteMany({ project: project._id });
    const Task = (await import("../models/Task")).default;
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();

    res.json({ message: "Project removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
