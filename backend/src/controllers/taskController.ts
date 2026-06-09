import { Response, Request } from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import Column from "../models/Column";
import Team from "../models/Team";
import Notification from "../models/Notification";
import { IUser } from "../types";

interface AuthRequest extends Request {
  user?: IUser;
  params: any;
  body: any;
  query: any;
}

// @desc    Get tasks for a project
// @route   GET /api/tasks/projects/:projectId/tasks
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
      .populate("comments.user", "name email avatar")
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
      .populate("column")
      .populate("comments.user", "name email avatar")
      .populate("activity.user", "name email avatar");

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
      type,
      labels,
      dueDate,
    } = req.body;

    // Fetch project and team for role checks
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const team = await Team.findById(projectDoc.team);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const currentUserMember = team.members.find(
      (m) => m.user.toString() === authReq.user?._id.toString()
    );

    if (!currentUserMember) {
      res.status(403).json({ message: "Not a team member" });
      return;
    }

    const currentUserRole = currentUserMember.role;

    // Check assignment permissions
    if (assignee) {
      if (currentUserRole === "member") {
        res.status(403).json({ message: "Members cannot assign tasks" });
        return;
      }

      if (currentUserRole === "admin") {
        const assigneeMember = team.members.find(
          (m) => m.user.toString() === assignee
        );
        if (!assigneeMember || assigneeMember.role !== "member") {
          res.status(403).json({
            message: "Admins can only assign tasks to Members",
          });
          return;
        }
      }
    }

    // Get max order in column
    const maxOrderTask = await Task.findOne({ column }).sort("-order");
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    // Auto-generate taskNumber per project
    const maxNumberTask = await Task.findOne({ project }).sort("-taskNumber");
    const taskNumber = maxNumberTask ? maxNumberTask.taskNumber + 1 : 1;

    const task = await Task.create({
      title,
      description,
      project,
      column,
      assignee,
      reporter: authReq.user?._id,
      priority,
      type: type || "task",
      taskNumber,
      labels,
      dueDate,
      order,
      activity: [
        {
          user: authReq.user?._id,
          action: "created",
          createdAt: new Date(),
        },
      ],
    });

    // Create notification if assigned
    if (assignee && assignee !== authReq.user?._id.toString()) {
      await Notification.create({
        recipient: assignee,
        sender: authReq.user?._id,
        type: "assignment",
        message: `assigned you to a task: ${task.title}`,
        task: task._id,
        project: projectDoc._id,
      });
    }

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
  const authReq = req as AuthRequest;
  try {
    const { title, description, assignee, priority, type, labels, dueDate } =
      req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Role checks for assignment changes
    if (assignee !== undefined) {
      const oldAssignee = task.assignee ? task.assignee.toString() : "";
      const newAssignee = assignee || "";

      if (oldAssignee !== newAssignee && newAssignee !== "") {
        const projectDoc = await Project.findById(task.project);
        const team = await Team.findById(projectDoc?.team);

        const currentUserMember = team?.members.find(
          (m) => m.user.toString() === authReq.user?._id.toString()
        );
        const currentUserRole = currentUserMember?.role;

        if (currentUserRole === "member") {
          res.status(403).json({ message: "Members cannot assign tasks" });
          return;
        }

        if (currentUserRole === "admin") {
          const assigneeMember = team?.members.find(
            (m) => m.user.toString() === newAssignee
          );
          if (!assigneeMember || assigneeMember.role !== "member") {
            res.status(403).json({
              message: "Admins can only assign tasks to Members",
            });
            return;
          }
        }
      }
    }

    // Track changes in activity log
    const changes: any[] = [];

    if (title && title !== task.title) {
      changes.push({
        user: authReq.user?._id,
        action: "updated",
        field: "title",
        oldValue: task.title,
        newValue: title,
        createdAt: new Date(),
      });
      task.title = title;
    }

    if (description !== undefined && description !== task.description) {
      changes.push({
        user: authReq.user?._id,
        action: "updated",
        field: "description",
        createdAt: new Date(),
      });
      task.description = description;
    }

    if (assignee !== undefined) {
      const oldAssignee = task.assignee ? task.assignee.toString() : "";
      const newAssignee = assignee || "";
      if (oldAssignee !== newAssignee) {
        changes.push({
          user: authReq.user?._id,
          action: assignee ? "assigned" : "unassigned",
          field: "assignee",
          createdAt: new Date(),
        });
        task.assignee = assignee || undefined;

        // Notify new assignee
        if (newAssignee && newAssignee !== authReq.user?._id.toString()) {
          await Notification.create({
            recipient: newAssignee,
            sender: authReq.user?._id,
            type: "assignment",
            message: `assigned you to a task: ${task.title}`,
            task: task._id,
            project: task.project,
          });
        }
      }
    }

    if (priority && priority !== task.priority) {
      changes.push({
        user: authReq.user?._id,
        action: "updated",
        field: "priority",
        oldValue: task.priority,
        newValue: priority,
        createdAt: new Date(),
      });
      task.priority = priority;
    }

    if (type && type !== task.type) {
      changes.push({
        user: authReq.user?._id,
        action: "updated",
        field: "type",
        oldValue: task.type,
        newValue: type,
        createdAt: new Date(),
      });
      task.type = type;
    }

    if (labels) {
      task.labels = labels;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || undefined;
    }

    // Push activity entries
    if (changes.length > 0) {
      task.activity.push(...changes);
    }

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
  const authReq = req as AuthRequest;
  try {
    const { columnId, order } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const oldColumnId = task.column.toString();

    // Log column move in activity
    if (oldColumnId !== columnId) {
      // Get column names for readable activity log
      const [oldCol, newCol] = await Promise.all([
        Column.findById(oldColumnId),
        Column.findById(columnId),
      ]);

      task.activity.push({
        user: authReq.user?._id as any,
        action: "moved",
        field: "status",
        oldValue: oldCol?.name || oldColumnId,
        newValue: newCol?.name || columnId,
        createdAt: new Date(),
      });
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

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: "Comment text is required" });
      return;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    task.comments.push({
      user: authReq.user?._id as any,
      text: text.trim(),
      createdAt: new Date(),
    });

    task.activity.push({
      user: authReq.user?._id as any,
      action: "commented",
      createdAt: new Date(),
    });

    await task.save();

    // Return the populated task
    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("comments.user", "name email avatar")
      .populate("activity.user", "name email avatar");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get task activity log
// @route   GET /api/tasks/:id/activity
// @access  Private
export const getTaskActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .select("activity")
      .populate("activity.user", "name email avatar");

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task.activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
};
