import { usingMemoryStore } from "./db.js";
import AuditLog from "../models/AuditLog.js";
import { auditLogs } from "../data/demoStore.js";

export async function writeAudit({ actor, action, entity, entityId, metadata = {} }) {
  if (usingMemoryStore) {
    auditLogs.unshift({ _id: `a-${Date.now()}`, actor, action, entity, entityId, metadata, createdAt: new Date() });
    return;
  }

  await AuditLog.create({ actor, action, entity, entityId, metadata });
}
