import express from "express";
import {
  getSessioni,
  createSessione,
  updateSessione,
  deleteSessione,
} from "../controllers/sessioneController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getSessioni);
router.post("/", auth, createSessione);
router.put("/:id", auth, updateSessione);
router.delete("/:id", auth, deleteSessione);

export default router;
