import { Request, Response, NextFunction } from "express";
import { writeAuditLog } from "../src/repositories/audit.repo.js";

export function audit(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", async () => {
      try {
        await writeAuditLog({
          requestId: req.requestId || "",
          user: req.user?.sub,
          role: req.user?.role,
          action,
          path:
            (req.query.path as string) ||
            (req.body as Record<string, string>)?.path,
          status: res.statusCode,
        });
      } catch (err) {
        console.error("Audit write failed", err);
      }
    });
    next();
  };
}
