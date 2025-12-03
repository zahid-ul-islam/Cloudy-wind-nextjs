import express from "express";
import {
  sendInvite,
  getMyInvites,
  acceptInvite,
  rejectInvite,
} from "../controllers/inviteController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

router.post("/", sendInvite);
router.get("/", getMyInvites);
router.put("/:id/accept", acceptInvite);
router.put("/:id/reject", rejectInvite);

export default router;
