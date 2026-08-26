import express from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../controllers/profileController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getProfile);
router.post("/", auth, createProfile);
router.put("/", auth, updateProfile);

export default router;
