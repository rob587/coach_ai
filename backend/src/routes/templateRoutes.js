import express from "express";
import {
  getTemplate,
  saveTemplate,
  deleteTemplate,
} from "../controllers/templateController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:sessione_id", auth, getTemplate);
router.post("/", auth, saveTemplate);
router.delete("/:sessione_id", auth, deleteTemplate);

export default router;
