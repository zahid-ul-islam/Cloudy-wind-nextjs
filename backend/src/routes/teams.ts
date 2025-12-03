import express from "express";
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
} from "../controllers/teamController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").get(protect, getTeams).post(protect, createTeam);

router
  .route("/:id")
  .get(protect, getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.post("/:id/members", protect, addMember);
router.delete("/:id/members/:userId", protect, removeMember);
router.patch("/:id/members/:userId/role", protect, updateMemberRole);

export default router;
