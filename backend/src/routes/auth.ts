import express from "express";
import {
  register,
  login,
  getMe,
  refreshToken,
  updateProfile,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/refresh", refreshToken);

export default router;
