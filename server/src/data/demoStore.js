import bcrypt from "bcryptjs";

const passwordHash = bcrypt.hashSync("Password@123", 10);

export const users = [
  { _id: "u-admin", name: "Ananya Rao", email: "admin@atomquest.demo", password: passwordHash, role: "admin", department: "People Ops" },
  { _id: "u-manager", name: "Rahul Mehta", email: "manager@atomquest.demo", password: passwordHash, role: "manager", department: "Manufacturing Excellence" },
  { _id: "u-employee", name: "Subhash Patil", email: "employee@atomquest.demo", password: passwordHash, role: "employee", department: "Product Engineering", manager: "u-manager" },
  { _id: "u-employee-2", name: "Meera Shah", email: "meera@atomquest.demo", password: passwordHash, role: "employee", department: "Product Engineering", manager: "u-manager" }
];

export const goals = [
  {
    _id: "g-1",
    title: "Reduce motor quality rejection rate",
    description: "Lower production rejection rate through root cause analysis and preventive controls.",
    owner: "u-employee",
    manager: "u-manager",
    weightage: 35,
    planned: 75,
    actual: 62,
    status: "On Track",
    approvalStatus: "Approved",
    sharedWith: ["u-employee-2"],
    checkIns: [{ quarter: "Q1", planned: 35, actual: 30, comment: "Supplier correction initiated.", updatedBy: "u-employee" }]
  },
  {
    _id: "g-2",
    title: "Launch service dashboard MVP",
    description: "Deliver dashboard for warranty, ticket aging, and service SLA tracking.",
    owner: "u-employee",
    manager: "u-manager",
    weightage: 30,
    planned: 60,
    actual: 55,
    status: "On Track",
    approvalStatus: "Approved",
    sharedWith: [],
    checkIns: [{ quarter: "Q1", planned: 30, actual: 28, comment: "MVP data model ready.", updatedBy: "u-employee" }]
  },
  {
    _id: "g-3",
    title: "Improve cross-functional goal review cadence",
    description: "Run monthly goal reviews and publish action closure summaries.",
    owner: "u-employee",
    manager: "u-manager",
    weightage: 35,
    planned: 50,
    actual: 48,
    status: "On Track",
    approvalStatus: "Approved",
    sharedWith: ["u-manager"],
    checkIns: [{ quarter: "Q1", planned: 25, actual: 24, comment: "First two reviews completed.", updatedBy: "u-employee" }]
  },
  {
    _id: "g-4",
    title: "Cut warranty analysis turnaround time",
    description: "Create a repeatable warranty triage and escalation workflow.",
    owner: "u-employee-2",
    manager: "u-manager",
    weightage: 100,
    planned: 40,
    actual: 20,
    status: "Not Started",
    approvalStatus: "Submitted",
    sharedWith: [],
    checkIns: []
  }
];

export const auditLogs = [
  { _id: "a-1", actor: "u-employee", action: "GOALS_SUBMITTED", entity: "GoalPlan", entityId: "u-employee", metadata: { totalWeightage: 100 }, createdAt: new Date() },
  { _id: "a-2", actor: "u-manager", action: "GOALS_APPROVED", entity: "GoalPlan", entityId: "u-employee", metadata: { count: 3 }, createdAt: new Date() }
];

export function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}
