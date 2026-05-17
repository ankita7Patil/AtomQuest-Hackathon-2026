import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Goal from "./models/Goal.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI before running seed.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([User.deleteMany({}), Goal.deleteMany({}), AuditLog.deleteMany({})]);

const admin = await User.create({ name: "Ananya Rao", email: "admin@atomquest.demo", password: "Password@123", role: "admin", department: "People Ops" });
const manager = await User.create({ name: "Rahul Mehta", email: "manager@atomquest.demo", password: "Password@123", role: "manager", department: "Manufacturing Excellence" });
const employee = await User.create({ name: "Subhash Patil", email: "employee@atomquest.demo", password: "Password@123", role: "employee", department: "Product Engineering", manager: manager._id });

await Goal.create([
  { title: "Reduce motor quality rejection rate", description: "Lower production rejection rate through root cause analysis.", owner: employee._id, manager: manager._id, weightage: 35, planned: 75, actual: 62, status: "On Track", approvalStatus: "Approved" },
  { title: "Launch service dashboard MVP", description: "Deliver warranty, ticket aging, and service SLA dashboard.", owner: employee._id, manager: manager._id, weightage: 30, planned: 60, actual: 55, status: "On Track", approvalStatus: "Approved" },
  { title: "Improve cross-functional goal review cadence", description: "Run monthly goal reviews and publish action summaries.", owner: employee._id, manager: manager._id, weightage: 35, planned: 50, actual: 48, status: "On Track", approvalStatus: "Approved", sharedWith: [manager._id] }
]);

await AuditLog.create({ actor: admin._id, action: "SEED_DATA_CREATED", entity: "System", entityId: "seed" });
console.log("Seeded demo users and goals.");
await mongoose.disconnect();
