import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { usingMemoryStore } from "../utils/db.js";
import AuditLog from "../models/AuditLog.js";
import { auditLogs, users } from "../data/demoStore.js";

const router = Router();
router.use(requireAuth, allowRoles("admin", "manager"));

router.get("/", async (_req, res, next) => {
  try {
    if (usingMemoryStore) {
      const logs = auditLogs.slice(0, 50).map((log) => ({
        ...log,
        actor: users.find((user) => user._id === log.actor)
      }));
      return res.json({ logs });
    }

    const logs = await AuditLog.find({}).populate("actor", "name email role").sort("-createdAt").limit(100);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

export default router;
