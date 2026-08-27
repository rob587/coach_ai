import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import sessioneRoutes from "./routes/sessioneRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importare routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/sessioni", sessioneRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CoachAI API funzionante" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Errore interno del server" });
});

export default app;
