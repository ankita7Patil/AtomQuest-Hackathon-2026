import jwt from "jsonwebtoken";
import { usingMemoryStore } from "../utils/db.js";
import User from "../models/User.js";
import { users, publicUser } from "../data/demoStore.js";

const secret = () => process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, secret(), { expiresIn: "8h" });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;
    if (!token) return res.status(401).json({ message: "Authentication token is required." });

    const decoded = jwt.verify(token, secret());
    const user = usingMemoryStore
      ? publicUser(users.find((item) => item._id === decoded.id) || {})
      : await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User no longer exists." });
    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    next();
  };
}
