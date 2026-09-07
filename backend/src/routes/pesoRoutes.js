import express from "express";
import {
  getPesiLog,
  createPesoLog,
  deletePesoLog,
} from "../controllers/pesoController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPesiLog);
router.post("/", auth, createPesoLog);
router.delete("/:id", auth, deletePesoLog);

export default router;
