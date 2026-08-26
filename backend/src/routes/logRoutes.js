import express from "express";
import {
  getLogs,
  getLogsByEsercizio,
  createLog,
  updateLog,
  deleteLog,
  getSuggerimentoCarichi,
} from "../controllers/logController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getLogs);
router.get("/esercizio/:nome_esercizio", auth, getLogsByEsercizio);
router.get("/suggerimento/:sessione_id", auth, getSuggerimentoCarichi);
router.post("/", auth, createLog);
router.put("/:id", auth, updateLog);
router.delete("/:id", auth, deleteLog);

export default router;
