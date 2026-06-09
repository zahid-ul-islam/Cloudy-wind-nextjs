import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
  addComment,
  getTaskActivity,
} from "../controllers/taskController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Project tasks
router.route("/projects/:projectId/tasks").get(protect, getTasks);

// Task operations
router.route("/").post(protect, createTask);

router
  .route("/:id")
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Move and reorder
router.put("/:id/move", protect, moveTask);
router.put("/reorder", protect, reorderTasks);

// Comments and activity
router.post("/:id/comments", protect, addComment);
router.get("/:id/activity", protect, getTaskActivity);

export default router;

