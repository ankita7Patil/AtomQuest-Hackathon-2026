import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { usingMemoryStore } from "../utils/db.js";
import Goal from "../models/Goal.js";
import { goals, users } from "../data/demoStore.js";
import { validateGoalPlan } from "../utils/goalValidation.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();
router.use(requireAuth);

function canSeeGoal(user, goal) {
  if (user.role === "admin") return true;
  if (goal.owner === user._id) return true;
  if (goal.manager === user._id) return true;
  return goal.sharedWith?.includes(user._id);
}

function hydrate(goal) {
  const owner = users.find((user) => user._id === goal.owner);
  const manager = users.find((user) => user._id === goal.manager);
  return { ...goal, owner, manager };
}

router.get("/", async (req, res, next) => {
  try {
    if (usingMemoryStore) return res.json({ goals: goals.filter((goal) => canSeeGoal(req.user, goal)).map(hydrate) });

    const query = req.user.role === "admin"
      ? {}
      : { $or: [{ owner: req.user._id }, { manager: req.user._id }, { sharedWith: req.user._id }] };
    const data = await Goal.find(query).populate("owner manager sharedWith", "name email role department").sort("-updatedAt");
    res.json({ goals: data });
  } catch (error) {
    next(error);
  }
});

router.post("/", allowRoles("employee", "manager", "admin"), async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      weightage: Number(req.body.weightage),
      planned: Number(req.body.planned || 0),
      actual: Number(req.body.actual || 0),
      status: req.body.status || "Not Started",
      owner: req.user._id,
      manager: req.user.manager || req.body.manager || req.user._id,
      sharedWith: req.body.sharedWith || []
    };

    if (!payload.title || payload.weightage < 10) return res.status(400).json({ message: "Title and minimum 10% weightage are required." });

    if (usingMemoryStore) {
      const draftGoals = goals.filter((goal) => goal.owner === req.user._id && goal.approvalStatus === "Draft");
      if (draftGoals.length >= 8) return res.status(400).json({ message: "Maximum 8 goals are allowed." });
      const goal = { _id: `g-${Date.now()}`, approvalStatus: "Draft", checkIns: [], ...payload };
      goals.unshift(goal);
      await writeAudit({ actor: req.user._id, action: "GOAL_CREATED", entity: "Goal", entityId: goal._id });
      return res.status(201).json({ goal: hydrate(goal) });
    }

    const currentDrafts = await Goal.find({ owner: req.user._id, approvalStatus: "Draft" });
    if (currentDrafts.length >= 8) return res.status(400).json({ message: "Maximum 8 goals are allowed." });
    const goal = await Goal.create(payload);
    await writeAudit({ actor: req.user._id, action: "GOAL_CREATED", entity: "Goal", entityId: goal._id.toString() });
    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
});

router.post("/submit", allowRoles("employee", "manager"), async (req, res, next) => {
  try {
    if (usingMemoryStore) {
      const draftGoals = goals.filter((goal) => goal.owner === req.user._id && goal.approvalStatus === "Draft");
      const validation = validateGoalPlan(draftGoals);
      if (validation) return res.status(400).json({ message: validation });
      draftGoals.forEach((goal) => { goal.approvalStatus = "Submitted"; goal.manager = req.user.manager || goal.manager; });
      await writeAudit({ actor: req.user._id, action: "GOALS_SUBMITTED", entity: "GoalPlan", entityId: req.user._id, metadata: { count: draftGoals.length } });
      return res.json({ goals: draftGoals.map(hydrate) });
    }

    const draftGoals = await Goal.find({ owner: req.user._id, approvalStatus: "Draft" });
    const validation = validateGoalPlan(draftGoals);
    if (validation) return res.status(400).json({ message: validation });
    await Goal.updateMany({ owner: req.user._id, approvalStatus: "Draft" }, { approvalStatus: "Submitted" });
    await writeAudit({ actor: req.user._id, action: "GOALS_SUBMITTED", entity: "GoalPlan", entityId: req.user._id.toString(), metadata: { count: draftGoals.length } });
    res.json({ message: "Goal plan submitted for manager approval." });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/approval", allowRoles("manager", "admin"), async (req, res, next) => {
  try {
    const { decision, rejectionReason = "" } = req.body;
    if (!["Approved", "Rejected"].includes(decision)) return res.status(400).json({ message: "Decision must be Approved or Rejected." });

    if (usingMemoryStore) {
      const goal = goals.find((item) => item._id === req.params.id);
      if (!goal) return res.status(404).json({ message: "Goal not found." });
      if (req.user.role === "manager" && goal.manager !== req.user._id) return res.status(403).json({ message: "Only assigned manager can review this goal." });
      goal.approvalStatus = decision;
      goal.rejectionReason = rejectionReason;
      await writeAudit({ actor: req.user._id, action: `GOAL_${decision.toUpperCase()}`, entity: "Goal", entityId: goal._id });
      return res.json({ goal: hydrate(goal) });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    if (req.user.role === "manager" && goal.manager?.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Only assigned manager can review this goal." });
    goal.approvalStatus = decision;
    goal.rejectionReason = rejectionReason;
    await goal.save();
    await writeAudit({ actor: req.user._id, action: `GOAL_${decision.toUpperCase()}`, entity: "Goal", entityId: goal._id.toString() });
    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status, actual } = req.body;
    if (!["Not Started", "On Track", "Completed"].includes(status)) return res.status(400).json({ message: "Invalid status." });

    if (usingMemoryStore) {
      const goal = goals.find((item) => item._id === req.params.id);
      if (!goal || !canSeeGoal(req.user, goal)) return res.status(404).json({ message: "Goal not found." });
      goal.status = status;
      goal.actual = Number(actual ?? goal.actual);
      await writeAudit({ actor: req.user._id, action: "GOAL_STATUS_UPDATED", entity: "Goal", entityId: goal._id, metadata: { status, actual: goal.actual } });
      return res.json({ goal: hydrate(goal) });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    goal.status = status;
    goal.actual = Number(actual ?? goal.actual);
    await goal.save();
    await writeAudit({ actor: req.user._id, action: "GOAL_STATUS_UPDATED", entity: "Goal", entityId: goal._id.toString(), metadata: { status, actual: goal.actual } });
    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/checkins", async (req, res, next) => {
  try {
    const checkIn = {
      quarter: req.body.quarter,
      planned: Number(req.body.planned),
      actual: Number(req.body.actual),
      comment: req.body.comment || "",
      updatedBy: req.user._id
    };
    if (!["Q1", "Q2", "Q3", "Q4"].includes(checkIn.quarter)) return res.status(400).json({ message: "Quarter must be Q1, Q2, Q3, or Q4." });

    if (usingMemoryStore) {
      const goal = goals.find((item) => item._id === req.params.id);
      if (!goal || !canSeeGoal(req.user, goal)) return res.status(404).json({ message: "Goal not found." });
      goal.checkIns = goal.checkIns.filter((item) => item.quarter !== checkIn.quarter).concat(checkIn);
      goal.planned = checkIn.planned;
      goal.actual = checkIn.actual;
      goal.status = checkIn.actual >= 100 ? "Completed" : checkIn.actual > 0 ? "On Track" : "Not Started";
      await writeAudit({ actor: req.user._id, action: "CHECKIN_UPSERTED", entity: "Goal", entityId: goal._id, metadata: checkIn });
      return res.json({ goal: hydrate(goal) });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found." });
    goal.checkIns = goal.checkIns.filter((item) => item.quarter !== checkIn.quarter).concat(checkIn);
    goal.planned = checkIn.planned;
    goal.actual = checkIn.actual;
    goal.status = checkIn.actual >= 100 ? "Completed" : checkIn.actual > 0 ? "On Track" : "Not Started";
    await goal.save();
    await writeAudit({ actor: req.user._id, action: "CHECKIN_UPSERTED", entity: "Goal", entityId: goal._id.toString(), metadata: checkIn });
    res.json({ goal });
  } catch (error) {
    next(error);
  }
});

export default router;
