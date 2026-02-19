import { Request, Response, NextFunction } from "express";
import { writeAuditLog } from '../src/repositories/audit.repo';
import { log } from '../src/logging/logging';

export function auditMiddleware(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", async () => {
      const auditData = {
        requestId: req.requestId || "",
        user: req.user?.sub,
        role: req.user?.role,
        action,
        path:
          (req.query.path as string) ||
          (req.body as Record<string, string>)?.path,
        status: res.statusCode,
      };

      log("audit", "file_action", auditData);

      try {
        await writeAuditLog(auditData);
      } catch (err) {
        log("error", "audit_write_failed", {
          requestId: req.requestId,
          action,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
    next();
  };
}
