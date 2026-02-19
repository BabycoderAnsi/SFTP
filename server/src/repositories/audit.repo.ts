import prisma from '../db/prisma';
import { AuditLogEntry } from '../types/index';

export function writeAuditLog(entry: AuditLogEntry) {
  return prisma.auditLog.create({ data: entry });
}
