import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { usingMemoryStore } from "../utils/db.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { goals, users } from "../data/demoStore.js";
import { calculateProgress } from "../utils/goalValidation.js";

const router = Router();
router.use(requireAuth);

function visibleGoals(user) {
  if (user.role === "admin") return goals;
  return goals.filter((goal) => goal.owner === user._id || goal.manager === user._id || goal.sharedWith?.includes(user._id));
}

router.get("/", async (req, res, next) => {
  try {
    if (usingMemoryStore) {
      const data = visibleGoals(req.user);
      const submitted = data.filter((goal) => goal.approvalStatus === "Submitted").length;
      const approved = data.filter((goal) => goal.approvalStatus === "Approved").length;
      const completed = data.filter((goal) => goal.status === "Completed").length;
      const totalWeightage = data
        .filter((goal) => goal.owner === req.user._id && goal.approvalStatus !== "Rejected")
        .reduce((sum, goal) => sum + Number(goal.weightage), 0);

      return res.json({
        metrics: {
          totalGoals: data.length,
          submitted,
          approved,
          completed,
          progress: calculateProgress(data),
          totalWeightage,
          people: req.user.role === "admin" ? users.length : users.filter((user) => user.manager === req.user._id).length
        },
        statusBreakdown: ["Not Started", "On Track", "Completed"].map((status) => ({
          status,
          count: data.filter((goal) => goal.status === status).length
        })),
        approvalQueue: data.filter((goal) => goal.approvalStatus === "Submitted")
      });
    }

    const query = req.user.role === "admin"
      ? {}
      : { $or: [{ owner: req.user._id }, { manager: req.user._id }, { sharedWith: req.user._id }] };
    const data = await Goal.find(query).populate("owner manager", "name email role department");
    const people = req.user.role === "admin" ? await User.countDocuments() : await User.countDocuments({ manager: req.user._id });

    res.json({
      metrics: {
        totalGoals: data.length,
        submitted: data.filter((goal) => goal.approvalStatus === "Submitted").length,
        approved: data.filter((goal) => goal.approvalStatus === "Approved").length,
        completed: data.filter((goal) => goal.status === "Completed").length,
        progress: calculateProgress(data),
        totalWeightage: data.filter((goal) => goal.owner._id.toString() === req.user._id.toString() && goal.approvalStatus !== "Rejected").reduce((sum, goal) => sum + Number(goal.weightage), 0),
        people
      },
      statusBreakdown: ["Not Started", "On Track", "Completed"].map((status) => ({ status, count: data.filter((goal) => goal.status === status).length })),
      approvalQueue: data.filter((goal) => goal.approvalStatus === "Submitted")
    });
  } catch (error) {
    next(error);
  }
});

export default router;
