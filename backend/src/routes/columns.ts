import express from "express";
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "../controllers/columnController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Project columns
router
  .route("/projects/:projectId/columns")
  .get(protect, getColumns)
  .post(protect, createColumn);

// Column operations
router.route("/:id").put(protect, updateColumn).delete(protect, deleteColumn);

// Reorder
router.put("/reorder", protect, reorderColumns);

export default router;
