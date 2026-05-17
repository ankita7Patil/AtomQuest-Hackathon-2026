import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { usingMemoryStore } from "../utils/db.js";
import Goal from "../models/Goal.js";
import { goals, users } from "../data/demoStore.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();
router.use(requireAuth);

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

router.get("/goals.csv", allowRoles("manager", "admin"), async (req, res, next) => {
  try {
    const rows = [["Owner", "Manager", "Title", "Weightage", "Planned", "Actual", "Status", "Approval", "Shared", "Updated"]];

    if (usingMemoryStore) {
      goals.forEach((goal) => {
        const owner = users.find((user) => user._id === goal.owner);
        const manager = users.find((user) => user._id === goal.manager);
        rows.push([owner?.name, manager?.name, goal.title, goal.weightage, goal.planned, goal.actual, goal.status, goal.approvalStatus, goal.sharedWith?.length || 0, new Date().toISOString()]);
      });
    } else {
      const data = await Goal.find({}).populate("owner manager sharedWith", "name email");
      data.forEach((goal) => rows.push([goal.owner?.name, goal.manager?.name, goal.title, goal.weightage, goal.planned, goal.actual, goal.status, goal.approvalStatus, goal.sharedWith?.length || 0, goal.updatedAt.toISOString()]));
    }

    await writeAudit({ actor: req.user._id, action: "REPORT_EXPORTED", entity: "Report", entityId: "goals.csv" });
    res.header("Content-Type", "text/csv");
    res.attachment("goal-report.csv");
    res.send(rows.map((row) => row.map(csvEscape).join(",")).join("\n"));
  } catch (error) {
    next(error);
  }
});

export default router;
