import express from "express";
import {
  getFeedback,
  generateFeedback,
} from "../controllers/feedbackController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getFeedback);
router.post("/generate", auth, generateFeedback);

export default router;
