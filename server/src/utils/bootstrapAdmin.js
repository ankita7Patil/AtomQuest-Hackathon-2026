import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export async function bootstrapAdmin() {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Company Admin";

  if (!email || !password) {
    console.warn("No users found. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.");
    return;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
    department: "Administration"
  });

  await AuditLog.create({
    actor: admin._id,
    action: "FIRST_ADMIN_CREATED",
    entity: "User",
    entityId: admin._id.toString(),
    metadata: { email }
  });

  console.log(`Created first admin user: ${email}`);
}
