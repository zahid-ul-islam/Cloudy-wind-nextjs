import { Response, Request } from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import Team from "../models/Team";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  params: any;
  body: any;
  query: any;
}

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { projectId } = req.params;

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

    const tasks = await Task.find({ project: projectId })
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .sort("order");

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("project")
      .populate("column");

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const {
      title,
      description,
      project,
      column,
      assignee,
      priority,
      labels,
      dueDate,
    } = req.body;

    // Get max order in column
    const maxOrderTask = await Task.findOne({ column }).sort("-order");
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project,
      column,
      assignee,
      reporter: authReq.user?._id,
      priority,
      labels,
      dueDate,
      order,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, assignee, priority, labels, dueDate } =
      req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.assignee = assignee !== undefined ? assignee : task.assignee;
    task.priority = priority || task.priority;
    task.labels = labels || task.labels;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar");

    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Move task to different column
// @route   PUT /api/tasks/:id/move
// @access  Private
export const moveTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { columnId, order } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    task.column = columnId;
    task.order = order;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Reorder tasks
// @route   PUT /api/tasks/reorder
// @access  Private
export const reorderTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tasks } = req.body; // Array of { id, order, column }

    for (const taskData of tasks) {
      await Task.findByIdAndUpdate(taskData.id, {
        order: taskData.order,
        column: taskData.column,
      });
    }

    res.json({ message: "Tasks reordered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
