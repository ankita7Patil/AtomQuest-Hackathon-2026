import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "goal-portal-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
