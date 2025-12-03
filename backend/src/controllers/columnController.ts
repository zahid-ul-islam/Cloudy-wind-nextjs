import { Response, Request } from "express";
import Column from "../models/Column";
import Project from "../models/Project";
import Team from "../models/Team";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  params: any;
  body: any;
}

// @desc    Get columns for a project
// @route   GET /api/projects/:projectId/columns
// @access  Private
export const getColumns = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("team");
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
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const columns = await Column.find({ project: projectId }).sort("order");
    res.json(columns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create column
// @route   POST /api/projects/:projectId/columns
// @access  Private
export const createColumn = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { projectId } = req.params;
    const { name, color } = req.body;

    const project = await Project.findById(projectId);
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
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Get max order
    const maxOrderColumn = await Column.findOne({ project: projectId }).sort(
      "-order"
    );
    const order = maxOrderColumn ? maxOrderColumn.order + 1 : 0;

    const column = await Column.create({
      name,
      color,
      project: projectId,
      order,
    });

    res.status(201).json(column);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update column
// @route   PUT /api/columns/:id
// @access  Private
export const updateColumn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, color } = req.body;

    const column = await Column.findById(req.params.id);
    if (!column) {
      res.status(404).json({ message: "Column not found" });
      return;
    }

    column.name = name || column.name;
    column.color = color || column.color;

    const updatedColumn = await column.save();
    res.json(updatedColumn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete column
// @route   DELETE /api/columns/:id
// @access  Private
export const deleteColumn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) {
      res.status(404).json({ message: "Column not found" });
      return;
    }

    // Delete tasks in this column
    const Task = (await import("../models/Task")).default;
    await Task.deleteMany({ column: column._id });

    await column.deleteOne();
    res.json({ message: "Column removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Reorder columns
// @route   PUT /api/columns/reorder
// @access  Private
export const reorderColumns = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { columns } = req.body; // Array of { id, order }

    for (const col of columns) {
      await Column.findByIdAndUpdate(col.id, { order: col.order });
    }

    res.json({ message: "Columns reordered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
