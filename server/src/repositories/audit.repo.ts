import prisma from "../db/prisma.js";
import { AuditLogEntry } from "../types/index.js";

export function writeAuditLog(entry: AuditLogEntry) {
  return prisma.auditLog.create({ data: entry });
}
