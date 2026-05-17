import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { usingMemoryStore } from "../utils/db.js";
import User from "../models/User.js";
import { users, publicUser } from "../data/demoStore.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();
router.use(requireAuth);

router.get("/", allowRoles("admin", "manager"), async (req, res, next) => {
  try {
    if (usingMemoryStore) {
      const visible = req.user.role === "admin"
        ? users
        : users.filter((user) => user.manager === req.user._id || user._id === req.user._id);
      return res.json({ users: visible.map(publicUser) });
    }

    const query = req.user.role === "admin" ? {} : { $or: [{ manager: req.user._id }, { _id: req.user._id }] };
    const data = await User.find(query).select("-password").populate("manager", "name email role");
    res.json({ users: data });
  } catch (error) {
    next(error);
  }
});

router.post("/", allowRoles("admin"), async (req, res, next) => {
  try {
    const { name, email, password, role, department, manager } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (!["employee", "manager", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be employee, manager, or admin." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    if (usingMemoryStore) {
      if (users.some((user) => user.email === email.toLowerCase())) {
        return res.status(409).json({ message: "A user with this email already exists." });
      }
      const user = {
        _id: `u-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password,
        role,
        department: department || "General",
        manager: manager || undefined
      };
      users.push(user);
      await writeAudit({ actor: req.user._id, action: "USER_CREATED", entity: "User", entityId: user._id, metadata: { email, role } });
      return res.status(201).json({ user: publicUser(user) });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "A user with this email already exists." });

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || "General",
      manager: manager || undefined
    });

    await writeAudit({
      actor: req.user._id,
      action: "USER_CREATED",
      entity: "User",
      entityId: user._id.toString(),
      metadata: { email, role }
    });

    const safeUser = await User.findById(user._id).select("-password").populate("manager", "name email role");
    res.status(201).json({ user: safeUser });
  } catch (error) {
    next(error);
  }
});

export default router;
