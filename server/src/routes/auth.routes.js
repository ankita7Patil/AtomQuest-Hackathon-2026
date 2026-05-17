import { Router } from "express";
import bcrypt from "bcryptjs";
import { usingMemoryStore } from "../utils/db.js";
import User from "../models/User.js";
import { users, publicUser } from "../data/demoStore.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { writeAudit } from "../utils/audit.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = usingMemoryStore
      ? users.find((item) => item.email === email.toLowerCase())
      : await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    const isValid = usingMemoryStore ? bcrypt.compareSync(password, user.password) : await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ message: "Invalid email or password." });

    await writeAudit({ actor: user._id, action: "LOGIN", entity: "User", entityId: user._id });
    res.json({ token: signToken(user), user: usingMemoryStore ? publicUser(user) : user.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
