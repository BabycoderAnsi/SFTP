import prisma from "../db/prisma.ts";
import { AuditLogEntry } from "../types/index.ts";

export function writeAuditLog(entry: AuditLogEntry) {
  return prisma.auditLog.create({ data: entry });
}
